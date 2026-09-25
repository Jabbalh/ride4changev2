import { handleContact } from './contact'
import { handleSitemap } from './sitemap'

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  if (url.pathname === '/sitemap.xml') return handleSitemap(env)

  if (url.pathname === '/api/contact') {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Méthode non autorisée' }, { status: 405, headers: { Allow: 'POST' } })
    }
    return handleContact(request, env)
  }

  return Response.json({ error: 'Not found' }, { status: 404 })
}

export default {
  async fetch(request, env) {
    const response = await route(request, env)
    // public/_headers ne s'applique qu'aux fichiers statiques : en-têtes de sécurité des réponses du worker
    const headers = new Headers(response.headers)
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  },
} satisfies ExportedHandler<Env>
