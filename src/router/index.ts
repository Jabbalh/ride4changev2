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
    { path: '/contact', component: Contact }
  ],
  scrollBehavior() { return { top: 0 } }
})

export default router
