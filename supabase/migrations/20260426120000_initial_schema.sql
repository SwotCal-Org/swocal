-- =============================================================================
-- 20260426120000_initial_schema
-- Tables: profiles, merchants, generated_offers, swipes, redemptions,
--         coupon_templates, coupon_template_redemptions
--
-- This file is the single source of truth for the schema. Both the consumer
-- mobile app and the merchant business app read these tables. Do not edit the
-- schema in the Supabase dashboard — add a new migration file instead.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically by handle_new_user() (see
-- triggers migration). Holds the abstract intent_vector that the consumer
-- sends to the server. Raw preferences live on-device — never stored here.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text,
  full_name     text,
  avatar_url    text,
  intent_vector jsonb       not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── merchants ───────────────────────────────────────────────────────────────
-- One row per physical business location. Owned by an auth user (the merchant
-- dashboard signs in and edits this row). Status drives onboarding state.
create table if not exists public.merchants (
  id                  uuid        primary key default gen_random_uuid(),
  owner_id            uuid        references auth.users(id) on delete set null,
  name                text        not null,
  category            text        not null,
  address             text,
  lat                 double precision,
  lng                 double precision,
  image_url           text,
  logo_url            text,
  phone               text,
  email               text,
  website             text,
  hours               jsonb       not null default '{}'::jsonb,
  transaction_volume  text        not null default 'normal',
  rules               jsonb       not null default '{}'::jsonb,
  status              text        not null default 'pending',
  onboarded_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint merchants_volume_chk check (transaction_volume in ('low','normal','high')),
  constraint merchants_status_chk check (status in ('pending','active','suspended'))
);

-- One merchant row per owner (simplifies the dashboard auth helpers).
create unique index if not exists merchants_owner_unique
  on public.merchants (owner_id)
  where owner_id is not null;

-- ── generated_offers ────────────────────────────────────────────────────────
-- An AI-or-template offer card produced for one user, one merchant, one
-- moment in time. The token is what the QR encodes and what /redeem looks up.
create table if not exists public.generated_offers (
  id               uuid        primary key default gen_random_uuid(),
  merchant_id      uuid        not null references public.merchants(id) on delete cascade,
  user_id          uuid        references auth.users(id) on delete cascade,
  user_session     text,
  headline         text        not null,
  subline          text        not null,
  discount_percent int         not null,
  context_signals  jsonb       not null default '{}'::jsonb,
  token            text        not null unique default gen_random_uuid()::text,
  status           text        not null default 'active',
  expires_at       timestamptz not null default (now() + interval '2 hours'),
  created_at       timestamptz not null default now(),
  constraint generated_offers_status_chk
    check (status in ('active','redeemed','expired')),
  constraint generated_offers_discount_chk
    check (discount_percent between 0 and 100)
);

-- ── swipes ──────────────────────────────────────────────────────────────────
-- Every left/right gesture. Powers the merchant funnel ("shown vs. accepted").
create table if not exists public.swipes (
  id          uuid        primary key default gen_random_uuid(),
  offer_id    uuid        not null references public.generated_offers(id) on delete cascade,
  user_id     uuid        references auth.users(id) on delete set null,
  session_id  text,
  direction   text        not null,
  created_at  timestamptz not null default now(),
  constraint swipes_direction_chk check (direction in ('left','right'))
);

-- ── redemptions ─────────────────────────────────────────────────────────────
-- Write-once log of a successful AI-offer redemption (token → coupon scanned).
-- Distinct from coupon_template_redemptions, which logs use of a merchant-
-- defined static coupon. The two coexist by design.
create table if not exists public.redemptions (
  id           uuid        primary key default gen_random_uuid(),
  offer_id     uuid        not null references public.generated_offers(id) on delete cascade,
  user_id      uuid        references auth.users(id) on delete set null,
  redeemed_at  timestamptz not null default now()
);

-- ── coupon_templates ────────────────────────────────────────────────────────
-- Merchant-authored static coupons (different from generated_offers, which are
-- AI-personalised one-shots). Lives entirely in the business dashboard CRUD.
create table if not exists public.coupon_templates (
  id                uuid        primary key default gen_random_uuid(),
  merchant_id       uuid        not null references public.merchants(id) on delete cascade,
  title             text        not null,
  description       text,
  discount_type     text        not null,
  discount_value    numeric     not null,
  banner_image_url  text,
  conditions        jsonb       not null default '{}'::jsonb,
  status            text        not null default 'draft',
  active_from       timestamptz,
  active_until      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint coupon_templates_discount_type_chk
    check (discount_type in ('percent','fixed','bogo')),
  constraint coupon_templates_status_chk
    check (status in ('draft','active','paused','archived')),
  constraint coupon_templates_value_chk
    check (discount_value >= 0)
);

-- ── coupon_template_redemptions ─────────────────────────────────────────────
-- Per-use log for static coupons. amount_cents is optional (POS may not report).
create table if not exists public.coupon_template_redemptions (
  id                  uuid        primary key default gen_random_uuid(),
  coupon_template_id  uuid        not null references public.coupon_templates(id) on delete cascade,
  user_id             uuid        references auth.users(id) on delete set null,
  amount_cents        integer,
  redeemed_at         timestamptz not null default now()
);
