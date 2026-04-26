# components/

React components grouped by domain — not by type.

## Folders

| Folder         | What lives here                                                   |
| -------------- | ----------------------------------------------------------------- |
| `auth/`        | LoginForm, SignupForm                                             |
| `coupons/`     | CouponForm, CouponCard, ConditionsEditor                          |
| `layout/`      | Sidebar (and any future shell chrome)                             |
| `onboarding/`  | OnboardingWizard, SettingsForm                                    |
| `chat/`        | AI assistant components (in progress)                             |
| `ui/`          | Headless primitives — Button, Card, Chip, Input, Select, Stepper, Switch, Textarea, Logo |

## Conventions

- Server-rendered by default. Add `'use client'` only when you need browser
  state, refs, or event handlers.
- Mutations call Server Actions from `@/actions/*` — never invoke Supabase
  from a client component directly.
- Style with the tokens in `@/lib/design-tokens` (mirrors the mobile app's
  `Swo` palette so both surfaces feel like one product).
