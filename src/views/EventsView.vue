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
        <p v-if="loading" class="events-state">Chargement des événements…</p>
        <div v-else-if="error" class="events-state events-error">
          <p>{{ error }}</p>
          <button class="btn btn-outline" @click="reload">Réessayer</button>
        </div>
        <p v-else-if="!upcoming.length && !past.length" class="events-state">
          Aucun événement pour le moment. Suivez-nous sur les réseaux sociaux pour ne rien manquer !
        </p>

        <div v-else class="events-layout" :class="{ 'no-featured': !featured }">
          <!-- FEATURED : prochain événement marqué « is_featured » dans Supabase -->
          <div v-if="featured" class="event-featured">
            <div class="section-heading">
              <span class="overline">À la une</span>
              <h2>{{ featured.title }}</h2>
              <p v-if="featured.description">{{ featured.description }}</p>
            </div>
            <div class="featured-details">
              <div class="detail-item"><span class="detail-icon">📅</span><div><strong>{{ featured.dateLabel }}</strong><span>{{ featured.type }}</span></div></div>
              <div v-if="featured.location" class="detail-item"><span class="detail-icon">📍</span><div><strong>{{ featured.location }}</strong></div></div>
              <div v-if="featured.participants" class="detail-item"><span class="detail-icon">👥</span><div><strong>{{ featured.participants }}</strong></div></div>
            </div>
            <div class="featured-actions">
              <router-link :to="{ path: '/contact', query: { objet: 'evenement' } }" class="btn btn-primary">Je m'inscris</router-link>
              <router-link v-if="featured.has_details" :to="`/evenements/${featured.id}`" class="btn btn-outline">En savoir plus</router-link>
            </div>
          </div>

          <!-- EVENTS LIST -->
          <div class="events-list">
            <h3 class="list-title">Tous les événements</h3>
            <!-- Cliquable seulement si l'événement a un article (has_details, calculé par Supabase) -->
            <component
                :is="event.has_details ? RouterLink : 'div'"
                v-for="event in [...upcoming, ...past]"
                :key="event.id"
                v-bind="event.has_details ? { to: `/evenements/${event.id}` } : {}"
                class="event-item"
                :class="{ past: event.past, clickable: event.has_details }"
            >
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
                <p>{{ [event.location, event.description].filter(Boolean).join(' · ') }}</p>
                <span v-if="event.has_details" class="read-more">Lire la suite →</span>
              </div>
            </component>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useEvents } from '@/composables/useEvents'

// Les événements sont gérés dans Supabase (table « events ») : voir README.
const { upcoming, past, featured, loading, error, reload } = useEvents()
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
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(1.5rem, 5vw, 5rem);
  line-height: 0.95;
}
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; max-width:500px; }

.events-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
.events-layout.no-featured { grid-template-columns: minmax(0, 720px); }
.events-state { color: var(--grey-light); font-size: 1rem; padding: 2rem 0; }
.events-error { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
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
.event-item.clickable { cursor: pointer; }
.event-item.clickable:hover h4 { color: var(--red); }
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
.read-more { display: inline-block; margin-top: 0.4rem; font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--red); }
.featured-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

@media (max-width: 900px) {
  .events-layout { grid-template-columns: 1fr; gap: 3rem; }
}
</style>
