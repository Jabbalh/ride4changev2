<template>
  <div class="event-detail-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <router-link to="/evenements" class="back-link">← Tous les événements</router-link>
        <router-link v-if="isEditor && event" :to="`/admin/evenements/${event.id}`" class="back-link edit-link">✎ Modifier</router-link>
        <template v-if="event">
          <span class="overline">{{ event.type }}<template v-if="event.past"> · Passé</template></span>
          <h1>{{ event.title }}</h1>
          <p>{{ [event.dateLabel, event.location].filter(Boolean).join(' · ') }}</p>
        </template>
        <h1 v-else-if="!loading">ÉVÉNEMENT</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p v-if="loading" class="detail-state">Chargement…</p>
        <div v-else-if="error" class="detail-state detail-error">
          <p>{{ error }}</p>
          <button class="btn btn-outline" @click="reload">Réessayer</button>
        </div>
        <div v-else-if="!event" class="detail-state">
          <p>Cet événement n'existe pas ou n'est plus en ligne.</p>
          <router-link to="/evenements" class="btn btn-primary">Voir les événements</router-link>
        </div>

        <div v-else class="detail-layout">
          <!-- Article (colonne `details` : HTML de l'éditeur ou Markdown), ou à défaut le résumé -->
          <article v-if="articleHtml" class="article-content" v-html="articleHtml"></article>
          <p v-else class="article-summary">{{ event.description }}</p>

          <aside class="info-card">
            <h3>Infos pratiques</h3>
            <div class="info-row"><span class="info-icon">📅</span><div><span class="info-label">Date</span><strong>{{ event.dateLabel }}</strong></div></div>
            <div v-if="event.location" class="info-row"><span class="info-icon">📍</span><div><span class="info-label">Lieu</span><strong>{{ event.location }}</strong></div></div>
            <div v-if="event.participants" class="info-row"><span class="info-icon">👥</span><div><span class="info-label">Participants</span><strong>{{ event.participants }}</strong></div></div>
            <router-link
                v-if="!event.past"
                :to="{ path: '/contact', query: { objet: 'evenement' } }"
                class="btn btn-primary info-cta"
            >Je m'inscris</router-link>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEvent } from '@/composables/useEvents'
import { renderRichText } from '@/lib/richText'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ id: number }>()

const { event, loading, error, reload } = useEvent(() => props.id)

// Lien « Modifier » pour un éditeur connecté (lecture de la session locale, aucun appel réseau pour un visiteur)
const { isEditor, init } = useAuth()
init()

// HTML nettoyé par DOMPurify dans renderRichText : v-html est sûr ici
const articleHtml = computed(() => event.value?.has_details && event.value.details ? renderRichText(event.value.details) : '')
</script>

<style scoped>
.page-header {
  position: relative; padding: 9rem 0 4rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.12) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.back-link {
  display: inline-block; margin-bottom: 1.5rem;
  font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase;
  color: var(--grey-light); transition: color 0.3s;
}
.back-link:hover { color: var(--red); }
.edit-link { margin-left: 1.5rem; color: var(--red); }
.page-header .overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.75rem; }
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(2rem, 5vw, 4.5rem);
  line-height: 0.95;
}
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; }

.detail-state { color: var(--grey-light); font-size: 1rem; padding: 2rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1.25rem; }
.detail-error { flex-direction: row; align-items: center; flex-wrap: wrap; }

.detail-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 4rem; align-items: start; }
.article-summary { color: var(--grey-light); font-size: 1.05rem; line-height: 1.7; }

/* Styles du contenu de l'article : src/assets/article.css (partagés avec l'éditeur) */
.article-content { max-width: 760px; }

.info-card { background: var(--dark); padding: 1.75rem; border-left: 3px solid var(--red); position: sticky; top: 6rem; }
.info-card h3 { font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); margin-bottom:1rem; }
.info-row { display:flex; align-items:center; gap:1rem; padding:0.6rem 0; border-bottom:1px solid rgba(255,255,255,0.07); }
.info-icon { font-size:1.25rem; }
.info-row > div { display:flex; flex-direction:column; }
.info-label { font-size:0.75rem; color:var(--grey); font-family:'Barlow Condensed',sans-serif; letter-spacing:0.1em; text-transform:uppercase; }
.info-row strong { font-size:0.95rem; }
.info-cta { margin-top: 1.5rem; width: 100%; text-align: center; }

@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; gap: 2.5rem; }
  .info-card { position: static; order: -1; }
}
</style>
