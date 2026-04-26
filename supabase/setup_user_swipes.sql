-- Stores each user swipe event with business context.
-- Run in Supabase SQL editor.

begin;

create table if not exists public.user_swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('left', 'right')),
  business_id text not null,
  business_name text not null,
  business_address text not null,
  business_category text,
  distance_m integer,
  swiped_at timestamptz not null default now()
);

create index if not exists idx_user_swipes_user_id on public.user_swipes(user_id);
create index if not exists idx_user_swipes_swiped_at on public.user_swipes(swiped_at desc);
create index if not exists idx_user_swipes_business_id on public.user_swipes(business_id);

alter table public.user_swipes enable row level security;

drop policy if exists "user_swipes_select_own" on public.user_swipes;
create policy "user_swipes_select_own"
  on public.user_swipes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_swipes_insert_own" on public.user_swipes;
create policy "user_swipes_insert_own"
  on public.user_swipes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_swipes_update_own" on public.user_swipes;
create policy "user_swipes_update_own"
  on public.user_swipes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_swipes_delete_own" on public.user_swipes;
create policy "user_swipes_delete_own"
  on public.user_swipes
  for delete
  to authenticated
  using (auth.uid() = user_id);

commit;
