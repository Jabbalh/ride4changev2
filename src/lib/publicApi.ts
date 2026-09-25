// Lectures publiques de Supabase (API REST PostgREST) avec un simple fetch.
// Les pages publiques n'ont ainsi pas besoin de supabase-js (environ 87 Ko compressés), qui n'est chargé
// que pour l'espace éditeur (voir useAuth.ts). Mêmes droits qu'avant : clé publishable + RLS.

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export class PublicApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
  }
}

/**
 * GET /rest/v1/<table>?<query>. `query` suit la syntaxe PostgREST, par exemple
 * { select: 'id, title', published: 'eq.true', order: 'starts_on.asc' }.
 */
export async function restSelect<T>(table: string, query: Record<string, string>): Promise<T[]> {
  if (!url || !key) throw new PublicApiError('Supabase non configuré')
  // Comme supabase-js : pas d'espaces dans la liste des colonnes
  const params = { ...query, ...(query.select && { select: query.select.replace(/\s/g, '') }) }
  const res = await fetch(`${url}/rest/v1/${table}?${new URLSearchParams(params)}`, {
    headers: { apikey: key, Accept: 'application/json' },
  })
  if (!res.ok) throw new PublicApiError(`Supabase ${res.status}`, res.status)
  return res.json()
}

/** Première ligne du résultat, ou null. */
export async function restSelectOne<T>(table: string, query: Record<string, string>): Promise<T | null> {
  const rows = await restSelect<T>(table, { ...query, limit: '1' })
  return rows[0] ?? null
}
