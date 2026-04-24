<template>
  <div class="gallery-page">
    <SocialFloat />
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Nos moments</span>
        <h1>GALERIE</h1>
        <p>Sorties, actions solidaires, rassemblements — l'aventure en images.</p>
      </div>
    </section>

    <!-- FILTRES -->
    <section class="filters-bar">
      <div class="container">
        <div class="filter-tabs">
          <button
            v-for="cat in categories" :key="cat.id"
            class="filter-tab"
            :class="{ active: activeFilter === cat.id }"
            @click="activeFilter = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- GALERIE GRID -->
    <section class="gallery-section">
      <div class="container">
        <div class="gallery-grid">
          <div
            v-for="photo in filteredPhotos"
            :key="photo.id"
            class="photo-card"
            :class="photo.size"
            @click="openModal(photo)"
          >
            <div class="photo-inner" :style="{ background: photo.bg }">
              <span class="photo-emoji">{{ photo.emoji }}</span>
              <div class="photo-overlay">
                <span class="photo-tag">{{ photo.tag }}</span>
                <h3>{{ photo.title }}</h3>
                <p>{{ photo.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL -->
    <div v-if="selected" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        <div class="modal-photo" :style="{ background: selected.bg }">
          <span>{{ selected.emoji }}</span>
        </div>
        <div class="modal-info">
          <span class="photo-tag">{{ selected.tag }}</span>
          <h2>{{ selected.title }}</h2>
          <p class="modal-date">{{ selected.date }}</p>
          <p class="modal-desc">{{ selected.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {Photo} from "@/models/CustomType.ts";
import SocialFloat from "@/components/SocialFloat.vue";

const activeFilter = ref('all')
const selected = ref<Photo>()

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

const filteredPhotos = computed(() =>
  activeFilter.value === 'all' ? photos : photos.filter(p => p.cat === activeFilter.value)
)

const openModal = (photo: any) => { selected.value = photo }
const closeModal = () => { selected.value = undefined }
</script>

<style scoped>
.page-header {
  position: relative; padding: 10rem 0 5rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.1) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.page-header .overline {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.8rem;
  letter-spacing: 0.3em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.75rem;
}
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(1.5rem, 5vw, 5rem);
  line-height: 0.95;
}
.page-header p { color: var(--grey-light); font-size: 1.1rem; margin-top: 1rem; max-width: 500px; }

.filters-bar {
  background: var(--dark); padding: 1.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  position: sticky; top: 70px; z-index: 100;
}
.filter-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-tab {
  padding: 0.5rem 1.25rem;
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.85rem;
  letter-spacing: 0.15em; text-transform: uppercase;
  background: transparent; border: 1px solid rgba(255,255,255,0.15);
  color: var(--grey); cursor: pointer; transition: all 0.3s;
}
.filter-tab:hover { border-color: var(--white); color: var(--white); }
.filter-tab.active { background: var(--red); border-color: var(--red); color: var(--white); }

.gallery-section { padding: 3rem 0 6rem; }
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220px;
  gap: 1rem;
}
.photo-card { cursor: pointer; overflow: hidden; }
.photo-card.large { grid-column: span 2; }
.photo-card.tall { grid-row: span 2; }
.photo-inner {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  transition: transform 0.4s ease;
}
.photo-card:hover .photo-inner { transform: scale(1.03); }
.photo-emoji { font-size: 4rem; transition: transform 0.4s ease; }
.photo-card:hover .photo-emoji { transform: scale(1.15); }
.photo-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 1.5rem;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
  transform: translateY(40px); opacity: 0;
  transition: all 0.4s ease;
}
.photo-card:hover .photo-overlay { transform: translateY(0); opacity: 1; }
.photo-tag {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.3rem;
}
.photo-overlay h3 { font-family: 'Barlow Condensed',sans-serif; font-size: 1.1rem; font-weight: 700; }
.photo-overlay p { font-size: 0.8rem; color: var(--grey-light); }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  padding: 2rem;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--dark); max-width: 700px; width: 100%;
  position: relative; overflow: hidden;
}
.modal-close {
  position: absolute; top: 1rem; right: 1rem; z-index: 10;
  background: var(--red); border: none; color: var(--white);
  width: 36px; height: 36px; cursor: pointer;
  font-size: 0.85rem; transition: background 0.3s;
}
.modal-close:hover { background: var(--red-dark); }
.modal-photo {
  height: 280px; display: flex; align-items: center; justify-content: center;
  font-size: 6rem;
}
.modal-info { padding: 2rem; }
.modal-info .photo-tag { font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--red); display: block; margin-bottom: 0.5rem; }
.modal-info h2 { font-family: 'Bebas Neue',sans-serif; font-size: 2rem; margin-bottom: 0.5rem; }
.modal-date { font-family: 'Barlow Condensed',sans-serif; font-size: 0.85rem; letter-spacing: 0.1em; color: var(--grey); margin-bottom: 0.75rem; }
.modal-desc { color: var(--grey-light); line-height: 1.7; font-size: 0.95rem; }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: 1fr 1fr; }
  .photo-card.large { grid-column: span 2; }
}
@media (max-width: 480px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .photo-card.large { grid-column: span 1; }
  .photo-card.tall { grid-row: span 1; }
}
</style>
