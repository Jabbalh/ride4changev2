<template>
  <nav class="admin-nav" aria-label="Espace éditeur">
    <span class="who">Espace éditeur · {{ email }}</span>
    <div class="tabs">
      <router-link v-for="s in SECTIONS" :key="s.to" :to="s.to" class="tab" :class="{ active: route.path.startsWith(s.to) }">{{ s.label }}</router-link>
    </div>
    <button class="logout" @click="logout">Se déconnecter</button>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Rubriques éditables : ajouter ici toute nouvelle page /admin/…
const SECTIONS = [
  { to: '/admin/evenements', label: 'Événements' },
  { to: '/admin/association', label: "L'Association" },
]

const route = useRoute()
const router = useRouter()
const { email, signOut } = useAuth()

async function logout() {
  await signOut()
  await router.push('/')
}
</script>

<style scoped>
.admin-nav {
  display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
  padding-bottom: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1);
}
.who { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey); }
.tabs { display: flex; gap: 0.25rem; flex: 1; }
.tab {
  font-family:'Barlow Condensed',sans-serif; font-size:0.9rem; letter-spacing:0.12em; text-transform:uppercase;
  padding: 0.45rem 1rem; color: var(--grey-light); border-bottom: 2px solid transparent;
}
.tab:hover { color: var(--white); }
.tab.active { color: var(--white); border-bottom-color: var(--red); }
.logout {
  background: none; border: 1px solid rgba(255,255,255,0.15); color: var(--grey-light); cursor: pointer;
  font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.12em; text-transform:uppercase; padding: 0.45rem 1rem;
}
.logout:hover { border-color: var(--red); color: var(--white); }
</style>
