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

Le contenu est écrit directement dans les pages. Chaque vue de `src/views/` commence par une ou plusieurs listes (événements, articles de la boutique, formules d'initiation…) à éditer :

- **Événements** : `src/views/EventsView.vue`, liste `events`
- **Boutique** : `src/views/BoutiqueView.vue`, liste `products`. Un article avec `available: true` affiche le bouton « Commander ».
- **Initiation & Roulage** : `src/views/InitiationView.vue`, listes `formules`, `equipement` et `deroulement`
- **Coordonnées** : `src/views/ContactView.vue`, liste `infos`

Les images se déposent dans `public/`.

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

Le site ne charge aucune ressource tierce. Les polices sont hébergées localement via Fontsource, et les icônes des réseaux sociaux sont des SVG intégrés. Merci de conserver ce principe (RGPD).
