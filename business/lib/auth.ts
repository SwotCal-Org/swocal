import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/db';

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

// Resolve the merchant row owned by the current user, if any. Used by route
// guards to decide between onboarding and dashboard.
export async function getMyMerchant(): Promise<Merchant | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from('merchants')
    .select('*')
    .eq('owner_id', userData.user.id)
    .maybeSingle();
  return (data as Merchant | null) ?? null;
}

export async function requireMerchant(): Promise<Merchant> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.onboarded_at) redirect('/onboarding');
  return data as Merchant;
}
