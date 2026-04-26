import { supabase } from '@/lib/supabase/client';

export type UploadBucket = 'merchant-images' | 'coupon-banners' | 'avatars';

const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);

// Upload a local image (from expo-image-picker) to Supabase Storage. Returns
// the public URL. Path is `<auth.uid()>/<subpath>/<uuid>.<ext>` to satisfy
// the bucket RLS policies.
//
// Note: React Native's fetch returns a streaming Response — we convert to
// ArrayBuffer because supabase-js does not handle RN Blobs reliably.
export async function uploadImage(args: {
  bucket: UploadBucket;
  subpath: string;
  uri: string;
  mimeType?: string | null;
}): Promise<string> {
  const { bucket, subpath, uri, mimeType } = args;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('You need to be signed in to upload.');

  const ext = (uri.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
  const safeExt = ALLOWED_EXT.has(ext) ? ext : 'jpg';
  const contentType = mimeType ?? (safeExt === 'png' ? 'image/png' : safeExt === 'webp' ? 'image/webp' : 'image/jpeg');

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const path = `${user.id}/${subpath}/${crypto.randomUUID()}.${safeExt}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType, upsert: false });
  if (error) throw new Error(error.message);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function deleteImage(bucket: UploadBucket, publicUrl: string): Promise<void> {
  const marker = `/object/public/${bucket}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return;
  const path = publicUrl.slice(i + marker.length);
  await supabase.storage.from(bucket).remove([path]);
}
