-- King Bariki: initial Postgres schema (replaces Firestore riders/payments/payouts/admins/supervisors/recruiters)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null check (role in ('admin', 'supervisor', 'recruiter', 'rider')),
  created_at timestamptz not null default now()
);

create table public.riders (
  id uuid primary key references public.profiles(id) on delete cascade,
  phone text,
  plate_number text,
  vehicle_type text not null default 'Bajaji',
  chassis_number text,
  engine_number text,
  engine_capacity text,
  model_number text,
  shahidi_number text,
  daily_fee numeric not null default 25000,
  payment_frequency text not null default 'Daily' check (payment_frequency in ('Daily', 'Weekly', '10-Day')),
  contract_start date,
  contract_term_months int,
  contract_end date,
  guarantor_name text,
  guarantor_phone text,
  witness_name text,
  witness_phone text,
  active boolean not null default true,
  bike_id text,
  notes text,
  location jsonb,
  created_at timestamptz not null default now()
);

create table public.payments (
  id text primary key, -- our AzamPay externalId / gatewayRef
  rider_id uuid not null references public.riders(id) on delete cascade,
  amount numeric not null,
  transaction_id text,
  provider text,
  msisdn text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed')),
  recorded_at timestamptz not null default now(),
  verified_by uuid references public.profiles(id)
);

create index payments_rider_id_recorded_at_idx on public.payments (rider_id, recorded_at desc);

create table public.payouts (
  id text primary key, -- AzamPay disbursement reference
  amount numeric not null,
  phone_number text not null,
  provider text,
  recipient_name text,
  narration text,
  status text not null default 'submitted',
  initiated_by uuid references public.profiles(id),
  gateway_message text,
  operator_reference text,
  fsp_reference_id text,
  recorded_at timestamptz not null default now()
);

-- --- Role helpers (security definer to avoid RLS self-recursion on profiles) ---

create function public.current_role() returns text
language sql security definer stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select public.current_role() = 'admin';
$$;

create function public.is_manager() returns boolean
language sql security definer stable
set search_path = public
as $$
  select public.current_role() in ('admin', 'supervisor', 'recruiter');
$$;

-- --- Row Level Security ---

alter table public.profiles enable row level security;
alter table public.riders enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;

-- profiles: everyone signed in can read (needed to resolve names/roles across the app);
-- only admins can create/update/delete other profiles; a user may update their own row.
create policy "profiles_select_signed_in" on public.profiles
  for select using (auth.uid() is not null);

create policy "profiles_insert_self_or_admin" on public.profiles
  for insert with check (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());

-- riders: managers see the fleet; a rider sees/updates only their own row.
create policy "riders_select_manager_or_self" on public.riders
  for select using (public.is_manager() or id = auth.uid());

create policy "riders_insert_self_or_manager" on public.riders
  for insert with check (id = auth.uid() or public.is_manager());

create policy "riders_update_manager_or_self" on public.riders
  for update using (public.is_manager() or id = auth.uid());

create policy "riders_delete_admin_or_self" on public.riders
  for delete using (public.is_admin() or id = auth.uid());

-- payments: managers see all; a rider sees only their own payments.
-- Real rider-initiated payments are written server-side (service role, bypasses RLS)
-- via the AzamPay action + webhook. Only managers write payment rows directly (manual cash entry).
create policy "payments_select_manager_or_owner" on public.payments
  for select using (public.is_manager() or rider_id = auth.uid());

create policy "payments_insert_manager" on public.payments
  for insert with check (public.is_manager());

create policy "payments_update_manager" on public.payments
  for update using (public.is_manager());

create policy "payments_delete_admin" on public.payments
  for delete using (public.is_admin());

-- payouts: admin-only audit trail, always written server-side via the service role.
create policy "payouts_select_admin" on public.payouts
  for select using (public.is_admin());
