-- =============================================================================
-- 20260426120300_triggers
-- (a) handle_new_user — auto-create a profile row when an auth user signs up.
-- (b) set_updated_at  — generic BEFORE UPDATE trigger that bumps updated_at.
-- =============================================================================

-- ── handle_new_user ─────────────────────────────────────────────────────────
-- Runs after any INSERT on auth.users. Pulls full_name from signup metadata
-- when the client passes it (mobile signup form does). security definer is
-- required because the function reads from auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── set_updated_at ──────────────────────────────────────────────────────────
-- Generic. Attached to any table whose updated_at column we want kept fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists merchants_set_updated_at on public.merchants;
create trigger merchants_set_updated_at
  before update on public.merchants
  for each row execute function public.set_updated_at();

drop trigger if exists coupon_templates_set_updated_at on public.coupon_templates;
create trigger coupon_templates_set_updated_at
  before update on public.coupon_templates
  for each row execute function public.set_updated_at();
