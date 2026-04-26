-- =============================================================================
-- 20260426120100_indexes
-- Index targets are the actual query shapes the apps run today. Don't add
-- speculative indexes — every index slows writes and Postgres keeps stats on
-- which queries actually need them.
-- =============================================================================

-- ── generated_offers ────────────────────────────────────────────────────────
-- /redeem looks up by token — already covered by the UNIQUE constraint.
-- "My active coupons" in the mobile coupons screen.
create index if not exists generated_offers_user_status_created_idx
  on public.generated_offers (user_id, status, created_at desc);

-- Merchant dashboard — "recent offers for this merchant".
create index if not exists generated_offers_merchant_created_idx
  on public.generated_offers (merchant_id, created_at desc);

-- Background job to flip status='active' → 'expired' once expires_at passes.
-- Partial index keeps it small (most rows are already redeemed/expired).
create index if not exists generated_offers_expires_at_active_idx
  on public.generated_offers (expires_at)
  where status = 'active';

-- ── swipes ──────────────────────────────────────────────────────────────────
create index if not exists swipes_user_created_idx
  on public.swipes (user_id, created_at desc);

create index if not exists swipes_offer_idx
  on public.swipes (offer_id);

-- ── redemptions ─────────────────────────────────────────────────────────────
create index if not exists redemptions_offer_idx
  on public.redemptions (offer_id);

create index if not exists redemptions_redeemed_at_idx
  on public.redemptions (redeemed_at desc);

-- ── coupon_templates ────────────────────────────────────────────────────────
-- Merchant dashboard list view (filter by merchant, sort recent first).
create index if not exists coupon_templates_merchant_created_idx
  on public.coupon_templates (merchant_id, created_at desc);

-- Public consumer queries will eventually filter by status='active' and
-- active_from/active_until window.
create index if not exists coupon_templates_active_window_idx
  on public.coupon_templates (status, active_from, active_until)
  where status = 'active';

-- ── coupon_template_redemptions ─────────────────────────────────────────────
create index if not exists coupon_template_redemptions_template_idx
  on public.coupon_template_redemptions (coupon_template_id, redeemed_at desc);

create index if not exists coupon_template_redemptions_user_idx
  on public.coupon_template_redemptions (user_id, redeemed_at desc);

-- ── merchants ───────────────────────────────────────────────────────────────
-- Filter by status (admin lists pending/active/suspended).
create index if not exists merchants_status_idx
  on public.merchants (status);

-- Geo lookup. We don't use PostGIS yet — a btree on (lat, lng) is enough for
-- the tiny demo dataset and a bounding-box pre-filter when we move past it.
create index if not exists merchants_lat_lng_idx
  on public.merchants (lat, lng);
