<script setup lang="ts">
withDefaults(defineProps<{ displayImage: boolean }>(), {
  displayImage: true,
});
</script>
<template>
      <a href="https://www.facebook.com/profile.php?id=61573516003975" target="_blank" title="Facebook">
<!--        <svg v-if="displayImage" style="color: blue" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>-->
            <img v-if="displayImage" src="http://www.google.com/s2/favicons?domain=facebook.com" />
        <span v-else>Facebook</span>
      </a>
</template>
