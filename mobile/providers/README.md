# providers/

React Context providers. Each provider wraps the tree in `app/_layout.tsx`
and exposes a `useX()` hook for consumers.

## Files

| File                | Provides                                                      |
| ------------------- | ------------------------------------------------------------- |
| `AuthProvider.tsx`  | `useAuth()` → `{ session, user, loading, signIn, signUp, signOut }` |

## Auth state model

`AuthProvider` subscribes to `supabase.auth.onAuthStateChange` once and re-
publishes through context. The session is restored from AsyncStorage on app
boot, so auth survives cold starts.

`useAuth().loading` is `true` until the initial session resolution finishes —
the route guard in `app/_layout.tsx` shows a spinner during that window.
