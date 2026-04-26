# app/

Expo Router routes. The directory tree IS the navigation tree — every `.tsx`
file becomes a route, every `_layout.tsx` wraps its siblings.

## Groups

| Folder      | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| `(auth)/`   | Public — `/login`, `/signup`. Parens = group, not URL segment.   |
| `(tabs)/`   | Authed bottom-tab navigator: Swipe / Coupons / You.              |

## Auth gate

`_layout.tsx` wraps the whole app in `<RouteGuard>`, which redirects:

- unauthenticated users out of `(tabs)/` → `/(auth)/login`
- authenticated users out of `(auth)/` → `/(tabs)`

So a screen file under `(tabs)/` can assume `useAuth().user` is non-null.

## Adding a route

```tsx
// app/(tabs)/settings.tsx
export default function SettingsScreen() { ... }
```

Then register it in `app/(tabs)/_layout.tsx` if it should appear in the tab bar.
