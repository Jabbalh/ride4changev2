import { handleContact } from './contact'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return Response.json({ error: 'Méthode non autorisée' }, { status: 405, headers: { Allow: 'POST' } })
      }
      return handleContact(request, env)
    }

    return Response.json({ error: 'Not found' }, { status: 404 })
  },
} satisfies ExportedHandler<Env>
