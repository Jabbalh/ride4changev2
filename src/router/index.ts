import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import About from '@/views/AboutView.vue'
import Gallery from '@/views/GalleryView.vue'
import Events from '@/views/EventsView.vue'
import Contact from '@/views/ContactView.vue';
import CompetitionView from "@/views/CompetitionView.vue";
import InitiationView from "@/views/InitiationView.vue";
import BoutiqueView from "@/views/BoutiqueView.vue";
import EventDetailView from "@/views/EventDetailView.vue";
import { useAuth } from '@/composables/useAuth'

declare module 'vue-router' {
  interface RouteMeta {
    // Page réservée aux éditeurs (table public.editors). Confort d'interface : la vraie protection est RLS.
    requiresEditor?: boolean
  }
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/association', component: About },
    { path: '/galerie', component: Gallery },
    { path: '/competition', component: CompetitionView },
    { path: '/initiation-roulage', component: InitiationView },
    { path: '/evenements', component: Events },
    { path: '/evenements/:id(\\d+)', component: EventDetailView, props: route => ({ id: Number(route.params.id) }) },
    { path: '/boutique', component: BoutiqueView },
    { path: '/contact', component: Contact },

    // Espace éditeur : chargé à la demande (les visiteurs ne téléchargent pas ce code)
    { path: '/connexion', component: () => import('@/views/admin/LoginView.vue') },
    { path: '/admin/evenements', component: () => import('@/views/admin/AdminEventsView.vue'), meta: { requiresEditor: true } },
    { path: '/admin/evenements/nouveau', component: () => import('@/views/admin/EventFormView.vue'), meta: { requiresEditor: true } },
    { path: '/admin/association', component: () => import('@/views/admin/AdminMilestonesView.vue'), meta: { requiresEditor: true } },
    {
      path: '/admin/evenements/:id(\\d+)',
      component: () => import('@/views/admin/EventFormView.vue'),
      props: route => ({ id: Number(route.params.id) }),
      meta: { requiresEditor: true },
    },
  ],
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach(async to => {
  if (!to.meta.requiresEditor) return
  const { init, isEditor } = useAuth()
  await init()
  if (!isEditor.value) return { path: '/connexion', query: { redirect: to.fullPath } }
})

export default router
