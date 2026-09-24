-- Calendrier des événements affiché sur la page /evenements.
-- À exécuter dans Supabase : SQL Editor → coller ce fichier → Run.

-- Types d'événements : liste déroulante dans le Table Editor.
-- Pour en ajouter un : alter type public.event_type add value 'Nouveau type';
create type public.event_type as enum (
  'Sortie',
  'Roulage',
  'Initiation',
  'Formation',
  'Compétition',
  'Rassemblement',
  'Rallye',
  'Solidarité',
  'Atelier',
  'AG'
);

create table public.events (
  id           bigint generated always as identity primary key,
  title        text not null,
  type         public.event_type not null default 'Sortie',
  starts_on    date not null,
  ends_on      date,                            -- vide = événement sur une journée
  location     text,
  description  text,                            -- résumé court, affiché dans la liste
  details      text,                            -- article détaillé en Markdown (page /evenements/:id)
  -- Calculé : vrai si details contient au moins un caractère visible (espaces et retours à la ligne seuls = vide).
  -- Non vide = événement cliquable.
  has_details  boolean generated always as (coalesce(details, '') ~ '\S') stored,
  participants text,                            -- ex : « 120 participants » (affiché sur l'événement à la une)
  is_featured  boolean not null default false,  -- mis en avant en haut de la page
  published    boolean not null default true,   -- décocher pour masquer sans supprimer
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint events_dates_check check (ends_on is null or ends_on >= starts_on)
);

comment on table public.events is 'Calendrier affiché sur la page Événements du site.';

create index events_starts_on_idx on public.events (starts_on);

-- updated_at mis à jour automatiquement
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- Sécurité : lecture publique des seuls événements publiés, aucune écriture via l'API publique.
-- Les modifications se font depuis le dashboard Supabase (qui contourne RLS).
alter table public.events enable row level security;

revoke all on public.events from anon, authenticated;
grant select on public.events to anon, authenticated;

create policy "Lecture publique des événements publiés"
on public.events for select
to anon, authenticated
using (published);
