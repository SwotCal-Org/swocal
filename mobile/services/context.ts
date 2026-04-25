import { supabase } from '@/lib/supabase/client';
import type { ContextResponse } from '@/types/api';

export async function fetchContext(): Promise<ContextResponse> {
  const { data, error } = await supabase.functions.invoke<ContextResponse>('context', {
    method: 'GET',
  });
  if (error) throw error;
  if (!data) throw new Error('empty context response');
  return data;
}
