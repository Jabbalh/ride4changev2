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
  router/       déclaration des routes (vraies URL : /association, /evenements/12…)
  assets/       feuille de style globale et variables CSS
public/         images servies telles quelles
worker/         backend Cloudflare (API)
wrangler.toml   configuration Cloudflare
```

## Modifier le contenu

Les **événements** et les **dates clés de la page L'Association** sont gérés dans Supabase (voir ci-dessous). Le reste du contenu, y compris le texte de présentation de L'Association, est écrit directement dans les pages : chaque vue de `src/views/` commence par une ou plusieurs listes à éditer.

- **Boutique** : `src/views/BoutiqueView.vue`, liste `products`. Un article avec `available: true` affiche le bouton « Commander ».
- **Initiation & Roulage** : `src/views/InitiationView.vue`, listes `formules`, `equipement` et `deroulement`
- **Coordonnées** : `src/views/ContactView.vue`, liste `infos`

Les images se déposent dans `public/`.

### Contenu géré dans Supabase

Le calendrier de la page **Événements** est lu dans la table `events` de Supabase. Deux façons d'ajouter ou de modifier un événement, visibles immédiatement sur le site sans redéploiement :

- **Depuis le site (espace éditeur)** : lien « Espace éditeur » en bas de page, ou `/admin/evenements`, puis connexion avec un compte éditeur. L'article se rédige dans un éditeur visuel (voir ci-dessous).
- **Depuis le dashboard Supabase** : **Table Editor** → `events`. Pour masquer un événement sans le perdre, décocher « Publié ». Pour le supprimer définitivement : bouton **Supprimer** dans la liste de l'espace éditeur (avec confirmation), ou depuis le dashboard. Les images de son article restent dans **Storage → event-images**.

#### Dates clés de L'Association (table `milestones`)

La liste « année + description » de la page **L'Association** est lue dans la table `milestones`. Le texte de présentation, lui, reste écrit dans `src/views/AboutView.vue` : il change rarement, et cela évite un appel à la base.

- **Depuis le site** : Espace éditeur → onglet **L'Association**, ou le lien « ✎ Modifier les dates » sous la liste, visible une fois connecté. On peut y **ajouter**, **modifier** sur place ou **supprimer** une date (avec confirmation). Contrairement aux événements, il n'y a pas de brouillon : une date est visible dès son ajout.
- **Ordre d'affichage** : libre, celui de la liste de l'espace éditeur. Les boutons **↑** et **↓** déplacent une date d'un cran, et le formulaire d'ajout propose de placer la nouvelle date **en tête** ou **en fin de liste**. L'ordre complet est enregistré en une seule opération.
- **Contrôles** : année entre 1900 et 2100, description obligatoire (500 caractères maximum), vérifiés par le site et imposés par la base.
- **Mise en place (une fois)** : exécuter dans le SQL Editor `supabase/migrations/20260927090000_create_milestones.sql`, qui reprend les dates affichées jusqu'ici, puis `20260928090000_milestones_position.sql`, qui ajoute l'ordre manuel en conservant l'ordre existant.

#### Comptes éditeurs

Être connecté ne suffit pas : seuls les comptes listés dans la table `editors` peuvent écrire. Les règles de sécurité en base (RLS) l'imposent, quoi que fasse le navigateur.

Mise en place (une fois) :

1. **SQL Editor** : exécuter `supabase/migrations/20260925090000_events_editors.sql`.
2. **Authentication → Sign In / Providers** : désactiver **Allow new users to sign up**. Les comptes sont alors créés uniquement par l'administrateur (recommandé, même si la table `editors` protège déjà les données).

Ajouter un éditeur :

1. **Authentication → Users → Add user → Create new user** : email, mot de passe, cocher **Auto Confirm User**.
2. **SQL Editor** :
   ```sql
   insert into public.editors (user_id) select id from auth.users where email = 'prenom@exemple.fr';
   ```

Retirer un éditeur : `delete from public.editors where user_id = (select id from auth.users where email = 'prenom@exemple.fr');` (ou supprimer son compte dans **Authentication → Users**).

Mot de passe oublié : le réinitialiser depuis **Authentication → Users**.

| Colonne | Rôle |
|---|---|
| `title` | Titre de l'événement (obligatoire) |
| `type` | Sortie, Roulage, Initiation, Formation, Compétition, Rassemblement, Rallye, Solidarité, Atelier ou AG (liste déroulante) |
| `starts_on` / `ends_on` | Date de début (obligatoire) et date de fin (vide si l'événement dure une journée) |
| `location`, `description` | Lieu et description courte (affichée dans la liste) |
| `details` | Article détaillé : HTML produit par l'éditeur visuel, ou Markdown s'il est saisi dans le dashboard (voir ci-dessous). S'il n'est pas vide, l'événement devient cliquable et ouvre sa page article |
| `has_details` | Calculé automatiquement (non modifiable) : coché si `details` contient du texte |
| `participants` | Texte libre, affiché seulement sur l'événement à la une (ex : « 120 participants ») |
| `is_featured` | Coché : l'événement est mis en avant en haut de la page (le prochain événement coché est retenu) |
| `published` | Décoché : l'événement est masqué sans être supprimé |

« À venir » ou « Passé » est calculé automatiquement à partir de la date. Les 6 derniers événements passés restent affichés.

#### Écrire un article (colonne `details`)

L'article s'affiche sur la page `/evenements/<id>`, accessible depuis la liste (« Lire la suite ») et depuis l'événement à la une (« En savoir plus »).

**Depuis l'espace éditeur**, il se rédige dans un éditeur visuel, comme un traitement de texte : titres, gras, italique, souligné, barré, couleurs de la charte (blanc, rouge, orange, gris), alignement, listes, citations, séparateurs, liens et **images**. Les raccourcis habituels fonctionnent (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z).

- **Images** : bouton 🖼, copier-coller ou glisser-déposer dans l'article. La photo est envoyée dans Supabase Storage (bucket `event-images`) **dès son insertion**, et non à l'enregistrement de l'événement. Formats acceptés : JPEG, PNG, WebP, GIF.
  - Taille : le fichier d'origine peut peser jusqu'à 25 Mo. Il est réduit à 1600 px dans le navigateur, puis doit faire au plus **5 Mo**. Ces 5 Mo sont vérifiés par le site, avec un message immédiat, et imposés par Supabase quoi qu'il arrive.
  - Les GIF ne sont pas réduits, pour garder l'animation : un GIF de plus de 5 Mo est refusé.
  - **Taille d'affichage** : cliquer sur l'image, puis soit tirer une poignée à un coin (les proportions sont toujours conservées), soit utiliser les boutons **Petite** (240 px), **Moyenne** (420 px) ou **Pleine** (largeur de l'article). Sur mobile, une image plus large que l'écran se réduit automatiquement.
  - **Image à côté du texte** : cliquer sur l'image, puis **◧ Gauche** ou **Droite ◨**. Le texte qui suit l'entoure, et **▣ Seule** la remet sur sa propre ligne. Un titre, un séparateur ou un tableau repart toujours sous l'image, ce qui permet d'enchaîner des blocs « image + texte ». Sur mobile, l'image repasse au-dessus du texte.
- **Tableaux** : le bouton ▦ insère un tableau de 3 × 3 avec une ligne d'en-tête. Quand le curseur est dedans, la barre propose d'ajouter ou de supprimer des lignes et des colonnes, d'activer l'en-tête, de fusionner des cellules ou de supprimer le tableau. Les colonnes ont une largeur égale, et le texte passe à la ligne plutôt que de déborder sur mobile. Pour mettre une image à côté d'un texte, préférer l'alignement d'image ci-dessus : un tableau ne se réorganise pas sur petit écran.
  - Une image insérée puis retirée de l'article, ou un article jamais enregistré, laisse le fichier dans Storage. Faire le ménage de temps en temps dans **Storage → event-images**.
- **Contenu collé** depuis Word ou un site web : seules la couleur et l'alignement sont conservés. Les autres styles (polices, tailles, fonds) sont retirés pour garder la charte du site.
- **Images d'autres sites** : elles sont retirées automatiquement (RGPD). Seules s'affichent les images de Supabase Storage et celles du site (`/fichier.jpg`, dans `public/`).
- Les liens vers d'autres sites s'ouvrent dans un nouvel onglet, et le HTML dangereux (scripts…) est filtré.

**Depuis le dashboard Supabase**, `details` peut aussi être saisi en Markdown (`## Titre`, `**gras**`, `- liste`, `![photo](/moto1.jpg)`…). L'éditeur visuel le convertit à la première modification.

**Images des articles, mise en place (une fois) :** exécuter `supabase/migrations/20260926090000_event_images_storage.sql` dans le SQL Editor. Il crée le bucket public `event-images`, où seuls les éditeurs peuvent déposer des fichiers. Pour supprimer une image : **Storage → event-images** dans le dashboard.

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

La page de contact accepte un objet pré-sélectionné dans l'URL, par exemple `/contact?objet=boutique`.

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

### Documentation d'exploitation

- [`docs/DOMAINES.md`](docs/DOMAINES.md) : DNS, domaines, redirections et lien avec le Worker.
- [`docs/REFERENCEMENT.md`](docs/REFERENCEMENT.md) : référencement, ce qui est en place et les actions à mener.

## Vie privée

Le site ne charge aucune ressource tierce, à une exception près : l'API Supabase, pour les événements. Les polices sont hébergées localement via Fontsource, et les icônes des réseaux sociaux sont des SVG intégrés. Merci de conserver ce principe (RGPD), et de choisir une région Europe pour le projet Supabase.
