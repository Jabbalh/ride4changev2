<script setup lang="ts">
// Scroll progress
import {onMounted, ref} from "vue";

const progressBar = ref<HTMLElement | null>(null);
const scrollThumb = ref<HTMLElement | null>(null); //document.getElementById('scrollThumb');
const scrollPct = ref<HTMLElement | null>(null); //document.getElementById('scrollPct');
const scrollIndicator = ref<HTMLElement | null>(null); //document.getElementById('scrollIndicator');

onMounted(() => {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.round((scrollTop / docHeight) * 100);

    if (progressBar.value && scrollThumb.value && scrollPct.value && scrollIndicator.value) {
      progressBar.value.style.width = pct + '%';
      scrollThumb.value.style.height = pct + '%';
      scrollPct.value.textContent = pct + '%';

      // Hide indicator when at bottom
      scrollIndicator.value.classList.toggle('hidden', pct >= 98);
    }
  });
})



</script>
<template>
  <!-- PROGRESS BAR -->
  <div class="progress-bar" ref="progressBar"></div>

  <!-- SCROLL INDICATOR -->
  <div class="scroll-indicator" ref="scrollIndicator">
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
.scroll-pct{font-size:.65rem;color:#666;letter-spacing:1px;}
</style>