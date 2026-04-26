# types/

Shared TypeScript types not derived from the DB schema.

## Files

| File      | What                                                          |
| --------- | ------------------------------------------------------------- |
| `api.ts`  | Edge function request/response shapes. Mirrors what `services/` returns. |

## When to put a type here

- It's used by more than one file
- It describes a contract with the server (request body, response envelope)
- It's a discriminated union the UI needs to switch on

## When NOT to

- It's local to one component → keep it next to that component
- It's purely a DB row → import from `@/lib/supabase/types` instead
