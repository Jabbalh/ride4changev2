<script setup lang="ts">
import { useId } from 'vue'
defineProps({ displayImage: {type: Boolean, default: true} });
// id unique : le composant apparaît plusieurs fois sur la page
const gradientId = `ig-gradient-${useId()}`
</script>
<template>
  <a href="https://www.instagram.com/ride4change_ludo_et_paule/" target="_blank" rel="noopener" title="Instagram" aria-label="Instagram (nouvel onglet)">
    <svg v-if="displayImage" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <radialGradient :id="gradientId" cx="0.3" cy="1.07" r="1.2">
          <stop offset="0" stop-color="#FFDD55"/>
          <stop offset="0.1" stop-color="#FFDD55"/>
          <stop offset="0.5" stop-color="#FF543E"/>
          <stop offset="1" stop-color="#C837AB"/>
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6.5" :fill="`url(#${gradientId})`"/>
      <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.8"/>
      <circle cx="16.1" cy="7.9" r="1.05" fill="#fff"/>
    </svg>
    <span v-else>Instagram</span>
  </a>
</template>
<style scoped>
svg{width:1.5rem;height:1.5rem;display:block;}
</style>
