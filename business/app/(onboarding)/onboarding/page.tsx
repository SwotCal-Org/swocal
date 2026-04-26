import { redirect } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { getMyMerchant, requireUser } from '@/lib/auth';

export default async function OnboardingPage() {
  await requireUser();
  const merchant = await getMyMerchant();
  if (merchant?.onboarded_at) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <span className="font-hand text-xl text-ink-2">getting you set up…</span>
      </header>
      <div className="px-6 pb-16">
        <OnboardingWizard
          defaults={
            merchant
              ? {
                  name: merchant.name,
                  category: merchant.category,
                  address: merchant.address ?? '',
                  lat: merchant.lat ?? undefined,
                  lng: merchant.lng ?? undefined,
                  phone: merchant.phone,
                  email: merchant.email,
                  website: merchant.website,
                  logo_url: merchant.logo_url,
                  hours: merchant.hours,
                  max_discount: merchant.rules?.max_discount ?? 20,
                  quiet_hours: merchant.rules?.quiet_hours ?? [],
                  transaction_volume: merchant.transaction_volume,
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
