# mobile/

Consumer Expo / React Native app. Users swipe on AI-generated, hyper-local
offer cards.

```bash
npm install
npm run ios       # or: android, web
```

## Layout

```
mobile/
├── app/            Expo Router routes — file-based routing
│   ├── (auth)/     Public screens: login, signup
│   └── (tabs)/     Authed screens: swipe (index), coupons, profile
├── components/     Reusable React components
│   └── ui/         Headless-style primitives: Button, Chip, Input
├── constants/      Design tokens (Swo, Spacing, Radius, Shadow, Type)
├── lib/            Long-lived integrations
│   └── supabase/   Client + generated DB types
├── providers/      React Context providers (Auth)
├── services/       The data-flow boundary — every server call lives here
└── types/          Shared TypeScript types (API contracts)
```

## Path alias

`@/*` resolves from the `mobile/` root. Always import as
`@/components/swocal-card` rather than relative paths.

## Env

Copy `../.env.example` to `mobile/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

The `EXPO_PUBLIC_` prefix is required — anything else is stripped from the
client bundle by Expo.

## Design system

Colors, type, spacing, shadows live in `constants/Colors.ts` and mirror
`../Swocal Design System/colors_and_type.css` (the canonical reference).
The app is single-theme warm cream — no dark mode by design.
