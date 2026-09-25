# Ride 4 Change — Référencement

Mis à jour le 25/09/2026.

La partie technique est en place : le site est prêt à être indexé par Google dès son déploiement. Il reste des actions à faire dans les outils de Google et Bing, et du contenu à étoffer.

## Actions à mener

### Après le déploiement (à faire une fois)

- [ ] **Google Search Console** : ajouter une propriété de type **Domaine** pour `ride4change.fr`.
    - Google fournit un enregistrement TXT : l'ajouter dans Cloudflare (zone `ride4change.fr` → *DNS → Records*, type `TXT`, name `@`), puis cliquer sur *Valider*.
    - Menu *Sitemaps* : soumettre `https://ride4change.fr/sitemap.xml`.
    - Menu *Inspection de l'URL* : demander l'indexation de l'accueil et de `/association`, pour accélérer le premier passage.
- [ ] **Bing Webmaster Tools** : se connecter avec le compte Google et importer la propriété depuis Search Console (le sitemap est repris automatiquement). Bing alimente aussi DuckDuckGo, Ecosia et Qwant.
- [ ] **Vérifier les aperçus de partage** : coller `https://ride4change.fr` dans le *Sharing Debugger* de Facebook (developers.facebook.com/tools/debug), puis cliquer sur *Scrape Again*. L'aperçu doit afficher le titre, la description et la photo de l'équipe au Mans.
- [ ] **Tester les données structurées** : passer `https://ride4change.fr/` et une page d'événement (ex : `/evenements/1`) dans le *Test des résultats enrichis* de Google (search.google.com/test/rich-results). Il doit détecter une organisation et un événement.

### Visibilité locale et liens (à faire une fois, puis entretenir)

- [ ] **Google Business Profile** (business.google.com) : créer la fiche de l'association (catégorie « Association » ou « Club de sport »), avec l'adresse de Saint-Méen-le-Grand, le site, des photos et les horaires si pertinent. C'est ce qui fait apparaître l'association sur Google Maps et dans les recherches locales.
- [ ] **Réseaux sociaux** : mettre `https://ride4change.fr` dans la bio Facebook, Instagram et TikTok.
- [ ] **Partenaires** : demander un lien vers le site sur les sites des partenaires (Pif Paf Motos, Dafy…), des circuits et des organisateurs de courses. Chaque lien depuis un site reconnu améliore le classement.
- [ ] **Annuaires** : inscrire l'association sur l'annuaire des associations de la mairie, du département et sur les sites de la fédération moto (FFM) si possible.

### Contenu (en continu)

Google classe les pages sur leur texte. Plus le site explique clairement qui vous êtes, où, et pour qui, mieux il sera trouvé.

- [ ] **Remplacer le contenu d'exemple** des pages Boutique, Initiation & Roulage et Galerie (la galerie est exclue du sitemap tant qu'elle n'a pas de vraies photos).
- [ ] **Employer les mots que les gens tapent** : « association moto handicap », « pilote moto handicapé », « initiation moto sur circuit », « roulage Le Mans », « Fay-de-Bretagne », « Bretagne », « Ille-et-Vilaine ».
- [ ] **Publier régulièrement des événements avec un article** : chaque article est une page référencée, avec sa date dans les résultats Google. Ajouter une photo au début de l'article : elle sert d'image d'aperçu sur les réseaux sociaux.
- [ ] **Soigner le titre et la description de chaque événement** : ce sont eux qui s'affichent dans Google. La description (le champ court, pas l'article) doit faire une ou deux phrases.
- [ ] **Compléter le numéro de téléphone** dans le pied de page (actuellement `+33 00 00 00 00 00`), puis l'ajouter aux données structurées de `index.html`.

### Suivi (une fois par mois)

- [ ] Search Console → *Pages* : vérifier que les pages sont indexées et corriger les erreurs signalées.
- [ ] Search Console → *Performances* : voir sur quelles recherches le site apparaît, pour ajuster le vocabulaire des pages.

## Ce qui est en place

| Élément | Où | Rôle |
|---|---|---|
| Vraies URL (`/association`, `/evenements/12`) | `src/router/index.ts` (`createWebHistory`), `wrangler.toml` (`not_found_handling`) | Chaque page est référençable séparément. Les anciens liens `/#/…` sont redirigés. |
| Titre, description, URL canonique par page | `meta` des routes, `src/lib/seo.ts` | Ce que Google affiche dans ses résultats |
| Pages d'événement | `src/views/EventDetailView.vue` | Titre, description et première image de l'article, données structurées `Event` |
| Aperçus de partage (Open Graph) | `index.html`, `public/og-image.jpg` (1200×630) | Aperçu sur Facebook, WhatsApp, Instagram… |
| Fiche de l'association (JSON-LD `SportsOrganization`) | `index.html` | Nom, adresse, logo, réseaux sociaux pour Google |
| Exclusion de l'espace éditeur | `noindex` sur `/connexion` et `/admin/*`, `public/robots.txt` | Ces pages n'apparaissent pas dans Google |
| `robots.txt` | `public/robots.txt` | Indique le sitemap et exclut l'espace éditeur |
| `sitemap.xml` | `worker/sitemap.ts` | Liste les pages et les événements avec article, lue dans Supabase (à jour sans redéploiement, cache 1 h) |
| Langue | `index.html` (`lang="fr"`) | Référencement en français |
| Icônes (favicon) | `public/favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | Icône de l'onglet et des résultats Google sur mobile (tête du logo en rond), icône d'écran d'accueil (logo entier). Générées depuis `public/logo.svg` |
| Domaines secondaires | Bulk Redirect 301 (voir [`DOMAINES.md`](DOMAINES.md)) | Un seul domaine indexé, `ride4change.fr`, sans contenu dupliqué |

**Ajouter une page au site** : lui donner un `meta.title` et un `meta.description` dans `src/router/index.ts`, et l'ajouter à `STATIC_PAGES` dans `worker/sitemap.ts`.

## Limite connue et évolution possible

Google exécute le JavaScript et voit le titre et la description propres à chaque page. En revanche, **les aperçus Facebook et WhatsApp ne lisent que le HTML brut** : ils affichent toujours les valeurs par défaut d'`index.html` (accueil), même pour un lien vers un événement.

Si des aperçus propres à chaque événement deviennent importants (partage d'événements sur les réseaux), le Worker pourrait injecter le titre, la description et l'image de l'événement dans le HTML avant de l'envoyer (`HTMLRewriter` de Cloudflare, en ajoutant `/evenements/*` à `run_worker_first`).
