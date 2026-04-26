import { redirect } from 'next/navigation';
import { getMyMerchant, getUser } from '@/lib/auth';

export default async function RootPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  const merchant = await getMyMerchant();
  if (!merchant || !merchant.onboarded_at) redirect('/onboarding');
  redirect('/dashboard');
}
