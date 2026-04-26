-- Merchant ↔ Google Place linking table.
-- Run in Supabase SQL editor.

begin;

create table if not exists public.merchant_business_links (
  id uuid primary key default gen_random_uuid(),
  merchant_user_id uuid not null unique references auth.users(id) on delete cascade,
  google_place_id text not null,
  google_place_name text not null,
  google_place_address text,
  link_status text not null default 'linked' check (link_status in ('linked', 'pending', 'unlinked')),
  linked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_merchant_business_links_place_id on public.merchant_business_links(google_place_id);

create or replace function public.tg_set_timestamp_merchant_business_links()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_timestamp_merchant_business_links on public.merchant_business_links;
create trigger set_timestamp_merchant_business_links
before update on public.merchant_business_links
for each row
execute function public.tg_set_timestamp_merchant_business_links();

alter table public.merchant_business_links enable row level security;

drop policy if exists "merchant_business_links_select_own" on public.merchant_business_links;
create policy "merchant_business_links_select_own"
  on public.merchant_business_links
  for select
  to authenticated
  using (auth.uid() = merchant_user_id);

drop policy if exists "merchant_business_links_insert_own" on public.merchant_business_links;
create policy "merchant_business_links_insert_own"
  on public.merchant_business_links
  for insert
  to authenticated
  with check (auth.uid() = merchant_user_id);

drop policy if exists "merchant_business_links_update_own" on public.merchant_business_links;
create policy "merchant_business_links_update_own"
  on public.merchant_business_links
  for update
  to authenticated
  using (auth.uid() = merchant_user_id)
  with check (auth.uid() = merchant_user_id);

drop policy if exists "merchant_business_links_delete_own" on public.merchant_business_links;
create policy "merchant_business_links_delete_own"
  on public.merchant_business_links
  for delete
  to authenticated
  using (auth.uid() = merchant_user_id);

commit;
