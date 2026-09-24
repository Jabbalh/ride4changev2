import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Contenu riche des articles (colonne `details`) :
// - HTML produit par l'éditeur visuel de l'espace éditeur (RichTextEditor) ;
// - ou Markdown (articles saisis à la main dans le dashboard Supabase).
// Dans les deux cas, le résultat passe par DOMPurify avant tout v-html.

// Images autorisées : fichiers du site (public/) ou Supabase Storage.
// Toute autre URL est retirée : pas de ressource tierce (RGPD, voir README).
const storagePrefix = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/`
  : null

function isAllowedImage(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true
  return storagePrefix !== null && src.startsWith(storagePrefix)
}

// Styles en ligne autorisés : ceux que produit l'éditeur (couleur du texte, alignement).
// Le reste (tailles, polices, fonds collés depuis Word…) est retiré pour garder la charte du site.
const ALLOWED_STYLES = new Set(['color', 'text-align'])
const SAFE_STYLE_VALUE = /^[#a-z0-9(),.%\s-]+$/i

function filterStyle(style: string): string {
  return style
    .split(';')
    .map(declaration => declaration.split(':').map(part => part.trim()))
    .filter(([prop, value]) => prop && value && ALLOWED_STYLES.has(prop.toLowerCase()) && SAFE_STYLE_VALUE.test(value))
    .map(([prop, value]) => `${prop!.toLowerCase()}: ${value}`)
    .join('; ')
}

DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName !== 'style') return
  data.attrValue = filterStyle(data.attrValue)
  if (!data.attrValue) data.keepAttr = false
})

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') ?? ''
    if (/^https?:\/\//.test(href) && !href.startsWith(location.origin)) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  }
  if (node.tagName === 'IMG') {
    if (!isAllowedImage(node.getAttribute('src') ?? '')) {
      node.remove()
      return
    }
    node.setAttribute('loading', 'lazy')
  }
})

/** Convertit le contenu d'un article (HTML de l'éditeur ou Markdown) en HTML sûr. */
export function renderRichText(content: string): string {
  // L'éditeur produit du HTML qui commence toujours par une balise ; sinon, c'est du Markdown
  const html = /^\s*</.test(content)
    ? content
    // breaks : un simple retour à la ligne dans l'éditeur Supabase donne un retour à la ligne à l'écran
    : marked.parse(content, { async: false, gfm: true, breaks: true })
  return DOMPurify.sanitize(html)
}
