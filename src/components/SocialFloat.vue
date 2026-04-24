<template>
  <div class="social-float">
    <FacebookSocialLinkk />
    <TiktokSocialLink />
    <InstagramSocialLink />
  </div>
</template>

<script setup lang="ts">

import FacebookSocialLinkk from "@/components/FacebookSocialLinkk.vue";
import TiktokSocialLink from "@/components/TiktokSocialLink.vue";
import InstagramSocialLink from "@/components/InstagramSocialLink.vue";
</script>

<style scoped>
.social-float{position:fixed;right:1.25rem;top:50%;transform:translateY(-50%);z-index:200;display:flex;flex-direction:column;gap:.6rem;}
.social-float a{width:38px;height:38px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#aaa;transition:all .2s;}
.social-float a:hover{background:#2a1010;border-color:var(--red);color:var(--red);transform:scale(1.1);}
@media(max-width:768px){.social-float{right:.5rem;}}
</style>