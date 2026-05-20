<template>
  <div id="app-wrapper">
    <NavBar />
    <main>
      <SocialFloat />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <FooterBar />
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'
import SocialFloat from "@/components/SocialFloat.vue";
</script>

<style>
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main { flex: 1; }
</style>
