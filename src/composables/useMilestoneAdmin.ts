import { supabase } from '@/lib/supabase'
import { MILESTONE_COLUMNS, type Milestone } from '@/composables/useMilestones'

// Écriture des dates clés, réservée aux éditeurs par RLS (supabase/migrations/…_create_milestones.sql).
// .select().single() après chaque écriture : un refus RLS (0 ligne touchée) lève une erreur au lieu d'un faux succès.

export const MIN_YEAR = 1900
export const MAX_YEAR = 2100
export const MAX_DESCRIPTION = 500

function client() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

/** Message d'erreur de validation, ou null si les valeurs sont correctes (mêmes règles que la base). */
export function validateMilestone(year: number | string, description: string): string | null {
  const y = Number(year)
  if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR) return `L'année doit être comprise entre ${MIN_YEAR} et ${MAX_YEAR}.`
  const d = description.trim()
  if (!d) return 'La description est obligatoire.'
  if (d.length > MAX_DESCRIPTION) return `La description ne doit pas dépasser ${MAX_DESCRIPTION} caractères.`
  return null
}

export function milestoneErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code
  if (code === '42501' || code === 'PGRST116') return "Vous n'avez pas les droits pour cette action. Reconnectez-vous avec un compte éditeur."
  if (code === '23514') return 'Valeurs refusées : vérifiez l\'année et la description.'
  return "L'opération a échoué. Réessayez dans un instant."
}

export async function createMilestone(year: number, description: string): Promise<Milestone> {
  const { data, error } = await client()
    .from('milestones')
    .insert({ year, description: description.trim() })
    .select(MILESTONE_COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function updateMilestone(id: number, year: number, description: string): Promise<Milestone> {
  const { data, error } = await client()
    .from('milestones')
    .update({ year, description: description.trim() })
    .eq('id', id)
    .select(MILESTONE_COLUMNS)
    .single()
  if (error) throw error
  return data
}

/**
 * Enregistre l'ordre complet (ids du premier au dernier) en une seule opération côté base.
 * Pour un non-éditeur, RLS ne modifie aucune ligne sans lever d'erreur : on compare donc le nombre de lignes modifiées.
 */
export async function reorderMilestones(ids: number[]): Promise<void> {
  const { data, error } = await client().rpc('reorder_milestones', { ids })
  if (error) throw error
  if (data !== ids.length) throw Object.assign(new Error('Réordonnancement refusé'), { code: '42501' })
}

export async function deleteMilestone(id: number): Promise<void> {
  const { error } = await client()
    .from('milestones')
    .delete()
    .eq('id', id)
    .select('id')
    .single()
  if (error) throw error
}
