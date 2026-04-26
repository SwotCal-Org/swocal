-- Auth role enforcement and sync.
-- Supabase does not support adding custom columns directly to auth.users safely.
-- Use auth.users.raw_user_meta_data.role and validate/sync it.

begin;

-- 1) Ensure profiles.role exists and is constrained.
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
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'merchant'));
  end if;
end $$;

create index if not exists idx_profiles_role on public.profiles(role);

-- 2) Validate auth.users metadata role and sync to profiles.role.
create or replace function public.handle_auth_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'user');

  if v_role not in ('user', 'merchant') then
    raise exception 'Invalid role %. Allowed roles: user, merchant', v_role;
  end if;

  insert into public.profiles (id, full_name, role, updated_at)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    v_role,
    now()
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_auth_user_role_sync on auth.users;
create trigger trg_auth_user_role_sync
after insert or update of raw_user_meta_data
on auth.users
for each row
execute function public.handle_auth_user_role();

commit;

-- Usage in signup metadata:
-- options.data = { full_name: 'Mia', role: 'merchant' }
