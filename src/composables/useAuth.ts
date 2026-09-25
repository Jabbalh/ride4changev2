import { computed, ref } from 'vue'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// État partagé par tout le site (un seul utilisateur connecté à la fois)
const session = ref<Session | null>(null)
const isEditor = ref(false)
let ready: Promise<void> | null = null
let clientPromise: Promise<SupabaseClient<Database> | null> | null = null

// Clé sous laquelle supabase-js enregistre la session (valeur par défaut : sb-<projet>-auth-token)
const SESSION_KEY = (() => {
  const url = import.meta.env.VITE_SUPABASE_URL
  try { return url ? `sb-${new URL(url).hostname.split('.')[0]}-auth-token` : null } catch { return null }
})()

function hasStoredSession(): boolean {
  try { return !!SESSION_KEY && !!localStorage.getItem(SESSION_KEY) } catch { return false }
}

/**
 * supabase-js (environ 87 Ko compressés) n'est chargé qu'à la demande : pour l'espace éditeur,
 * ou si une session éditeur existe déjà. Un visiteur ne le télécharge jamais.
 */
function client(): Promise<SupabaseClient<Database> | null> {
  clientPromise ??= import('@/lib/supabase').then(({ supabase }) => {
    supabase?.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      // Pas d'appel Supabase directement dans ce callback (risque de blocage signalé par supabase-js)
      setTimeout(refreshEditor, 0)
    })
    return supabase
  })
  return clientPromise
}

// Les droits réels sont vérifiés par RLS côté base ; ceci ne sert qu'à adapter l'interface.
async function refreshEditor() {
  const supabase = session.value ? await client() : null
  if (!supabase || !session.value) {
    isEditor.value = false
    return
  }
  const { data, error } = await supabase.rpc('is_editor')
  isEditor.value = !error && data === true
}

/** Charge la session éventuelle (localStorage) une seule fois. Sans session enregistrée, ni téléchargement ni appel réseau. */
function init(): Promise<void> {
  ready ??= (async () => {
    if (!hasStoredSession()) return
    const supabase = await client()
    if (!supabase) return
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    await refreshEditor()
  })().catch(e => {
    // Échec (réseau…) : considéré comme non connecté, et nouvel essai à la prochaine navigation
    console.error('Chargement de la session impossible', e)
    ready = null
  })
  return ready
}

/** Renvoie true si le compte est éditeur. Lève une erreur si les identifiants sont invalides. */
async function signIn(email: string, password: string): Promise<boolean> {
  const supabase = await client()
  if (!supabase) throw new Error('Supabase non configuré')
  await init()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  session.value = data.session
  await refreshEditor()
  return isEditor.value
}

async function signOut() {
  if (clientPromise) await (await clientPromise)?.auth.signOut()
  session.value = null
  isEditor.value = false
}

export function useAuth() {
  return {
    session,
    isEditor,
    email: computed(() => session.value?.user.email ?? null),
    init,
    signIn,
    signOut,
  }
}
