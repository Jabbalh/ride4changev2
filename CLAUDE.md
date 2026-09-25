# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Site de l'association moto **Ride 4 Change** : SPA Vue 3 + Vite + TypeScript, avec un petit backend Cloudflare Worker. Le projet, le contenu et les commentaires sont en français.

## Commandes

```sh
pnpm install
pnpm dev            # front + worker (/api/*) sur http://localhost:5173/
pnpm build          # type-check (vue-tsc --build) + vite build, en parallèle
pnpm build-only     # vite build sans type-check
pnpm preview        # sert le build, worker compris
pnpm cf-typegen     # régénère worker-configuration.d.ts (après chaque modif de wrangler.toml)
```

Il n'y a ni tests ni linter. La vérification passe par `pnpm build` (type-check des trois projets TS) et un test dans le navigateur.

Pour simuler le build Cloudflare en local : `pnpm build`, puis `pnpm preview` (le site et le worker, avec la configuration de `wrangler.toml`) et `npx wrangler deploy --dry-run --config dist/ride4changev2/wrangler.json`.

## Architecture

### Front (`src/`)
- Le router utilise **`createWebHistory`** (vraies URL `/association`, indispensables au référencement). Cloudflare renvoie `index.html` pour toute URL sans fichier (`not_found_handling = "single-page-application"` dans `wrangler.toml`). Les anciens liens `/#/page` sont réécrits au chargement, dans `src/router/index.ts`, **avant** `createWebHistory` (qui lit l'URL dès sa création). Route attrape-tout : une URL inconnue renvoie à l'accueil. Les liens internes des articles (`/contact`) sont de simples `<a>` : ils rechargent la page.
- Pour ajouter une page, il faut toucher 3 endroits : `src/router/index.ts` (avec `meta.title` et `meta.description`), `NAV_LINKS` dans `src/lib/navLinks.ts` (liste unique, partagée par le menu et le pied de page), et `STATIC_PAGES` dans `worker/sitemap.ts`.
- Référencement : `src/lib/seo.ts` (`setPageMeta`, `setPageJsonLd`) met à jour titre, description, canonique, robots et Open Graph à chaque navigation (`router.afterEach`, depuis `meta`). La page article complète ensuite avec l'événement chargé (titre, description, première image, JSON-LD `Event`). `meta.noindex` sur `/connexion` et `/admin/*`. `index.html` garde les valeurs par défaut et le JSON-LD de l'association : ce sont les seules lues par les robots sans JavaScript (aperçus Facebook, WhatsApp), à garder cohérentes avec `seo.ts`. Image de partage : `public/og-image.jpg` (1200×630). `public/robots.txt` exclut l'espace éditeur.
- Le contenu des pages est codé en dur dans des tableaux au début du `<script setup>` de chaque vue (produits, formules…), **sauf les événements et les dates clés de L'Association** (`milestones`, via `useMilestones.ts`), qui viennent de Supabase. La présentation de L'Association reste volontairement en dur : c'est un choix de l'utilisateur, pour un contenu stable et sans appel à la base.
- Styles : la seule feuille globale chargée est `src/assets/main.css` (variables `--red`, `--dark`, `--dark2`, `--grey`, `--grey-light`…). Toute classe utilitaire partagée (`.text-bold`…) va dans ce fichier. Les vues dupliquent un bloc `.page-header` en CSS scoped ; copier celui d'une vue existante pour une nouvelle page.
- Polices : Bebas Neue (titres), Barlow Condensed (menus, labels) et Barlow (texte), servies localement via `@fontsource/*` et importées dans `src/main.ts`. Un nouveau `font-weight` doit y être importé. Ne pas réintroduire Google Fonts ni d'autres ressources tierces (seule exception : l'API Supabase) : le choix a été fait pour le RGPD.
- Le menu passe en burger sous **1150px** : 7 liens + bouton tiennent tout juste. Ajouter un onglet impose de revérifier la largeur de la barre.

### Backend (`worker/`)
- `wrangler.toml` déclare `main = "./worker/index.ts"` et `[assets] run_worker_first = ["/api/*", "/sitemap.xml"]`. Seules ces URLs passent par le worker, tout le reste est servi en statique.
- `/sitemap.xml` (`worker/sitemap.ts`) : pages fixes + événements publiés qui ont un article, lus dans Supabase à chaque requête (cache 1 h, 5 min si Supabase ne répond pas). Le worker lit `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` dans les `[vars]` de `wrangler.toml` (clé publique, déjà dans le JavaScript du site), à garder identiques aux variables de build `VITE_SUPABASE_*`.
- `worker/index.ts` route les URLs, et chaque endpoint a son module (`worker/contact.ts`).
- `/api/contact` valide les champs, contient un champ piège anti-spam (`website`) et **ne fait pour l'instant que `console.log` le message** (TODO : envoi de mail ou stockage).
- La liste `OBJETS` de `worker/contact.ts` doit rester synchronisée avec les `<option>` et avec `objetsPrefill` dans `src/views/ContactView.vue`. Cette vue accepte `?objet=...` pour pré-sélectionner l'objet.
- Typage : `tsconfig.worker.json`, un projet TS séparé, référencé par `tsconfig.json`, avec `worker-configuration.d.ts` généré. Le type `Env` en provient.

### Build et `base`
- `@cloudflare/vite-plugin` fait tourner le worker dans `pnpm dev` et `pnpm preview`. Il fait aussi sortir le build dans `dist/client/` (le site) et `dist/ride4changev2/` (le worker et le `wrangler.json` généré), et non dans `dist/`.
- Le site est toujours servi à la racine : `vite.config.ts` ne définit pas de `base`. Le plugin Cloudflare **ne supporte pas** un `base` non racine en dev, où tout renvoie le 404 du worker. Les vues utilisent encore `import.meta.env.BASE_URL` (qui vaut `/`) pour les images de `public/` : garder cette convention.

### Supabase (contenu)
- Le navigateur interroge Supabase directement (`src/lib/supabase.ts`, avec la clé publishable). Il ne passe pas par le worker. Les droits reposent entièrement sur RLS : lecture seule des lignes `published`. La saisie se fait dans le dashboard Supabase.
- Le schéma est versionné dans `supabase/migrations/`, et les types sont écrits à la main dans `src/lib/database.types.ts`, au format de `supabase gen types` (`pnpm db:types` pour les régénérer). Les migrations ne sont appliquées ni au build ni au déploiement : l'utilisateur les exécute dans le SQL Editor.
- Un composable par rubrique (`src/composables/useEvents.ts`) charge les données et calcule l'affichage (mois et jour en français, passé ou à venir). La table ne stocke que des données brutes.
- La section « Prochain événement » de l'accueil utilise `useNextEvent()` : une seule ligne, le premier événement publié pas encore terminé (`starts_on` ou `ends_on` ≥ aujourd'hui). S'il n'y en a pas, ou si le chargement échoue, la section est masquée, sans message d'erreur.
- `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont lues **au build** (`.env.local` en local, *build variables* sur Cloudflare). Absentes, `supabase` vaut `null` et la vue affiche son état d'erreur.
- Page article `/evenements/:id` (`EventDetailView.vue`, `useEvent(id)`) : elle affiche la colonne `details` (HTML produit par l'éditeur Tiptap `src/components/admin/RichTextEditor.vue`, ou Markdown saisi dans le dashboard). Un événement n'est cliquable que si `has_details`, colonne générée en base (`details ~ '\S'`), est vrai. La liste ne charge pas `details`.
- Le contenu riche passe **toujours** par `renderRichText()` (`src/lib/richText.ts`) avant un `v-html`. Ce qui commence par `<` est traité comme du HTML, le reste passe par marked ; tout finit dans DOMPurify. Les hooks retirent les images hors `public/` et hors Supabase Storage, ne gardent que `color` et `text-align` dans les `style`, et ouvrent les liens externes dans un nouvel onglet. L'éditeur charge aussi son contenu initial via `renderRichText()`, donc un ancien article Markdown est converti.
- Styles du contenu : `src/assets/article.css` (classe globale `.article-content`), partagés par la page article et l'éditeur. Ne pas les redupliquer en CSS scoped.
- Images des articles : `src/lib/eventImages.ts` (redimensionnement à 1600 px dans le navigateur, puis envoi dans le bucket `event-images` dès l'insertion, pas à l'enregistrement). Tailles : source ≤ 25 Mo avant décodage, fichier final ≤ `MAX_UPLOAD_BYTES` (5 Mo), qui doit rester égal au `file_size_limit` du bucket. Les erreurs `ImageUploadError` sont affichées telles quelles. Le collage et le dépôt d'images dans l'éditeur passent par le même envoi (`handlePaste` et `handleDrop`) ; les `data:` sont refusées par l'extension Image. Redimensionnement : `resize` de l'extension Image (poignées aux coins, attributs `width`/`height` en px). `ResizableImage` réapplique la largeur dans `update()`, car le node view de Tiptap ne l'applique qu'à la création : sans ça, les boutons de taille (`updateAttributes`) n'auraient aucun effet visible. Côté public, `max-width: 100%` et `height: auto` dans `article.css` évitent toute déformation.
- Alignement d'image : attribut `align` de `ResizableImage`, rendu en `data-align="left|right"` (DOMPurify garde les `data-*`). Le flottement est défini dans `article.css` sur l'`img`, et il est annulé sous 600 px. Dans l'éditeur, c'est l'enveloppe Tiptap (`[data-resize-container]:has(img[data-align])`) qui flotte. Les `h1` à `h3`, les `hr` et les tableaux ont `clear: both`.
- Tableaux : `TableKit` avec `resizable: false`, car des largeurs de colonnes seraient stockées en style inline, que `renderRichText` retire. En public, `table-layout: fixed` et `overflow-wrap: anywhere` évitent tout débordement.
- Droits sur les images : migration `…_event_images_storage.sql`, envoi réservé aux éditeurs, sans suppression depuis le site. Tiptap (~400 Ko) n'est chargé que dans l'espace éditeur, grâce à l'import dynamique des routes admin.
- **Espace éditeur** (`src/views/admin/`, routes `/connexion` et `/admin/*`, chargées à la demande) : connexion email et mot de passe via Supabase Auth (`useAuth`, état partagé au niveau du module). Écriture via `useEventAdmin.ts`. Droits : table `public.editors`, fonction `public.is_editor()` et policies insert, update et delete réservées aux éditeurs, avec des `grant` limités aux colonnes éditables. Suppression depuis la liste `/admin/evenements`, avec confirmation dans la ligne (migration `…_events_delete.sql`). `deleteEvent()` transforme « aucune ligne supprimée » (PGRST116) en refus de droits. Les images de l'article restent dans le bucket. Le garde `meta.requiresEditor` du router n'est que du confort : la protection réelle est RLS.
- `milestones` : pas de colonne `published`, et suppression permise aux éditeurs (policy delete). L'ordre est manuel, via la colonne `position` : un trigger place toute nouvelle ligne en tête, et le site ne peut pas fixer `position` à l'insertion. `reorder_milestones(ids[])` (security invoker, soumise à RLS) réécrit toutes les positions en une opération et renvoie le nombre de lignes modifiées. `reorderMilestones()` compare ce nombre à la longueur de la liste, car un refus RLS ne lève pas d'erreur. `useMilestoneAdmin.ts` enchaîne `.select().single()` après insert, update et delete. Page `/admin/association` avec édition sur place et confirmation de suppression dans la ligne (pas de `window.confirm`).
- Navigation de l'espace éditeur : `src/components/admin/AdminNav.vue` (onglets et déconnexion). Toute nouvelle page `/admin/…` doit être ajoutée à `SECTIONS`.
- Conséquence : un éditeur connecté voit aussi les brouillons. Les requêtes **publiques** doivent donc filtrer `.eq('published', true)` explicitement (voir `useEvents.ts`).
- Pas de magic link ni d'OAuth : connexion par mot de passe uniquement (`detectSessionInUrl: false`).
- Pour toute nouvelle rubrique ou évolution de schéma, suivre le skill `.claude/skills/supabase-content`.

## Déploiement

- **Cloudflare Workers**, relié au dépôt GitHub : chaque push sur `main` déclenche `pnpm build` puis `npx wrangler deploy`. Node 22 est fixé par `.node-version`.
- Domaines : `ride4change.fr` est le Custom Domain du Worker (configuré dans le dashboard, pas dans `wrangler.toml`). `www` et les domaines secondaires (`ride4change.eu`, `rideforchange.fr`, `rideforchange.eu`) redirigent en 301 via des règles Cloudflare. Le détail des opérations DNS est dans `docs/DOMAINES.md`.
- `docs/` contient la documentation d'exploitation, à tenir à jour : `docs/DOMAINES.md` (DNS, domaines, redirections, lien avec le Worker) `docs/REFERENCEMENT.md` (ce qui est en place et les actions à mener) et `docs/ANALYSE.md` (constats de l'analyse du 25/09/2026 et plan par lots : cocher les cases au fil des corrections). GitHub Pages n'est plus utilisé.

## Notes produit

`description.txt` contient la liste d'idées et de demandes de l'association (team racing, galerie, couleurs orange et noir…).
