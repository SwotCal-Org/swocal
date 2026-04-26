import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/db';

// React.cache() dedupes calls within a single request — layout + page can both
// call requireMerchant() and only one DB query fires.

export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

export const getMyMerchant = cache(async (): Promise<Merchant | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('merchants')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();
  return (data as Merchant | null) ?? null;
});

export async function requireMerchant(): Promise<Merchant> {
  await requireUser();
  const merchant = await getMyMerchant();
  if (!merchant || !merchant.onboarded_at) redirect('/onboarding');
  return merchant;
}
