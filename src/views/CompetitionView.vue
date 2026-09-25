<template>
  <PhotoGallery
    overline="Nos moments"
    title="Compétition"
    subtitle="Parce qu'on fait aussi de la compétition : l'aventure en images."
    :categories="categories"
    :photos="photos"
  />
</template>

<script setup lang="ts">
import PhotoGallery from '@/components/PhotoGallery.vue'
import type { Photo } from '@/models/CustomType'

// Contenu en partie provisoire (« Bla bla bla »), à compléter.
const categories = [
  { id: 'all', label: 'Tout voir' },
  { id: 'mans', label: 'Les 24H du Mans' },
  { id: 'valencia', label: 'Valencia' },
  { id: 'spa', label: '8 Heures de Spa' },
  { id: 'mugello', label: 'Mugello CIV' },
]

const photos: Photo[] = [
  { id:1, cat:'mans', size:'large', emoji:'🏍️', bg:'linear-gradient(135deg,#1a0d0d,#3d1a1a)', tag:'Le Mans', title:'Dans les starting-blocks', date:'Avril 2026', desc:'Prêts à démarrer sur cette piste mythique.' },
  { id:2, cat:'mans', size:'', emoji:'🎁', bg:'linear-gradient(135deg,#0d1a0d,#1a3d1a)', tag:'Le Mans', title:'La piste', date:'Avril 2026', desc:'Plus de 4 km d\'asphalte nous attendent.' },
  { id:3, cat:'mans', size:'', emoji:'🏁', bg:'linear-gradient(135deg,#1a1a0d,#3d3d1a)', tag:'Le Mans', title:'La course', date:'Avril 2026', desc:'En plein cœur de l\'édition 2026, un pur moment de joie.' },
  { id:4, cat:'valencia', size:'tall', emoji:'🔧', bg:'linear-gradient(135deg,#0d0d1a,#1a1a3d)', tag:'Valencia', title:'Un tour en Espagne', date:'Septembre 2026', desc:'Soleil et asphalte !' },
  { id:5, cat:'valencia', size:'', emoji:'🛣️', bg:'linear-gradient(135deg,#1a0a0a,#2d1515)', tag:'Valencia', title:'La course', date:'Septembre 2026', desc:'Que du bonheur de rouler sous le soleil.' },
  { id:6, cat:'spa', size:'', emoji:'🩺', bg:'linear-gradient(135deg,#0d1515,#152d2d)', tag:'8 Heures de Spa', title:'Bla bla bla', date:'Juin 2026', desc:'Bla bla bla.' },
  { id:7, cat:'spa', size:'large', emoji:'🏔️', bg:'linear-gradient(135deg,#0d0d1a,#1a1a2d)', tag:'8 Heures de Spa', title:'Bla bla bla', date:'Juin 2026', desc:'Bla bla bla.' },
  { id:8, cat:'mugello', size:'', emoji:'🍖', bg:'linear-gradient(135deg,#1a0d00,#2d1a00)', tag:'Mugello CIV', title:'Bla bla bla', date:'Mai 2026', desc:'Bla bla bla.' },
  { id:9, cat:'mugello', size:'', emoji:'🌅', bg:'linear-gradient(135deg,#1a0a00,#3d2000)', tag:'Mugello CIV', title:'Bla bla bla', date:'Mai 2026', desc:'Bla bla bla.' },
]
</script>
