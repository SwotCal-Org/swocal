import { supabase } from '@/lib/supabase/client';
import type { RedeemResponse } from '@/types/api';

export async function redeemToken(token: string): Promise<RedeemResponse> {
  const { data, error } = await supabase.functions.invoke<RedeemResponse>('redeem', {
    body: { token },
  });
  if (error) throw error;
  if (!data) throw new Error('empty redeem response');
  return data;
}
