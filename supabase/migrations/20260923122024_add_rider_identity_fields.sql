-- A driver can be added to the fleet by the admin before they have a login
-- account, so name/email must live on `riders` itself, not only on the
-- (optional) linked `profiles` row.

alter table public.riders add column name text not null default '';
alter table public.riders add column email text;

update public.riders r
set name = coalesce(p.name, ''), email = p.email
from public.profiles p
where r.profile_id = p.id;
