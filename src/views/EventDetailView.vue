<template>
  <div class="event-detail-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <router-link to="/evenements" class="back-link">← Tous les événements</router-link>
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
          <!-- Article Markdown (colonne `details`), ou à défaut le résumé -->
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
import { renderMarkdown } from '@/lib/markdown'

const props = defineProps<{ id: number }>()

const { event, loading, error, reload } = useEvent(() => props.id)

// HTML nettoyé par DOMPurify dans renderMarkdown : v-html est sûr ici
const articleHtml = computed(() => event.value?.has_details && event.value.details ? renderMarkdown(event.value.details) : '')
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

/* Contenu Markdown : généré par v-html, d'où :deep() */
.article-content { color: var(--grey-light); font-size: 1.02rem; line-height: 1.75; max-width: 760px; }
.article-content :deep(h1),
.article-content :deep(h2) { font-family:'Bebas Neue',sans-serif; font-size: 2rem; line-height: 1.1; color: var(--white); margin: 2.25rem 0 0.75rem; }
.article-content :deep(h3),
.article-content :deep(h4) { font-family:'Barlow Condensed',sans-serif; font-size: 1.25rem; font-weight: 700; letter-spacing: 0.05em; color: var(--white); margin: 1.75rem 0 0.5rem; }
.article-content :deep(> :first-child) { margin-top: 0; }
.article-content :deep(p),
.article-content :deep(ul),
.article-content :deep(ol),
.article-content :deep(blockquote),
.article-content :deep(table) { margin-bottom: 1.1rem; }
.article-content :deep(ul),
.article-content :deep(ol) { padding-left: 1.4rem; }
.article-content :deep(li) { margin-bottom: 0.35rem; }
.article-content :deep(li::marker) { color: var(--red); }
.article-content :deep(strong) { color: var(--white); }
.article-content :deep(a) { color: var(--red); border-bottom: 1px solid currentColor; }
.article-content :deep(a:hover) { color: var(--white); }
.article-content :deep(img) { max-width: 100%; height: auto; display: block; margin: 1.5rem 0; border-left: 3px solid var(--red); }
.article-content :deep(blockquote) { border-left: 3px solid var(--red); background: var(--dark); padding: 1rem 1.25rem; font-style: italic; }
.article-content :deep(blockquote p:last-child) { margin-bottom: 0; }
.article-content :deep(hr) { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem 0; }
.article-content :deep(code) { background: var(--dark2); padding: 0.1rem 0.35rem; font-size: 0.9em; }
.article-content :deep(table) { border-collapse: collapse; width: 100%; font-size: 0.92rem; }
.article-content :deep(th),
.article-content :deep(td) { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0.55rem 0.75rem; text-align: left; }
.article-content :deep(th) { font-family:'Barlow Condensed',sans-serif; letter-spacing: 0.1em; text-transform: uppercase; color: var(--white); }

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
