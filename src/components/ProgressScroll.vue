<script setup lang="ts">
// Barre de progression en haut de page et indicateur de défilement en bas à droite
import { onMounted, onUnmounted, ref } from "vue";

const progressBar = ref<HTMLElement | null>(null);
const scrollThumb = ref<HTMLElement | null>(null);
const scrollPct = ref<HTMLElement | null>(null);
const scrollIndicator = ref<HTMLElement | null>(null);

function update() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  // Page plus courte que l'écran : rien à faire défiler (évite 0/0 = NaN)
  const pct = docHeight > 0 ? Math.min(100, Math.round((window.scrollY / docHeight) * 100)) : 100;

  if (progressBar.value && scrollThumb.value && scrollPct.value && scrollIndicator.value) {
    progressBar.value.style.width = pct + '%';
    scrollThumb.value.style.height = pct + '%';
    scrollPct.value.textContent = pct + '%';

    // Masqué en bas de page, ou s'il n'y a rien à faire défiler
    scrollIndicator.value.classList.toggle('hidden', pct >= 98);
  }
}

// La hauteur de la page change sans défilement (premier affichage, changement de page, données chargées) :
// on recalcule dès que la taille du document change.
const resizeObserver = new ResizeObserver(() => update());

onMounted(() => {
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  resizeObserver.observe(document.body);
  update();
});
onUnmounted(() => {
  window.removeEventListener('scroll', update);
  window.removeEventListener('resize', update);
  resizeObserver.disconnect();
});
</script>
<template>
  <!-- PROGRESS BAR -->
  <div class="progress-bar" ref="progressBar"></div>

  <!-- SCROLL INDICATOR -->
  <div class="scroll-indicator" ref="scrollIndicator" aria-hidden="true">
    <div class="scroll-track">
      <div class="scroll-thumb" ref="scrollThumb"></div>
    </div>
    <span class="scroll-pct" ref="scrollPct">0%</span>
  </div>
</template>

<style scoped>

/* PROGRESS BAR */
.progress-bar{position:fixed;top:0;left:0;height:3px;background:var(--red);z-index:999;width:0%;transition:width .1s linear;box-shadow:0 0 8px rgba(226,75,74,.7);}

/* SCROLL INDICATOR */
.scroll-indicator{position:fixed;bottom:2rem;right:5rem;z-index:200;display:flex;flex-direction:column;align-items:center;gap:.4rem;opacity:1;transition:opacity .4s;}
.scroll-indicator.hidden{opacity:0;pointer-events:none;}
.scroll-track{width:2px;height:60px;background:#2a2a2a;border-radius:2px;position:relative;overflow:hidden;}
.scroll-thumb{position:absolute;top:0;left:0;width:100%;background:var(--red);border-radius:2px;transition:height .1s linear;box-shadow:0 0 6px rgba(226,75,74,.6);}
.scroll-pct{font-size:.65rem;color:var(--grey);letter-spacing:1px;}
</style>
