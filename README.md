# Swocal — Swipe Local

> *Mia is cold, hungry, and has 12 minutes. She opens Swocal. The app already knows it's 11°C and overcast. It knows the café 80m away hasn't had a customer in 90 minutes. It generates — right now, just for her — "Cold outside? Your oat flat white is waiting. 15% off, next 2 hours only." She swipes right. The café fills a quiet slot. Everyone wins.*

**One sentence pitch:** Swocal is a Tinder for local commerce — real-time, context-aware offers that don't exist until the moment you need them. 

**Two sentence pitch:** The user feeds their personal preferences into the app using a Tinder like interface, swiping left and right on local businesses they may be interested in. On the other side of the app, the business owners fill the data from their business, and set conditions for coupon attribution. Based on the consumers personal preferences, on the rules set by businesses, and context data (weather, time, local events, calendar data from user, previous coupons used by user), AI automatically attributes short lived coupons to customers in order to incentivize customers to use the businesses.

Coupon rates are limited, on both sides : customers only get a set numbers of coupons a day, and businesses can set a monthly limit of coupons given out by their business.

Customers are given coupons in the form of QR code : those are time limited, usable in only one location, and are scanned and authentified by the business owner from their side of the app.

---

## System Design

```
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICE (Expo)                   │
│  Preferences (stored locally, never leave device)       │
│  ↓  anonymous intent vector only                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              EDGE LAYER (Vercel Edge Functions)         │
│                                                         │
│  /api/context      /api/rank       /api/generate-offer  │
│  ┌─────────────┐   ┌────────────┐  ┌─────────────────┐  │
│  │ OpenWeather │   │  Scoring   │  │   Claude API    │  │
│  │ Time/Day    │   │  Function  │  │   (structured   │  │
│  │ Simulated   │   │            │  │    output)      │  │
│  │ Payone feed │   │            │  │                 │  │
│  └─────────────┘   └────────────┘  └─────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    SUPABASE                             │
│  merchants │ offers │ generated_offers │ swipes         │
│  users     │ redemptions                               │
└─────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              MERCHANT DASHBOARD (Vercel/Next.js)        │
│  Swipe stats │ Offer rule editor │ Redemptions          │
└─────────────────────────────────────────────────────────┘
```

**Privacy / GDPR:** User preferences live in AsyncStorage on-device. Only an abstract `intent_vector` (e.g. `{mood: "warm_comfort", budget: "mid"}`) hits the server — no PII, no raw location.

---

## Supabase Schema

```sql
create table merchants (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text,                      -- "cafe" | "bakery" | "restaurant"
  address text,
  lat float, lng float,
  image_url text,                     -- Unsplash URL by category
  transaction_volume text default 'normal', -- "low"|"normal"|"high" (simulated Payone)
  rules jsonb                         -- {"max_discount": 20, "quiet_hours": ["10-12","14-16"]}
);

create table generated_offers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  user_session text,
  headline text,                      -- "Cold outside? Your cappuccino is waiting."
  subline text,                       -- "15% off · 200m away · Next 2 hours"
  discount_percent int,
  context_signals jsonb,              -- {"weather":"overcast","temp":11,"time":"lunch"}
  token text unique default gen_random_uuid()::text,
  status text default 'active',       -- active | redeemed | expired
  expires_at timestamptz default now() + interval '2 hours',
  created_at timestamptz default now()
);

create table swipes (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references generated_offers(id),
  direction text,                     -- "left" | "right"
  session_id text,
  created_at timestamptz default now()
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references generated_offers(id),
  redeemed_at timestamptz default now()
);
```

### Seed Data

```sql
insert into merchants (name, category, address, lat, lng, image_url, transaction_volume, rules) values
('Café Mayer', 'cafe', 'Marktplatz 4, Stuttgart', 48.7784, 9.1800, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', 'low', '{"max_discount": 20, "quiet_hours": ["10:00-12:00","14:00-16:00"]}'),
('Bäckerei Weber', 'bakery', 'Königstraße 12, Stuttgart', 48.7786, 9.1795, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'low', '{"max_discount": 15, "quiet_hours": ["13:00-15:00"]}'),
('Thai Kitchen', 'restaurant', 'Gerberstraße 5, Stuttgart', 48.7775, 9.1810, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', 'low', '{"max_discount": 25, "quiet_hours": ["11:00-13:00"]}'),
('Weinbar Schmidt', 'bar', 'Calwer Straße 21, Stuttgart', 48.7780, 9.1790, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', 'normal', '{"max_discount": 20, "quiet_hours": ["17:00-19:00"]}'),
('Süßes Eck', 'dessert', 'Schlossplatz 8, Stuttgart', 48.7788, 9.1805, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 'low', '{"max_discount": 30, "quiet_hours": ["14:00-17:00"]}');
```

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
