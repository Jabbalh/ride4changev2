<template>
  <div id="app-wrapper">
    <a href="#contenu" class="skip-link" @click.prevent="goToContent">Aller au contenu</a>
    <NavBar />
    <main id="contenu" tabindex="-1">
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

// Lien d'évitement : place le focus sur le contenu principal, sans passer par le menu
// (évite aussi d'ajouter #contenu à l'adresse, qui est gérée par le router)
function goToContent() {
  const main = document.getElementById('contenu')
  main?.focus()
  main?.scrollIntoView()
}
</script>

<style>
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main { flex: 1; }
main:focus { outline: none; }
</style>
