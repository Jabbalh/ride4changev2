<template>
  <div class="admin-page">
    <section class="section">
      <div class="container">
        <router-link to="/admin/evenements" class="back-link">← Tous les événements</router-link>
        <span class="overline">Espace éditeur</span>
        <h1>{{ isNew ? 'NOUVEL ÉVÉNEMENT' : 'MODIFIER L\'ÉVÉNEMENT' }}</h1>

        <p v-if="loading" class="state">Chargement…</p>
        <div v-else-if="loadError" class="state">
          <p>{{ loadError }}</p>
          <button class="btn btn-outline" @click="load">Réessayer</button>
        </div>

        <form v-else class="form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="title">Titre *</label>
            <input id="title" v-model="form.title" type="text" maxlength="200" required />
          </div>

          <div class="form-row three">
            <div class="field">
              <label for="type">Type *</label>
              <select id="type" v-model="form.type">
                <option v-for="t in eventTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="field">
              <label for="starts_on">Date de début *</label>
              <input id="starts_on" v-model="form.starts_on" type="date" required />
            </div>
            <div class="field">
              <label for="ends_on">Date de fin</label>
              <input id="ends_on" v-model="form.ends_on" type="date" :min="form.starts_on || undefined" />
              <span class="help">Vide = une seule journée</span>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label for="location">Lieu</label>
              <input id="location" v-model="form.location" type="text" maxlength="200" />
            </div>
            <div class="field">
              <label for="participants">Participants</label>
              <input id="participants" v-model="form.participants" type="text" maxlength="100" placeholder="Ex : 120 participants" />
              <span class="help">Affiché uniquement pour l'événement à la une</span>
            </div>
          </div>

          <div class="field">
            <label for="description">Résumé</label>
            <textarea id="description" v-model="form.description" rows="2" maxlength="500"></textarea>
            <span class="help">Une ou deux phrases, affichées dans la liste des événements</span>
          </div>

          <div class="field">
            <span class="field-label">Article détaillé</span>
            <RichTextEditor v-model="form.details" />
            <span class="help">Rempli : l'événement devient cliquable et ouvre une page article. Les photos sont redimensionnées automatiquement avant l'envoi.</span>
          </div>

          <div class="checks">
            <label><input v-model="form.published" type="checkbox" /> Publié <span class="help">(décoché = brouillon, invisible sur le site)</span></label>
            <label><input v-model="form.is_featured" type="checkbox" /> À la une <span class="help">(le prochain événement coché est mis en avant)</span></label>
          </div>

          <p v-if="saveError" class="error-msg">{{ saveError }}</p>

          <div class="actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
            <router-link to="/admin/evenements" class="btn btn-outline">Annuler</router-link>
          </div>
          <p v-if="updatedAt" class="help">Dernière modification : {{ new Date(updatedAt).toLocaleString('fr-FR') }}</p>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Constants } from '@/lib/database.types'
import RichTextEditor from '@/components/admin/RichTextEditor.vue'
import { adminErrorMessage, emptyEventForm, fetchEventForEdit, saveEvent } from '@/composables/useEventAdmin'

// id absent : création
const props = defineProps<{ id?: number }>()
const router = useRouter()

const eventTypes = Constants.public.Enums.event_type
const isNew = computed(() => props.id === undefined)

const form = ref(emptyEventForm())
const updatedAt = ref<string | null>(null)
const loading = ref(false)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')

async function load() {
  if (props.id === undefined) {
    form.value = emptyEventForm()
    updatedAt.value = null
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const result = await fetchEventForEdit(props.id)
    form.value = result.values
    updatedAt.value = result.updatedAt
  } catch (e) {
    console.error(e)
    loadError.value = adminErrorMessage(e)
  } finally {
    loading.value = false
  }
}
watch(() => props.id, load, { immediate: true })

async function handleSubmit() {
  saveError.value = ''
  if (!form.value.title.trim()) {
    saveError.value = 'Le titre est obligatoire.'
    return
  }
  if (form.value.ends_on && form.value.ends_on < form.value.starts_on) {
    saveError.value = 'La date de fin doit être postérieure ou égale à la date de début.'
    return
  }
  saving.value = true
  try {
    await saveEvent(form.value, props.id)
    await router.push({ path: '/admin/evenements', query: { saved: '1' } })
  } catch (e) {
    console.error(e)
    saveError.value = adminErrorMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-page { padding-top: 5rem; }
.back-link { display: inline-block; margin-bottom: 1.25rem; font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase; color: var(--grey-light); }
.back-link:hover { color: var(--red); }
.overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.5rem; }
h1 { font-family:'Bebas Neue',sans-serif; font-size: 3rem; line-height: 1; margin-bottom: 2rem; }
.state { color: var(--grey-light); padding: 2rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }

.form { display: flex; flex-direction: column; gap: 1.5rem; max-width: 900px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.form-row.three { grid-template-columns: 1fr 1fr 1fr; }
.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label, .field-label { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey); }
.field input, .field select, .field textarea {
  background: var(--dark2); border: 1px solid rgba(255,255,255,0.1);
  color: var(--white); padding: 0.8rem 1rem;
  font-family: 'Barlow',sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.3s;
  color-scheme: dark;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--red); }
.field textarea { resize: vertical; }
.field select option { background: var(--dark2); }
.help { font-size: 0.8rem; color: var(--grey); }
.help code { background: var(--dark2); padding: 0 0.3rem; }

.checks { display: flex; flex-direction: column; gap: 0.6rem; }
.checks label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; }
.checks input { accent-color: var(--red); width: 1.05rem; height: 1.05rem; }
.error-msg { background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.3); padding: 0.85rem 1rem; font-size: 0.9rem; }
.actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.actions .btn:disabled { opacity: 0.6; cursor: wait; }

@media (max-width: 800px) {
  .form-row, .form-row.three { grid-template-columns: 1fr; }
}
</style>
