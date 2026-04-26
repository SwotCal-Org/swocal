create extension if not exists pgcrypto;

create table if not exists public.store_coupons (
  id uuid primary key default gen_random_uuid(),
  merchant_user_id uuid not null references auth.users(id) on delete cascade,
  google_place_id text not null,
  business_name text not null,
  business_address text,
  business_category text,
  headline text not null,
  discount_percent integer not null check (discount_percent between 1 and 100),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'redeemed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_coupons_place_idx on public.store_coupons (google_place_id);
create index if not exists store_coupons_status_idx on public.store_coupons (status);
create index if not exists store_coupons_merchant_idx on public.store_coupons (merchant_user_id);

create unique index if not exists store_coupons_active_unique
  on public.store_coupons (merchant_user_id, google_place_id, headline)
  where status = 'active';

create or replace function public.set_store_coupons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_store_coupons_updated_at on public.store_coupons;
create trigger trg_store_coupons_updated_at
before update on public.store_coupons
for each row
execute procedure public.set_store_coupons_updated_at();

alter table public.store_coupons enable row level security;

drop policy if exists "store_coupons_select_authenticated" on public.store_coupons;
create policy "store_coupons_select_authenticated"
on public.store_coupons
for select
to authenticated
using (true);

drop policy if exists "store_coupons_insert_own" on public.store_coupons;
create policy "store_coupons_insert_own"
on public.store_coupons
for insert
to authenticated
with check (auth.uid() = merchant_user_id);

drop policy if exists "store_coupons_update_own" on public.store_coupons;
create policy "store_coupons_update_own"
on public.store_coupons
for update
to authenticated
using (auth.uid() = merchant_user_id)
with check (auth.uid() = merchant_user_id);

drop policy if exists "store_coupons_delete_own" on public.store_coupons;
create policy "store_coupons_delete_own"
on public.store_coupons
for delete
to authenticated
using (auth.uid() = merchant_user_id);
