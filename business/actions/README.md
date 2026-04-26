# actions/

Next.js Server Actions — mutations invoked from client components via the
`'use server'` boundary.

## Files

| File           | Exports                                                                |
| -------------- | ---------------------------------------------------------------------- |
| `merchant.ts`  | `completeOnboarding()`, `updateMerchantProfile()`, `signOut()`         |
| `coupons.ts`   | `createCoupon()`, `updateCoupon()`, `setCouponStatus()`, `deleteCoupon()` |

## Conventions

- Every action starts with `requireUser()` or `requireMerchant()` from
  `@/lib/auth` — never trust the client.
- Validate input with Zod before touching the DB. The schema doubles as the
  TypeScript type via `z.infer`.
- `revalidatePath()` after a mutation so the next render sees fresh data.
- Mutations that change the user's location should `redirect()` instead of
  returning — the action runs server-side.
- DB-level RLS is the safety net: even if an action forgot a check, the
  policies in `../supabase/migrations/*_rls_policies.sql` would still block.
