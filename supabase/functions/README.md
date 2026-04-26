# supabase/functions/

Deno-based HTTP edge functions. Each subfolder is one function; `_shared/`
holds code imported across functions (CORS + JSON helpers).

## Functions

| Function          | Method | Auth        | Purpose                                                                  |
| ----------------- | ------ | ----------- | ------------------------------------------------------------------------ |
| `context`         | GET    | none        | Returns weather + time-of-day. Called on app open before signin.         |
| `generate-offers` | POST   | user JWT    | Ranks merchants, calls Claude (or template fallback), inserts offers.    |
| `redeem`          | POST   | user JWT    | Looks up an offer by token, marks redeemed, writes a redemption row.     |

JWT enforcement is configured per-function in `../config.toml`.

## Auth model

Functions create the Supabase client with the **anon key + the caller's JWT**
(never the service role). Every read/write therefore runs through RLS — the
function cannot read another user's data even by mistake.

```ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
});
```

## Shared helpers (`_shared/cors.ts`)

```ts
import { jsonResponse, preflight } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  return jsonResponse({ ok: true });
});
```

## Environment variables

Set per-environment in the Supabase dashboard (or `supabase secrets set` for
the cloud, `.env.local` for the CLI):

| Variable                    | Used by             |
| --------------------------- | ------------------- |
| `SUPABASE_URL`              | all                 |
| `SUPABASE_ANON_KEY`         | all                 |
| `OPENWEATHER_API_KEY`       | `context` (optional — falls back to mock) |
| `ANTHROPIC_API_KEY`         | `generate-offers` (optional — falls back to template copy) |

## Deploy

```bash
supabase functions deploy context
supabase functions deploy generate-offers
supabase functions deploy redeem
```
