# Swocal — Swipe Local

> *Mia is cold, hungry, and has 12 minutes. She opens Swocal. The app already knows it's 11°C and overcast. It knows the café 80m away hasn't had a customer in 90 minutes. It generates — right now, just for her — "Cold outside? Your oat flat white is waiting. 15% off, next 2 hours only." She swipes right. The café fills a quiet slot. Everyone wins.*

**One sentence pitch:** Swocal is a Tinder for local commerce — real-time, context-aware offers that don't exist until the moment you need them. 

**Two sentence pitch:** The user feeds their personal preferences into the app using a Tinder like interface, swiping left and right on local businesses they may be interested in. On the other side of the app, the business owners fill the data from their business, and set conditions for coupon attribution. Based on the consumers personal preferences, on the rules set by businesses, and context data (weather, time, local events, calendar data from user, previous coupons used by user), AI automatically attributes short lived coupons to customers in order to incentivize customers to use the businesses.

Coupon rates are limited, on both sides : customers only get a set numbers of coupons a day, and businesses can set a monthly limit of coupons given out by their business.

---

## System Design

```
┌──────────────────────────┐         ┌──────────────────────────┐
│  CONSUMER  (mobile/)     │         │  MERCHANT  (business/)   │
│  Expo / React Native     │         │  Next.js 15 App Router   │
│  swipe · coupon · profile│         │  dashboard · coupons ·   │
│                          │         │  redemptions · settings  │
└────────────┬─────────────┘         └────────────┬─────────────┘
             │   anon key + user JWT              │   anon key + user JWT
             ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE EDGE                            │
│                                                                 │
│   functions/context     functions/generate-offers   functions/  │
│   (weather + time)      (rank + Claude + insert)    redeem      │
└─────────────────────────────────┬───────────────────────────────┘
                                  │  RLS-gated reads/writes
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE POSTGRES                         │
│  profiles · merchants · generated_offers · swipes ·             │
│  redemptions · coupon_templates · coupon_template_redemptions   │
│                                                                 │
│  Schema lives in supabase/migrations/ — single source of truth  │
└─────────────────────────────────────────────────────────────────┘
```

**Privacy / GDPR:** User preferences live in AsyncStorage on-device. Only an abstract `intent_vector` (e.g. `{mood: "warm_comfort", budget: "mid"}`) hits the server — no PII, no raw location.

## Repo layout

```
swocal/
├── mobile/                  Expo consumer app — swipe deck + coupons
├── business/                Next.js merchant dashboard
├── supabase/
│   ├── config.toml          Supabase CLI config (local dev ports, auth)
│   ├── seed.sql             Idempotent demo data
│   ├── migrations/          Versioned schema — apply in filename order
│   └── functions/           Deno edge functions + _shared/cors.ts
└── Swocal Design System/    Visual + verbal brand reference
```

Each folder has its own `README.md`. Start there.

## Get started

```bash
# 1. Database — link, push migrations, seed
supabase link --project-ref cwxflidwpgsqlkmcbxcn
supabase db push
supabase db reset                # local only — nukes & re-applies + seed

# 2. Mobile (consumer)
cd mobile && npm install && npm run ios

# 3. Business (merchant)
cd business && npm install && npm run dev      # http://localhost:3001
```

Env files: `mobile/.env`, `business/.env.local`. See `.env.example` files in each.

## Database flow — the rule

**Schema changes happen in `supabase/migrations/`, never in the dashboard.**
Add a new `YYYYMMDDHHMMSS_what.sql` file, push, and regenerate types:

```bash
supabase migration new add_payment_methods
# edit the new file …
supabase db push
supabase gen types typescript --project-id cwxflidwpgsqlkmcbxcn --schema public \
  > mobile/lib/supabase/types.ts
# also update business/types/db.ts by hand (see business/types/README.md)
```

RLS is the only thing standing between an authenticated user and someone
else's row. Both apps use the anon key + the user's JWT — never the service
role from client code. Policy reference: `supabase/migrations/README.md`.

---

## Supabase schema

The schema lives in [`supabase/migrations/`](./supabase/migrations/) — one
`.sql` file per concern, applied in filename order:

| File                          | Concern                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `..._initial_schema.sql`      | All tables (`profiles`, `merchants`, `generated_offers`, `swipes`, `redemptions`, `coupon_templates`, `coupon_template_redemptions`) |
| `..._indexes.sql`             | Indexes targeted at the actual query shapes                  |
| `..._rls_policies.sql`        | Row-Level Security — see policy table in `supabase/migrations/README.md` |
| `..._triggers.sql`            | `handle_new_user` (auto-create profile) + `set_updated_at`   |

Demo data: [`supabase/seed.sql`](./supabase/seed.sql) — 5 Stuttgart merchants,
idempotent (only seeds when the table is empty).

---

## 3 Screens

### Screen 1: Swipe (main)

```
┌──────────────────────────────┐
│ ☁️ 11°C Stuttgart  🕐 11:47  │  ← context bar (always visible)
├──────────────────────────────┤
│                              │
│   [merchant image]           │
│                              │
│ ┌──────────────────────────┐ │
│ │ Cold outside?            │ │  ← AI-generated headline
│ │ Your cappuccino          │ │
│ │ is waiting. ☕           │ │
│ │                          │ │
│ │  15% off  ·  200m away  │ │  ← AI-generated subline
│ │  ⏱ Next 2 hours         │ │
│ │                          │ │
│ │  [Café Mayer]            │ │
│ └──────────────────────────┘ │
│                              │
│   ✗              ♥          │  ← swipe left / right
└──────────────────────────────┘
```

Cards are pre-fetched 3 at a time; next batch generates in background. Context bar updates every 60s.

### Screen 2: Coupon (after right swipe)

```
┌──────────────────────────────┐
│  🎉 It's a match!            │
├──────────────────────────────┤
│  [merchant image]            │
│                              │
│  Cold outside?               │
│  Your cappuccino is waiting. │
│                              │
│  ┌────────────────────────┐  │
│  │  ████ QR CODE ████    │  │  ← generated from token UUID
│  └────────────────────────┘  │
│                              │
│  Show this at Café Mayer     │
│  ⏱ Expires 13:47            │
│                              │
│  Generated for: ☁️ 11°C     │
│  + Quiet afternoon           │  ← show WHY this offer exists
└──────────────────────────────┘
```

### Screen 3: Merchant Dashboard (web, Vercel)

```
┌─────────────────────────────────────────┐
│  Café Mayer — Today's Performance       │
├──────────┬──────────┬───────────────────┤
│ 24 shown │ 17 right │ 6 redeemed (35%)  │
├──────────┴──────────┴───────────────────┤
│  Your current rule:                     │
│  ┌─────────────────────────────────┐    │
│  │ Max discount:  [20%] ▼          │    │
│  │ Trigger:       Quiet hours only │    │
│  │ Category goal: Fill lunch dip   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  AI handled the rest ✓                  │
│                                         │
│  Best performing signal today:          │
│  ☁️ Weather match → 71% swipe right     │
└─────────────────────────────────────────┘
```

---

## 3 API Endpoints

### `GET /api/context`

Returns current context state. Called on app open.

```ts
// Output:
{
  weather: { condition: "overcast", temp: 11, icon: "☁️" },
  time_of_day: "lunch",           // morning|lunch|afternoon|evening
  day_type: "weekday",
  timestamp: "2026-04-25T11:47:00"
}
```

Uses OpenWeatherMap free tier. Stuttgart coords hardcoded for demo.

### `POST /api/generate-offers`

Ranking + generation. Called with user intent.

```ts
// Input:
{
  session_id: "anon-uuid",
  intent_vector: { mood: "warm_comfort", budget: "mid" },
  context: { weather: "overcast", temp: 11, time_of_day: "lunch" }
}

// Output: array of 3 generated offers
[{
  id: "uuid",
  merchant: { name: "Café Mayer", image_url: "...", distance_m: 200 },
  headline: "Cold outside? Your cappuccino is waiting. ☕",
  subline: "15% off · 200m away · Next 2 hours",
  discount_percent: 15,
  token: "uuid-token",
  expires_at: "2026-04-25T13:47:00"
}]
```

**Ranking:** `score = weather_match(0.3) + preference_match(0.4) + transaction_volume_low(0.2) + recency_novelty(0.1)` — generate for top 3 only.

**Claude prompt:**
```
Context: {weather}, {temp}°C, {time_of_day}, {day_type}
Merchant: {name}, category: {category}
Merchant rule: max {max_discount}% discount, goal: fill quiet hours
User mood: {mood}

Generate a hyper-local, emotionally resonant offer. Return JSON:
{ headline: string (max 8 words, emotional), subline: string (factual: X% off · Ym away · timing), discount_percent: number }
```

### `POST /api/redeem`

```ts
// Input: { token: "uuid-token" }
// Output: { valid: true, offer: {...}, merchant: {...} }
// Side effect: status = 'redeemed', inserts into redemptions
```

---

## Division of Labor (2 hours)

| Person | Hour 1 | Hour 2 |
|--------|--------|--------|
| **Storyteller** | Seed Supabase with 5 merchants + offer rules. Pitch deck outline. | Demo script, polish slides, rehearse 3-second UI moment |
| **Frontend** | Scaffold Expo app, navigation, onboarding (3 preference tiles) | Swipe card component (`react-native-deck-swiper`), coupon screen + QR |
| **Vibe coder** | Supabase client, `/api/context` (OpenWeatherMap), context bar component | Merchant dashboard (Vercel/Next.js), wire swipe → redemption flow |
| **Generalist** | `/api/generate-offers` (Claude API + ranking logic), Supabase schema deploy | `/api/redeem`, end-to-end wiring, make demo bulletproof |

---

## What to Fake

| Faked | How to frame it in pitch |
|-------|--------------------------|
| Payone transaction density | Pre-seeded `transaction_volume: "low"` in Supabase | "Simulated Payone feed — real integration uses webhooks" |
| User location/geofencing | Hardcode Stuttgart center coords | "Geofence triggers; using fixed demo location" |
| On-device SLM | Claude API call server-side | "Intent vector is anonymized before leaving device — GDPR compliant" |
| Push notifications | User opens app manually | "Notification layer sits here — FCM/APNs hook-in point" |
| Merchant image generation | Unsplash URL by category | "Image generation via DALL-E 3 in production" |

---

## Demo Script (5-minute flow)

1. **"Mia opens Swocal"** → Onboarding: she taps Coffee, Local food, Cozy spots
2. **Context bar appears** → ☁️ 11°C · Lunch break — call this out verbally
3. **First card loads** → Café Mayer, "Cold outside? Your cappuccino is waiting." — pause on the emotional headline
4. **Swipe right** → "It's a match!" animation → coupon screen with QR + "Generated for: ☁️ 11°C + Quiet afternoon" — *this is the magic moment*
5. **Switch to merchant view** → Show the rule editor ("max 20%, fill quiet hours") → "The AI did everything else"
6. **Close with numbers** → 17/24 swipe right = 71% acceptance vs 2-3% for traditional push coupons

**The line:** *"The offer doesn't exist until Mia needs it. The merchant set one rule. The AI did the rest."*

---

## Tech Stack

- **Mobile:** Expo + React Native
- **Backend/API:** Vercel Edge Functions
- **Database:** Supabase (Postgres)
- **AI:** Claude API (Anthropic)
- **Weather:** OpenWeatherMap free tier
- **Merchant dashboard:** Next.js on Vercel

### Bootstrap commands

```bash
# Mobile app
npx create-expo-app swocal --template tabs
cd swocal
npx expo install react-native-deck-swiper react-native-qrcode-svg @supabase/supabase-js expo-location

# Merchant dashboard
npx create-next-app merchant-dashboard --ts --app --tailwind
```


### Design

Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/Ki7xdTOZu5Eoup2ZnY0epA
Implement: the designs in this project

Assets:

https://claude.ai/design/p/71b41ff4-7c42-466a-9319-513a3d864376?via=share
