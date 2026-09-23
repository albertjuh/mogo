-- The original `id uuid primary key references public.profiles(id)` column
-- definition created a separate FK constraint (riders_id_fkey) alongside the
-- PK constraint. The earlier decouple-riders migration only dropped/rebuilt
-- the PK (riders_pkey), leaving this stray FK still forcing riders.id to
-- exist in profiles -- exactly the coupling we were trying to remove.

alter table public.riders drop constraint if exists riders_id_fkey;
