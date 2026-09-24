-- Images des articles d'événements, stockées dans Supabase Storage.
-- À exécuter dans Supabase : SQL Editor → coller ce fichier → Run.
-- Prérequis : 20260925090000_events_editors.sql (fonction public.is_editor()).

-- Bucket public en lecture : les images sont affichées sur le site via leur URL publique.
-- Taille et formats limités par Supabase lui-même (le site redimensionne déjà les photos avant l'envoi).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-images',
  'event-images',
  true,
  5 * 1024 * 1024,  -- 5 Mo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Seuls les éditeurs peuvent déposer des images.
-- Pas de modification ni de suppression depuis le site (gestion des fichiers : Storage dans le dashboard).
create policy "Éditeurs : envoi d'images d'événements"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-images' and (select public.is_editor()));
