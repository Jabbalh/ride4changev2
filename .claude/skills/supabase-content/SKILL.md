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
| Page détail (article Markdown) | `src/views/EventDetailView.vue` (`useEvent(id)`, route `/evenements/:id`) |
| Rendu Markdown sûr | `src/lib/markdown.ts` (`renderMarkdown`) |

Principes à conserver :
- **Lecture seule depuis le site.** Le navigateur utilise la clé publique ; les droits reposent sur RLS : `select` uniquement, et uniquement les lignes `published`. Aucune policy `insert`, `update` ou `delete` pour `anon` : la saisie se fait dans le dashboard Supabase.
- **Les données restent brutes en base.** On stocke des dates (`date`), jamais des libellés comme « Juin » ou « Passé ». Le composable calcule l'affichage.
- **Supabase est la seule ressource tierce autorisée** (voir « Vie privée » dans le README). N'ajouter aucune autre dépendance externe côté navigateur.

## Ajouter une rubrique (ex : boutique, formules d'initiation)

1. **Migration** : créer `supabase/migrations/<AAAAMMJJHHMMSS>_create_<table>.sql` en copiant la structure de celle des événements :
   - `id bigint generated always as identity primary key`, `published boolean not null default true`, `created_at`, `updated_at` ;
   - un ordre d'affichage explicite si nécessaire (`position int`) ;
   - un **enum** plutôt que du texte libre pour les listes fermées, car il donne une liste déroulante dans le Table Editor ;
   - le trigger `updated_at`, qui réutilise `public.set_updated_at()`, déjà créée : ne pas la recréer ;
   - `enable row level security`, `revoke all … from anon, authenticated`, `grant select … to anon, authenticated`, et une policy `for select to anon, authenticated using (published)`.
2. **Types** : ajouter la table (`Row`, `Insert`, `Update`, `Relationships: []`) et les enums dans `src/lib/database.types.ts`, au format de `supabase gen types`.
3. **Composable** : créer `src/composables/use<Rubrique>.ts` sur le modèle de `useEvents.ts`. Il gère `loading`, `error`, le cas `supabase === null` et le tri. Il renvoie des données prêtes à afficher.
4. **Vue** : remplacer le tableau codé en dur par le composable, et gérer les états chargement, erreur (avec un bouton « Réessayer ») et liste vide. Garder le CSS existant.
5. **Texte riche** : colonne Markdown, rendue **uniquement** via `renderMarkdown()` puis `v-html`. Jamais de `v-html` sur du contenu brut. Pour une page détail, reprendre le trio `details` / `has_details` (colonne générée `~ '\S'`) / sélection explicite qui exclut `details` de la liste.
6. **Images** : utiliser Supabase Storage, avec un bucket public en lecture, et stocker le chemin dans la table. Ne pas mettre d'URL externe arbitraire.
7. **Documentation** : mettre à jour la section « Contenu géré dans Supabase » du `README.md` (tableau des colonnes), et `CLAUDE.md` si l'architecture change.

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
