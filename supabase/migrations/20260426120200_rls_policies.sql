-- =============================================================================
-- 20260426120200_rls_policies
--
-- Threat model: edge functions and the Next.js merchant app both use the anon
-- key + the user's JWT (never the service role). That means every query they
-- run hits these policies — RLS is the only defense between an authenticated
-- user and someone else's data. Service-role calls bypass RLS entirely; only
-- background jobs / admin tools should use that key.
--
-- Convention: policies are named "<table> <action> <who>" so policy lists in
-- the dashboard read like sentences.
-- =============================================================================

alter table public.profiles                    enable row level security;
alter table public.merchants                   enable row level security;
alter table public.generated_offers            enable row level security;
alter table public.swipes                      enable row level security;
alter table public.redemptions                 enable row level security;
alter table public.coupon_templates            enable row level security;
alter table public.coupon_template_redemptions enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
-- A user only sees and edits their own profile. Inserts happen via the
-- handle_new_user() trigger after auth signup, so users do not insert directly.
drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles select own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── merchants ───────────────────────────────────────────────────────────────
-- Public read so the consumer app can render cards. Owners can insert and
-- update their own row (one row per owner — see the unique index in the
-- schema migration).
drop policy if exists "merchants select all"   on public.merchants;
drop policy if exists "merchants insert owner" on public.merchants;
drop policy if exists "merchants update owner" on public.merchants;

create policy "merchants select all"
  on public.merchants for select
  using (true);

create policy "merchants insert owner"
  on public.merchants for insert
  with check (owner_id = auth.uid());

create policy "merchants update owner"
  on public.merchants for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ── generated_offers ────────────────────────────────────────────────────────
-- Each user only sees / inserts / updates their own offers. The merchant
-- dashboard reads its merchant's offers via a dedicated select policy.
drop policy if exists "offers select own"      on public.generated_offers;
drop policy if exists "offers insert own"      on public.generated_offers;
drop policy if exists "offers update own"      on public.generated_offers;
drop policy if exists "offers select merchant" on public.generated_offers;

create policy "offers select own"
  on public.generated_offers for select
  using (user_id = auth.uid());

create policy "offers insert own"
  on public.generated_offers for insert
  with check (user_id = auth.uid());

create policy "offers update own"
  on public.generated_offers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "offers select merchant"
  on public.generated_offers for select
  using (
    exists (
      select 1 from public.merchants m
      where m.id = generated_offers.merchant_id
        and m.owner_id = auth.uid()
    )
  );

-- ── swipes ──────────────────────────────────────────────────────────────────
drop policy if exists "swipes select own"      on public.swipes;
drop policy if exists "swipes insert own"      on public.swipes;
drop policy if exists "swipes select merchant" on public.swipes;

create policy "swipes select own"
  on public.swipes for select
  using (user_id = auth.uid());

create policy "swipes insert own"
  on public.swipes for insert
  with check (user_id = auth.uid());

-- Merchants can read swipes for their own offers (funnel analytics).
create policy "swipes select merchant"
  on public.swipes for select
  using (
    exists (
      select 1
      from public.generated_offers o
      join public.merchants m on m.id = o.merchant_id
      where o.id = swipes.offer_id
        and m.owner_id = auth.uid()
    )
  );

-- ── redemptions ─────────────────────────────────────────────────────────────
drop policy if exists "redemptions select own"      on public.redemptions;
drop policy if exists "redemptions insert own"      on public.redemptions;
drop policy if exists "redemptions select merchant" on public.redemptions;

create policy "redemptions select own"
  on public.redemptions for select
  using (user_id = auth.uid());

create policy "redemptions insert own"
  on public.redemptions for insert
  with check (user_id = auth.uid());

create policy "redemptions select merchant"
  on public.redemptions for select
  using (
    exists (
      select 1
      from public.generated_offers o
      join public.merchants m on m.id = o.merchant_id
      where o.id = redemptions.offer_id
        and m.owner_id = auth.uid()
    )
  );

-- ── coupon_templates ────────────────────────────────────────────────────────
-- Anyone can read active templates (the consumer app will surface them).
-- Only the owning merchant can write.
drop policy if exists "coupon_templates select active"  on public.coupon_templates;
drop policy if exists "coupon_templates select owner"   on public.coupon_templates;
drop policy if exists "coupon_templates insert owner"   on public.coupon_templates;
drop policy if exists "coupon_templates update owner"   on public.coupon_templates;
drop policy if exists "coupon_templates delete owner"   on public.coupon_templates;

create policy "coupon_templates select active"
  on public.coupon_templates for select
  using (status = 'active');

create policy "coupon_templates select owner"
  on public.coupon_templates for select
  using (
    exists (
      select 1 from public.merchants m
      where m.id = coupon_templates.merchant_id
        and m.owner_id = auth.uid()
    )
  );

create policy "coupon_templates insert owner"
  on public.coupon_templates for insert
  with check (
    exists (
      select 1 from public.merchants m
      where m.id = coupon_templates.merchant_id
        and m.owner_id = auth.uid()
    )
  );

create policy "coupon_templates update owner"
  on public.coupon_templates for update
  using (
    exists (
      select 1 from public.merchants m
      where m.id = coupon_templates.merchant_id
        and m.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.merchants m
      where m.id = coupon_templates.merchant_id
        and m.owner_id = auth.uid()
    )
  );

create policy "coupon_templates delete owner"
  on public.coupon_templates for delete
  using (
    exists (
      select 1 from public.merchants m
      where m.id = coupon_templates.merchant_id
        and m.owner_id = auth.uid()
    )
  );

-- ── coupon_template_redemptions ─────────────────────────────────────────────
drop policy if exists "coupon_template_redemptions select own"      on public.coupon_template_redemptions;
drop policy if exists "coupon_template_redemptions insert own"      on public.coupon_template_redemptions;
drop policy if exists "coupon_template_redemptions select merchant" on public.coupon_template_redemptions;

create policy "coupon_template_redemptions select own"
  on public.coupon_template_redemptions for select
  using (user_id = auth.uid());

create policy "coupon_template_redemptions insert own"
  on public.coupon_template_redemptions for insert
  with check (user_id = auth.uid());

create policy "coupon_template_redemptions select merchant"
  on public.coupon_template_redemptions for select
  using (
    exists (
      select 1
      from public.coupon_templates t
      join public.merchants m on m.id = t.merchant_id
      where t.id = coupon_template_redemptions.coupon_template_id
        and m.owner_id = auth.uid()
    )
  );
