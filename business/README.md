# business/

Merchant dashboard — Next.js 15 App Router. Shop owners sign in here to
onboard, write coupon templates, and watch redemptions.

```bash
npm install
npm run dev      # → http://localhost:3001
```

## Layout

```
business/
├── app/                Next.js routes (App Router)
│   ├── (auth)/         Public — login, signup
│   ├── (onboarding)/   First-run merchant setup wizard
│   ├── (app)/          Authed — dashboard, coupons, redemptions, settings
│   └── api/            Route handlers (server endpoints)
├── actions/            Server Actions — mutations called from client forms
├── components/         React components grouped by domain (auth, coupons, layout, onboarding, ui)
├── lib/
│   ├── supabase/       SSR / browser / middleware clients
│   └── ai/             Anthropic SDK wrappers
├── types/              Hand-written DB types (db.ts) and shared types
└── middleware.ts       Refreshes Supabase session cookies on every request
```

## Auth flow

1. `middleware.ts` runs `updateSession()` on every request — keeps the
   Supabase session cookie fresh.
2. Server components call `requireUser()` / `requireMerchant()` from
   `@/lib/auth` to gate access. They redirect on miss.
3. Server Actions (`actions/`) re-resolve the user from cookies before
   touching the DB.

## Env

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

## Schema source of truth

DB shape lives in `../supabase/migrations/`. The hand-written types in
`types/db.ts` mirror that schema — keep them in sync when migrations change.
