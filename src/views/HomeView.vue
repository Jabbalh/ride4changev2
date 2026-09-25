<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="container hero-content">

        <h1 class="hero-title">
          <img src="/logo.svg" alt="Logo" class="image-logo">
          <span class="line1">Ride</span>
          <span class="line2">4</span>
          <span class="line3">Change</span>
        </h1>
        <p class="hero-sub">Profitez de votre seule vie et lâchez les chevaux</p>
      </div>
    </section>

    <!-- INTRO -->
    <section class="intro section">
      <div class="container intro-grid">
        <div class="intro-text">
          <div class="section-heading">
            <span class="overline">Qui sommes-nous</span>
            <h2 >Nés d’une passion inébranlable,<br>portés par le défi permanent.</h2>
            <p><span class="text-bold">Ride 4 Change,</span> c’est une équipe de passionnés de moto et de compétition, réunis autour d’une conviction : <span class="text-bold">le handicap ne doit pas être une limite à la passion.</span>
              <br />Sur la piste comme dans la vie, nous repoussons les barrières, partageons nos expériences et faisons de chaque défi une nouvelle aventure.
              <br /><span class="text-bold">Une équipe devenu une famille. Aucun frein</span>
              <br /><span class="text-bold">Nos limites ? Elles sont faites pour être repoussées…</span>
            </p>
          </div>
          <router-link to="/association" class="btn btn-primary">En savoir plus</router-link>
        </div>
        <div class="intro-values">
          <div v-for="v in values" :key="v.title" class="value-card">
            <button type="button" class="value-icon" :aria-label="`Agrandir la photo : ${v.title}`" @click="openPhoto(v)" @pointerenter="preloadLarge(v)" @focus="preloadLarge(v)">
              <img :src="baseUrl + v.icon" :alt="v.title">
            </button>
            <h3>{{ v.title }}</h3>
            <p>{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ACTIONS / APERÇU GALERIE -->
    <section class="actions-preview section" style="background: var(--dark);">
      <div class="container">
        <div class="section-heading">
          <span class="overline">Nos actions</span>
          <h2>Sur le terrain</h2>
          <p>Entre les courses, les initiations et le partage chaque kilomètre à du sens.</p>
        </div>
        <div class="actions-grid">
          <div v-for="action in actions" :key="action.title" class="action-card">
            <div class="action-img" :style="{ background: action.color }">
              <span class="action-emoji">{{ action.emoji }}</span>
            </div>
            <div class="action-info">
              <span class="action-tag">{{ action.tag }}</span>
              <h3>{{ action.title }}</h3>
              <p>{{ action.desc }}</p>
            </div>
          </div>
        </div>
        <div class="center-cta">
          <router-link to="/galerie" class="btn btn-primary">Voir toutes les photos</router-link>
        </div>

        <!-- GALLERY CAROUSEL PREVIEW -->
        <div class="gallery-carousel-wrapper">
          <div class="section-heading center">
            <span class="overline">Aperçu</span>
            <h2>La galerie en mouvement</h2>
          </div>
          
          <div class="carousel-container">
            <div 
              v-for="(photo, index) in galleryPhotos" 
              :key="photo.id"
              class="carousel-slide"
              :class="{ active: currentSlide === index }"
              :style="{ background: photo.bg }"
            >
              <span class="carousel-emoji">{{ photo.emoji }}</span>
              <div class="carousel-caption">
                <h3>{{ photo.title }}</h3>
              </div>
            </div>
            
            <div class="carousel-progress-container">
              <div class="carousel-progress-bar" :style="{ width: progress + '%' }"></div>
            </div>

            <div class="carousel-indicators">
              <span 
                v-for="(_, index) in galleryPhotos" 
                :key="index"
                class="indicator"
                :class="{ active: currentSlide === index }"
                @click="goToSlide(index)"
              ></span>
            </div>

            <button class="carousel-control prev" @click="prevSlide" aria-label="Photo précédente">
              <span>‹</span>
            </button>
            <button class="carousel-control next" @click="handleNext" aria-label="Photo suivante">
              <span>›</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- PROCHAIN ÉVÈNEMENT -->
    <section v-if="nextEvent" class="next-event section">
      <div class="container">
        <div class="event-banner">
          <div class="event-date-box">
            <span class="month">{{ nextEvent.month }}</span>
            <span class="day">{{ nextEvent.day }}</span>
            <span class="year">{{ nextEvent.year }}</span>
          </div>
          <div class="event-info">
            <span class="overline">Prochain événement</span>
            <h2>{{ nextEvent.title }}</h2>
            <p v-if="nextEvent.description">{{ nextEvent.description }}</p>
            <router-link v-if="nextEvent.has_details" :to="`/evenements/${nextEvent.id}`" class="btn btn-primary">En savoir plus</router-link>
            <router-link v-else to="/evenements" class="btn btn-primary">Voir le programme</router-link>
          </div>
          <div class="event-decoration">🏍</div>
        </div>
      </div>
    </section>

    <!-- TEMOIGNAGES -->
    <section class="testimonials section" style="background: var(--dark2);">
      <div class="container">
        <div class="section-heading">
          <span class="overline">Témoignages</span>
          <h2>Ils font partie<br>de l'aventure</h2>
        </div>
        <div class="testimonials-grid">
          <div v-for="t in testimonials" :key="t.name" class="testimonial-card">
            <p class="quote">"{{ t.quote }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ t.initials }}</div>
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PHOTO AGRANDIE -->
    <dialog ref="photoDialog" class="photo-dialog" :class="{ closing }" @click.self="closePhoto" @cancel.prevent="closePhoto">
      <figure v-if="openedPhoto" :key="openedPhoto.icon" :style="{ '--w': openedPhoto.w, '--h': openedPhoto.h }">
        <button type="button" class="photo-dialog-close" aria-label="Fermer" @click="closePhoto">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <!-- Vignette (déjà en cache) affichée tout de suite, remplacée par la grande version dès qu'elle est chargée -->
        <img :src="baseUrl + (largeReady ? openedPhoto.large : openedPhoto.icon)" :alt="openedPhoto.title">
        <figcaption>{{ openedPhoto.title }}</figcaption>
      </figure>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import SocialFloat from "@/components/SocialFloat.vue";
import { useNextEvent } from '@/composables/useEvents'

const baseUrl = import.meta.env.BASE_URL;

// Section « Prochain événement » : masquée s'il n'y en a pas
const { event: nextEvent } = useNextEvent()

// GALLERY CAROUSEL
const galleryPhotos = [
  { id: 1, emoji: '🏍️', bg: 'linear-gradient(135deg,#1a0d0d,#3d1a1a)', title: 'Route des Gorges du Verdon' },
  { id: 2, emoji: '🎁', bg: 'linear-gradient(135deg,#0d1a0d,#1a3d1a)', title: 'Collecte de Noël' },
  { id: 3, emoji: '🏁', bg: 'linear-gradient(135deg,#1a1a0d,#3d3d1a)', title: 'Rallye des 3 Cols' },
  { id: 4, emoji: '🔧', bg: 'linear-gradient(135deg,#0d0d1a,#1a1a3d)', title: 'Journée mécanique' },
]

const currentSlide = ref(0)
const progress = ref(0)
const SLIDE_DURATION = 5000 // 5 seconds
const PROGRESS_INTERVAL = 50 // Update progress every 50ms

let slideInterval: any
let progressInterval: any

const startCarousel = () => {
  slideInterval = setInterval(() => {
    nextSlide()
  }, SLIDE_DURATION)

  progressInterval = setInterval(() => {
    progress.value += (PROGRESS_INTERVAL / SLIDE_DURATION) * 100
  }, PROGRESS_INTERVAL)
}

const stopCarousel = () => {
  clearInterval(slideInterval)
  clearInterval(progressInterval)
}

const resetCarousel = () => {
  stopCarousel()
  progress.value = 0
  startCarousel()
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % galleryPhotos.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + galleryPhotos.length) % galleryPhotos.length
  resetCarousel()
}

const handleNext = () => {
  nextSlide()
  resetCarousel()
}

const goToSlide = (index: number) => {
  if (currentSlide.value === index) return
  currentSlide.value = index
  resetCarousel()
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})
const anneeExistance = new Date().getFullYear() - 2025;

const values = [
  { icon: 'lemans.jpg', large: 'lemans-grand.jpg', w: 1600, h: 1067, title: 'Les compétitions', desc: 'PMR Bridgestone & Bol d’argent .' },
  { icon: 'partenaire.jpg', large: 'partenaire-grand.jpg', w: 1200, h: 1600, title: 'Nos partenaires', desc: '' },
  { icon: 'initiation.jpg', large: 'initiation-grand.jpg', w: 1600, h: 1067, title: 'Initiation et Roulages', desc: "Le Mans & Fay de Bretagne." },
  { icon: 'solidarite.jpg', large: 'solidarite-grand.jpg', w: 1600, h: 1067, title: 'La Solidarité', desc: "Parce que sans amis ou bénévoles rien n’es possible." },
]

// PHOTO AGRANDIE : <dialog> natif (Échap, focus et fond inerte gérés par le navigateur)
type Value = (typeof values)[number]
const photoDialog = ref<HTMLDialogElement>()
const openedPhoto = ref<Value>()
const largeReady = ref(false)
const closing = ref(false)
const CLOSE_MS = 180 // durée de l'animation de fermeture (voir photo-out dans le CSS)
let closeTimer: ReturnType<typeof setTimeout> | undefined

// Précharge la grande version au survol : elle est souvent prête avant le clic
const preloaded = new Map<string, Promise<void>>()
function preloadLarge(v: Value): Promise<void> {
  let p = preloaded.get(v.large)
  if (!p) {
    const img = new Image()
    img.src = baseUrl + v.large
    p = img.decode().catch(() => {})
    preloaded.set(v.large, p)
  }
  return p
}

async function openPhoto(v: Value) {
  clearTimeout(closeTimer)
  closing.value = false
  openedPhoto.value = v
  largeReady.value = false
  // Attendre que Vue affiche la nouvelle photo avant d'ouvrir : sinon la précédente apparaît un instant
  await nextTick()
  if (!photoDialog.value?.open) photoDialog.value?.showModal()
  await preloadLarge(v)
  // Comparaison par fichier : openedPhoto.value est un proxy réactif, jamais === v
  if (openedPhoto.value?.large === v.large) largeReady.value = true
}

function closePhoto() {
  const dialog = photoDialog.value
  if (!dialog?.open || closing.value) return
  const finish = () => {
    dialog.close()
    closing.value = false
    openedPhoto.value = undefined
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish()
  closing.value = true
  closeTimer = setTimeout(finish, CLOSE_MS)
}
const actions = [
  { tag: 'Courses', emoji: '🏁', color: 'linear-gradient(135deg,#1f1a1a,#2d1f00)', title: 'Le Mans, Spa Francorchamps, Le Castellet', desc: '' },
  { tag: 'Initiations circuit', emoji: '🪖', color: 'linear-gradient(135deg,#1a1f1a,#1f2d1f)', title: 'Nos initiations et roulages', desc: 'Pour les handis comme les valides ' },
  { tag: 'Les salons', emoji: '🩺', color: 'linear-gradient(135deg,#1a1a2d,#1a1a1a)', title: 'Venez nous rencontrer', desc: 'À Vannes, Rennes, etc...' },
]
const testimonials = [
  { name: 'Toto', role: 'Membre depuis 2025', initials: 'TT', quote: "Moi je bricole." },
  { name: 'Machin', role: 'Squatteur', initials: 'M', quote: "Moi je squatte." },
  { name: 'Ludo', role: 'Membre fondateur', initials: 'LR', quote: "Depuis 2025, je pilote." },
]
</script>

<style scoped>

/* HERO */
.hero {
  position: relative;
  min-height: 20vh;
  margin-top: 3rem;
  padding-top: var(--nav-height);
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background-image: linear-gradient(160deg, rgba(13, 13, 13, 0.9) 0%, rgba(26, 10, 10, 0.4) 40%, rgba(13, 13, 13, 0.9) 100%), url('/accuei.jpg');
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 50%, rgba(230,57,70,0.12) 0%, transparent 60%);
}
.hero-pattern {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: repeating-linear-gradient(
    45deg, var(--white) 0, var(--white) 1px, transparent 0, transparent 50%
  );
  background-size: 30px 30px;
}
.hero-content {
  position: relative; z-index: 2;
  padding-bottom: 80px;
  height: 40vh;
}
.hero-badge {
  display: inline-block;
  border: 1px solid rgba(230,57,70,0.4);
  padding: 0.4rem 1.25rem;
  margin-bottom: 2rem;
  font-family: 'Barlow Condensed',sans-serif;
  font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--red);
}
.hero-title {
  line-height: 0.9; margin-bottom: 1.5rem;
}
.hero-title .line1 {
  font-family: 'Bebas Neue',sans-serif;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  color: var(--white); letter-spacing: 0.05em;
}
.hero-title .line2 {
  padding-left: 0.25em;
  font-family: 'Bebas Neue',sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  color: var(--red); letter-spacing: 0.12em;
}
.hero-title .line3 {
  padding-left: 0.25em;
  font-family: 'Bebas Neue',sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,0.8);
  letter-spacing: 0.3em;
}
.hero-sub {
  font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.4em;
  text-transform: uppercase; color: var(--white);
  font-size: 0.9rem; margin-bottom: 2.5rem;
}
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 4rem; }
.hero-stats {
  display: flex; gap: 3rem; flex-wrap: wrap;
  padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);
}
.stat { display: flex; flex-direction: column; }
.stat-value {
  font-family: 'Bebas Neue',sans-serif; font-size: 2.5rem;
  color: var(--red); line-height: 1;
}
.stat-label {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey);
}
.hero-scroll {
  position: absolute; bottom: 2rem; right: 3rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey);
}
.scroll-line { width: 1px; height: 50px; background: linear-gradient(to bottom, var(--red), transparent); }

/* INTRO */
.intro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.intro-text .section-heading { margin-bottom: 2rem; }
.intro-values { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.value-card {
  background: var(--dark2); padding: 1.5rem;
  border-left: 3px solid var(--red);
  transition: transform 0.3s;
}
.value-card:hover { transform: translateY(-4px); }
.value-icon {
  display: block; width: 100%; margin-bottom: 0.75rem;
  padding: 0; border: none; background: none; cursor: zoom-in;
}
.value-icon:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

/* PHOTO AGRANDIE */
/* Bloque le défilement de la page tant que la photo est ouverte */
:global(html:has(.photo-dialog[open])) { overflow: hidden; }
.photo-dialog {
  margin: auto; padding: 0; border: none; background: none;
  max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem);
  overflow: visible;
}
.photo-dialog::backdrop { background: rgba(0,0,0,0.92); backdrop-filter: blur(4px); }
.photo-dialog figure { position: relative; margin: 0; }
/* Taille calculée d'après les dimensions de la grande photo (--w, --h) : la vignette et la grande
   version s'affichent exactement au même format, sans saut quand l'une remplace l'autre */
.photo-dialog img {
  width: min(calc(100vw - 2rem), calc((100vh - 5rem) * var(--w) / var(--h)), calc(var(--w) * 1px));
  aspect-ratio: var(--w) / var(--h);
  height: auto; object-fit: cover; margin: 0 auto;
}

/* Animations d'ouverture et de fermeture */
.photo-dialog[open] figure { animation: photo-in 0.22s ease-out; }
.photo-dialog[open]::backdrop { animation: backdrop-in 0.22s ease-out; }
.photo-dialog.closing figure { animation: photo-out 0.18s ease-in forwards; }
.photo-dialog.closing::backdrop { animation: backdrop-out 0.18s ease-in forwards; }
@keyframes photo-in { from { opacity: 0; transform: scale(0.96); } }
@keyframes photo-out { to { opacity: 0; transform: scale(0.96); } }
@keyframes backdrop-in { from { opacity: 0; } }
@keyframes backdrop-out { to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .photo-dialog figure, .photo-dialog::backdrop { animation: none !important; }
}
.photo-dialog figcaption {
  margin-top: 0.75rem; text-align: center;
  font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-light);
}
.photo-dialog-close {
  position: absolute; top: 0.75rem; right: 0.75rem; z-index: 1;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(13,13,13,0.55); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.25); color: var(--white);
  cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.photo-dialog-close:hover { background: rgba(13,13,13,0.8); border-color: var(--red); color: var(--red); transform: rotate(90deg); }
.photo-dialog-close:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }
.value-card h3 {
  font-family: 'Barlow Condensed',sans-serif; font-size: 1rem;
  letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem;
}
.value-card p { font-size: 0.88rem; color: var(--grey); line-height: 1.6; }

/* ACTIONS */
.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
.action-card {
  background: var(--black); overflow: hidden;
  transition: transform 0.3s;
}
.action-card:hover { transform: translateY(-6px); }
.action-img {
  height: 160px; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.action-emoji { font-size: 4rem; }
.action-info { padding: 1.5rem; }
.action-tag {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.5rem;
}
.action-info h3 { font-family: 'Barlow Condensed',sans-serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
.action-info p { font-size: 0.88rem; color: var(--grey); line-height: 1.6; }
.center-cta { text-align: center; margin-bottom: 5rem; }

/* GALLERY CAROUSEL */
.gallery-carousel-wrapper {
  margin-top: 4rem;
}
.section-heading.center {
  text-align: center;
  margin-bottom: 2.5rem;
}
.carousel-container {
  position: relative;
  height: 400px;
  background: var(--dark2);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
}
.carousel-slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.8s ease;
  z-index: 1;
}
.carousel-slide.active {
  opacity: 1;
  z-index: 2;
}
.carousel-emoji {
  font-size: 8rem;
  margin-bottom: 1rem;
  transform: translateY(20px);
  transition: transform 0.8s ease;
}
.carousel-slide.active .carousel-emoji {
  transform: translateY(0);
}
.carousel-caption {
  position: absolute;
  bottom: 3rem;
  text-align: center;
}
.carousel-caption h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 0.05em;
  color: var(--white);
}
.carousel-progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  z-index: 10;
}
.carousel-progress-bar {
  height: 100%;
  background: var(--red);
  width: 0;
}
.carousel-indicators {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 10;
}
.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transition: all 0.3s;
  cursor: pointer;
}
.indicator.active {
  background: var(--red);
  transform: scale(1.3);
}

.carousel-control {
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  z-index:10;
  font-size:1.5rem;
  width:40px;
  height:40px;
  background:rgba(20,20,20,.8);
  border:1px solid #333;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:all .2s;
  color:#ccc;
}
.carousel-control:hover {
  background:var(--red);border-color:var(--red);color:#fff;
}
.carousel-control.prev { left: 1rem; }
.carousel-control.next { right: 1rem; }

@media (max-width: 768px) {
  .carousel-container { height: 300px; }
  .carousel-emoji { font-size: 6rem; }
  .carousel-caption h3 { font-size: 1.5rem; }
  .carousel-control { width: 36px; height: 36px; font-size: 1.5rem; }
}

/* EVENT BANNER */
.event-banner {
  background: var(--dark);
  border: 1px solid rgba(230,57,70,0.3);
  display: grid; grid-template-columns: auto 1fr auto;
  gap: 3rem; align-items: center; padding: 3rem;
  position: relative; overflow: hidden;
}
.event-banner::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 4px; height: 100%; background: var(--red);
}
.event-date-box {
  display: flex; flex-direction: column; align-items: center;
  background: var(--red); padding: 1.5rem 2rem; min-width: 100px;
}
.event-date-box .month {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.8rem;
  letter-spacing: 0.2em; text-transform: uppercase;
}
.event-date-box .day {
  font-family: 'Bebas Neue',sans-serif; font-size: 4rem; line-height: 1;
}
.event-date-box .year {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem; opacity: 0.8;
}
.event-info .overline {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem;
  letter-spacing: 0.3em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.5rem;
}
.event-info h2 { font-family: 'Bebas Neue',sans-serif; font-size: 2.5rem; margin-bottom: 0.75rem; }
.event-info p { color: var(--grey-light); font-size: 0.95rem; margin-bottom: 1.5rem; max-width: 500px; }
.event-decoration { font-size: 5rem; opacity: 0.15; }

/* TESTIMONIALS */
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.testimonial-card {
  background: var(--dark); padding: 2rem;
  border-bottom: 3px solid var(--red);
}
.quote { font-style: italic; color: var(--grey-light); line-height: 1.8; margin-bottom: 1.5rem; font-size: 0.95rem; }
.testimonial-author { display: flex; align-items: center; gap: 1rem; }
.author-avatar {
  width: 44px; height: 44px; background: var(--red);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.85rem; font-weight: 700;
  flex-shrink: 0;
}
.testimonial-author strong { display: block; font-size: 0.9rem; }
.testimonial-author span { font-size: 0.8rem; color: var(--grey); font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.05em; }

.image-logo {
  display: inline-block; vertical-align: bottom; margin-right: 10px; width: 2.5em; height: 2.5em;
}
@media (max-width: 1100px) {
  .image-logo {
    display: inline-block; vertical-align: bottom; margin-right: 10px; width: 2em; height: 2em;
  }
}

@media (max-width: 900px) {
  .intro-grid { grid-template-columns: 1fr; gap: 3rem; }
  .event-banner { grid-template-columns: auto 1fr; }
  .event-decoration { display: none; }
  .image-logo {
    display: inline-block; vertical-align: bottom; margin-right: 10px; width: 1.5em; height: 1.5em;
  }
}
@media (max-width: 600px) {
  .hero-stats { gap: 1.5rem; }
  .event-banner { grid-template-columns: 1fr; padding: 2rem; }
  .intro-values { grid-template-columns: 1fr; }
  .image-logo {
    display: inline-block; vertical-align: bottom; margin-right: 10px; width: 1.2em; height: 1.2em;
  }
}
</style>
