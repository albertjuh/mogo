-- Deleting an admin/manager account shouldn't be blocked by their audit-trail
-- references on payments/payouts; null them out instead.

alter table public.payments
  drop constraint payments_verified_by_fkey,
  add constraint payments_verified_by_fkey
    foreign key (verified_by) references public.profiles(id) on delete set null;

alter table public.payouts
  drop constraint payouts_initiated_by_fkey,
  add constraint payouts_initiated_by_fkey
    foreign key (initiated_by) references public.profiles(id) on delete set null;
