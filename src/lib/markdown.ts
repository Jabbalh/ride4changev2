import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Images autorisées dans les articles : fichiers du site (public/) ou Supabase Storage.
// Toute autre URL est retirée : pas de ressource tierce (RGPD, voir README).
const storagePrefix = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/`
  : null

function isAllowedImage(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true
  return storagePrefix !== null && src.startsWith(storagePrefix)
}

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

/** Convertit le Markdown saisi dans Supabase en HTML sûr (balises dangereuses et scripts retirés). */
export function renderMarkdown(markdown: string): string {
  // breaks : un simple retour à la ligne dans l'éditeur Supabase donne un retour à la ligne à l'écran
  const html = marked.parse(markdown, { async: false, gfm: true, breaks: true })
  return DOMPurify.sanitize(html)
}
