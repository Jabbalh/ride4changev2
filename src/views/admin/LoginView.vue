<template>
  <div class="admin-page">
    <section class="section">
      <div class="container narrow">
        <span class="overline">Espace éditeur</span>
        <h1>CONNEXION</h1>

        <div v-if="isEditor" class="notice">
          <p>Vous êtes connecté en tant que <strong>{{ email }}</strong>.</p>
          <div class="actions">
            <router-link :to="redirectTo" class="btn btn-primary">Continuer</router-link>
            <button class="btn btn-outline" @click="signOut">Se déconnecter</button>
          </div>
        </div>

        <form v-else class="form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" v-model="emailInput" type="email" autocomplete="username" required />
          </div>
          <div class="field">
            <label for="password">Mot de passe</label>
            <input id="password" v-model="password" type="password" autocomplete="current-password" required />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <button type="submit" class="btn btn-primary" :disabled="sending">
            {{ sending ? 'Connexion…' : 'Se connecter' }}
          </button>
          <p class="hint">Les comptes éditeurs sont créés par l'administrateur du site.</p>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { isEditor, email, init, signIn, signOut } = useAuth()
init()

// Retour vers la page demandée avant la connexion (chemins internes uniquement)
const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/admin/evenements'
})

const emailInput = ref('')
const password = ref('')
const sending = ref(false)
const error = ref('')

async function handleSubmit() {
  sending.value = true
  error.value = ''
  try {
    const editor = await signIn(emailInput.value.trim(), password.value)
    if (!editor) {
      await signOut()
      error.value = "Ce compte n'a pas les droits d'édition."
      return
    }
    await router.replace(redirectTo.value)
  } catch (e) {
    const code = (e as { code?: string })?.code
    error.value = code === 'invalid_credentials'
      ? 'Email ou mot de passe incorrect.'
      : 'Connexion impossible pour le moment. Réessayez plus tard.'
  } finally {
    password.value = ''
    sending.value = false
  }
}
</script>

<style scoped>
.admin-page { padding-top: 5rem; }
.narrow { max-width: 460px; }
.overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.5rem; }
h1 { font-family:'Bebas Neue',sans-serif; font-size: 3rem; line-height: 1; margin-bottom: 2rem; }
.form { display: flex; flex-direction: column; gap: 1.25rem; align-items: stretch; }
.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey); }
.field input {
  background: var(--dark2); border: 1px solid rgba(255,255,255,0.1);
  color: var(--white); padding: 0.85rem 1rem;
  font-family: 'Barlow',sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.3s;
}
.field input:focus { border-color: var(--red); }
.form .btn { align-self: flex-start; }
.form .btn:disabled { opacity: 0.6; cursor: wait; }
.error-msg { background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.3); padding: 0.85rem 1rem; font-size: 0.9rem; }
.hint { font-size: 0.85rem; color: var(--grey); }
.notice { background: var(--dark); border-left: 3px solid var(--red); padding: 1.5rem; }
.notice p { margin-bottom: 1.25rem; color: var(--grey-light); }
.actions { display: flex; gap: 1rem; flex-wrap: wrap; }
</style>
