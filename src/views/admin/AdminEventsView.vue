<template>
  <div class="admin-page">
    <section class="section">
      <div class="container">
        <AdminNav />
        <div class="admin-header">
          <h1>ÉVÉNEMENTS</h1>
          <div class="actions">
            <router-link to="/admin/evenements/nouveau" class="btn btn-primary">+ Nouvel événement</router-link>
          </div>
        </div>

        <p v-if="route.query.saved && !deletedTitle" class="success-msg">Événement enregistré.</p>
        <p v-if="deletedTitle" class="success-msg">« {{ deletedTitle }} » a été supprimé.</p>

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
              <td>
                <!-- Le flex est sur un div : appliqué au td, il le sortirait du tableau et décalerait la ligne -->
                <div class="badges">
                  <span v-if="event.published" class="badge ok">Publié</span>
                  <span v-else class="badge">Brouillon</span>
                  <span v-if="event.is_featured" class="badge accent">À la une</span>
                  <span v-if="event.has_details" class="badge">Article</span>
                </div>
              </td>
              <td class="row-actions">
                <template v-if="confirmDeleteId === event.id">
                  <span class="confirm">Supprimer définitivement ?</span>
                  <button class="link danger" :disabled="busyId === event.id" @click="remove(event)">Oui, supprimer</button>
                  <button class="link" :disabled="busyId === event.id" @click="confirmDeleteId = null">Non</button>
                </template>
                <template v-else>
                  <router-link :to="`/admin/evenements/${event.id}`">Modifier</router-link>
                  <router-link v-if="event.published && event.has_details" :to="`/evenements/${event.id}`">Voir</router-link>
                  <button class="link" @click="askDelete(event.id)">Supprimer</button>
                </template>
                <p v-if="rowError?.id === event.id" class="row-error">{{ rowError.message }}</p>
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
import { useRoute } from 'vue-router'
import AdminNav from '@/components/admin/AdminNav.vue'
import { adminErrorMessage, deleteEvent, fetchAllEvents, type AdminEventRow } from '@/composables/useEventAdmin'

const route = useRoute()

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

// Suppression : confirmation dans la ligne (pas de window.confirm)
const confirmDeleteId = ref<number | null>(null)
const busyId = ref<number | null>(null)
const rowError = ref<{ id: number, message: string } | null>(null)
const deletedTitle = ref('')

function askDelete(id: number) {
  rowError.value = null
  confirmDeleteId.value = id
}

async function remove(event: AdminEventRow) {
  busyId.value = event.id
  rowError.value = null
  try {
    await deleteEvent(event.id)
    confirmDeleteId.value = null
    deletedTitle.value = event.title
    events.value = events.value.filter(e => e.id !== event.id)
  } catch (e) {
    console.error(e)
    rowError.value = { id: event.id, message: adminErrorMessage(e) }
  } finally {
    busyId.value = null
  }
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
.link {
  background: none; border: none; padding: 0; cursor: pointer; margin-left: 1rem;
  font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase; color: var(--red);
}
.link:hover { color: var(--white); }
.link.danger { color: #ff6b6b; font-weight: 700; }
.link:disabled { opacity: 0.5; cursor: wait; }
.confirm { font-size: 0.85rem; color: var(--white); }
.row-error { margin-top: 0.4rem; font-size: 0.8rem; color: #ff6b6b; white-space: normal; }

@media (max-width: 700px) {
  .events-table thead { display: none; }
  .events-table tr { display: block; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .events-table td { display: block; border: none; padding: 0.2rem 0; text-align: left; }
  .row-actions a, .row-actions .link { margin: 0 1rem 0 0; }
  .confirm { margin-right: 1rem; }
}
</style>
