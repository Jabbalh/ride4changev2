// Métadonnées de page (titre, description, Open Graph, canonique, robots) mises à jour à chaque navigation.
// index.html contient les valeurs par défaut, lues par les robots qui n'exécutent pas le JavaScript
// (aperçus Facebook, WhatsApp…) : les garder cohérentes avec celles-ci.

export const SITE_URL = 'https://ride4change.fr'
export const SITE_NAME = 'Ride 4 Change'
export const DEFAULT_DESCRIPTION =
  "Ride 4 Change, association moto de Saint-Méen-le-Grand (Bretagne) : compétition, initiation et roulages sur piste. Le handicap ne doit pas être une limite à la passion."
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

export type PageMeta = {
  title?: string        // sans le nom du site, ajouté automatiquement
  description?: string
  path?: string         // chemin canonique, ex : '/association'
  image?: string        // URL absolue
  noindex?: boolean
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function setPageMeta(meta: PageMeta) {
  const title = meta.title ? `${meta.title} | ${SITE_NAME}` : `${SITE_NAME} | Association moto et handicap`
  const description = meta.description ?? DEFAULT_DESCRIPTION
  const url = SITE_URL + (meta.path ?? '/')
  const image = meta.image ?? DEFAULT_IMAGE

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow')
  setCanonical(url)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', image)
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)
}

/** Données structurées JSON-LD propres à la page (ex : un événement). null les retire. */
export function setPageJsonLd(data: object | null) {
  const id = 'page-jsonld'
  document.getElementById(id)?.remove()
  if (!data) return
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}
