import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  console.error('Supabase non configuré : VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY manquants (voir .env.example).')
}

// null si non configuré (ex : build GitHub Pages) : les vues affichent alors un message d'erreur.
// Clé publique : les droits réels sont définis par les règles RLS dans supabase/migrations/.
// Session persistée (localStorage) uniquement pour les éditeurs connectés : un visiteur n'a aucune session.
// detectSessionInUrl désactivé : connexion par mot de passe uniquement (ni magic link ni OAuth, qui passent des jetons dans l'URL).
export const supabase = url && key
  ? createClient<Database>(url, key, { auth: { detectSessionInUrl: false } })
  : null
