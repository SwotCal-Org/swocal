# app/

Next.js App Router routes. Folder names with `(parens)` are route groups —
they affect layouts and auth gating but not the URL.

## Groups

| Group           | URL prefix | Gate                                                        |
| --------------- | ---------- | ----------------------------------------------------------- |
| `(auth)/`       | none       | Public — `/login`, `/signup`. Redirects authed users to `/dashboard`. |
| `(onboarding)/` | none       | Authed but no merchant row yet — `/onboarding`              |
| `(app)/`        | none       | Authed + onboarded merchant — `/dashboard`, `/coupons`, `/redemptions`, `/settings` |
| `api/`          | `/api`     | Route handlers (REST endpoints, webhooks)                   |

## Auth model

`requireMerchant()` in each `(app)/` page server-resolves the merchant from
cookies and redirects to `/onboarding` if `onboarded_at` is null. The
middleware (`../middleware.ts`) keeps the session cookie fresh.
