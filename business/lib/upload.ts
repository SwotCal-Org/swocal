import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type UploadBucket = 'merchant-images' | 'coupon-banners' | 'avatars';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

// Upload one image to Storage and return its public URL.
// Path is always `<auth.uid()>/<subpath>/<uuid>.<ext>` so the bucket RLS
// policies allow only the file's owner to write.
export async function uploadImage(
  bucket: UploadBucket,
  file: File,
  subpath: string,
): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Use a JPEG, PNG, or WebP image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Image is too large. Max ${Math.round(MAX_BYTES / 1024 / 1024)}MB.`);
  }

  const supabase = createSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('You need to be signed in to upload.');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${user.id}/${subpath}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// Best-effort delete. The URL must come from getPublicUrl on the same bucket.
export async function deleteImage(bucket: UploadBucket, publicUrl: string): Promise<void> {
  const marker = `/object/public/${bucket}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return;
  const path = publicUrl.slice(i + marker.length);
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(bucket).remove([path]);
}
