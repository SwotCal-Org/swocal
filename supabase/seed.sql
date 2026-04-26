-- =============================================================================
-- Seed data — 5 Stuttgart merchants for the demo.
-- Idempotent: only runs when the merchants table is empty, so re-running
-- `supabase db reset` (or applying after a manual edit) won't duplicate rows.
-- =============================================================================

do $$
begin
  if (select count(*) from public.merchants) = 0 then
    insert into public.merchants
      (name, category, address, lat, lng, image_url, transaction_volume, rules, status, onboarded_at)
    values
      ('Café Mayer',     'cafe',       'Marktplatz 4, Stuttgart',     48.7784, 9.1800,
       'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', 'low',
       '{"max_discount":20,"quiet_hours":["10:00-12:00","14:00-16:00"]}'::jsonb,
       'active', now()),

      ('Bäckerei Weber', 'bakery',     'Königstraße 12, Stuttgart',   48.7786, 9.1795,
       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'low',
       '{"max_discount":15,"quiet_hours":["13:00-15:00"]}'::jsonb,
       'active', now()),

      ('Thai Kitchen',   'restaurant', 'Gerberstraße 5, Stuttgart',   48.7775, 9.1810,
       'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', 'low',
       '{"max_discount":25,"quiet_hours":["11:00-13:00"]}'::jsonb,
       'active', now()),

      ('Weinbar Schmidt','bar',        'Calwer Straße 21, Stuttgart', 48.7780, 9.1790,
       'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', 'normal',
       '{"max_discount":20,"quiet_hours":["17:00-19:00"]}'::jsonb,
       'active', now()),

      ('Süßes Eck',      'dessert',    'Schlossplatz 8, Stuttgart',   48.7788, 9.1805,
       'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 'low',
       '{"max_discount":30,"quiet_hours":["14:00-17:00"]}'::jsonb,
       'active', now());
  end if;
end $$;
