<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="logo-icon">⚙</span>
              <span><strong>Ride</strong> 4 Change</span>
            </div>
            <p>Suivez nous sur les réseaux sociaux.</p>
            <div class="social-links">
              <a href="https://www.facebook.com/profile.php?id=61573516003975" target="_blank" aria-label="Facebook">FB</a>
              <a href="https://www.instagram.com/ride4change_ludo_et_paule/" target="_blank" aria-label="Instagram">IG</a>
              <a href="https://www.tiktok.com/@ride4change" target="_blank" aria-label="Tiktok">TT</a>
            </div>
          </div>
          <div class="footer-nav">
            <h4>Navigation</h4>
            <ul>
              <li v-for="link in links" :key="link.to">
                <router-link :to="link.to">{{ link.label }}</router-link>
              </li>
            </ul>
          </div>
          <div class="footer-contact">
            <h4>Contact</h4>
            <p>📍 24 rue Maurice<br>35290 Saint Meen le Grand, France</p>
            <p>📧 1ride4change@gmail.com</p>
            <p>📞 +33 00 00 00 00 00</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} Ride 4 change — Tous droits réservés</p>
        <p>Association loi 1901 — Fondée en 2025</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const links = [
  { to: '/', label: 'Accueil' },
  { to: '/association', label: "L'Association" },
  { to: '/galerie', label: 'Galerie' },
  { to: '/evenements', label: 'Événements' },
  { to: '/contact', label: 'Contact' },
]
</script>

<style scoped>
.footer { background: var(--dark); border-top: 2px solid var(--red); }
.footer-top { padding: 4rem 0; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; }
.footer-logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.logo-icon { font-size: 1.5rem; color: var(--red); }
.footer-logo span { font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.15em; text-transform: uppercase; font-size: 1rem; }
.footer-logo strong { color: var(--red); }
.footer-brand p { color: var(--grey); font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.5rem; }
.social-links { display: flex; gap: 0.75rem; }
.social-links a {
  width: 38px; height: 38px; border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem; letter-spacing: 0.05em;
  color: var(--grey); transition: all 0.3s;
}
.social-links a:hover { border-color: var(--red); color: var(--red); }
.footer-nav h4, .footer-contact h4 {
  font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.2em;
  text-transform: uppercase; font-size: 0.8rem; color: var(--red);
  margin-bottom: 1.25rem;
}
.footer-nav ul { list-style: none; }
.footer-nav li { margin-bottom: 0.6rem; }
.footer-nav a { color: var(--grey); font-size: 0.9rem; transition: color 0.3s; }
.footer-nav a:hover { color: var(--white); }
.footer-contact p { color: var(--grey); font-size: 0.9rem; margin-bottom: 0.6rem; line-height: 1.6; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 1.25rem 0;
}
.footer-bottom .container { display: flex; justify-content: space-between; align-items: center; }
.footer-bottom p { font-size: 0.8rem; color: var(--grey); font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.05em; }
@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom .container { flex-direction: column; gap: 0.5rem; text-align: center; }
}
</style>
