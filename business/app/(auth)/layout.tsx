import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full bg-cream">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="mb-12">
          <Logo />
        </header>
        <div className="grid flex-1 gap-12 lg:grid-cols-2 lg:items-center">
          <section className="hidden lg:block">
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight">
              Run your <span className="text-coral">local</span> magic.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-2">
              Onboard your shop, set your rules, and design coupons your neighbors will actually
              swipe right on.
            </p>
            <div className="mt-10 flex gap-3">
              <span className="rounded-full border-2 border-ink bg-mustard px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Onboard in minutes
              </span>
              <span className="rounded-full border-2 border-ink bg-mint-soft px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Conditions you control
              </span>
            </div>
          </section>
          <section className="w-full max-w-md justify-self-center lg:justify-self-end">{children}</section>
        </div>
      </div>
    </main>
  );
}
