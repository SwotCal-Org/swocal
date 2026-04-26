-- =============================================================================
-- 20260426120400_merchant_panel_fields
-- Adds owner-facing fields needed by the merchant panel:
--   * coupon_ai_rules — prompt + cap + conditions that drive AI coupon issuance
--                      (the owner does NOT create coupons directly; the AI does,
--                      using these rules)
--   * about, products, gallery — presentation surface shown to consumers
-- =============================================================================

alter table public.merchants
  add column if not exists coupon_ai_rules jsonb not null default '{}'::jsonb,
  add column if not exists about           text,
  add column if not exists products        jsonb not null default '[]'::jsonb,
  add column if not exists gallery         jsonb not null default '[]'::jsonb;
