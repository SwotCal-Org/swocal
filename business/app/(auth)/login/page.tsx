import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect('/');
  return <LoginForm />;
}
