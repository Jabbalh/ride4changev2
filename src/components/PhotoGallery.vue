<template>
  <div class="gallery-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">{{ overline }}</span>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
    </section>

    <!-- FILTRES -->
    <section class="filters-bar">
      <div class="container">
        <div class="filter-tabs" role="group" aria-label="Filtrer les photos">
          <button
            v-for="cat in categories" :key="cat.id"
            type="button"
            class="filter-tab"
            :class="{ active: activeFilter === cat.id }"
            :aria-pressed="activeFilter === cat.id"
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
          <!-- Chaque carte est un bouton : atteignable au clavier, et son texte sert de libellé -->
          <button
            v-for="photo in filteredPhotos"
            :key="photo.id"
            type="button"
            class="photo-card"
            :class="photo.size"
            @click="openModal(photo)"
          >
            <span class="photo-inner" :style="{ background: photo.bg }">
              <span class="photo-emoji" aria-hidden="true">{{ photo.emoji }}</span>
              <span class="photo-overlay">
                <span class="photo-tag">{{ photo.tag }}</span>
                <span class="photo-title">{{ photo.title }}</span>
                <span class="photo-date">{{ photo.date }}</span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- MODAL : <dialog> natif (Échap, focus piégé puis rendu à la carte, fond inerte) -->
    <dialog ref="dialog" class="modal" aria-labelledby="gallery-modal-title" @click.self="closeModal" @close="selected = undefined">
      <div v-if="selected" class="modal-content">
        <button type="button" class="modal-close" aria-label="Fermer" @click="closeModal">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <div class="modal-photo" :style="{ background: selected.bg }">
          <span aria-hidden="true">{{ selected.emoji }}</span>
        </div>
        <div class="modal-info">
          <span class="photo-tag">{{ selected.tag }}</span>
          <h2 id="gallery-modal-title">{{ selected.title }}</h2>
          <p class="modal-date">{{ selected.date }}</p>
          <p class="modal-desc">{{ selected.desc }}</p>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
// Galerie filtrable avec popin, partagée par les pages Galerie et Compétition
import { ref, computed, nextTick } from 'vue'
import type { Photo } from '@/models/CustomType'

const props = defineProps<{
  overline: string
  title: string
  subtitle: string
  categories: { id: string, label: string }[]
  photos: Photo[]
}>()

const activeFilter = ref('all')
const selected = ref<Photo>()
const dialog = ref<HTMLDialogElement>()

const filteredPhotos = computed(() =>
  activeFilter.value === 'all' ? props.photos : props.photos.filter(p => p.cat === activeFilter.value)
)

async function openModal(photo: Photo) {
  selected.value = photo
  // Afficher le contenu avant d'ouvrir, pour ne jamais montrer la photo précédente
  await nextTick()
  dialog.value?.showModal()
}
function closeModal() {
  dialog.value?.close()
}
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
  color: var(--grey-light); cursor: pointer; transition: all 0.3s;
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
/* Réinitialise le style de bouton de la carte */
.photo-card {
  cursor: pointer; overflow: hidden;
  padding: 0; border: none; background: none; color: inherit; font: inherit; text-align: left;
  display: block; width: 100%; height: 100%;
}
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
/* Titres visibles au survol, au focus clavier, et toujours sur écran tactile (pas de survol possible) */
.photo-card:hover .photo-overlay, .photo-card:focus-visible .photo-overlay { transform: translateY(0); opacity: 1; }
@media (hover: none) {
  .photo-overlay { transform: none; opacity: 1; }
}
.photo-card:focus-visible { outline-offset: 2px; }
.photo-tag {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.3rem;
}
.photo-title { display: block; font-family: 'Barlow Condensed',sans-serif; font-size: 1.1rem; font-weight: 700; }
.photo-date { display: block; font-size: 0.8rem; color: var(--grey-light); }

/* MODAL */
:global(html:has(dialog.modal[open])) { overflow: hidden; }
.modal {
  margin: auto; padding: 0; border: none; background: none; color: inherit;
  width: min(700px, calc(100vw - 2rem)); max-height: calc(100vh - 2rem);
}
.modal::backdrop { background: rgba(0,0,0,0.92); backdrop-filter: blur(4px); }
.modal[open] .modal-content { animation: modal-in 0.22s ease-out; }
.modal[open]::backdrop { animation: backdrop-in 0.22s ease-out; }
@keyframes modal-in { from { opacity: 0; transform: scale(0.96); } }
@keyframes backdrop-in { from { opacity: 0; } }
.modal-content {
  background: var(--dark); width: 100%;
  position: relative; overflow: hidden;
}
.modal-close {
  position: absolute; top: 0.75rem; right: 0.75rem; z-index: 10;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(13,13,13,0.55); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.25); color: var(--white);
  cursor: pointer; transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.modal-close:hover { background: rgba(13,13,13,0.8); border-color: var(--red); color: var(--red); }
.modal-photo {
  height: 280px; display: flex; align-items: center; justify-content: center;
  font-size: 6rem;
}
.modal-info { padding: 2rem; }
.modal-info .photo-tag { font-size: 0.75rem; margin-bottom: 0.5rem; }
.modal-info h2 { font-family: 'Bebas Neue',sans-serif; font-size: 2rem; margin-bottom: 0.5rem; }
.modal-date { font-family: 'Barlow Condensed',sans-serif; font-size: 0.85rem; letter-spacing: 0.1em; color: var(--grey-light); margin-bottom: 0.75rem; }
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
