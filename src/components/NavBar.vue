<template>
  <nav class="navbar" :class="{ scrolled: isScrolled, 'menu-open': menuOpen }">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo" @click="menuOpen = false">
        <span class="logo-icon">⚙</span>
        <span class="logo-text"><strong>Ride 4 Change</strong></span>
      </router-link>
      <button class="burger" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" :class="{ open: menuOpen }">
        <li v-for="link in links" :key="link.to">
          <router-link :to="link.to" @click="menuOpen = false">{{ link.label }}</router-link>
        </li>
        <li>
          <router-link to="/contact" class="btn btn-primary nav-cta" @click="menuOpen = false">Nous rejoindre</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const isScrolled = ref(false)
const menuOpen = ref(false)
const links = [
  { to: '/', label: 'Accueil' },
  { to: '/association', label: "L'Association" },
  { to: '/galerie', label: 'Galerie' },
  { to: '/evenements', label: 'Événements' },
  { to: '/contact', label: 'Contact' },
]
const handleScroll = () => { isScrolled.value = window.scrollY > 50 }
onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.navbar {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000; padding: 1.2rem 0;
  transition: all 0.4s ease;
}
.navbar.scrolled {
  background: rgba(13,13,13,0.97);
  padding: 0.7rem 0;
  border-bottom: 1px solid rgba(230,57,70,0.3);
  backdrop-filter: blur(10px);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-logo { display: flex; align-items: center; gap: 0.75rem; }
.logo-icon { font-size: 1.8rem; color: var(--red); animation: spin 12s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.logo-text { font-family: 'Barlow Condensed',sans-serif; font-size: 1.1rem; letter-spacing: 0.15em; text-transform: uppercase; }
.logo-text strong { color: var(--red); }
.nav-links { list-style: none; display: flex; align-items: center; gap: 2rem; }
.nav-links a {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.9rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-light);
  transition: color 0.3s; position: relative;
}
.nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0;
  width: 0; height: 2px; background: var(--red); transition: width 0.3s ease;
}
.nav-links a:hover, .nav-links a.router-link-exact-active { color: var(--white); }
.nav-links a:hover::after, .nav-links a.router-link-exact-active::after { width: 100%; }
.nav-cta { padding: 0.55rem 1.25rem !important; font-size: 0.8rem !important; color: var(--white) !important; }
.nav-cta::after { display: none !important; }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.burger span { display: block; width: 24px; height: 2px; background: var(--white); transition: all 0.3s ease; }
@media (max-width: 768px) {
  .burger { display: flex; }
  .nav-links {
    position: fixed; top: 0; right: 0; width: 280px; height: 100vh;
    background: var(--dark); flex-direction: column; align-items: flex-start;
    padding: 5rem 2rem 2rem; gap: 0.5rem;
    transform: translateX(100%); transition: transform 0.4s ease;
    border-left: 2px solid var(--red);
  }
  .nav-links.open { transform: translateX(0); }
  .nav-links a { font-size: 1.1rem; padding: 0.5rem 0; }
  .menu-open .burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .menu-open .burger span:nth-child(2) { opacity: 0; }
  .menu-open .burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
}
</style>
