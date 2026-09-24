import { supabase } from '@/lib/supabase'

// Bucket créé par supabase/migrations/20260926090000_event_images_storage.sql (envoi réservé aux éditeurs)
const BUCKET = 'event-images'
const MAX_DIMENSION = 1600 // px, côté le plus long
const RESIZE_ABOVE_BYTES = 1024 * 1024
// Limite du bucket (file_size_limit dans la migration) : vérifiée ici pour un message immédiat,
// et appliquée de toute façon par Supabase (seule vraie protection).
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
// Au-delà, on refuse avant même de décoder l'image (évite de saturer la mémoire du navigateur)
const MAX_SOURCE_BYTES = 25 * 1024 * 1024

/** Erreur à afficher telle quelle à l'utilisateur. */
export class ImageUploadError extends Error {}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`

/** Réduit les photos trop grandes avant l'envoi (les GIF sont conservés pour ne pas casser les animations). */
async function prepareImage(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size <= RESIZE_ABOVE_BYTES) {
    bitmap.close()
    return file
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  // PNG conservé (transparence possible) ; photos en JPEG
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Conversion impossible'))), type, 0.85))
}

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Refus de Supabase pour dépassement de file_size_limit (HTTP 413, ou statusCode "413" dans la réponse). */
function isTooLargeError(error: unknown): boolean {
  const e = error as { status?: number, statusCode?: string | number, message?: string }
  return e.status === 413 || String(e.statusCode) === '413' || /maximum allowed size|too large/i.test(e.message ?? '')
}

/** Envoie l'image dans Supabase Storage et renvoie son URL publique. */
export async function uploadEventImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase non configuré')
  if (!EXTENSIONS[file.type]) throw new ImageUploadError('Format non pris en charge (JPEG, PNG, WebP ou GIF).')
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ImageUploadError(`Fichier trop lourd (${mb(file.size)}). Maximum ${mb(MAX_SOURCE_BYTES)} avant réduction.`)
  }

  let blob: Blob
  try {
    blob = await prepareImage(file)
  } catch {
    throw new ImageUploadError("Impossible de lire cette image. Essayez de l'enregistrer en JPEG ou PNG.")
  }
  // Après réduction (les GIF ne sont pas réduits, pour garder l'animation)
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new ImageUploadError(file.type === 'image/gif'
      ? `GIF trop lourd (${mb(blob.size)}, maximum ${mb(MAX_UPLOAD_BYTES)}). Les GIF ne sont pas réduits automatiquement.`
      : `Image trop lourde même après réduction (${mb(blob.size)}, maximum ${mb(MAX_UPLOAD_BYTES)}).`)
  }

  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${EXTENSIONS[blob.type] ?? 'jpg'}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false })
  if (error) {
    if (isTooLargeError(error)) throw new ImageUploadError(`Image refusée par le serveur : ${mb(MAX_UPLOAD_BYTES)} maximum.`)
    throw error
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
