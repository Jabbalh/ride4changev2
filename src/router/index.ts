import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import About from '@/views/AboutView.vue'
import Gallery from '@/views/GalleryView.vue'
import Events from '@/views/EventsView.vue'
import Contact from '@/views/ContactView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/association', component: About },
    { path: '/galerie', component: Gallery },
    { path: '/evenements', component: Events },
    { path: '/contact', component: Contact }
  ],
  scrollBehavior() { return { top: 0 } }
})

export default router
