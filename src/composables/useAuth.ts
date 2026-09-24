import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// État partagé par tout le site (un seul utilisateur connecté à la fois)
const session = ref<Session | null>(null)
const isEditor = ref(false)
let ready: Promise<void> | null = null

// Les droits réels sont vérifiés par RLS côté base ; ceci ne sert qu'à adapter l'interface.
async function refreshEditor() {
  if (!supabase || !session.value) {
    isEditor.value = false
    return
  }
  const { data, error } = await supabase.rpc('is_editor')
  isEditor.value = !error && data === true
}

/** Charge la session éventuelle (localStorage) une seule fois. Sans session, aucun appel réseau. */
function init(): Promise<void> {
  ready ??= (async () => {
    if (!supabase) return
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    await refreshEditor()
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      // Pas d'appel Supabase directement dans ce callback (risque de blocage signalé par supabase-js)
      setTimeout(refreshEditor, 0)
    })
  })()
  return ready
}

/** Renvoie true si le compte est éditeur. Lève une erreur si les identifiants sont invalides. */
async function signIn(email: string, password: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase non configuré')
  await init()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  session.value = data.session
  await refreshEditor()
  return isEditor.value
}

async function signOut() {
  await supabase?.auth.signOut()
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
