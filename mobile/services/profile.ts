import { supabase } from '@/lib/supabase/client';

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  intent_vector: Record<string, unknown>;
};

/** True when the user has saved preferences (consumer onboarding in Swipe). */
export function isProfileOnboarded(intentVector: unknown): boolean {
  if (!intentVector || typeof intentVector !== 'object' || Array.isArray(intentVector)) return false;
  return Object.keys(intentVector as Record<string, unknown>).length > 0;
}

// Fetch the current user's profile row. Returns null if signed-out.
export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, intent_vector')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateMyAvatar(avatarUrl: string | null): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);
  if (error) throw error;
}
