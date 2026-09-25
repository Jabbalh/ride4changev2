import { supabase } from '@/lib/supabase'
import type { Database, Tables } from '@/lib/database.types'

// Accès éditeur à la table events. Les droits sont vérifiés par RLS (supabase/migrations/…_events_editors.sql) :
// ces fonctions échouent proprement pour un utilisateur qui n'est pas éditeur.

const ADMIN_LIST_COLUMNS = 'id, title, type, starts_on, ends_on, is_featured, published, has_details, updated_at'
const EDIT_COLUMNS = 'id, title, type, starts_on, ends_on, location, description, details, participants, is_featured, published, updated_at'

export type AdminEventRow = Pick<Tables<'events'>,
  'id' | 'title' | 'type' | 'starts_on' | 'ends_on' | 'is_featured' | 'published' | 'has_details' | 'updated_at'>

type EventType = Database['public']['Enums']['event_type']

/** Valeurs du formulaire : chaînes vides pour les champs non remplis (converties en null à l'enregistrement). */
export type EventFormValues = {
  title: string
  type: EventType
  starts_on: string
  ends_on: string
  location: string
  description: string
  details: string
  participants: string
  is_featured: boolean
  published: boolean
}

export function emptyEventForm(): EventFormValues {
  return {
    title: '', type: 'Sortie', starts_on: '', ends_on: '', location: '', description: '',
    details: '', participants: '', is_featured: false, published: true,
  }
}

function client() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

/** Message lisible pour les erreurs Supabase / Postgres les plus courantes. */
export function adminErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code
  if (code === '42501') return "Vous n'avez pas les droits pour cette action. Reconnectez-vous avec un compte éditeur."
  if (code === '23514') return 'La date de fin doit être postérieure ou égale à la date de début.'
  if (code === 'PGRST116') return "Cet événement n'existe pas."
  return "L'opération a échoué. Réessayez dans un instant."
}

/** Tous les événements, brouillons compris, du plus récent au plus ancien. */
export async function fetchAllEvents(): Promise<AdminEventRow[]> {
  const { data, error } = await client()
    .from('events')
    .select(ADMIN_LIST_COLUMNS)
    .order('starts_on', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchEventForEdit(id: number): Promise<{ values: EventFormValues, updatedAt: string }> {
  const { data, error } = await client()
    .from('events')
    .select(EDIT_COLUMNS)
    .eq('id', id)
    .single()
  if (error) throw error
  return {
    values: {
      title: data.title,
      type: data.type,
      starts_on: data.starts_on,
      ends_on: data.ends_on ?? '',
      location: data.location ?? '',
      description: data.description ?? '',
      details: data.details ?? '',
      participants: data.participants ?? '',
      is_featured: data.is_featured,
      published: data.published,
    },
    updatedAt: data.updated_at,
  }
}

/** Supprime l'événement. Les images de son article restent dans le bucket. */
export async function deleteEvent(id: number): Promise<void> {
  const { error } = await client()
    .from('events')
    .delete()
    .eq('id', id)
    // .single() : une suppression refusée par RLS ne touche aucune ligne, ce qui lève ici une erreur au lieu d'un faux succès
    .select('id')
    .single()
  // Aucune ligne supprimée : l'événement était affiché dans la liste, c'est donc un refus de droits
  if (error?.code === 'PGRST116') throw Object.assign(new Error('Suppression refusée'), { code: '42501' })
  if (error) throw error
}

/** Crée (id absent) ou met à jour l'événement. Renvoie son id. */
export async function saveEvent(values: EventFormValues, id?: number): Promise<number> {
  const optional = (v: string) => (v.trim() === '' ? null : v.trim())
  const row = {
    title: values.title.trim(),
    type: values.type,
    starts_on: values.starts_on,
    ends_on: values.ends_on || null,
    location: optional(values.location),
    description: optional(values.description),
    details: optional(values.details),
    participants: optional(values.participants),
    is_featured: values.is_featured,
    published: values.published,
  }
  const query = id === undefined
    ? client().from('events').insert(row)
    : client().from('events').update(row).eq('id', id)
  // .single() : une mise à jour refusée par RLS ne touche aucune ligne, ce qui lève ici une erreur au lieu d'un faux succès
  const { data, error } = await query.select('id').single()
  if (error) throw error
  return data.id
}
