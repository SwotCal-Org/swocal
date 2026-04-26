-- =============================================================================
-- 20260426120500_storage
-- Three public buckets with RLS that constrains writes to the user's own
-- folder. Path convention: <auth.uid()>/<subpath>/<uuid>.<ext>
--
-- Public buckets serve files via /storage/v1/object/public/<bucket>/<path>
-- without auth — that read path bypasses RLS by design. The policies below
-- still cover the PostgREST surface and explicitly forbid writes to anyone
-- else's folder.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('merchant-images', 'merchant-images', true, 5242880,
    array['image/jpeg','image/png','image/webp']),
  ('coupon-banners',  'coupon-banners',  true, 5242880,
    array['image/jpeg','image/png','image/webp']),
  ('avatars',         'avatars',         true, 2097152,
    array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── merchant-images ─────────────────────────────────────────────────────────
drop policy if exists "merchant-images read public" on storage.objects;
drop policy if exists "merchant-images write owner" on storage.objects;
drop policy if exists "merchant-images update owner" on storage.objects;
drop policy if exists "merchant-images delete owner" on storage.objects;

create policy "merchant-images read public"
  on storage.objects for select
  using (bucket_id = 'merchant-images');

create policy "merchant-images write owner"
  on storage.objects for insert
  with check (
    bucket_id = 'merchant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "merchant-images update owner"
  on storage.objects for update
  using (
    bucket_id = 'merchant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "merchant-images delete owner"
  on storage.objects for delete
  using (
    bucket_id = 'merchant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── coupon-banners ──────────────────────────────────────────────────────────
drop policy if exists "coupon-banners read public" on storage.objects;
drop policy if exists "coupon-banners write owner" on storage.objects;
drop policy if exists "coupon-banners update owner" on storage.objects;
drop policy if exists "coupon-banners delete owner" on storage.objects;

create policy "coupon-banners read public"
  on storage.objects for select
  using (bucket_id = 'coupon-banners');

create policy "coupon-banners write owner"
  on storage.objects for insert
  with check (
    bucket_id = 'coupon-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "coupon-banners update owner"
  on storage.objects for update
  using (
    bucket_id = 'coupon-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "coupon-banners delete owner"
  on storage.objects for delete
  using (
    bucket_id = 'coupon-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── avatars ─────────────────────────────────────────────────────────────────
drop policy if exists "avatars read public" on storage.objects;
drop policy if exists "avatars write owner" on storage.objects;
drop policy if exists "avatars update owner" on storage.objects;
drop policy if exists "avatars delete owner" on storage.objects;

create policy "avatars read public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars write owner"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars update owner"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars delete owner"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
