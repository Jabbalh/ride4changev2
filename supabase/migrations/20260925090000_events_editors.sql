-- Édition des événements depuis le site par des éditeurs authentifiés (Supabase Auth).
-- À exécuter dans Supabase : SQL Editor → coller ce fichier → Run.
--
-- Être connecté ne suffit pas : il faut figurer dans public.editors.
-- (Sinon, si les inscriptions sont ouvertes, n'importe qui pourrait créer un compte et modifier les événements.)
--
-- Ajouter un éditeur (après l'avoir créé dans Authentication → Users) :
--   insert into public.editors (user_id) select id from auth.users where email = 'prenom@exemple.fr';
-- Retirer un éditeur :
--   delete from public.editors where user_id = (select id from auth.users where email = 'prenom@exemple.fr');

create table public.editors (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.editors is 'Comptes autorisés à créer et modifier les événements depuis le site.';

alter table public.editors enable row level security;

revoke all on public.editors from anon, authenticated;
grant select on public.editors to authenticated;

-- Chacun ne voit que sa propre ligne (le site s'en sert pour savoir si l'utilisateur connecté est éditeur).
-- Aucune écriture via l'API : la liste se gère uniquement depuis le dashboard.
create policy "Un utilisateur voit s'il est éditeur"
on public.editors for select
to authenticated
using (user_id = (select auth.uid()));

-- Vrai si l'utilisateur connecté est éditeur. security definer : lit editors sans dépendre de ses règles RLS.
create function public.is_editor() returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.editors where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_editor() from public, anon;
grant execute on function public.is_editor() to authenticated;

-- Événements : les éditeurs lisent tout (y compris non publiés), créent et modifient.
-- Pas de suppression depuis le site : décocher « published » pour masquer (suppression possible dans le dashboard).
-- Droits limités aux colonnes éditables : id, has_details, created_at et updated_at restent gérés par la base.
grant insert (title, type, starts_on, ends_on, location, description, details, participants, is_featured, published)
  on public.events to authenticated;
grant update (title, type, starts_on, ends_on, location, description, details, participants, is_featured, published)
  on public.events to authenticated;

create policy "Éditeurs : lecture de tous les événements"
on public.events for select
to authenticated
using ((select public.is_editor()));

create policy "Éditeurs : création"
on public.events for insert
to authenticated
with check ((select public.is_editor()));

create policy "Éditeurs : modification"
on public.events for update
to authenticated
using ((select public.is_editor()))
with check ((select public.is_editor()));
