<script setup lang="ts">
defineProps({ displayImage: {type: Boolean, default: true} });
const note = 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z'
</script>
<template>
  <a href="https://www.tiktok.com/@ride4change" target="_blank" rel="noopener" title="TikTok" aria-label="TikTok (nouvel onglet)">
    <svg v-if="displayImage" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <g transform="translate(12 12) scale(0.72) translate(-12 -12)">
        <path :d="note" fill="#25F4EE" transform="translate(-0.9 -0.9)"/>
        <path :d="note" fill="#FE2C55" transform="translate(0.9 0.9)"/>
        <path :d="note" fill="#fff"/>
      </g>
    </svg>
    <span v-else>Tiktok</span>
  </a>
</template>
<style scoped>
svg{width:1.5rem;height:1.5rem;display:block;}
</style>
