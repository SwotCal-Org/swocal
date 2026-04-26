'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { signOut } from '@/actions/merchant';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '◐' },
  { href: '/coupons', label: 'Coupons', icon: '◇' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
] as const;

export function Sidebar({ merchantName }: { merchantName: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col self-start overflow-y-auto border-r border-border-soft bg-paper px-5 py-6">
      <Link href="/dashboard" className="mb-8 inline-block">
        <Logo />
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-r3 px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-mustard-soft text-ink' : 'text-ink-2 hover:bg-cream-deep',
              ].join(' ')}
            >
              <span aria-hidden className="text-base">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border-soft pt-4">
        <p className="text-xs uppercase tracking-wider text-ink-3">Signed in as</p>
        <p className="mt-1 truncate font-display text-base text-ink">{merchantName}</p>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="text-xs font-semibold text-coral underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
