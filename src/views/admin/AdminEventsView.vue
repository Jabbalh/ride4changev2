<template>
  <div class="admin-page">
    <section class="section">
      <div class="container">
        <div class="admin-header">
          <div>
            <span class="overline">Espace éditeur · {{ email }}</span>
            <h1>ÉVÉNEMENTS</h1>
          </div>
          <div class="actions">
            <router-link to="/admin/evenements/nouveau" class="btn btn-primary">+ Nouvel événement</router-link>
            <button class="btn btn-outline" @click="logout">Se déconnecter</button>
          </div>
        </div>

        <p v-if="route.query.saved" class="success-msg">Événement enregistré.</p>

        <p v-if="loading" class="state">Chargement…</p>
        <div v-else-if="error" class="state">
          <p>{{ error }}</p>
          <button class="btn btn-outline" @click="load">Réessayer</button>
        </div>
        <p v-else-if="!events.length" class="state">Aucun événement. Créez le premier !</p>

        <table v-else class="events-table">
          <thead>
            <tr><th>Date</th><th>Événement</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.id" :class="{ draft: !event.published }">
              <td class="date">{{ event.starts_on }}<template v-if="event.ends_on"> → {{ event.ends_on }}</template></td>
              <td>
                <span class="type">{{ event.type }}</span>
                <strong>{{ event.title }}</strong>
              </td>
              <td class="badges">
                <span v-if="event.published" class="badge ok">Publié</span>
                <span v-else class="badge">Brouillon</span>
                <span v-if="event.is_featured" class="badge accent">À la une</span>
                <span v-if="event.has_details" class="badge">Article</span>
              </td>
              <td class="row-actions">
                <router-link :to="`/admin/evenements/${event.id}`">Modifier</router-link>
                <router-link v-if="event.published && event.has_details" :to="`/evenements/${event.id}`">Voir</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { adminErrorMessage, fetchAllEvents, type AdminEventRow } from '@/composables/useEventAdmin'

const route = useRoute()
const router = useRouter()
const { email, signOut } = useAuth()

const events = ref<AdminEventRow[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    events.value = await fetchAllEvents()
  } catch (e) {
    console.error(e)
    error.value = adminErrorMessage(e)
  } finally {
    loading.value = false
  }
}
load()

async function logout() {
  await signOut()
  await router.push('/evenements')
}
</script>

<style scoped>
.admin-page { padding-top: 5rem; }
.admin-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.5rem; }
h1 { font-family:'Bebas Neue',sans-serif; font-size: 3rem; line-height: 1; }
.actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.state { color: var(--grey-light); padding: 2rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }
.success-msg { background: rgba(0,180,80,0.1); border: 1px solid rgba(0,180,80,0.3); padding: 0.85rem 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; }

.events-table { width: 100%; border-collapse: collapse; }
.events-table th {
  text-align: left; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.15);
  font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey);
}
.events-table td { padding: 0.9rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.07); vertical-align: middle; }
.events-table tr.draft td { opacity: 0.6; }
.date { font-family:'Barlow Condensed',sans-serif; white-space: nowrap; color: var(--grey-light); }
.type { display: block; font-family:'Barlow Condensed',sans-serif; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); }
.badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.badge { font-family:'Barlow Condensed',sans-serif; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.15rem 0.5rem; background: rgba(255,255,255,0.08); color: var(--grey-light); }
.badge.ok { background: rgba(0,180,80,0.15); color: #5fd68b; }
.badge.accent { background: rgba(230,57,70,0.2); color: var(--red); }
.row-actions { white-space: nowrap; text-align: right; }
.row-actions a { font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase; color: var(--red); margin-left: 1rem; }
.row-actions a:hover { color: var(--white); }

@media (max-width: 700px) {
  .events-table thead { display: none; }
  .events-table tr { display: block; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .events-table td { display: block; border: none; padding: 0.2rem 0; text-align: left; }
  .row-actions a { margin: 0 1rem 0 0; }
}
</style>
