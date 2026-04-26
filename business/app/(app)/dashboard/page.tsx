import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireMerchant } from '@/lib/auth';

type RedemptionRow = { user_id: string | null; amount_cents: number | null };

export default async function DashboardPage() {
  const merchant = await requireMerchant();
  const supabase = await createSupabaseServerClient();

  // The dashboard tells the owner the value Swocal is generating *for them*:
  //   1. customers driven  — distinct people who used a Swocal coupon at this shop
  //   2. sales driven      — total $ those redemptions represent
  //   3. coupons given out — how many coupons the AI has issued for this shop
  //
  // We pull from two tables because Swocal has two coupon shapes:
  //   * AI-issued one-shot offers (generated_offers + redemptions)
  //   * Static coupon templates   (coupon_template_redemptions, legacy)
  // Both contribute to "customers driven" and "sales driven".

  const [templateRedemptionsRes, offerRedemptionsRes, offersGivenRes] = await Promise.all([
    supabase
      .from('coupon_template_redemptions')
      .select('user_id, amount_cents, coupon_templates!inner(merchant_id)')
      .eq('coupon_templates.merchant_id', merchant.id),
    supabase
      .from('redemptions')
      .select('user_id, generated_offers!inner(merchant_id, discount_percent)')
      .eq('generated_offers.merchant_id', merchant.id),
    supabase
      .from('generated_offers')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id),
  ]);

  const templateRows = (templateRedemptionsRes.data ?? []) as RedemptionRow[];
  const offerRows = (offerRedemptionsRes.data ?? []) as Array<{ user_id: string | null }>;

  const distinctUsers = new Set<string>();
  for (const r of templateRows) if (r.user_id) distinctUsers.add(r.user_id);
  for (const r of offerRows) if (r.user_id) distinctUsers.add(r.user_id);

  // Sales driven = sum of recorded amounts on coupon redemptions. AI-offer
  // redemptions don't carry a $ amount in the schema yet, so they only count
  // toward customer reach, not revenue.
  const salesCents = templateRows.reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);

  const couponsGivenOut = offersGivenRes.count ?? 0;
  const customersDriven = distinctUsers.size;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm uppercase tracking-wider text-ink-3">Dashboard</p>
        <h1 className="font-display text-4xl">
          Hi, {merchant.name.split(' ')[0]} <span className="font-hand text-coral">·</span>
        </h1>
        <p className="mt-1 text-ink-2">Here's what Swocal coupons did for you so far.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Customers driven" value={formatInt(customersDriven)} tone="mint" />
        <Stat label="Sales driven" value={formatMoney(salesCents)} tone="mustard" />
        <Stat label="Coupons given out" value={formatInt(couponsGivenOut)} tone="coral" />
      </div>

      <Card padding="lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl">Tune how coupons get given out</h2>
            <p className="mt-1 text-ink-2">
              Coupons are issued by AI. You set the rules — when, how often, on what conditions.
            </p>
          </div>
          <Link href="/coupons">
            <Button size="lg">Edit coupon rules →</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'mint' | 'mustard' | 'coral';
}) {
  const bg = { mint: 'bg-mint-soft', mustard: 'bg-mustard-soft', coral: 'bg-coral-soft' }[tone];
  return (
    <div className="swo-card overflow-hidden p-6">
      <div
        className={`mb-3 inline-block rounded-full border-2 border-ink ${bg} px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider`}
      >
        {label}
      </div>
      <div className="font-display text-5xl text-ink">{value}</div>
    </div>
  );
}

function formatInt(n: number) {
  return n.toLocaleString('en-US');
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
