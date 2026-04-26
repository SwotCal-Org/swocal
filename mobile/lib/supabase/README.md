# lib/supabase/

The Supabase client and its DB types.

## Files

| File         | Notes                                                              |
| ------------ | ------------------------------------------------------------------ |
| `client.ts`  | Singleton client. Uses AsyncStorage for session, anon key for auth. |
| `types.ts`   | Generated from the cloud schema. **Don't edit by hand.**           |

## Regenerating types

After applying a migration, refresh the types so the client knows about the
new shape:

```bash
supabase gen types typescript \
  --project-id cwxflidwpgsqlkmcbxcn \
  --schema public \
  > mobile/lib/supabase/types.ts
```

## Importing

```ts
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
```

But really, screens should import from `@/services/*` instead of using the
client directly. See `../../services/README.md`.
