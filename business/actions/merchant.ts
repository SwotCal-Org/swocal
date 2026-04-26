'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser, requireMerchant } from '@/lib/auth';

const dayHoursSchema = z
  .object({ open: z.string().regex(/^\d{2}:\d{2}$/), close: z.string().regex(/^\d{2}:\d{2}$/) })
  .nullable();

const weatherEnum = z.enum(['clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist', 'drizzle']);
const timeOfDayEnum = z.enum(['morning', 'lunch', 'afternoon', 'evening']);

export const couponRulesSchema = z.object({
  prompt: z.string().max(2000).optional(),
  monthly_cap: z.number().int().min(0).max(2000).optional(),
  weather_required: z.array(weatherEnum).optional(),
  weather_blocklist: z.array(weatherEnum).optional(),
  temp_min_c: z.number().int().min(-30).max(50).optional(),
  temp_max_c: z.number().int().min(-30).max(50).optional(),
  time_of_day: z.array(timeOfDayEnum).optional(),
  only_when_quiet: z.boolean().optional(),
});

export type CouponRulesInput = z.infer<typeof couponRulesSchema>;

const onboardingSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.string().min(2),
  address: z.string().min(2),
  lat: z.number().refine((n) => !Number.isNaN(n)),
  lng: z.number().refine((n) => !Number.isNaN(n)),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  hours: z.record(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']), dayHoursSchema),
  max_discount: z.number().int().min(5).max(50),
  quiet_hours: z.array(z.string()),
  transaction_volume: z.enum(['low', 'normal', 'high']),
  about: z.string().max(2000).optional().nullable(),
  products: z.array(z.string().min(1).max(120)).max(50).optional(),
  gallery: z.array(z.string().url()).max(20).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(input: OnboardingInput) {
  const user = await requireUser();
  const parsed = onboardingSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('merchants')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  const payload = {
    owner_id: user.id,
    name: parsed.name,
    category: parsed.category,
    address: parsed.address,
    lat: parsed.lat,
    lng: parsed.lng,
    phone: parsed.phone ?? null,
    email: parsed.email ?? null,
    website: parsed.website ?? null,
    logo_url: parsed.logo_url ?? null,
    hours: parsed.hours,
    transaction_volume: parsed.transaction_volume,
    rules: { max_discount: parsed.max_discount, quiet_hours: parsed.quiet_hours },
    about: parsed.about ?? null,
    products: parsed.products ?? [],
    gallery: parsed.gallery ?? [],
    status: 'active' as const,
    onboarded_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from('merchants').update(payload).eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('merchants').insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/');
  redirect('/dashboard');
}

const profileSchema = onboardingSchema.partial();

export async function updateMerchantProfile(input: Partial<OnboardingInput>) {
  const merchant = await requireMerchant();
  const parsed = profileSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = { ...parsed };
  if (parsed.max_discount !== undefined || parsed.quiet_hours !== undefined) {
    updates.rules = {
      ...merchant.rules,
      ...(parsed.max_discount !== undefined ? { max_discount: parsed.max_discount } : {}),
      ...(parsed.quiet_hours !== undefined ? { quiet_hours: parsed.quiet_hours } : {}),
    };
    delete updates.max_discount;
    delete updates.quiet_hours;
  }

  const { error } = await supabase.from('merchants').update(updates).eq('id', merchant.id);
  if (error) throw new Error(error.message);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function updateCouponRules(input: CouponRulesInput) {
  const merchant = await requireMerchant();
  const parsed = couponRulesSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('merchants')
    .update({ coupon_ai_rules: parsed })
    .eq('id', merchant.id);
  if (error) throw new Error(error.message);
  revalidatePath('/coupons');
  revalidatePath('/dashboard');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
