-- Seed random coupons for all users to see in the Coupons tab.
-- Uses existing linked merchant businesses from public.merchant_business_links.
-- Run in Supabase SQL editor.

begin;

-- Optional cleanup: uncomment to reset existing seeded coupons.
-- delete from public.store_coupons;

with linked as (
  select
    mbl.merchant_user_id,
    mbl.google_place_id,
    mbl.google_place_name,
    mbl.google_place_address
  from public.merchant_business_links mbl
  where mbl.link_status = 'linked'
),
coupon_templates as (
  select *
  from (
    values
      ('Coffee break deal', 15),
      ('Today only special', 20),
      ('Weekend saver', 25),
      ('Local favorite offer', 30),
      ('Happy hour bonus', 35),
      ('Flash coupon', 40),
      ('Early bird reward', 18),
      ('Loyalty boost', 22)
  ) as t(headline_base, discount_percent)
),
expanded as (
  -- 4 random coupons per linked business.
  select
    l.merchant_user_id,
    l.google_place_id,
    l.google_place_name,
    l.google_place_address,
    row_number() over (partition by l.google_place_id order by random()) as seq
  from linked l
  cross join generate_series(1, 4) gs
),
picked as (
  select
    e.merchant_user_id,
    e.google_place_id,
    e.google_place_name,
    e.google_place_address,
    (
      select ct.headline_base
      from coupon_templates ct
      order by random()
      limit 1
    ) as headline_base,
    (
      select ct.discount_percent
      from coupon_templates ct
      order by random()
      limit 1
    ) as discount_percent
  from expanded e
),
final_rows as (
  select
    p.merchant_user_id,
    p.google_place_id,
    p.google_place_name,
    p.google_place_address,
    p.headline_base || ' #' || floor(random() * 900 + 100)::int as headline,
    p.discount_percent,
    now() + ((floor(random() * 6) + 1)::int || ' days')::interval as expires_at
  from picked p
)
insert into public.store_coupons (
  merchant_user_id,
  google_place_id,
  business_name,
  business_address,
  business_category,
  headline,
  discount_percent,
  expires_at,
  status
)
select
  f.merchant_user_id,
  f.google_place_id,
  f.google_place_name,
  f.google_place_address,
  'Local business',
  f.headline,
  f.discount_percent,
  f.expires_at,
  'active'
from final_rows f
where not exists (
  select 1
  from public.store_coupons sc
  where sc.merchant_user_id = f.merchant_user_id
    and sc.google_place_id = f.google_place_id
    and sc.headline = f.headline
);

commit;

-- Verify:
-- select business_name, headline, discount_percent, expires_at, status
-- from public.store_coupons
-- order by created_at desc
-- limit 100;
