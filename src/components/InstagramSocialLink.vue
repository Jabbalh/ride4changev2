<script setup lang="ts">
defineProps({ displayImage: {type: Boolean, default: true} });
</script>
<template>
  <a href="https://www.instagram.com/ride4change_ludo_et_paule/" target="_blank" title="Instagram">
<!--    <svg v-if="displayImage" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5"/><path fill="#1a1a1a" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/></svg>-->
    <img v-if="displayImage" src="http://www.google.com/s2/favicons?domain=instagram.com" />
    <span v-else>Instagram</span>
  </a>
</template>
<style scoped>
img{width:1.5rem;height:1.5rem;}
</style>