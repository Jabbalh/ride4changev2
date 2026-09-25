# Ride 4 Change — Analyse du site et améliorations

Analyse du 25/09/2026, portant sur le code, l'expérience utilisateur, le contenu, la performance et la sécurité. Les numéros de ligne correspondent à l'état du code à cette date.

**Bilan.** La base est saine. La sécurité Supabase est solide (RLS partout, droits limités aux colonnes éditables, aucun secret dans le dépôt), et l'espace éditeur est bien isolé du site public. Les faiblesses sont ailleurs : un formulaire de contact qui perd les messages, beaucoup de contenu d'exemple encore en ligne, et des optimisations faciles non faites.

## Plan proposé

| Lot | Contenu | Qui | État |
|---|---|---|---|
| **A. Formulaire de contact** | Envoi par mail via Cloudflare Email Routing (voir « Lot A : envoi des messages »), limitation anti-spam, contrôles d'origine et de taille | Claude ; l'utilisateur active Email Routing | En attente de validation par l'association |
| **B. Nettoyage rapide** | Images inutilisées, fautes, bugs carrousel et indicateur, code mort, menus alignés | Claude | Fait (25/09/2026) |
| **C. Performance et en-têtes** | `_headers` (sécurité et cache), images en WebP, chargement à la demande, allègement du JS public | Claude | Fait (25/09/2026) |
| **D. Accessibilité** | Formulaire, menu mobile, focus, popins de la galerie, pause du carrousel | Claude | Fait (25/09/2026) |
| **E. Mentions légales** | Page `/mentions-legales` et lien dans le pied de page | Claude ; l'utilisateur fournit RNA et directeur de publication | Page faite (25/09/2026), 3 informations à compléter |
| **F. Contenu** | Vraies photos, témoignages, textes Compétition et Boutique, téléphone | L'association (Claude intègre) | À faire |

Ordre conseillé : A (urgent), puis B et C (rapides, sans risque), puis D et E. F avance en parallèle, au rythme de l'association.

## Lot A : envoi des messages du formulaire

Réflexion du 25/09/2026, **en attente de validation par le responsable de l'association**.

**Solution retenue : Cloudflare Email Routing + envoi depuis le Worker**, à la place de Resend (proposé au départ).

- **Email Routing** (gratuit) : Cloudflare reçoit les mails de `@ride4change.fr` et les fait suivre. Exemple : `contact@ride4change.fr` → `1ride4change@gmail.com`, sans boîte à gérer.
- **Envoi depuis le Worker** (liaison `send_email`, gratuite) : le Worker envoie chaque message du formulaire à une adresse **vérifiée** dans Email Routing (le Gmail de l'association). Expéditeur `contact@ride4change.fr`, `Reply-To` réglé sur l'adresse du visiteur : il suffit de cliquer sur « Répondre » dans Gmail.
- **Limite** : on ne peut envoyer qu'aux adresses vérifiées. Pas de mail de confirmation automatique au visiteur ; l'écran de confirmation du site suffit. (Cloudflare propose aussi un service d'envoi généraliste, *Email Service*, lancé en bêta : disponibilité à vérifier dans le dashboard, inutile pour ce besoin.)
- **Avantages** : aucun service tiers (cohérent avec le choix RGPD du site, où Supabase est la seule exception), gratuit, pas de compte supplémentaire, et `contact@ride4change.fr` devient une vraie adresse de réception.

**Point bloquant à confirmer.** Au 25/09/2026, les MX de `ride4change.fr` pointent chez OVH (`mx1`, `mx2`, `mx3.mail.ovh.net`, offre MX Plan incluse avec le domaine), avec le SPF `v=spf1 include:mx.ovh.com -all`. Activer Email Routing remplace ces MX par ceux de Cloudflare : **une éventuelle boîte OVH en `@ride4change.fr` cesserait de recevoir des mails.**

Questions pour le responsable de l'association :

- [ ] La messagerie OVH de `ride4change.fr` est-elle utilisée (une adresse créée, des mails reçus) ? Si oui, il faut la migrer ou choisir une autre solution.
- [ ] À quelle adresse les messages du formulaire doivent-ils arriver : `1ride4change@gmail.com`, ou une autre ?
- [ ] Faut-il aussi créer `contact@ride4change.fr` (redirigée vers cette adresse) pour l'afficher sur le site à la place du Gmail ?

**Ensuite :**

1. **Utilisateur (dashboard Cloudflare)** : zone `ride4change.fr` → *Email* → *Email Routing* → *Enable* (Cloudflare remplace les MX et le SPF). Ajouter l'adresse de destination, puis cliquer sur le lien de vérification reçu. Optionnel : règle `contact@ride4change.fr` → cette adresse.
2. **Claude (code)** :
    - liaison `send_email` dans `wrangler.toml` (puis `pnpm cf-typegen`) ;
    - envoi du message dans `worker/contact.ts` ;
    - protections anti-spam de la section « Sécurité » : limite de débit, vérification de `Origin` et `Content-Type`, taille maximale du corps, rejet des retours à la ligne dans les champs courts, contrôle de délai ;
    - suppression du `console.log` des données personnelles.
3. Tester en ligne avec un vrai message, puis mettre à jour `docs/DOMAINES.md` (nouveaux enregistrements MX et SPF).

## Les 5 priorités

- [ ] **Le formulaire de contact perd tous les messages** (solution envisagée : voir « Lot A : envoi des messages »). Le visiteur voit « Message envoyé ! », mais `worker/contact.ts:62-66` ne fait qu'un `console.log`, dans des journaux que personne ne consulte (pas de `[observability]` dans `wrangler.toml`). Les demandes d'adhésion, de boutique et d'inscription aux événements passent toutes par ce formulaire. Les noms, emails et messages restent en clair dans les logs. → Envoyer un mail (Cloudflare Email Routing, expéditeur `contact@ride4change.fr`), puis ne journaliser qu'un identifiant.
- [x] **Pas de mentions légales ni de politique de confidentialité** : page `/mentions-legales` créée (`src/views/LegalView.vue`), liée dans le pied de page et depuis le formulaire. **Reste à fournir par l'association**, en haut du fichier (constantes `EDITEUR` et `HEBERGEMENT`) : numéro RNA, directeur ou directrice de la publication, région d'hébergement Supabase (dashboard → *Project Settings* → *General*). Facultatif : crédits photos. Tant qu'une valeur manque, la page affiche « à compléter ». À revoir quand le lot A sera fait (destinataires des messages).
    - Constat initial : mentions obligatoires pour une association qui édite un site (LCEN) et collecte des données (RGPD). → Page `/mentions-legales` : éditeur (nom, siège, numéro RNA), directeur de la publication, hébergeurs (Cloudflare, Supabase), finalité et durée de conservation des données, droits des visiteurs. Lien dans `FooterBar.vue:39`, et mention d'information sous le bouton du formulaire (`ContactView.vue:57-66`).
- [ ] **Contenu d'exemple visible par les visiteurs** (détail dans « Contenu à remplacer »).
- [x] **Environ 2 Mo d'images inutilisées en ligne**, accessibles par leur adresse (détail dans « Performance »).
- [x] **Aucun en-tête de sécurité ni de cache** → fichier `public/_headers` (proposition dans « Sécurité »).

## Bugs

- [x] **Carrousel de l'accueil** (`HomeView.vue:203-210`) : le défilement automatique appelle `nextSlide()` sans remettre `progress` à zéro. Après le premier cycle, la barre reste pleine et `progress` grimpe sans fin. → `progress.value = 0` dans le callback de `slideInterval`, ou un seul intervalle.
- [x] **Indicateur de défilement** (`ProgressScroll.vue:10-24`) : affiche « NaN% » sur une page plus courte que l'écran (`0/0`). L'écouteur `scroll` n'est jamais retiré, n'est pas `passive`, et l'indicateur n'est pas recalculé après un changement de page. → Garde `docHeight > 0`, `{ passive: true }`, `removeEventListener` dans `onUnmounted`, recalcul sur `router.afterEach`.
- [ ] **Envoi d'images dans l'éditeur** (`RichTextEditor.vue:186-200, 299-317`) : avec plusieurs images collées ou déposées, le premier envoi terminé remet `uploading` à `false`, les erreurs s'écrasent, et la position de dépôt devient fausse après la première insertion. Enregistrer pendant un envoi perd l'image, qui reste orpheline dans le bucket. → Compteur d'envois, envois séquentiels, bouton « Enregistrer » désactivé pendant un envoi.
- [ ] **Dates clés, « En fin de liste »** (`AdminMilestonesView.vue:117-130`) : si la création réussit mais pas le déplacement, la date est créée sans apparaître, et réessayer crée un doublon. → Recharger la liste aussi en cas d'erreur, avec un message « date créée, mais pas déplacée ».
- [ ] **Réordonnancement des dates** (`useMilestoneAdmin.ts`) : si un autre éditeur supprime une date entre-temps, le message « pas les droits » s'affiche alors que l'ordre a été enregistré. → Distinguer 0 ligne modifiée (refus) de « moins que prévu » (liste périmée : recharger).
- [ ] **Session éditeur** (`useAuth.ts:21-33`) : si `getSession()` échoue, la promesse rejetée reste en cache, et chaque accès à `/admin/*` lève une erreur jusqu'au rechargement. → `try/catch` qui remet `ready = null`.

## Contenu à remplacer

- [ ] **Page Compétition** (`CompetitionView.vue:80-96`) : « Bla bla bla » ×4 et emojis sans rapport (🎁 🩺 🍖). Elle est dans le menu et le sitemap. → La remplir, ou la retirer du menu et de `STATIC_PAGES` (`worker/sitemap.ts`) en attendant.
- [ ] **Témoignages fictifs** « Toto / Moi je bricole », « Machin / Squatteur » (`HomeView.vue:312-316`) → Vrais témoignages, ou masquer la section.
- [ ] **Carrousel de l'accueil** en emojis, avec des titres inventés (Gorges du Verdon, Collecte de Noël) (`HomeView.vue:188-193`).
- [ ] **Galerie** tirée d'un modèle : Verdon, Camargue, Arles, col de l'Iseran, dates 2023-2024 (`GalleryView.vue:79-97`). Le bouton « Voir toutes les photos » de l'accueil (`HomeView.vue:69`) y mène.
- [ ] **Cartes « Nos actions »** en emojis (🩺 pour « Les salons »), et description vide pour « Courses » (`HomeView.vue:307-311`).
- [ ] **« Nos partenaires »** : description vide et aucun partenaire cité (`HomeView.vue:255`). `public/partenaire1.png` n'est pas utilisé. → Section partenaires avec logos.
- [ ] **Boutique** : 4 articles « Prix à venir », tous indisponibles, en emojis (`BoutiqueView.vue:50-55`) → Vrais articles, ou masquer l'onglet.
- [ ] **Bureau** : « Anthony Martin, Bricoleur, Bricoleur passionné. » (`AboutView.vue:115`) → Vrais rôles (trésorier, secrétaire…) et bios.
- [ ] **Téléphone factice** `+33 00 00 00 00 00` (`FooterBar.vue:31`, `ContactView.vue:158`). L'email n'est pas cliquable (`mailto:`). Ces coordonnées sont dupliquées entre les deux fichiers.

## Fautes visibles

- [x] `HomeView.vue:30` : « Une équipe devenu une famille. Aucun frein » → « Une équipe devenue une famille. Aucun frein. »
- [x] `HomeView.vue:54` : « …et le partage chaque kilomètre à du sens » → « …et le partage, chaque kilomètre a du sens. »
- [x] `HomeView.vue:254` : « Bol d'argent . » → « Bol d'Argent. »
- [x] `HomeView.vue:257` : « sans amis ou bénévoles rien n'es possible » → « sans amis ni bénévoles, rien n'est possible. »
- [x] `HomeView.vue:310` : « etc... » → « etc. »
- [x] `CompetitionView.vue:9` : « Parce ce qu'on fait aussi de la compétion - l'aventure en image. » → « Parce qu'on fait aussi de la compétition : l'aventure en images. »
- [x] `CompetitionView.vue:88` : « Dans les startings block », « Prêt à demarrer pour sur cette piste » → « Dans les starting-blocks », « Prêts à démarrer sur cette piste mythique. »
- [x] `CompetitionView.vue:90` : « En plein de coeur de l'édition » → « En plein cœur de l'édition »
- [x] `CompetitionView.vue:83, 91, 93-96` : uniformiser « 8 H de SPA » / « 8H de SPA » en « 8 Heures de Spa » ; « Soleil et Asphalte » → « Soleil et asphalte ».
- [x] `AboutView.vue:18` : « Née de la passion, unis par la route » → « Née de la passion, unie par la route ».
- [x] `InitiationView.vue:83` : « Debriefing » → « Débriefing ».
- [x] `FooterBar.vue:11` : « Suivez nous » → « Suivez-nous » ; ligne 38 : « Ride 4 change » → « Ride 4 Change ».
- [x] `FooterBar.vue:29` et `ContactView.vue:156` : « Saint Meen le Grand » → « Saint-Méen-le-Grand ».

## Navigation

- [x] **Menus différents** : la Galerie est dans le pied de page mais pas dans le menu (`NavBar.vue:29-37`), la Compétition dans le menu mais pas dans le pied de page (`FooterBar.vue:50-58`). → Une seule liste partagée (ex : `src/lib/navLinks.ts`), en revérifiant la largeur du menu (burger sous 1150 px).
- [x] **« Nous rejoindre »** (`NavBar.vue:16`) et **« Faire une demande »** (`AboutView.vue:93`) mènent à `/contact` sans `?objet=adhesion`.

## Accessibilité

- [x] **Formulaire de contact** (`ContactView.vue:28-59`) : aucun `<label>` relié à son champ (`for`/`id`), `outline: none` sur les champs, message d'erreur sans `role="alert"`, astérisque non expliqué. Pas de `maxlength`, alors que le worker refuse au-delà de 100, 200 ou 5000 caractères, avec un message qui cite le nom technique du champ (« prenom »).
- [x] **Menu mobile** (`NavBar.vue:8`) : bouton burger sans `aria-label` ni `aria-expanded`. Le menu ne se ferme pas avec Échap ni lors d'un retour arrière. `display: none` (ligne 105) annule sa transition.
- [x] **Galerie et Compétition** (`GalleryView.vue:33-67`, `CompetitionView.vue`) : cartes en `<div @click>` inaccessibles au clavier, popin en `div` (ni Échap, ni gestion du focus, le fond défile), bouton ✕ sans libellé, titres visibles seulement au survol (donc jamais sur mobile). → Reprendre le `<dialog>` de la popin de l'accueil.
- [x] **Carrousel** (`HomeView.vue:98-104, 203-211`) : défilement automatique sans pause ni respect de `prefers-reduced-motion` (WCAG 2.2.2) ; pastilles en `<span @click>` → `<button aria-label="Photo n">` de 24 px minimum.
- [x] **Focus clavier** : aucun style `:focus-visible` global dans `main.css`. Ajouter aussi un lien d'évitement « Aller au contenu » dans `App.vue`.
- [x] **Animations** : logo ⚙ qui tourne en boucle (`NavBar.vue:73`) et `scroll-behavior: smooth` (`main.css:28`) sans `prefers-reduced-motion`.
- [x] **Images** : photos de L'Association sans `alt` (`AboutView.vue:43, 46, 47`). Logo dans le `h1` avec `alt="Logo"` (`HomeView.vue:12`), lu « Logo Ride 4 Change » → `alt=""`.
- [x] **Contraste** : pourcentage de défilement en `#666` sur `#0d0d0d`, environ 3,4:1, sous le seuil AA (`ProgressScroll.vue:53`).
- [x] **Icônes réseaux** : nom accessible limité au `title`, et ouverture dans un nouvel onglet non signalée (`FacebookSocialLinkk.vue:5`…). Boutons flottants de 35 px (`SocialFloat.vue:18`) : viser 44 px sur mobile.

## Responsive

- [ ] **Boutons réseaux flottants** (`SocialFloat.vue:17`) et **indicateur de défilement** (`ProgressScroll.vue:49`) : ils recouvrent le contenu sur mobile. → Les masquer sous 768 px.
- [ ] **`h2 { font-size: 2.5rem !important }`** (`main.css`) écrase les `clamp()` de tous les titres, qui restent grands sur téléphone et dans les articles. → Le retirer, ou le remplacer par un `clamp`.
- [ ] **Barre de filtres** collée à `top: 70px` (Galerie, Compétition), alors que la hauteur de la barre de navigation varie.
- [ ] **En-tête de l'accueil** : `min-height: 20vh` et `height: 40vh` mélangés (`HomeView.vue:324, 351`). Risque de débordement en paysage sur petit écran → `min-height`.

## Performance

Sur chaque page publique, le visiteur télécharge environ 136 Ko compressés de JavaScript avant tout affichage. Tiptap (143 Ko) reste bien limité à l'espace éditeur.

| Fichier chargé partout | Brut | Compressé |
|---|---|---|
| JS principal (`index-*.js`) | 142 Ko | 49 Ko |
| supabase-js (`supabase-*.js`) | 299 Ko | 87 Ko |
| CSS (`index-*.css`, 26 `@font-face`) | 62 Ko | 9 Ko |

- [x] **supabase-js complet sur toutes les pages** (87 Ko compressés), alors que les pages publiques ne font que lire. → Lectures publiques en `fetch` direct vers `/rest/v1/` (comme `worker/sitemap.ts`), et `import()` de supabase-js seulement pour l'espace éditeur.
- [x] **marked et DOMPurify dans le JS principal** (environ 20 Ko compressés), utiles seulement pour `/evenements/:id`. → `EventDetailView` en import dynamique dans `src/router/index.ts`.
- [x] **Toutes les vues publiques en import statique** → Galerie, Boutique, Compétition et Initiation en `() => import(...)`.
- [x] **Images inutilisées, déployées et accessibles publiquement** (2,08 Mo) : `partenaire1.png` (471 Ko), `ales.PNG` (448 Ko), `moto3.jpg` (440 Ko), `moto2.jpg` (307 Ko), `la_mans.jpeg` (241 Ko), `yeye.jpg` (166 Ko), `icons.svg` (5 Ko). → Les supprimer. Ce sont peut-être des photos personnelles.
- [x] **`logo.svg` de 180 Ko** (export Inkscape) pour une icône de 1,2 em dans le titre (`HomeView.vue:12`). → Optimiser avec SVGO, ou remplacer par un PNG ou WebP de 128 px (environ 5 Ko).
- [x] **Image de fond de l'accueil** `accuei.jpg` (468 Ko, 2000 px), chargée par le CSS donc découverte tard. → WebP de 1600 px (environ 150 Ko) et `<link rel="preload" as="image">`.
- [x] **`Bassin.jpg`** (633 Ko, 2000 px) affichée dans une carte (`AboutView.vue:43`) → 1200 px en WebP (environ 100 Ko).
- [x] **Vignettes et grandes photos de l'accueil** en JPEG : 590 Ko pour les 4 vignettes, 260 à 370 Ko par grande photo → WebP (environ 40 Ko par vignette).
- [x] **Balises `<img>` sans `loading="lazy"`, `width`/`height` ni `decoding="async"`** (`HomeView.vue:39`, `AboutView.vue:43-47`) : décalages de mise en page et téléchargement de tout au premier affichage.
- [x] **Polices** : 9 imports `@fontsource` (`src/main.ts`), environ 195 Ko téléchargés. `barlow/300` et `400-italic` sont très peu utilisées → les retirer (environ 45 Ko).
- [x] **Cache** : sans `public/_headers`, Cloudflare sert tout en `max-age=0`, y compris les fichiers hashés de `/assets/`, qui sont revalidés à chaque visite → `Cache-Control: public, max-age=31536000, immutable` sur `/assets/*`.

## Sécurité

**Aucun trou critique.** RLS est activé sur toutes les tables, avec `revoke all` puis des droits par colonne. `is_editor()` est en `security definer` avec `search_path` fixé. Le bucket d'images refuse le SVG et limite à 5 Mo. `.env.local` n'a jamais été commité, et aucune clé secrète n'est présente (`wrangler.toml` ne contient que la clé publishable, volontairement).

- [x] **Aucun en-tête de sécurité** (CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`). C'est le point le plus important, puisque les articles passent par `v-html`. Proposition de `public/_headers`, où `<ref>` est le sous-domaine du projet Supabase. À déployer d'abord en `Content-Security-Policy-Report-Only` et à tester sur l'accueil, un article, la connexion et l'éditeur avec envoi d'image :

  ```
  /*
    Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://<ref>.supabase.co; font-src 'self'; connect-src 'self' https://<ref>.supabase.co; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
    X-Frame-Options: DENY
    Strict-Transport-Security: max-age=31536000; includeSubDomains

  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  ```

  `'unsafe-inline'` dans `style-src` est nécessaire, car les articles gardent des `style` (couleur, alignement). Le JSON-LD n'est pas bloqué, car ce n'est pas un script exécutable. `_headers` ne s'applique pas à `/api/*` ni à `/sitemap.xml`, qui passent par le worker : y ajouter `X-Content-Type-Options: nosniff`.
- [ ] **`/api/contact` sans limitation de débit** : un robot qui ne remplit pas le champ piège peut envoyer sans limite. C'est à régler avant de brancher l'envoi de mails → binding `[[ratelimits]]` Workers (ex : 5 par minute et par IP) ou Turnstile (Cloudflare, donc pas un tiers de plus).
- [ ] **`/api/contact` ne vérifie ni `Content-Type` ni `Origin`** (`contact.ts:43`) : n'importe quel site peut y poster, sans preflight CORS → Refuser si ce n'est pas `application/json` ou si l'origine n'est pas `https://ride4change.fr`.
- [ ] **Pas de limite de taille du corps** : il est lu entier avant validation → Refuser au-delà de 16 Ko.
- [ ] **Retours à la ligne acceptés** dans `prenom`, `nom`, `moto` : risque d'injection d'en-têtes dans le futur mail → Les rejeter partout sauf dans `message`.
- [ ] **Anti-spam limité au champ piège** → Ajouter un contrôle de délai (envoi en moins de 3 s après l'affichage rejeté).
- [ ] **Nettoyage des articles** (`richText.ts`) : le filtre d'images ne contrôle que `img[src]`. La configuration par défaut de DOMPurify laisse passer `srcset`, `<video>`, `<audio>`, `<source>`, `poster`, `background`, `<form>`, `<input>`, `<button>`. Seuls les éditeurs écrivent, d'où un risque faible → `ALLOWED_TAGS` limité aux balises de Tiptap, et `FORBID_ATTR: ['srcset', 'background', 'poster']`.
- [ ] **Détection des liens externes** (`richText.ts:43`) : `href.startsWith(location.origin)` considère `https://ride4change.fr.exemple.com` comme interne → Comparer `new URL(href, location.href).origin`.
- [ ] **Dashboard Supabase, à vérifier** : désactiver « Allow new users to sign up » (un inconnu peut sans doute créer un compte ; il n'aurait aucun droit, mais c'est inutile). Activer « Leaked password protection ».
- [ ] **Colonnes texte de `events` sans limite de longueur** → `check (char_length(...) <= N)` (ex : 200 pour `title`, 200 000 pour `details`).
- [ ] **Images orphelines** : elles s'accumulent dans le bucket `event-images` (événements supprimés, envois abandonnés) → Nettoyage périodique depuis le dashboard.

## Maintenance du code

- [x] **`GalleryView.vue` et `CompetitionView.vue` identiques à 95 %** (même template, même script, 110 lignes de CSS) → Composant `PhotoGallery.vue` et deux vues minces.
- [ ] **Bloc `.page-header` copié dans 8 vues** (environ 15 lignes identiques ; seule la position du dégradé change). Même chose pour `.info-card` et `.info-row` (ContactView, EventDetailView) → Composant `PageHeader.vue` ou classe globale.
- [x] **Code mort** : `anneeExistance` (`HomeView.vue:251`) ; import de `SocialFloat` inutilisé dans HomeView, GalleryView et CompetitionView (déjà monté dans `App.vue`) ; plugin `@vitejs/plugin-vue-jsx` sans aucun fichier JSX (`vite.config.ts`).
- [x] **Blocs commentés et CSS orphelin** : `ContactView.vue:83-108` (réunions, cotisation) et styles associés ; `AboutView.vue:78-89` (reste de gabarit « Iron Brotherhood MC ») et `.docs-text`, `.docs-list`.
- [x] **Typage faible** : `openModal = (photo: any)` (Galerie, Compétition) ; `slideInterval: any` (HomeView).
- [x] **Nom de fichier** : `FacebookSocialLinkk.vue` (double « k », répété dans 3 imports).
- [x] **Chemins absolus** `/logo.svg` et `url('/accuei.jpg')` (`HomeView.vue:12, 333`), contraires à la convention `import.meta.env.BASE_URL` du projet. Sans conséquence aujourd'hui (le site est à la racine).

## Demandes de l'association (`description.txt`) pas encore faites

- [ ] **Onglet « Ride 4 Change Racing »**, séparé de l'association : seule la page « Compétition » existe, en contenu d'exemple.
- [ ] **Tag « Nos aménagements »** (motos adaptées) dans la galerie.
- [ ] **Carte cadeau** dans la boutique.
- [ ] **Icônes de réseaux sociaux plus grandes**, et affichées aussi sur la page Contact (`displayImage=false`, `ContactView.vue:92-94`).
- [ ] **Charte orange et noir** : le site est rouge (`--red: #e63946`), et `--orange` est défini mais presque inutilisé. C'est une décision de charte à prendre avec l'association.
- [ ] **Refonte de la page d'accueil**, inspirée des sites cités en exemple : elle reste en grande partie en contenu d'exemple.
