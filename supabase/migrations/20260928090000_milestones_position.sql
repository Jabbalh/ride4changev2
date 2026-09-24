-- Ordre d'affichage manuel des dates clés (page « L'Association »).
-- À exécuter dans Supabase : SQL Editor → coller ce fichier → Run.
-- Prérequis : 20260927090000_create_milestones.sql.

alter table public.milestones add column position integer;

-- Ordre de départ : celui affiché jusqu'ici (année décroissante, puis ordre de saisie)
update public.milestones m
set position = o.rn
from (select id, row_number() over (order by year desc, id) as rn from public.milestones) o
where m.id = o.id;

alter table public.milestones alter column position set not null;

drop index if exists public.milestones_order_idx;
create index milestones_position_idx on public.milestones (position, id);

-- Une nouvelle date arrive en tête de liste (position gérée par la base, pas par le site)
create function public.milestones_set_initial_position() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.position := coalesce((select min(position) from public.milestones), 1) - 1;
  return new;
end;
$$;

create trigger milestones_initial_position
before insert on public.milestones
for each row execute function public.milestones_set_initial_position();

-- Réordonne toute la liste en une seule opération : ids dans l'ordre souhaité → positions 1, 2, 3…
-- security invoker : s'exécute avec les droits de l'appelant, donc RLS et grants s'appliquent
-- (seul un éditeur peut modifier les positions).
-- Renvoie le nombre de lignes modifiées : pour un non-éditeur, RLS filtre silencieusement (0),
-- le site compare donc ce nombre à la taille de la liste pour détecter un refus.
create function public.reorder_milestones(ids bigint[]) returns integer
language sql
security invoker
set search_path = ''
as $$
  with updated as (
    update public.milestones m
    set position = t.ord
    from unnest(ids) with ordinality as t(id, ord)
    where m.id = t.id
    returning 1
  )
  select count(*)::integer from updated;
$$;

revoke execute on function public.reorder_milestones(bigint[]) from public, anon;
grant execute on function public.reorder_milestones(bigint[]) to authenticated;
grant update (position) on public.milestones to authenticated;
