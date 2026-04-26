# supabase/migrations/

Each `.sql` file is a one-way change applied in filename order. Filenames
follow Supabase CLI convention: `YYYYMMDDHHMMSS_short_name.sql`.

## Current files

| File                          | What it does                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `..._initial_schema.sql`      | All tables: `profiles`, `merchants`, `generated_offers`, `swipes`, `redemptions`, `coupon_templates`, `coupon_template_redemptions` |
| `..._indexes.sql`             | Indexes targeted at the actual query shapes the apps run today                                     |
| `..._rls_policies.sql`        | Row-Level Security — defense between an authenticated user and someone else's data                 |
| `..._triggers.sql`            | `handle_new_user()` (auto-create profile on signup) and `set_updated_at()`                         |

## Adding a migration

```bash
# Create a new empty file with the right timestamp prefix
supabase migration new add_payment_methods

# Edit it. Then push.
supabase db push
```

## Conventions

- **Idempotent statements only.** `create table if not exists`, `drop policy if exists` before `create policy`. Re-running `db reset` should always succeed.
- **Don't edit applied migrations.** If a file has been pushed to the cloud, write a new migration to change its effects. Editing in place breaks anyone who has already applied it.
- **One concern per file.** Schema, indexes, RLS, triggers each live in their own file so diffs stay readable.
- **No data in migrations.** Reference data goes in `../seed.sql`. Backfills go in their own dated migration with a clear name.

## RLS model (quick reference)

| Table                            | Read                                          | Write                                 |
| -------------------------------- | --------------------------------------------- | ------------------------------------- |
| `profiles`                       | own                                           | own (update only — insert via trigger)|
| `merchants`                      | public                                        | owner                                 |
| `generated_offers`               | own + owning merchant                         | own                                   |
| `swipes`                         | own + owning merchant of the offer            | own                                   |
| `redemptions`                    | own + owning merchant of the offer            | own                                   |
| `coupon_templates`               | active (anyone) + owner                       | owner                                 |
| `coupon_template_redemptions`    | own + owning merchant of the template         | own                                   |

Service-role calls bypass RLS. Use it only for background jobs — never from
client code.
