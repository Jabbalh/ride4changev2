<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-overlay"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-badge">
          <span>Fondée en 2025 · Saint Meen le Grand, France</span>
        </div>
        <h1 class="hero-title">
          <img src="/logo.jpg" alt="Logo" class="image-logo">
          <span class="line1">Ride</span>
          <span class="line2">4</span>
          <span class="line3">Change</span>
        </h1>
        <p class="hero-sub">Profitez de votre seule vie et lâchez les chevaux</p>
        <div class="hero-actions">
          <router-link to="/association" class="btn btn-primary">Découvrir l'asso</router-link>
          <router-link to="/galerie" class="btn btn-outline">Voir la galerie</router-link>
        </div>
<!--        <div class="hero-actions">-->
<!--          <span class="stat-label">Nous suivre: </span>-->
<!--          <div class="social-links">-->
<!--            <a href="https://www.facebook.com/profile.php?id=61573516003975" target="_blank" aria-label="Facebook">FB</a>-->
<!--            <a href="https://www.instagram.com/ride4change_ludo_et_paule/" target="_blank" aria-label="Instagram">IG</a>-->
<!--            <a href="https://www.tiktok.com/@ride4change" target="_blank" aria-label="Tiktok">TT</a>-->
<!--          </div>-->
<!--        </div>-->
        <div class="hero-stats">
          <div v-for="s in stats" :key="s.label" class="stat">
            <span class="stat-value">{{ s.value }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
<!--      <div class="hero-scroll">-->
<!--        <span>Scroll</span>-->
<!--        <div class="scroll-line"></div>-->
<!--      </div>-->
    </section>

    <!-- INTRO -->
    <section class="intro section">
      <div class="container intro-grid">
        <div class="intro-text">
          <div class="section-heading">
            <span class="overline">Qui sommes-nous</span>
            <h2>Plus qu'un club,<br>une famille</h2>
            <p>Ride 4 change rassemble des passionnés de moto autour de valeurs communes : le respect, la solidarité et l'amour de la route.</p>
          </div>
          <router-link to="/association" class="btn btn-primary">En savoir plus</router-link>
        </div>
        <div class="intro-values">
          <div v-for="v in values" :key="v.title" class="value-card">
            <span class="value-icon">
              <img :src="baseUrl + v.icon" alt="Value Icon">
            </span>
            <h3>{{ v.title }}</h3>
            <p>{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ACTIONS / APERÇU GALERIE -->
    <section class="actions-preview section" style="background: var(--dark);">
      <div class="container">
        <div class="section-heading">
          <span class="overline">Nos actions</span>
          <h2>Sur le terrain</h2>
          <p>Entre les courses, les baptèmes et le partage, chaque kilomètre a du sens.</p>
        </div>
        <div class="actions-grid">
          <div v-for="action in actions" :key="action.title" class="action-card">
            <div class="action-img" :style="{ background: action.color }">
              <span class="action-emoji">{{ action.emoji }}</span>
            </div>
            <div class="action-info">
              <span class="action-tag">{{ action.tag }}</span>
              <h3>{{ action.title }}</h3>
              <p>{{ action.desc }}</p>
            </div>
          </div>
        </div>
        <div class="center-cta">
          <router-link to="/galerie" class="btn btn-primary">Voir toutes les photos</router-link>
        </div>
      </div>
    </section>

    <!-- PROCHAIN ÉVÈNEMENT -->
    <section class="next-event section">
      <div class="container">
        <div class="event-banner">
          <div class="event-date-box">
            <span class="month">Avril</span>
            <span class="day">25</span>
            <span class="year">2026</span>
          </div>
          <div class="event-info">
            <span class="overline">Prochain événement</span>
            <h2>Barbecue chez Ludo</h2>
            <p>Le rendez-vous incontournable, de la viande, du palet et des boules.</p>
            <router-link to="/evenements" class="btn btn-primary">Voir le programme</router-link>
          </div>
          <div class="event-decoration">🏍</div>
        </div>
      </div>
    </section>

    <!-- TEMOIGNAGES -->
    <section class="testimonials section" style="background: var(--dark2);">
      <div class="container">
        <div class="section-heading">
          <span class="overline">Témoignages</span>
          <h2>Ils font partie<br>de l'aventure</h2>
        </div>
        <div class="testimonials-grid">
          <div v-for="t in testimonials" :key="t.name" class="testimonial-card">
            <p class="quote">"{{ t.quote }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ t.initials }}</div>
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const baseUrl = import.meta.env.BASE_URL;
const anneeExistance = new Date().getFullYear() - 2025;
const stats = [
  { value: '5+', label: 'Membres actifs' },
  { value: anneeExistance, label: 'Année(s) d\'existence' },
  { value: '20', label: 'Sorties par an' },
  { value: '12000', label: 'Km parcourus / an' },
]
const values = [
  { icon: 'yeye.jpg', title: 'Le pilote', desc: 'Ludo, notre pilote toujours au top.' },
  { icon: 'partenaire.jpg', title: 'Un partenaire', desc: 'Ca sert toujours un bon garage.' },
  { icon: 'moto1.jpg', title: 'Des courses', desc: "Parce qu'on aime aussi la compétition." },
  { icon: 'toto.jpg', title: 'Des copains', desc: "Parce qu'on aime les copains qui nous accompagnent." },
]
const actions = [
  { tag: 'Courses', emoji: '🏁', color: 'linear-gradient(135deg,#1f1a1a,#2d1f00)', title: 'Le man', desc: 'Un petit tour au man.' },
  { tag: 'Baptèmes', emoji: '🪖', color: 'linear-gradient(135deg,#1a1f1a,#1f2d1f)', title: 'Initiation sécurité', desc: 'Des baptèmes de moto.' },
  { tag: 'Je ne sais pas', emoji: '🩺', color: 'linear-gradient(135deg,#1a1a2d,#1a1a1a)', title: 'Je ne sais pas', desc: 'Un autre truc ?.' },
]
const testimonials = [
  { name: 'Toto', role: 'Membre depuis 2025', initials: 'TT', quote: "Moi je bricole." },
  { name: 'Machin', role: 'Squatteur', initials: 'M', quote: "Moi je squatte." },
  { name: 'Ludo', role: 'Membre fondateur', initials: 'LR', quote: "Depuis 2025, je pilote." },
]
</script>

<style scoped>
/* HERO */
.hero {
  position: relative;

  margin-top: 3rem;
  padding-top: var(--nav-height);
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #0d0d0d 0%, #1a0a0a 40%, #0d0d0d 100%);
}
.hero-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 50%, rgba(230,57,70,0.12) 0%, transparent 60%);
}
.hero-pattern {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: repeating-linear-gradient(
    45deg, var(--white) 0, var(--white) 1px, transparent 0, transparent 50%
  );
  background-size: 30px 30px;
}
.hero-content {
  position: relative; z-index: 2;
  padding-bottom: 80px;
}
.hero-badge {
  display: inline-block;
  border: 1px solid rgba(230,57,70,0.4);
  padding: 0.4rem 1.25rem;
  margin-bottom: 2rem;
  font-family: 'Barlow Condensed',sans-serif;
  font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--red);
}
.hero-title {
  line-height: 0.9; margin-bottom: 1.5rem;
}
.hero-title .line1 {
  font-family: 'Bebas Neue',sans-serif;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  color: var(--white); letter-spacing: 0.05em;
}
.hero-title .line2 {
  padding-left: 0.25em;
  font-family: 'Bebas Neue',sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  color: var(--red); letter-spacing: 0.12em;
}
.hero-title .line3 {
  padding-left: 0.25em;
  font-family: 'Bebas Neue',sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,0.8);
  letter-spacing: 0.3em;
}
.hero-sub {
  font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.4em;
  text-transform: uppercase; color: var(--grey-light);
  font-size: 0.9rem; margin-bottom: 2.5rem;
}
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 4rem; }
.hero-stats {
  display: flex; gap: 3rem; flex-wrap: wrap;
  padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);
}
.stat { display: flex; flex-direction: column; }
.stat-value {
  font-family: 'Bebas Neue',sans-serif; font-size: 2.5rem;
  color: var(--red); line-height: 1;
}
.stat-label {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey);
}
.hero-scroll {
  position: absolute; bottom: 2rem; right: 3rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey);
}
.scroll-line { width: 1px; height: 50px; background: linear-gradient(to bottom, var(--red), transparent); }

/* INTRO */
.intro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.intro-text .section-heading { margin-bottom: 2rem; }
.intro-values { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.value-card {
  background: var(--dark2); padding: 1.5rem;
  border-left: 3px solid var(--red);
  transition: transform 0.3s;
}
.value-card:hover { transform: translateY(-4px); }
.value-icon { font-size: 1.75rem; display: block; margin-bottom: 0.75rem; }
.value-card h3 {
  font-family: 'Barlow Condensed',sans-serif; font-size: 1rem;
  letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem;
}
.value-card p { font-size: 0.88rem; color: var(--grey); line-height: 1.6; }

/* ACTIONS */
.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
.action-card {
  background: var(--black); overflow: hidden;
  transition: transform 0.3s;
}
.action-card:hover { transform: translateY(-6px); }
.action-img {
  height: 160px; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.action-emoji { font-size: 4rem; }
.action-info { padding: 1.5rem; }
.action-tag {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.5rem;
}
.action-info h3 { font-family: 'Barlow Condensed',sans-serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
.action-info p { font-size: 0.88rem; color: var(--grey); line-height: 1.6; }
.center-cta { text-align: center; }

/* EVENT BANNER */
.event-banner {
  background: var(--dark);
  border: 1px solid rgba(230,57,70,0.3);
  display: grid; grid-template-columns: auto 1fr auto;
  gap: 3rem; align-items: center; padding: 3rem;
  position: relative; overflow: hidden;
}
.event-banner::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 4px; height: 100%; background: var(--red);
}
.event-date-box {
  display: flex; flex-direction: column; align-items: center;
  background: var(--red); padding: 1.5rem 2rem; min-width: 100px;
}
.event-date-box .month {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.8rem;
  letter-spacing: 0.2em; text-transform: uppercase;
}
.event-date-box .day {
  font-family: 'Bebas Neue',sans-serif; font-size: 4rem; line-height: 1;
}
.event-date-box .year {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem; opacity: 0.8;
}
.event-info .overline {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem;
  letter-spacing: 0.3em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.5rem;
}
.event-info h2 { font-family: 'Bebas Neue',sans-serif; font-size: 2.5rem; margin-bottom: 0.75rem; }
.event-info p { color: var(--grey-light); font-size: 0.95rem; margin-bottom: 1.5rem; max-width: 500px; }
.event-decoration { font-size: 5rem; opacity: 0.15; }

/* TESTIMONIALS */
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.testimonial-card {
  background: var(--dark); padding: 2rem;
  border-bottom: 3px solid var(--red);
}
.quote { font-style: italic; color: var(--grey-light); line-height: 1.8; margin-bottom: 1.5rem; font-size: 0.95rem; }
.testimonial-author { display: flex; align-items: center; gap: 1rem; }
.author-avatar {
  width: 44px; height: 44px; background: var(--red);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.85rem; font-weight: 700;
  flex-shrink: 0;
}
.testimonial-author strong { display: block; font-size: 0.9rem; }
.testimonial-author span { font-size: 0.8rem; color: var(--grey); font-family: 'Barlow Condensed',sans-serif; letter-spacing: 0.05em; }

.image-logo {
  display: inline-block; vertical-align: bottom; margin-right: 10px; width: 2.5em; height: 2.5em;
}
@media (max-width: 1100px) {
  .image-logo {
    display: inline-block; vertical-align: bottom; margin-right: 10px; width: 2em; height: 2em;
  }
}

@media (max-width: 900px) {
  .intro-grid { grid-template-columns: 1fr; gap: 3rem; }
  .event-banner { grid-template-columns: auto 1fr; }
  .event-decoration { display: none; }
  .image-logo {
    display: inline-block; vertical-align: bottom; margin-right: 10px; width: 1.5em; height: 1.5em;
  }
}
@media (max-width: 600px) {
  .hero-stats { gap: 1.5rem; }
  .event-banner { grid-template-columns: 1fr; padding: 2rem; }
  .intro-values { grid-template-columns: 1fr; }
  .image-logo {
    display: inline-block; vertical-align: bottom; margin-right: 10px; width: 1.2em; height: 1.2em;
  }
}
</style>
