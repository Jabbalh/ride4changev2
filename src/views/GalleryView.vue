<template>
  <PhotoGallery
    overline="Nos moments"
    title="GALERIE"
    subtitle="Sorties, actions solidaires, rassemblements — l'aventure en images."
    :categories="categories"
    :photos="photos"
  />
</template>

<script setup lang="ts">
import PhotoGallery from '@/components/PhotoGallery.vue'
import type { Photo } from '@/models/CustomType'

// Contenu d'exemple, à remplacer par de vraies photos (page retirée du menu et du sitemap en attendant).
const categories = [
  { id: 'all', label: 'Tout voir' },
  { id: 'sorties', label: 'Sorties moto' },
  { id: 'solidaire', label: 'Actions solidaires' },
  { id: 'rallye', label: 'Rallyes' },
  { id: 'vie', label: 'Vie du club' },
]

const photos: Photo[] = [
  { id:1, cat:'sorties', size:'large', emoji:'🏍️', bg:'linear-gradient(135deg,#1a0d0d,#3d1a1a)', tag:'Sortie', title:'Route des Gorges du Verdon', date:'Juillet 2024', desc:'Une sortie mémorable à travers les gorges du Verdon, 280 km de routes sinueuses sous le soleil de Provence.' },
  { id:2, cat:'solidaire', size:'', emoji:'🎁', bg:'linear-gradient(135deg,#0d1a0d,#1a3d1a)', tag:'Solidarité', title:'Collecte de Noël', date:'Décembre 2023', desc:'120 jouets collectés pour les enfants de l\'hôpital d\'Arles. Une belle journée de fraternité.' },
  { id:3, cat:'rallye', size:'', emoji:'🏁', bg:'linear-gradient(135deg,#1a1a0d,#3d3d1a)', tag:'Rallye', title:'Rallye des 3 Cols', date:'Septembre 2024', desc:'Edition 2024 du rallye annuel dans les Alpes.' },
  { id:4, cat:'vie', size:'tall', emoji:'🔧', bg:'linear-gradient(135deg,#0d0d1a,#1a1a3d)', tag:'Atelier', title:'Journée mécanique', date:'Mars 2024', desc:'Session entretien motos entre membres. Partage de savoir-faire et bonne humeur garantis.' },
  { id:5, cat:'sorties', size:'', emoji:'🛣️', bg:'linear-gradient(135deg,#1a0a0a,#2d1515)', tag:'Sortie', title:'Traversée des Alpilles', date:'Juin 2024', desc:'Départ à l\'aube pour une traversée des Alpilles en petit groupe.' },
  { id:6, cat:'solidaire', size:'', emoji:'🩺', bg:'linear-gradient(135deg,#0d1515,#152d2d)', tag:'Humanitaire', title:'Convoi médical', date:'Octobre 2023', desc:'Transport de matériel pour le centre de soin mobile de Camargue.' },
  { id:7, cat:'rallye', size:'large', emoji:'🏔️', bg:'linear-gradient(135deg,#0d0d1a,#1a1a2d)', tag:'Rallye', title:'Col de l\'Iseran', date:'Août 2024', desc:'Le plus haut col routier des Alpes — 2764m ! Une montée inoubliable pour 35 membres.' },
  { id:8, cat:'vie', size:'', emoji:'🍖', bg:'linear-gradient(135deg,#1a0d00,#2d1a00)', tag:'Barbecue', title:'Fête de l\'été', date:'Juillet 2024', desc:'La fête annuelle du club réunit membres et familles autour d\'un grand barbecue.' },
  { id:9, cat:'sorties', size:'', emoji:'🌅', bg:'linear-gradient(135deg,#1a0a00,#3d2000)', tag:'Sortie', title:'Lever de soleil en Camargue', date:'Avril 2024', desc:'Sortie spéciale aurore, rendez-vous à 5h du matin pour un lever de soleil en Camargue.' },
]
</script>
