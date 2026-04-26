'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'merchant' },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace('/onboarding');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="swo-card flex flex-col gap-5 p-8">
      <div>
        <h2 className="font-display text-3xl">Get your shop online</h2>
        <p className="mt-1 text-sm text-ink-2">A free Swocal account, takes a minute.</p>
      </div>
      <Input
        label="Your name"
        name="full_name"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
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
        autoComplete="new-password"
        minLength={8}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint="At least 8 characters."
      />
      {error && (
        <div className="rounded-r3 border-2 border-danger bg-coral-soft px-3 py-2 text-sm text-ink">
          {error}
        </div>
      )}
      <Button type="submit" loading={loading} size="lg">
        Create account
      </Button>
      <p className="text-center text-sm text-ink-2">
        Already have one?{' '}
        <Link href="/login" className="font-semibold text-coral underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
