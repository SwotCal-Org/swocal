-- Swotcal onboarding + personalization SQL
-- Run this file in Supabase SQL Editor.

begin;

-- 1) Core preferences table for all local-business recommendations.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] not null default '{}',                   -- e.g. retail, wellness, entertainment
  spend_style text not null default 'Mid-range',            -- Budget-friendly | Mid-range | Premium
  vibes text[] not null default '{}',                       -- e.g. cozy, family-friendly, convenient
  budget text not null default '€€',                        -- € | €€ | €€€
  price_min integer,
  price_max integer,
  max_distance_m integer not null default 2500,
  location_enabled boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_budget_check check (budget in ('€', '€€', '€€€')),
  constraint user_preferences_spend_style_check check (
    spend_style in ('Budget-friendly', 'Mid-range', 'Premium')
  ),
  constraint user_preferences_price_bounds_check check (
    price_min is null
    or price_max is null
    or price_min <= price_max
  )
);

comment on table public.user_preferences is 'Per-user onboarding and recommendation preferences.';
comment on column public.user_preferences.interests is 'Selected local-business categories.';
comment on column public.user_preferences.vibes is 'Preferred place/offer vibes.';

-- Helpful indexes for targeting/filtering.
create index if not exists idx_user_preferences_interests_gin
  on public.user_preferences using gin (interests);

create index if not exists idx_user_preferences_vibes_gin
  on public.user_preferences using gin (vibes);

create index if not exists idx_user_preferences_location_enabled
  on public.user_preferences (location_enabled);

-- 2) Keep updated_at fresh on each update.
create or replace function public.tg_set_timestamp_user_preferences()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_timestamp_user_preferences on public.user_preferences;
create trigger set_timestamp_user_preferences
before update on public.user_preferences
for each row
execute function public.tg_set_timestamp_user_preferences();

-- 3) Row-level security: users can only read/write their own row.
alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: allow user to clear their own preferences row.
drop policy if exists "user_preferences_delete_own" on public.user_preferences;
create policy "user_preferences_delete_own"
  on public.user_preferences
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4) Helper RPC: create default row if it does not exist.
-- Use this after login before showing onboarding.
create or replace function public.ensure_user_preferences()
returns public.user_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_preferences;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_preferences (user_id)
  values (v_uid)
  on conflict (user_id) do nothing;

  select *
  into v_row
  from public.user_preferences
  where user_id = v_uid;

  return v_row;
end;
$$;

revoke all on function public.ensure_user_preferences() from public;
grant execute on function public.ensure_user_preferences() to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Onboarding write example (run from app, not manually):
--
-- insert into public.user_preferences (
--   user_id,
--   interests,
--   spend_style,
--   vibes,
--   budget,
--   location_enabled,
--   onboarding_completed_at
-- )
-- values (
--   auth.uid(),
--   array['Retail & fashion', 'Beauty & wellness'],
--   'Mid-range',
--   array['Trendy', 'Fast and convenient'],
--   '€€',
--   true,
--   now()
-- )
-- on conflict (user_id) do update
-- set
--   interests = excluded.interests,
--   spend_style = excluded.spend_style,
--   vibes = excluded.vibes,
--   budget = excluded.budget,
--   location_enabled = excluded.location_enabled,
--   onboarding_completed_at = excluded.onboarding_completed_at;
