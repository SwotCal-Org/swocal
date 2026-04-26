# lib/

Long-lived integrations and helpers — anything that's not a route, action,
or component.

## Subfolders

| Folder       | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `supabase/`  | Three Supabase clients: server (RSC + Server Actions), browser, middleware |
| `ai/`        | Anthropic SDK wrappers used by AI-assisted features                  |

## Top-level files

| File              | What                                                            |
| ----------------- | --------------------------------------------------------------- |
| `auth.ts`         | `getUser` / `requireUser` / `getMyMerchant` / `requireMerchant` |
| `design-tokens.ts`| Color, spacing, type tokens — mirror `Swo` from the mobile app  |

## Why three Supabase clients

Next.js mixes server, client, and middleware execution contexts. Each needs
a different cookie strategy, so `@supabase/ssr` provides:

- `server.ts` — `createSupabaseServerClient()` for RSC and Server Actions
- `client.ts` — `createSupabaseBrowserClient()` for `'use client'` components
- `middleware.ts` — `updateSession()` to refresh tokens before each request

Use the right one for the right context, otherwise auth silently fails.
