import { Sidebar } from '@/components/layout/Sidebar';
import { requireMerchant } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const merchant = await requireMerchant();
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar merchantName={merchant.name} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
