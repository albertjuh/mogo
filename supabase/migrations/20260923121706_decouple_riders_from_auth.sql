-- riders.id was a hard FK to profiles(id) (= auth.users.id), which would make
-- it impossible for a manager to add a driver to the fleet before that driver
-- has (or ever gets) a login account -- the normal onboarding order for a
-- fleet business. Decouple: riders get their own id, with an optional
-- profile_id linking to an auth account once/if the driver signs up.

-- Drop the policies that reference riders.id = auth.uid(); rebuilt below.
drop policy "riders_select_manager_or_self" on public.riders;
drop policy "riders_insert_self_or_manager" on public.riders;
drop policy "riders_update_manager_or_self" on public.riders;
drop policy "riders_delete_admin_or_self" on public.riders;
drop policy "payments_select_manager_or_owner" on public.payments;

alter table public.riders add column profile_id uuid references public.profiles(id) on delete set null;
update public.riders set profile_id = id;
alter table public.riders add constraint riders_profile_id_key unique (profile_id);

alter table public.riders drop constraint riders_pkey cascade;
alter table public.riders alter column id set default gen_random_uuid();
alter table public.riders add primary key (id);

-- `drop constraint riders_pkey cascade` above also dropped payments' FK to it
-- (and the payments_select_manager_or_owner policy that depended on riders);
-- recreate the FK now that riders has its PK back.
alter table public.payments
  add constraint payments_rider_id_fkey foreign key (rider_id) references public.riders(id) on delete cascade;

create policy "riders_select_manager_or_self" on public.riders
  for select using (public.is_manager() or profile_id = auth.uid());

create policy "riders_insert_manager" on public.riders
  for insert with check (public.is_manager());

create policy "riders_update_manager_or_self" on public.riders
  for update using (public.is_manager() or profile_id = auth.uid());

create policy "riders_delete_admin" on public.riders
  for delete using (public.is_admin());

create policy "payments_select_manager_or_owner" on public.payments
  for select using (
    public.is_manager()
    or exists (select 1 from public.riders where riders.id = payments.rider_id and riders.profile_id = auth.uid())
  );
