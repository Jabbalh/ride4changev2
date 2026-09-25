import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
// Les autres pages sont chargées à la demande : l'accueil ne télécharge que son propre code
// (la page article, par exemple, apporte marked et DOMPurify).
const About = () => import('@/views/AboutView.vue')
const Gallery = () => import('@/views/GalleryView.vue')
const Events = () => import('@/views/EventsView.vue')
const Contact = () => import('@/views/ContactView.vue')
const CompetitionView = () => import('@/views/CompetitionView.vue')
const InitiationView = () => import('@/views/InitiationView.vue')
const BoutiqueView = () => import('@/views/BoutiqueView.vue')
const EventDetailView = () => import('@/views/EventDetailView.vue')
const LegalView = () => import('@/views/LegalView.vue')
import { useAuth } from '@/composables/useAuth'
import { setPageJsonLd, setPageMeta } from '@/lib/seo'

declare module 'vue-router' {
  interface RouteMeta {
    // Page réservée aux éditeurs (table public.editors). Confort d'interface : la vraie protection est RLS.
    requiresEditor?: boolean
    // Référencement : titre (sans le nom du site) et description de la page
    title?: string
    description?: string
    // Page exclue des moteurs de recherche (espace éditeur)
    noindex?: boolean
  }
}

const editor = { requiresEditor: true, noindex: true, title: 'Espace éditeur' }

// Anciens liens en /#/page (avant le passage aux vraies URL) : l'adresse est réécrite ici,
// avant createWebHistory qui lit l'URL courante dès sa création.
if (location.hash.startsWith('#/')) {
  history.replaceState(null, '', import.meta.env.BASE_URL.replace(/\/$/, '') + location.hash.slice(1))
}

const router = createRouter({
  // Vraies URL (/association) et non /#/association : indispensable pour le référencement.
  // Cloudflare renvoie index.html pour toute URL inconnue (not_found_handling dans wrangler.toml).
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/association', component: About, meta: {
      title: "L'Association",
      description: "Qui sommes-nous ? L'histoire, les valeurs et l'engagement de Ride 4 Change, association moto et handicap fondée en 2025 en Bretagne.",
    } },
    { path: '/galerie', component: Gallery, meta: {
      title: 'Galerie',
      description: "Sorties, actions solidaires, rassemblements : l'aventure Ride 4 Change en images.",
    } },
    { path: '/competition', component: CompetitionView, meta: {
      title: 'Compétition',
      description: "Ride 4 Change en compétition moto : courses, pilotes et résultats de l'équipe.",
    } },
    { path: '/initiation-roulage', component: InitiationView, meta: {
      title: 'Initiation & Roulage',
      description: "Découvrir la piste en toute sécurité ou progresser à votre rythme : initiations et roulages moto encadrés par Ride 4 Change.",
    } },
    { path: '/evenements', component: Events, meta: {
      title: 'Événements',
      description: "L'agenda de Ride 4 Change : sorties, compétitions, roulages et actions solidaires à venir.",
    } },
    { path: '/evenements/:id(\\d+)', component: EventDetailView, props: route => ({ id: Number(route.params.id) }) },
    { path: '/boutique', component: BoutiqueView, meta: {
      title: 'Boutique',
      description: "Portez les couleurs de Ride 4 Change : chaque achat soutient les actions de l'association.",
    } },
    { path: '/contact', component: Contact, meta: {
      title: 'Contact',
      description: "Une question, envie de nous rejoindre ou de devenir partenaire ? Contactez l'association Ride 4 Change.",
    } },

    { path: '/mentions-legales', component: LegalView, meta: {
      title: 'Mentions légales',
      description: "Mentions légales du site de l'association Ride 4 Change : éditeur, hébergement et protection des données personnelles.",
    } },

    // Espace éditeur : chargé à la demande (les visiteurs ne téléchargent pas ce code)
    { path: '/connexion', component: () => import('@/views/admin/LoginView.vue'), meta: { noindex: true, title: 'Connexion' } },
    { path: '/admin/evenements', component: () => import('@/views/admin/AdminEventsView.vue'), meta: editor },
    { path: '/admin/evenements/nouveau', component: () => import('@/views/admin/EventFormView.vue'), meta: editor },
    { path: '/admin/association', component: () => import('@/views/admin/AdminMilestonesView.vue'), meta: editor },
    {
      path: '/admin/evenements/:id(\\d+)',
      component: () => import('@/views/admin/EventFormView.vue'),
      props: route => ({ id: Number(route.params.id) }),
      meta: editor,
    },

    // URL inconnue : retour à l'accueil (sinon page blanche)
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    // Bouton Retour : position précédente
    if (savedPosition) return savedPosition
    // Lien vers une section (ex : /mentions-legales#donnees-personnelles) : on attend la fin du fondu
    // de changement de page (App.vue), le temps que la section existe, et on laisse la place de la barre de navigation
    if (to.hash) return new Promise(resolve => setTimeout(() => resolve({ el: to.hash, top: 100 }), 350))
    return { top: 0 }
  },
})

router.beforeEach(async to => {
  if (!to.meta.requiresEditor) return
  const { init, isEditor } = useAuth()
  await init()
  if (!isEditor.value) return { path: '/connexion', query: { redirect: to.fullPath } }
})

router.afterEach(to => {
  setPageJsonLd(null)
  // Page article : valeurs par défaut en attendant l'événement, que la vue complète une fois chargé
  setPageMeta({ title: to.meta.title, description: to.meta.description, path: to.path, noindex: to.meta.noindex })
})

export default router
