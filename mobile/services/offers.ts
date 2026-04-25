import { supabase } from '@/lib/supabase/client';
import type { ContextResponse, GenerateOffersResponse, IntentVector, SwipeDirection } from '@/types/api';

export async function generateOffers(
  intent: IntentVector,
  context?: Pick<ContextResponse, 'weather' | 'time_of_day' | 'day_type'>
): Promise<GenerateOffersResponse> {
  const { data, error } = await supabase.functions.invoke<GenerateOffersResponse>('generate-offers', {
    body: { intent_vector: intent, context },
  });
  if (error) throw error;
  if (!data) throw new Error('empty offers response');
  return data;
}

export async function recordSwipe(args: { offerId: string; direction: SwipeDirection; userId: string }) {
  const { error } = await supabase
    .from('swipes')
    .insert({ offer_id: args.offerId, direction: args.direction, user_id: args.userId });
  if (error) throw error;
}

export async function listMyOffers() {
  const { data, error } = await supabase
    .from('generated_offers')
    .select('id, token, headline, subline, discount_percent, status, expires_at, merchant:merchants ( id, name, category, image_url )')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
