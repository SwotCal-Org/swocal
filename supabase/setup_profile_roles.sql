-- Adds user/merchant role support to profiles.
-- Run in Supabase SQL editor.

begin;

alter table public.profiles
  add column if not exists role text;

update public.profiles p
set role = coalesce(
  nullif((select u.raw_user_meta_data ->> 'role' from auth.users u where u.id = p.id), ''),
  'user'
)
where p.role is null;

alter table public.profiles
  alter column role set default 'user';

alter table public.profiles
  alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'merchant'));
  end if;
end $$;

create index if not exists idx_profiles_role on public.profiles(role);

commit;
