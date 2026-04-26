import { SettingsForm } from '@/components/onboarding/SettingsForm';
import { requireMerchant } from '@/lib/auth';

export default async function SettingsPage() {
  const merchant = await requireMerchant();
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-4xl">Settings</h1>
        <p className="mt-1 text-ink-2">Edit your business profile, hours, and offer policies.</p>
      </header>
      <SettingsForm merchant={merchant} />
    </div>
  );
}
