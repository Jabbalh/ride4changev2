---
name: supabase-content
description: Brancher une rubrique du site sur Supabase (nouvelle table de contenu lue par une vue Vue) ou faire évoluer le schéma existant (colonne, type d'événement, règle RLS). À utiliser dès qu'une demande touche au contenu stocké dans Supabase, à supabase/migrations/, à src/lib/database.types.ts ou aux composables de src/composables/.
---

# Contenu Supabase

Le modèle de référence est la rubrique **Événements** :

| Rôle | Fichier |
|---|---|
| Schéma et RLS | `supabase/migrations/20260924120000_create_events.sql` |
| Types TS | `src/lib/database.types.ts` |
| Client | `src/lib/supabase.ts` (peut valoir `null` si l'env n'est pas configuré) |
| Chargement et mise en forme | `src/composables/useEvents.ts` |
| Affichage (liste) | `src/views/EventsView.vue` |
| Page détail (article) | `src/views/EventDetailView.vue` (`useEvent(id)`, route `/evenements/:id`) |
| Rendu sûr du contenu riche | `src/lib/richText.ts` (`renderRichText` : HTML ou Markdown → DOMPurify) + styles `src/assets/article.css` |
| Éditeur visuel et images | `src/components/admin/RichTextEditor.vue` (Tiptap), `src/lib/eventImages.ts`, migration `…_event_images_storage.sql` |
| Droits éditeurs | `supabase/migrations/20260925090000_events_editors.sql` (table `editors`, `is_editor()`) |
| Connexion | `src/composables/useAuth.ts`, `src/views/admin/LoginView.vue` |
| Écriture (liste admin, formulaire) | `src/composables/useEventAdmin.ts`, `src/views/admin/*` |
| Rubrique simple éditable sur place (sans page détail ni brouillon) | `…_create_milestones.sql`, `useMilestones.ts`, `useMilestoneAdmin.ts`, `AdminMilestonesView.vue` |
| Navigation de l'espace éditeur | `src/components/admin/AdminNav.vue` (`SECTIONS`) |

Principes à conserver :
- **Visiteurs : lecture seule.** Le navigateur utilise la clé publique. Pour `anon`, RLS n'autorise que le `select` des lignes `published`.
- **Écriture réservée aux éditeurs**, jamais à « tout utilisateur connecté » (`authenticated` seul ne suffit pas : n'importe qui peut créer un compte si les inscriptions sont ouvertes). Policies `to authenticated` avec `(select public.is_editor())`, et `grant insert/update (colonnes éditables)` uniquement. Pas de delete depuis le site par défaut. Si l'utilisateur demande la suppression (ex : `milestones`, `events` via `…_events_delete.sql`), ajouter `grant delete` et une policy `for delete … using ((select public.is_editor()))`, avec une confirmation dans l'interface.
- **Les requêtes publiques filtrent `.eq('published', true)`**, puisqu'un éditeur connecté voit aussi les brouillons via RLS.
- **Les données restent brutes en base.** On stocke des dates (`date`), jamais des libellés comme « Juin » ou « Passé ». Le composable calcule l'affichage.
- **Supabase est la seule ressource tierce autorisée** (voir « Vie privée » dans le README). N'ajouter aucune autre dépendance externe côté navigateur.

## Ajouter une rubrique (ex : boutique, formules d'initiation)

1. **Migration** : créer `supabase/migrations/<AAAAMMJJHHMMSS>_create_<table>.sql` en copiant la structure de celle des événements :
   - `id bigint generated always as identity primary key`, `created_at`, `updated_at`, et `published boolean not null default true` si des brouillons sont utiles (pas pour une simple liste comme `milestones`) ;
   - si la rubrique remplace un contenu codé en dur, reprendre ce contenu dans la migration (`insert … values`) pour ne rien perdre ;
   - un ordre d'affichage manuel si nécessaire : reprendre le modèle de `…_milestones_position.sql`. Colonne `position` avec un trigger d'insertion (la nouvelle ligne arrive en tête), fonction `reorder_<table>(ids bigint[]) returns integer` en `security invoker` (la fonction renvoie le nombre de lignes modifiées, à vérifier côté site), `grant update (position)`, et des boutons ↑ ↓ qui envoient l'ordre complet ;
   - un **enum** plutôt que du texte libre pour les listes fermées, car il donne une liste déroulante dans le Table Editor ;
   - le trigger `updated_at`, qui réutilise `public.set_updated_at()`, déjà créée : ne pas la recréer ;
   - `enable row level security`, `revoke all … from anon, authenticated`, `grant select … to anon, authenticated`, et une policy `for select to anon, authenticated using (published)`.
2. **Types** : ajouter la table (`Row`, `Insert`, `Update`, `Relationships: []`) et les enums dans `src/lib/database.types.ts`, au format de `supabase gen types`.
3. **Composable** : créer `src/composables/use<Rubrique>.ts` sur le modèle de `useEvents.ts`. Les lectures publiques passent par `restSelect`/`restSelectOne` de `src/lib/publicApi.ts` (fetch REST, syntaxe PostgREST), **jamais** par `@/lib/supabase` : supabase-js ne doit pas être chargé sur les pages publiques (voir CLAUDE.md). Les modules admin, eux, utilisent le client supabase-js. Il gère `loading`, `error`, le cas `supabase === null` et le tri. Il renvoie des données prêtes à afficher.
4. **Vue** : remplacer le tableau codé en dur par le composable, et gérer les états chargement, erreur (avec un bouton « Réessayer ») et liste vide. Garder le CSS existant.
5. **Texte riche** : colonne `text` (HTML de `RichTextEditor`, ou Markdown), rendue **uniquement** via `renderRichText()` puis `v-html`, avec la classe globale `.article-content`. L'éditeur doit enregistrer `''` quand il est vide (et non `<p></p>`), sinon la colonne générée `has_details` passe à vrai. Pour les images, un bucket dédié par rubrique, avec une policy insert `to authenticated with check (bucket_id = '…' and (select public.is_editor()))`. Jamais de `v-html` sur du contenu brut. Pour une page détail, reprendre le trio `details` / `has_details` (colonne générée `~ '\S'`) / sélection explicite qui exclut `details` de la liste.
6. **Édition depuis le site** (si demandée) : dans une nouvelle migration, ajouter les policies éditeur sur la table (select de tout, insert, update avec `(select public.is_editor())`) et les `grant` par colonne. Écrire un module `use<Rubrique>Admin.ts` sur le modèle de `useEventAdmin.ts`, avec `.select('id').single()` après insert ou update pour qu'un refus RLS lève une erreur au lieu d'un faux succès. Ajouter des routes `/admin/<rubrique>` avec `meta: { requiresEditor: true }` et un import dynamique, puis un onglet dans `AdminNav.vue`. Réutiliser `is_editor()` : ne pas la recréer.
7. **Images** : utiliser Supabase Storage, avec un bucket public en lecture, et stocker le chemin dans la table. Ne pas mettre d'URL externe arbitraire.
8. **Documentation** : mettre à jour la section « Contenu géré dans Supabase » du `README.md` (tableau des colonnes), et `CLAUDE.md` si l'architecture change.

## Faire évoluer le schéma

- **Ne jamais modifier une migration déjà appliquée** : créer une nouvelle migration datée.
- Nouvelle valeur d'enum : `alter type public.<enum> add value '<Valeur>';`. Mettre aussi à jour l'union dans `database.types.ts`.
- Nouvelle colonne : `alter table … add column …`, avec une valeur par défaut ou nullable, pour ne pas casser les lignes existantes. Mettre à jour `Row`, `Insert` et `Update`.
- Colonne calculée à partir d'une autre (ex : `has_details`) : `generated always as (...) stored`, et `?: never` dans `Insert`. La règle vit ainsi dans la base, pas dans le front.
- Les composables sélectionnent des **colonnes explicites** (ex : `LIST_COLUMNS` dans `useEvents.ts`) pour ne pas charger les textes longs dans les listes. Une colonne ajoutée doit donc y être ajoutée pour être lue. Le type-check refuse une colonne absente de `database.types.ts`.
- **Ordre de déploiement** : si le site sélectionne une nouvelle colonne, la migration doit être appliquée **avant** le push. Sinon, la requête échoue et la page affiche son état d'erreur. Le dire explicitement à l'utilisateur.
- Avant de supprimer une colonne, vérifier toutes ses utilisations (sélections et vues).

## Vérifier

- `pnpm build` : le type-check valide l'usage de `supabase.from(...)` contre `database.types.ts`.
- Tester sans base : lancer un serveur factice qui répond du JSON sur `/rest/v1/<table>`, puis `VITE_SUPABASE_URL=http://localhost:<port> VITE_SUPABASE_PUBLISHABLE_KEY=test pnpm dev`. Sans ces variables, la vue doit afficher son état d'erreur.
- La migration n'est **pas** appliquée automatiquement. Dire à l'utilisateur de l'exécuter dans Supabase (**SQL Editor**), ou avec `supabase db push` s'il a lié la CLI.
- Si le projet Supabase est accessible (CLI liée), `pnpm db:types` régénère les types. Il faut définir `SUPABASE_PROJECT_ID` et avoir fait `supabase login`.
- Valider une migration sans toucher à la base : l'exécuter dans PGlite (`npm i @electric-sql/pglite` dans un dossier temporaire), après `create role anon; create role authenticated;`. Vérifier ensuite, avec `set role anon`, que la lecture est filtrée et que l'écriture est refusée.
- Tester les droits dans PGlite, avec les profils visiteur, connecté non éditeur et éditeur : créer un schéma `auth` factice (`auth.users`, et `auth.uid()` lisant `current_setting('request.jwt.claim.sub', true)`), puis `set role authenticated` + `set_config('request.jwt.claim.sub', '<uuid>', false)`.
- Tester l'espace éditeur dans le navigateur sans vrai compte : un serveur factice qui répond à `/auth/v1/token` (session avec un JWT factice), `/rest/v1/rpc/is_editor` et aux POST/PATCH de `/rest/v1/<table>`. Dans un onglet piloté en arrière-plan, `requestAnimationFrame` est suspendu : les transitions `fade` du router se figent. Remplacer `window.requestAnimationFrame` par un `setTimeout` après un rechargement complet.
