import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { getUser } from '@/lib/auth';

export default async function SignupPage() {
  const user = await getUser();
  if (user) redirect('/');
  return <SignupForm />;
}
