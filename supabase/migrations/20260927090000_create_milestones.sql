-- Dates clés de la page « L'Association » (année + description).
-- À exécuter dans Supabase : SQL Editor → coller ce fichier → Run.
-- Prérequis : 20260924120000_create_events.sql (set_updated_at) et 20260925090000_events_editors.sql (is_editor).

create table public.milestones (
  id          bigint generated always as identity primary key,
  year        smallint not null check (year between 1900 and 2100),
  description text not null check (char_length(btrim(description)) between 1 and 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.milestones is 'Dates clés affichées sur la page L''Association (année la plus récente en premier).';

-- Affichage : année décroissante, puis ordre de saisie
create index milestones_order_idx on public.milestones (year desc, id);

create trigger milestones_set_updated_at
before update on public.milestones
for each row execute function public.set_updated_at();

-- Reprise des dates affichées jusqu'ici sur le site (dans l'ordre d'affichage)
insert into public.milestones (year, description) values
  (2026, 'Début des initiations pistes sur le mythique circuit Bugatti au Mans'),
  (2026, 'Engagés à la Bridgestone PMR Cup'),
  (2026, 'L''équipe devient une famille avec plus de 10 membres actifs'),
  (2025, 'Engagement sportif à la Bridgestone PMR Cup avec une quatrième place au championnat en catégorie 1000 cm3'),
  (2025, 'Création de l''association par 4 membres fondateurs');

-- Sécurité : lecture publique de toutes les dates (pas de brouillon), écriture réservée aux éditeurs.
-- Contrairement aux événements, la suppression est permise depuis le site.
alter table public.milestones enable row level security;

revoke all on public.milestones from anon, authenticated;
grant select on public.milestones to anon, authenticated;
grant insert (year, description), update (year, description), delete on public.milestones to authenticated;

create policy "Lecture publique des dates clés"
on public.milestones for select
to anon, authenticated
using (true);

create policy "Éditeurs : création des dates clés"
on public.milestones for insert
to authenticated
with check ((select public.is_editor()));

create policy "Éditeurs : modification des dates clés"
on public.milestones for update
to authenticated
using ((select public.is_editor()))
with check ((select public.is_editor()));

create policy "Éditeurs : suppression des dates clés"
on public.milestones for delete
to authenticated
using ((select public.is_editor()));
