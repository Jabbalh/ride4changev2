import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  console.error('Supabase non configuré : VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY manquants (voir .env.example).')
}

// null si non configuré (ex : build GitHub Pages) : les vues affichent alors un message d'erreur.
// Clé publique : les droits réels sont définis par les règles RLS dans supabase/migrations/.
export const supabase = url && key
  ? createClient<Database>(url, key, { auth: { persistSession: false } })
  : null
