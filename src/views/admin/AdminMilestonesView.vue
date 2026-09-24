<template>
  <div class="admin-page">
    <section class="section">
      <div class="container">
        <AdminNav />
        <h1>DATES CLÉS</h1>
        <p class="intro">
          Affichées sur la page <router-link to="/association">L'Association</router-link>, dans l'ordre de cette liste.
          Utilisez ↑ et ↓ pour déplacer une date.
        </p>

        <!-- Ajout -->
        <form class="row-form add" @submit.prevent="add">
          <input v-model.number="newYear" type="number" :min="MIN_YEAR" :max="MAX_YEAR" aria-label="Année" required class="year" />
          <input v-model="newDescription" type="text" :maxlength="MAX_DESCRIPTION" placeholder="Description de la date clé" aria-label="Description" required class="desc" />
          <select v-model="newPlacement" aria-label="Position dans la liste" class="placement">
            <option value="top">En tête de liste</option>
            <option value="bottom">En fin de liste</option>
          </select>
          <button type="submit" class="btn btn-primary" :disabled="adding">{{ adding ? 'Ajout…' : '+ Ajouter' }}</button>
        </form>
        <p v-if="addError" class="error-msg">{{ addError }}</p>
        <p v-if="orderError" class="error-msg">{{ orderError }}</p>
        <p v-if="notice" class="success-msg">{{ notice }}</p>

        <p v-if="loading" class="state">Chargement…</p>
        <div v-else-if="loadError" class="state">
          <p>{{ loadError }}</p>
          <button class="btn btn-outline" @click="load">Réessayer</button>
        </div>
        <p v-else-if="!items.length" class="state">Aucune date clé pour le moment.</p>

        <ul v-else class="list">
          <li v-for="(m, index) in items" :key="m.id" class="item" :class="{ editing: editingId === m.id }">
            <span class="order">
              <button type="button" class="arrow" title="Monter" :aria-label="`Monter : ${m.description}`"
                      :disabled="index === 0 || reordering" @click="move(index, -1)">↑</button>
              <button type="button" class="arrow" title="Descendre" :aria-label="`Descendre : ${m.description}`"
                      :disabled="index === items.length - 1 || reordering" @click="move(index, 1)">↓</button>
            </span>
            <!-- Modification sur place -->
            <form v-if="editingId === m.id" class="row-form" @submit.prevent="save(m.id)">
              <input v-model.number="editYear" type="number" :min="MIN_YEAR" :max="MAX_YEAR" aria-label="Année" required class="year" />
              <input v-model="editDescription" type="text" :maxlength="MAX_DESCRIPTION" aria-label="Description" required class="desc" />
              <button type="submit" class="btn btn-primary" :disabled="busyId === m.id">Enregistrer</button>
              <button type="button" class="btn btn-outline" @click="cancelEdit">Annuler</button>
            </form>

            <template v-else>
              <span class="m-year">{{ m.year }}</span>
              <span class="m-text">{{ m.description }}</span>
              <span class="row-actions">
                <template v-if="confirmDeleteId === m.id">
                  <span class="confirm">Supprimer ?</span>
                  <button class="link danger" :disabled="busyId === m.id" @click="remove(m.id)">Oui, supprimer</button>
                  <button class="link" @click="confirmDeleteId = null">Non</button>
                </template>
                <template v-else>
                  <button class="link" @click="startEdit(m)">Modifier</button>
                  <button class="link" @click="confirmDeleteId = m.id">Supprimer</button>
                </template>
              </span>
            </template>
            <p v-if="rowError.id === m.id" class="error-msg row-error">{{ rowError.message }}</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import { fetchMilestones, type Milestone } from '@/composables/useMilestones'
import {
  createMilestone, deleteMilestone, reorderMilestones, updateMilestone, milestoneErrorMessage, validateMilestone,
  MAX_DESCRIPTION, MAX_YEAR, MIN_YEAR,
} from '@/composables/useMilestoneAdmin'

const items = ref<Milestone[]>([])
const loading = ref(true)
const loadError = ref('')
const notice = ref('')

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    items.value = await fetchMilestones()
  } catch (e) {
    console.error(e)
    loadError.value = milestoneErrorMessage(e)
  } finally {
    loading.value = false
  }
}
load()

function flash(message: string) {
  notice.value = message
  setTimeout(() => { if (notice.value === message) notice.value = '' }, 3000)
}

// --- Ajout ---
const newYear = ref<number>(new Date().getFullYear())
const newDescription = ref('')
// La base place toute nouvelle date en tête ; « en fin » = réordonnancement juste après la création
const newPlacement = ref<'top' | 'bottom'>('top')
const adding = ref(false)
const addError = ref('')

async function add() {
  addError.value = validateMilestone(newYear.value, newDescription.value) ?? ''
  if (addError.value) return
  adding.value = true
  try {
    const created = await createMilestone(newYear.value, newDescription.value)
    if (newPlacement.value === 'bottom') {
      await reorderMilestones([...items.value.map(m => m.id), created.id])
    }
    newDescription.value = ''
    flash('Date ajoutée.')
    await load()
  } catch (e) {
    console.error(e)
    addError.value = milestoneErrorMessage(e)
  } finally {
    adding.value = false
  }
}

// --- Ordre d'affichage ---
const reordering = ref(false)
const orderError = ref('')

/** Déplace la date d'un cran (-1 : vers le haut, 1 : vers le bas) et enregistre tout l'ordre en une fois. */
async function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.value.length) return
  const previous = [...items.value]
  const next = [...items.value]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  items.value = next // affichage immédiat
  reordering.value = true
  orderError.value = ''
  try {
    await reorderMilestones(next.map(m => m.id))
  } catch (e) {
    console.error(e)
    items.value = previous
    orderError.value = milestoneErrorMessage(e)
    await load() // se recaler sur l'ordre réellement enregistré
  } finally {
    reordering.value = false
  }
}

// --- Modification / suppression (une ligne à la fois) ---
const editingId = ref<number | null>(null)
const editYear = ref<number>(0)
const editDescription = ref('')
const confirmDeleteId = ref<number | null>(null)
const busyId = ref<number | null>(null)
const rowError = ref<{ id: number | null, message: string }>({ id: null, message: '' })

function startEdit(m: Milestone) {
  confirmDeleteId.value = null
  rowError.value = { id: null, message: '' }
  editingId.value = m.id
  editYear.value = m.year
  editDescription.value = m.description
}

function cancelEdit() {
  editingId.value = null
  rowError.value = { id: null, message: '' }
}

async function save(id: number) {
  const invalid = validateMilestone(editYear.value, editDescription.value)
  if (invalid) {
    rowError.value = { id, message: invalid }
    return
  }
  busyId.value = id
  try {
    await updateMilestone(id, editYear.value, editDescription.value)
    editingId.value = null
    rowError.value = { id: null, message: '' }
    flash('Date modifiée.')
    await load()
  } catch (e) {
    console.error(e)
    rowError.value = { id, message: milestoneErrorMessage(e) }
  } finally {
    busyId.value = null
  }
}

async function remove(id: number) {
  busyId.value = id
  try {
    await deleteMilestone(id)
    confirmDeleteId.value = null
    flash('Date supprimée.')
    await load()
  } catch (e) {
    console.error(e)
    rowError.value = { id, message: milestoneErrorMessage(e) }
  } finally {
    busyId.value = null
  }
}
</script>

<style scoped>
.admin-page { padding-top: 5rem; }
h1 { font-family:'Bebas Neue',sans-serif; font-size: 3rem; line-height: 1; margin-bottom: 0.75rem; }
.intro { color: var(--grey-light); font-size: 0.95rem; margin-bottom: 2rem; max-width: 720px; }
.intro a { color: var(--red); border-bottom: 1px solid currentColor; }
.state { color: var(--grey-light); padding: 2rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }

.row-form { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; flex: 1; }
.row-form.add { background: var(--dark); border-left: 3px solid var(--red); padding: 1rem; margin-bottom: 1rem; }
.row-form input {
  background: var(--dark2); border: 1px solid rgba(255,255,255,0.1); color: var(--white);
  padding: 0.65rem 0.85rem; font-family: 'Barlow',sans-serif; font-size: 0.95rem; outline: none;
}
.row-form input:focus { border-color: var(--red); }
.row-form .year { width: 6.5rem; }
.row-form .placement {
  background: var(--dark2); border: 1px solid rgba(255,255,255,0.1); color: var(--white);
  padding: 0.65rem 0.6rem; font-family: 'Barlow',sans-serif; font-size: 0.9rem; outline: none; color-scheme: dark;
}
.order { display: flex; flex-direction: column; gap: 2px; }
.arrow {
  width: 1.9rem; height: 1.4rem; line-height: 1; cursor: pointer;
  background: var(--dark2); border: 1px solid rgba(255,255,255,0.12); color: var(--grey-light); font-size: 0.85rem;
}
.arrow:hover:not(:disabled) { border-color: var(--red); color: var(--white); }
.arrow:disabled { opacity: 0.25; cursor: default; }
.row-form .desc { flex: 1; min-width: 14rem; }
.row-form .btn { padding: 0.6rem 1.1rem; font-size: 0.8rem; }
.row-form .btn:disabled { opacity: 0.6; cursor: wait; }

.success-msg { background: rgba(0,180,80,0.1); border: 1px solid rgba(0,180,80,0.3); padding: 0.7rem 1rem; margin-bottom: 1rem; font-size: 0.9rem; }
.error-msg { background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.3); padding: 0.7rem 1rem; margin-bottom: 1rem; font-size: 0.9rem; }

.list { list-style: none; margin-top: 1.5rem; border-left: 2px solid var(--red); }
.item { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 0.8rem 1rem 0.8rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
.item:hover { background: rgba(255,255,255,0.02); }
.item.editing { background: var(--dark); }
.m-year { font-family:'Bebas Neue',sans-serif; font-size: 1.3rem; color: var(--red); min-width: 3.5rem; }
.m-text { flex: 1; color: var(--grey-light); font-size: 0.95rem; }
.row-actions { display: flex; gap: 1rem; align-items: center; white-space: nowrap; }
.confirm { font-size: 0.85rem; color: var(--white); }
.link {
  background: none; border: none; cursor: pointer; padding: 0;
  font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase; color: var(--red);
}
.link:hover { color: var(--white); }
.link.danger { color: #ff6b6b; font-weight: 700; }
.link:disabled { opacity: 0.5; cursor: wait; }
.row-error { flex-basis: 100%; margin: 0.25rem 0 0; }
</style>
