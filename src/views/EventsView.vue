<template>
  <div class="events-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Agenda</span>
        <h1>ÉVÉNEMENTS</h1>
        <p>Toutes les sorties, rallyes et actions à venir.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="events-layout">
          <!-- FEATURED -->
          <div class="event-featured">
            <div class="section-heading">
              <span class="overline">À la une</span>
              <h2>Grand Rassemblement<br>Annuel 2025</h2>
              <p>Le temps fort de notre année ! Deux jours de roulage, de convivialité et de fraternité au circuit de Lédenon.</p>
            </div>
            <div class="featured-details">
              <div class="detail-item"><span class="detail-icon">📅</span><div><strong>14-15 Juin 2025</strong><span>Weekend complet</span></div></div>
              <div class="detail-item"><span class="detail-icon">📍</span><div><strong>Circuit de Lédenon</strong><span>Gard (30)</span></div></div>
              <div class="detail-item"><span class="detail-icon">👥</span><div><strong>120 participants</strong><span>Membres + invités</span></div></div>
            </div>
            <router-link to="/contact" class="btn btn-primary">Je m'inscris</router-link>
          </div>

          <!-- EVENTS LIST -->
          <div class="events-list">
            <h3 class="list-title">Tous les événements</h3>
            <div v-for="event in events" :key="event.id" class="event-item" :class="{ past: event.past }">
              <div class="event-date">
                <span class="e-month">{{ event.month }}</span>
                <span class="e-day">{{ event.day }}</span>
              </div>
              <div class="event-body">
                <div class="event-meta">
                  <span class="event-type">{{ event.type }}</span>
                  <span v-if="event.past" class="event-badge past-badge">Passé</span>
                  <span v-else class="event-badge upcoming-badge">À venir</span>
                </div>
                <h4>{{ event.title }}</h4>
                <p>{{ event.location }} · {{ event.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const events = [
  { id:1, month:'Avr', day:'20', type:'Sortie', title:'Sortie Printemps — Luberon', location:'Vaucluse (84)', desc:'Ouverture de la saison, 200 km dans le Luberon.', past: false },
  { id:2, month:'Mai', day:'04', type:'Formation', title:'Stage conduite sécurité', location:'Arles (13)', desc:'Formation avec moniteur FFM — 8 places disponibles.', past: false },
  { id:3, month:'Mai', day:'25', type:'Sortie', title:'Traversée des Corbières', location:'Aude (11)', desc:'Route mythique à travers les vignes et les châteaux cathares.', past: false },
  { id:4, month:'Jun', day:'14', type:'Rassemblement', title:'Grand Rassemblement Annuel', location:'Lédenon (30)', desc:'2 jours de festivités, circuit ouvert, barbecue géant !', past: false },
  { id:5, month:'Jul', day:'12', type:'Sortie', title:'Gorges du Verdon', location:'Alpes-de-Haute-Provence', desc:'Sortie estivale dans les gorges les plus profondes d\'Europe.', past: false },
  { id:6, month:'Sep', day:'06', type:'Rallye', title:'Rallye des 3 Cols', location:'Alpes (74/38/73)', desc:'Défi sportif de 450 km à travers les grands cols alpins.', past: false },
  { id:7, month:'Dec', day:'06', type:'Solidarité', title:'Collecte de jouets', location:'Arles (13)', desc:'Livraison des jouets à l\'hôpital d\'Arles avec le Père Noël 🎅', past: false },
  { id:8, month:'Jan', day:'18', type:'AG', title:'Assemblée Générale 2025', location:'Salle des fêtes, Arles', desc:'Bilan 2024, élection du bureau, programme 2025.', past: true },
  { id:9, month:'Mar', day:'08', type:'Atelier', title:'Journée mécanique', location:'Garage du club, Arles', desc:'Préparation des motos pour la saison. Café et croissants !', past: true },
]
</script>

<style scoped>
.page-header {
  position: relative; padding: 10rem 0 5rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.12) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.page-header .overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.75rem; }
.page-header h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(4rem,10vw,8rem); line-height:0.95; }
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; max-width:500px; }

.events-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
.event-featured .section-heading { margin-bottom: 2rem; }
.featured-details { margin-bottom: 2rem; }
.detail-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
.detail-icon { font-size: 1.5rem; }
.detail-item > div { display: flex; flex-direction: column; }
.detail-item strong { font-family: 'Barlow Condensed',sans-serif; font-size: 1rem; font-weight: 700; }
.detail-item span { font-size: 0.85rem; color: var(--grey); }

.list-title { font-family: 'Barlow Condensed',sans-serif; font-size: 0.8rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--red); margin-bottom: 1rem; }
.event-item {
  display: flex; gap: 1.25rem; padding: 1.25rem;
  background: var(--dark); margin-bottom: 0.75rem;
  border-left: 3px solid var(--red);
  transition: transform 0.3s, border-color 0.3s;
}
.event-item:hover { transform: translateX(4px); }
.event-item.past { border-color: rgba(255,255,255,0.1); opacity: 0.55; }
.event-date {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--red); padding: 0.5rem 0.9rem; flex-shrink: 0; min-width: 52px;
}
.event-item.past .event-date { background: rgba(255,255,255,0.1); }
.e-month { font-family: 'Barlow Condensed',sans-serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; }
.e-day { font-family: 'Bebas Neue',sans-serif; font-size: 1.8rem; line-height: 1; }
.event-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.3rem; }
.event-type { font-family: 'Barlow Condensed',sans-serif; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); }
.event-item.past .event-type { color: var(--grey); }
.event-badge { font-family: 'Barlow Condensed',sans-serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.15rem 0.5rem; }
.upcoming-badge { background: rgba(230,57,70,0.2); color: var(--red); }
.past-badge { background: rgba(255,255,255,0.07); color: var(--grey); }
.event-body h4 { font-family: 'Barlow Condensed',sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
.event-body p { font-size: 0.82rem; color: var(--grey); line-height: 1.5; }

@media (max-width: 900px) {
  .events-layout { grid-template-columns: 1fr; gap: 3rem; }
}
</style>
