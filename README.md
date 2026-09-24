# Ride 4 Change

Site de l'association moto **Ride 4 Change** : présentation de l'association, compétition, initiation et roulage, événements, boutique et formulaire de contact.

- **Front** : Vue 3, Vite, TypeScript, vue-router
- **Backend** : Cloudflare Worker (endpoints `/api/*`)
- **Hébergement** : Cloudflare Workers, déployé automatiquement à chaque push sur `main`

## Démarrage

Prérequis : Node.js 20.19+ ou 22.12+, et pnpm.

```sh
pnpm install
pnpm dev
```

Le site et l'API tournent ensemble sur http://localhost:5173/.

| Commande | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement (front et API) |
| `pnpm build` | Vérification TypeScript et build de production |
| `pnpm preview` | Sert le build de production en local |
| `pnpm cf-typegen` | Régénère les types du worker après une modification de `wrangler.toml` |

## Structure

```
src/
  views/        une vue par page (Accueil, Association, Compétition, Initiation & Roulage,
                Événements, Boutique, Contact, Galerie)
  components/   barre de navigation, pied de page, liens réseaux sociaux…
  router/       déclaration des routes (URLs en /#/...)
  assets/       feuille de style globale et variables CSS
public/         images servies telles quelles
worker/         backend Cloudflare (API)
wrangler.toml   configuration Cloudflare
```

## Modifier le contenu

Les **événements** sont gérés dans Supabase (voir ci-dessous). Le reste du contenu est écrit directement dans les pages : chaque vue de `src/views/` commence par une ou plusieurs listes à éditer.

- **Boutique** : `src/views/BoutiqueView.vue`, liste `products`. Un article avec `available: true` affiche le bouton « Commander ».
- **Initiation & Roulage** : `src/views/InitiationView.vue`, listes `formules`, `equipement` et `deroulement`
- **Coordonnées** : `src/views/ContactView.vue`, liste `infos`

Les images se déposent dans `public/`.

### Contenu géré dans Supabase

Le calendrier de la page **Événements** est lu dans la table `events` de Supabase. Pour ajouter ou modifier un événement : dashboard Supabase → **Table Editor** → `events`. La modification est visible immédiatement sur le site, sans redéploiement.

| Colonne | Rôle |
|---|---|
| `title` | Titre de l'événement (obligatoire) |
| `type` | Sortie, Roulage, Initiation, Formation, Compétition, Rassemblement, Rallye, Solidarité, Atelier ou AG (liste déroulante) |
| `starts_on` / `ends_on` | Date de début (obligatoire) et date de fin (vide si l'événement dure une journée) |
| `location`, `description` | Lieu et description courte (affichée dans la liste) |
| `details` | Article détaillé en **Markdown** (voir ci-dessous). S'il n'est pas vide, l'événement devient cliquable et ouvre sa page article |
| `has_details` | Calculé automatiquement (non modifiable) : coché si `details` contient du texte |
| `participants` | Texte libre, affiché seulement sur l'événement à la une (ex : « 120 participants ») |
| `is_featured` | Coché : l'événement est mis en avant en haut de la page (le prochain événement coché est retenu) |
| `published` | Décoché : l'événement est masqué sans être supprimé |

« À venir » ou « Passé » est calculé automatiquement à partir de la date. Les 6 derniers événements passés restent affichés.

#### Écrire un article (colonne `details`)

L'article s'affiche sur la page `/#/evenements/<id>`, accessible depuis la liste (« Lire la suite ») et depuis l'événement à la une (« En savoir plus »). Il s'écrit en Markdown :

```markdown
Deux jours de **roulage** et de convivialité.

## Programme
- Samedi : sessions par niveau
- Dimanche : balade et barbecue

> Pensez à votre combinaison !

![Photo du circuit](/moto1.jpg)

[Site du circuit](https://www.circuit-loheac.fr)
```

- Un simple retour à la ligne est conservé tel quel.
- **Images** : seules les images du site (`/fichier.jpg`, déposées dans `public/`) ou de Supabase Storage (bucket public) s'affichent. Les images d'autres sites sont retirées automatiquement (RGPD).
- Les liens vers d'autres sites s'ouvrent dans un nouvel onglet.
- Le HTML dangereux (scripts…) est filtré.

**Mise en place (une fois) :**

1. Dans Supabase, **SQL Editor** : exécuter, dans l'ordre, chaque fichier de `supabase/migrations/` qui n'a pas encore été appliqué (les noms commencent par leur date).
2. En local : copier `.env.example` en `.env.local` et y mettre l'URL du projet et la clé **publishable** (ou **anon**), à récupérer dans **Project Settings → API**.
3. Sur Cloudflare, dans les réglages du worker : **Settings → Build → Variables and secrets**, ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. Ce sont des variables **de build** : elles sont intégrées au site lors du `pnpm build`. Les définir comme variables d'exécution (runtime) ne suffit pas.

La clé publishable est visible dans le code du site, et c'est normal : les règles de sécurité en base (RLS) ne permettent que la lecture des événements publiés. Ne jamais utiliser la clé **secret** ou **service_role** côté site.

Toute évolution du schéma passe par une nouvelle migration dans `supabase/migrations/`. Le skill Claude Code `supabase-content` décrit la marche à suivre, y compris pour brancher d'autres rubriques.

### Ajouter une page

1. Créer la vue dans `src/views/`, en partant d'une vue existante pour garder le même en-tête.
2. Déclarer la route dans `src/router/index.ts`.
3. Ajouter le lien dans `src/components/NavBar.vue` et `src/components/FooterBar.vue`.

Le menu passe en mode burger sous 1150 px de large. Après l'ajout d'un onglet, vérifier qu'il tient toujours sur une ligne.

## Backend (API)

Le worker Cloudflare (`worker/`) ne traite que les URLs `/api/*`. Tout le reste est servi comme site statique.

### `POST /api/contact`

Reçoit le formulaire de contact en JSON :

```json
{ "prenom": "Jean", "nom": "Dupont", "email": "jean@mail.fr", "objet": "info", "moto": "", "message": "Bonjour" }
```

- Champs obligatoires : `prenom`, `nom`, `email` et `message`.
- `objet` vaut l'une de ces valeurs : `adhesion`, `info`, `initiation`, `boutique`, `evenement`, `presse` ou `autre`. Il peut aussi être vide.
- Réponses : `200 {"ok":true}`, `400 {"error":"..."}` si les données sont invalides, `405` pour une autre méthode que POST.
- Anti-spam : un champ caché `website`. S'il est rempli, le message est ignoré en silence.

> **À faire :** les messages ne sont pour l'instant envoyés nulle part. Ils sont seulement visibles dans les logs du worker (dashboard Cloudflare → worker → Logs). Il reste à brancher un envoi de mail (Resend, par exemple) ou un stockage (base D1).

Pour ajouter une valeur à `objet`, la mettre à jour dans `worker/contact.ts` et dans `src/views/ContactView.vue` (les `<option>` et la liste `objetsPrefill`).

La page de contact accepte un objet pré-sélectionné dans l'URL, par exemple `/#/contact?objet=boutique`.

## Déploiement

Le projet Cloudflare Workers est relié au dépôt GitHub. Chaque push sur `main` lance :

- **Build** : `pnpm build`
- **Déploiement** : `npx wrangler deploy`

La version de Node est fixée par `.node-version`.

### Domaine personnalisé

Le DNS du domaine doit être géré par Cloudflare :

1. Ajouter le domaine dans Cloudflare (plan Free).
2. Chez le registrar (OVH, par exemple), remplacer les serveurs DNS par ceux fournis par Cloudflare.
3. Dans le worker : **Settings → Domains & Routes → Add → Custom Domain**.

Si les mails du domaine restent chez OVH, vérifier que Cloudflare a bien importé les enregistrements MX et SPF.

### GitHub Pages (historique)

Le dossier `docs/` contient une ancienne version du site, servie par GitHub Pages sous `/ride4changev2/`, sans backend. Un `pnpm build-only` en local produit un build compatible dans `dist/client/`.

## Vie privée

Le site ne charge aucune ressource tierce, à une exception près : l'API Supabase, pour les événements. Les polices sont hébergées localement via Fontsource, et les icônes des réseaux sociaux sont des SVG intégrés. Merci de conserver ce principe (RGPD), et de choisir une région Europe pour le projet Supabase.
