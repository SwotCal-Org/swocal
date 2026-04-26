# types/

Hand-written TypeScript types shared across the app.

## Files

| File     | What                                                                  |
| -------- | --------------------------------------------------------------------- |
| `db.ts`  | DB row shapes (Merchant, CouponTemplate, etc.) and JSON value shapes  |

## Why hand-written instead of codegen

Schema changes here are rare and explicit. A hand-written file keeps the
business app self-contained, makes the type surface easy to scan, and avoids
the codegen toolchain in CI.

**Trade-off:** when you change `../supabase/migrations/`, also update
`db.ts`. Otherwise a runtime field will silently disagree with the type.
