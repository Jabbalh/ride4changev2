import { computed, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import { restSelect, restSelectOne } from '@/lib/publicApi'
import type { Tables } from '@/lib/database.types'

// Colonnes chargées pour la liste : tout sauf `details` (article Markdown, potentiellement long).
// `has_details` indique si l'événement a une page article.
const LIST_COLUMNS = 'id, title, type, starts_on, ends_on, location, description, participants, is_featured, has_details'
// Page article : les mêmes colonnes + le contenu Markdown
const DETAIL_COLUMNS = `${LIST_COLUMNS}, details`

export type EventRow = Pick<Tables<'events'>,
  'id' | 'title' | 'type' | 'starts_on' | 'ends_on' | 'location' | 'description' | 'participants' | 'is_featured' | 'has_details'>
export type EventDetailRow = EventRow & Pick<Tables<'events'>, 'details'>

export type CalendarEvent<T extends EventRow = EventRow> = T & {
  past: boolean
  month: string   // « Juin »
  day: string     // « 14 »
  year: string    // « 2026 »
  dateLabel: string // « 14-15 juin 2026 »
}

// Nombre d'événements passés affichés sous les événements à venir
const PAST_LIMIT = 6

// Les colonnes `date` arrivent en 'YYYY-MM-DD' : on les lit en heure locale (new Date('2026-06-14') serait en UTC).
function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

function today(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// Date locale au format des colonnes `date` ('YYYY-MM-DD'), pour filtrer côté base
function toIsoDate(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((n, i) => String(n).padStart(i ? 2 : 4, '0'))
    .join('-')
}

const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
const dayMonthYear = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function formatRange(start: Date, end: Date | null): string {
  if (!end || end.getTime() === start.getTime()) return dayMonthYear.format(start)
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${dayMonthYear.format(end)}`
  }
  return `${dayMonthYear.format(start)} au ${dayMonthYear.format(end)}`
}

function toCalendarEvent<T extends EventRow>(row: T, now: Date): CalendarEvent<T> {
  const start = parseDate(row.starts_on)
  const end = row.ends_on ? parseDate(row.ends_on) : null
  const month = monthShort.format(start).replace('.', '')
  return {
    ...row,
    past: (end ?? start) < now,
    month: month.charAt(0).toUpperCase() + month.slice(1),
    day: String(start.getDate()).padStart(2, '0'),
    year: String(start.getFullYear()),
    dateLabel: formatRange(start, end),
  }
}

/** Liste des événements publiés (page /evenements). */
export function useEvents() {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const upcoming = computed(() => events.value.filter(e => !e.past))
  const past = computed(() => events.value.filter(e => e.past).reverse().slice(0, PAST_LIMIT))
  // Événement à la une : le prochain événement marqué is_featured
  const featured = computed(() => upcoming.value.find(e => e.is_featured) ?? null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const data = await restSelect<EventRow>('events', {
        select: LIST_COLUMNS,
        // Filtre explicite (requête anonyme, mais on ne dépend pas de RLS pour masquer les brouillons)
        published: 'eq.true',
        order: 'starts_on.asc',
      })
      const now = today()
      events.value = data.map(row => toCalendarEvent(row, now))
    } catch (e) {
      console.error('Chargement des événements impossible', e)
      error.value = 'Impossible de charger les événements pour le moment.'
    } finally {
      loading.value = false
    }
  }

  load()

  return { upcoming, past, featured, loading, error, reload: load }
}

/**
 * Prochain événement publié, à venir ou en cours (page d'accueil).
 * `event` vaut null s'il n'y en a pas, ou si le chargement échoue : l'accueil n'affiche alors rien.
 */
export function useNextEvent() {
  const event = ref<CalendarEvent | null>(null)

  async function load() {
    try {
      const now = today()
      const iso = toIsoDate(now)
      const data = await restSelectOne<EventRow>('events', {
        select: LIST_COLUMNS,
        published: 'eq.true',
        // Pas encore terminé : commence aujourd'hui ou plus tard, ou se termine aujourd'hui ou plus tard
        or: `(starts_on.gte.${iso},ends_on.gte.${iso})`,
        order: 'starts_on.asc',
      })
      event.value = data ? toCalendarEvent(data, now) : null
    } catch (e) {
      console.error('Chargement du prochain événement impossible', e)
      event.value = null
    }
  }

  load()

  return { event }
}

/** Un événement avec son article (page /evenements/:id). `event` vaut null s'il n'existe pas ou n'est pas publié. */
export function useEvent(id: MaybeRefOrGetter<number>) {
  const event = ref<CalendarEvent<EventDetailRow> | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    event.value = null
    try {
      const eventId = toValue(id)
      if (!Number.isInteger(eventId)) return
      const data = await restSelectOne<EventDetailRow>('events', {
        select: DETAIL_COLUMNS,
        id: `eq.${eventId}`,
        published: 'eq.true',
      })
      event.value = data ? toCalendarEvent(data, today()) : null
    } catch (e) {
      console.error('Chargement de l\'événement impossible', e)
      error.value = 'Impossible de charger cet événement pour le moment.'
    } finally {
      loading.value = false
    }
  }

  // Recharge si on passe d'un article à un autre (même composant réutilisé par le router)
  watch(() => toValue(id), load, { immediate: true })

  return { event, loading, error, reload: load }
}
