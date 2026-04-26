# supabase/

Single source of truth for everything that lives in the cloud DB and the
edge runtime. Both the consumer mobile app and the merchant business app talk
to this Supabase project.

## Layout

```
supabase/
├── config.toml         CLI config — local dev ports, function JWT settings
├── seed.sql            Idempotent demo data (5 Stuttgart merchants)
├── migrations/         Versioned schema changes — apply in filename order
└── functions/          Deno edge functions (context, generate-offers, redeem)
```

## Workflow

```bash
# Link this folder to the cloud project (one-time per machine)
supabase link --project-ref cwxflidwpgsqlkmcbxcn

# Push pending migrations to the cloud DB
supabase db push

# Wipe and rebuild local DB from migrations + seed (local dev only)
supabase db reset

# Deploy a function
supabase functions deploy generate-offers
```

## The rule

**Schema changes happen here, not in the dashboard.** Add a new
`YYYYMMDDHHMMSS_what.sql` file to `migrations/` and run `supabase db push`.
If you edit the cloud schema by hand, the next person resetting their local
DB gets a different shape and silent breakage follows.
