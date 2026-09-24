import { supabase } from '@/lib/supabase'

// Bucket créé par supabase/migrations/20260926090000_event_images_storage.sql (envoi réservé aux éditeurs)
const BUCKET = 'event-images'
const MAX_DIMENSION = 1600 // px, côté le plus long
const RESIZE_ABOVE_BYTES = 1024 * 1024

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

/** Envoie l'image dans Supabase Storage et renvoie son URL publique. */
export async function uploadEventImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase non configuré')
  if (!EXTENSIONS[file.type]) throw new Error('Format non pris en charge (JPEG, PNG, WebP ou GIF).')
  const blob = await prepareImage(file)
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${EXTENSIONS[blob.type] ?? 'jpg'}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
