import { CouponRulesForm } from '@/components/coupons/CouponRulesForm';
import { requireMerchant } from '@/lib/auth';

export default async function CouponsPage() {
  const merchant = await requireMerchant();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-4xl">Coupons</h1>
        <p className="mt-1 text-ink-2">
          You don't write coupons here — the AI does. Tell it when and how to give them out, and it
          handles the rest.
        </p>
      </header>
      <CouponRulesForm initial={merchant.coupon_ai_rules ?? {}} />
    </div>
  );
}
