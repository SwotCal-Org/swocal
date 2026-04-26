# services/

**The data-flow boundary.** Every server call lives here. Screens import from
`services/` — never from `@/lib/supabase/client` directly.

Why: keeps screens declarative, makes the surface that talks to Supabase
auditable in one place, and lets us swap implementations (cache layer, retry,
logging) without touching UI.

## Files

| File         | Functions                                          | Backend                       |
| ------------ | -------------------------------------------------- | ----------------------------- |
| `context.ts` | `fetchContext()`                                   | edge function `context`       |
| `offers.ts`  | `generateOffers()`, `recordSwipe()`, `listMyOffers()` | edge function + Postgres   |
| `redeem.ts`  | `redeemToken()`                                    | edge function `redeem`        |

## Conventions

- One function = one server interaction. Don't compose calls in the same
  function — let the screen orchestrate.
- Always return typed data (see `@/types/api.ts`). Errors throw.
- No React in here. No hooks. Pure async functions.

## Example

```tsx
// app/(tabs)/index.tsx
import { generateOffers } from '@/services/offers';

const offers = await generateOffers({ mood: 'warm_comfort' });
```
