import { ref } from 'vue'
import { restSelect } from '@/lib/publicApi'
import type { Tables } from '@/lib/database.types'

// Dates clés de la page « L'Association » (table milestones).
// Lecture publique ; écriture réservée aux éditeurs (voir useMilestoneAdmin.ts).

export type Milestone = Pick<Tables<'milestones'>, 'id' | 'year' | 'description'>

export const MILESTONE_COLUMNS = 'id, year, description'

/** Récupère les dates clés dans l'ordre choisi par les éditeurs (colonne position). */
export async function fetchMilestones(): Promise<Milestone[]> {
  // Lecture publique en fetch direct (pas de supabase-js sur la page publique)
  return restSelect<Milestone>('milestones', { select: MILESTONE_COLUMNS, order: 'position.asc,id.asc' })
}

/** Liste pour la page publique. */
export function useMilestones() {
  const milestones = ref<Milestone[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      milestones.value = await fetchMilestones()
    } catch (e) {
      console.error('Chargement des dates clés impossible', e)
      error.value = 'Impossible de charger les dates clés pour le moment.'
    } finally {
      loading.value = false
    }
  }

  load()

  return { milestones, loading, error, reload: load }
}
