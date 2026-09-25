// /sitemap.xml : pages fixes du site + pages article des événements publiés, lues dans Supabase.
// Généré à chaque requête (mis en cache 1 h) : un nouvel événement y apparaît sans redéploiement.

const SITE_URL = 'https://ride4change.fr'

// Pages publiques à référencer (la galerie, encore en contenu d'exemple, et l'espace éditeur en sont exclus)
const STATIC_PAGES = ['/', '/association', '/competition', '/initiation-roulage', '/evenements', '/boutique', '/contact']

type EventEntry = { id: number, updated_at: string }

async function fetchEventPages(env: Env): Promise<EventEntry[]> {
  const url = `${env.SUPABASE_URL}/rest/v1/events?select=id,updated_at&published=eq.true&has_details=eq.true&order=starts_on.desc`
  const res = await fetch(url, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY } })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json()
}

function urlEntry(path: string, lastmod?: string): string {
  const date = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `<url><loc>${SITE_URL}${path}</loc>${date}</url>`
}

export async function handleSitemap(env: Env): Promise<Response> {
  let events: EventEntry[] = []
  try {
    events = await fetchEventPages(env)
  } catch (e) {
    // Supabase indisponible : on sert quand même les pages fixes, avec un cache court
    console.error('Sitemap : événements indisponibles', e)
  }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + [...STATIC_PAGES.map(p => urlEntry(p)), ...events.map(e => urlEntry(`/evenements/${e.id}`, e.updated_at))].join('\n')
    + '\n</urlset>\n'
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${events.length ? 3600 : 300}`,
    },
  })
}
