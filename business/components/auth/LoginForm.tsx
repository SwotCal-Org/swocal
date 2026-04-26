'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { Input } from '@/components/ui/Input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="swo-card flex flex-col gap-5 p-8">
      <div>
        <h2 className="font-display text-3xl">Welcome back</h2>
        <p className="mt-1 text-sm text-ink-2">Sign in to manage your shop.</p>
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormError message={error} />
      <Button type="submit" loading={loading} size="lg">
        Sign in
      </Button>
      <p className="text-center text-sm text-ink-2">
        New to Swocal?{' '}
        <Link href="/signup" className="font-semibold text-coral underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
