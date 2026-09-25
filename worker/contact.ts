const OBJETS = ['', 'adhesion', 'info', 'initiation', 'boutique', 'evenement', 'presse', 'autre'] as const

export interface ContactMessage {
  prenom: string
  nom: string
  email: string
  objet: (typeof OBJETS)[number]
  moto: string
  message: string
}

// Longueurs maximales : garder identiques aux maxlength du formulaire (src/views/ContactView.vue)
const MAX_LENGTHS = { prenom: 100, nom: 100, email: 254, moto: 200, message: 5000 }
// Noms affichés dans les messages d'erreur
const LABELS: Record<keyof typeof MAX_LENGTHS, string> = { prenom: 'Prénom', nom: 'Nom', email: 'Email', moto: 'Votre moto', message: 'Message' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function field(body: Record<string, unknown>, name: string): string {
  const value = body[name]
  return typeof value === 'string' ? value.trim() : ''
}

function validate(body: Record<string, unknown>): ContactMessage | string {
  const msg = {
    prenom: field(body, 'prenom'),
    nom: field(body, 'nom'),
    email: field(body, 'email'),
    objet: field(body, 'objet'),
    moto: field(body, 'moto'),
    message: field(body, 'message'),
  }

  if (!msg.prenom || !msg.nom || !msg.email || !msg.message) return 'Merci de remplir tous les champs obligatoires.'
  if (!EMAIL_RE.test(msg.email)) return 'Adresse email invalide.'
  if (!OBJETS.includes(msg.objet as ContactMessage['objet'])) return 'Objet invalide.'
  for (const [name, max] of Object.entries(MAX_LENGTHS)) {
    if (msg[name as keyof typeof MAX_LENGTHS].length > max) return `Le champ « ${LABELS[name as keyof typeof MAX_LENGTHS]} » est trop long (${max} caractères maximum).`
  }

  return msg as ContactMessage
}

export async function handleContact(request: Request, _env: Env): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // Champ piège invisible pour les humains : s'il est rempli, c'est un robot.
  // On répond "ok" pour ne pas lui donner d'indice.
  if (field(body as Record<string, unknown>, 'website')) {
    return Response.json({ ok: true })
  }

  const result = validate(body as Record<string, unknown>)
  if (typeof result === 'string') {
    return Response.json({ error: result }, { status: 400 })
  }

  // TODO : envoyer le message (mail via Resend, enregistrement en base D1…).
  // Pour l'instant il est seulement visible dans les logs du worker (dashboard Cloudflare → Logs).
  console.log('Nouveau message de contact', result)

  return Response.json({ ok: true })
}
