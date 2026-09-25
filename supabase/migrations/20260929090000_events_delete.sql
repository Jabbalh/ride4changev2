-- Suppression des événements depuis l'espace éditeur (même modèle que milestones).
-- Réservée aux éditeurs ; les visiteurs et les comptes non éditeurs ne peuvent toujours rien supprimer.
-- Les images de l'article restent dans le bucket event-images (pas de suppression depuis le site).

grant delete on public.events to authenticated;

create policy "Éditeurs : suppression"
on public.events for delete
to authenticated
using ((select public.is_editor()));
