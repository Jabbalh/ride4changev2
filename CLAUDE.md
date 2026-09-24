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

Pour simuler le build Cloudflare en local : `WORKERS_CI=1 pnpm build`, puis `npx wrangler deploy --dry-run`.

## Architecture

### Front (`src/`)
- Le router utilise **`createWebHashHistory`** (URLs en `/#/...`). Il n'y a donc aucune règle de réécriture côté hébergeur, et aucun conflit possible entre les routes Vue et `/api/*`.
- Pour ajouter une page, il faut toucher 3 endroits : `src/router/index.ts`, le tableau `links` de `src/components/NavBar.vue` et celui de `src/components/FooterBar.vue`.
- Le contenu des pages est codé en dur dans des tableaux au début du `<script setup>` de chaque vue (produits, formules…), **sauf les événements**, qui viennent de Supabase.
- Styles : la seule feuille globale chargée est `src/assets/main.css` (variables `--red`, `--dark`, `--dark2`, `--grey`, `--grey-light`…). `src/styles/main.css` existe mais n'est importé nulle part. Les vues dupliquent un bloc `.page-header` en CSS scoped ; copier celui d'une vue existante pour une nouvelle page.
- Polices : Bebas Neue (titres), Barlow Condensed (menus, labels) et Barlow (texte), servies localement via `@fontsource/*` et importées dans `src/main.ts`. Un nouveau `font-weight` doit y être importé. Ne pas réintroduire Google Fonts ni d'autres ressources tierces (seule exception : l'API Supabase) : le choix a été fait pour le RGPD.
- Le menu passe en burger sous **1150px** : 7 liens + bouton tiennent tout juste. Ajouter un onglet impose de revérifier la largeur de la barre.

### Backend (`worker/`)
- `wrangler.toml` déclare `main = "./worker/index.ts"` et `[assets] run_worker_first = ["/api/*"]`. Seules les URLs `/api/*` passent par le worker, tout le reste est servi en statique.
- `worker/index.ts` route les URLs, et chaque endpoint a son module (`worker/contact.ts`).
- `/api/contact` valide les champs, contient un champ piège anti-spam (`website`) et **ne fait pour l'instant que `console.log` le message** (TODO : envoi de mail ou stockage).
- La liste `OBJETS` de `worker/contact.ts` doit rester synchronisée avec les `<option>` et avec `objetsPrefill` dans `src/views/ContactView.vue`. Cette vue accepte `?objet=...` pour pré-sélectionner l'objet.
- Typage : `tsconfig.worker.json`, un projet TS séparé, référencé par `tsconfig.json`, avec `worker-configuration.d.ts` généré. Le type `Env` en provient.

### Build et `base`
- `@cloudflare/vite-plugin` fait tourner le worker dans `pnpm dev` et `pnpm preview`. Il fait aussi sortir le build dans `dist/client/` (le site) et `dist/ride4changev2/` (le worker et le `wrangler.json` généré), et non dans `dist/`.
- `base` dans `vite.config.ts` vaut `/` en dev et sur Cloudflare (`WORKERS_CI` ou `CF_PAGES` définis). Il vaut `/ride4changev2/` uniquement pour un build local destiné à GitHub Pages. Le plugin Cloudflare **ne supporte pas** un `base` non racine en dev, où tout renvoie le 404 du worker.
- Pour les images de `public/` référencées dans les vues, utiliser `import.meta.env.BASE_URL`, jamais un chemin absolu.

### Supabase (contenu)
- Le navigateur interroge Supabase directement (`src/lib/supabase.ts`, avec la clé publishable). Il ne passe pas par le worker. Les droits reposent entièrement sur RLS : lecture seule des lignes `published`. La saisie se fait dans le dashboard Supabase.
- Le schéma est versionné dans `supabase/migrations/`, et les types sont écrits à la main dans `src/lib/database.types.ts`, au format de `supabase gen types` (`pnpm db:types` pour les régénérer). Les migrations ne sont appliquées ni au build ni au déploiement : l'utilisateur les exécute dans le SQL Editor.
- Un composable par rubrique (`src/composables/useEvents.ts`) charge les données et calcule l'affichage (mois et jour en français, passé ou à venir). La table ne stocke que des données brutes.
- `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont lues **au build** (`.env.local` en local, *build variables* sur Cloudflare). Absentes, `supabase` vaut `null` et la vue affiche son état d'erreur.
- Page article `/evenements/:id` (`EventDetailView.vue`, `useEvent(id)`) : elle affiche la colonne `details` (Markdown). Un événement n'est cliquable que si `has_details`, colonne générée en base (`details ~ '\S'`), est vrai. La liste ne charge pas `details`.
- Le Markdown passe **toujours** par `renderMarkdown()` (`src/lib/markdown.ts` : marked puis DOMPurify) avant un `v-html`. Le hook DOMPurify retire les images hors `public/` et hors Supabase Storage, et ouvre les liens externes dans un nouvel onglet.
- Pour toute nouvelle rubrique ou évolution de schéma, suivre le skill `.claude/skills/supabase-content`.

## Déploiement

- **Cloudflare Workers**, relié au dépôt GitHub : chaque push sur `main` déclenche `pnpm build` puis `npx wrangler deploy`. Node 22 est fixé par `.node-version`.
- `docs/` est une ancienne copie du build servie par **GitHub Pages** (sous `/ride4changev2/`), sans backend. Elle est mise à jour à la main et n'est plus alimentée automatiquement.

## Notes produit

`description.txt` contient la liste d'idées et de demandes de l'association (team racing, galerie, couleurs orange et noir…).
