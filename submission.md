# Hack Nation Submission Draft

## Project Title *
Swocal — Swipe Local, Context-Aware Offers for Communities

## Event *
5th-hack-nation - Deadline: Apr 26, 9:00 AM ET (Opens at 5:00 PM CET)

## Challenge *
Generative City-Wallet (Agentic AI & Data Engineering)

## Program Type (Auto-filled) *
VC Big Bets

## Short Description *
Swocal is a mobile app that generates short-lived, context-aware local offers in real time. Users swipe through nearby merchant cards, while AI creates emotionally resonant but constrained offer copy based on weather, time-of-day, and merchant rules, then issues redeemable tokens.

## Structured Project Description

### 1. Problem & Challenge *
Local businesses struggle to fill quiet hours and attract nearby customers without resorting to generic, mass-blast promotions that feel irrelevant and get ignored. Traditional push coupons average a 2–3% acceptance rate, wasting marketing budgets and annoying users. Meanwhile, consumers are surrounded by local shops they'd genuinely enjoy but never discover because there's no timely, contextual nudge to walk in. The gap is not one of proximity — it's one of relevance and timing. We aim 

### 2. Target Audience *
Primary users are city consumers looking for spontaneous nearby food/drink offers and local merchants (cafes, bakeries, restaurants, bars, dessert shops) that need better conversion during low-traffic periods. The solution is especially relevant for dense urban areas where proximity and timing strongly influence purchase decisions.
This solution is aimed at:
- **Consumers:** Urban dwellers (primarily 18–35) during daily routines — lunch breaks, commutes, casual walks — who are open to local experiences but need a frictionless, low-effort discovery mechanism, and rely on nudges and offers to take the leap
- **Merchants:** Small-to-medium local businesses (cafés, bakeries, restaurants, bars, dessert shops) looking to fill off-peak slots and attract footfall without hiring a marketing team or running complex campaigns.


### 3. Solution & Core Features *
Swocal is a dual-sided platform with a mobile consumer app and a web merchant dashboard.

**Consumer side (Expo / React Native):**
- Onboarding via a Tinder-style preference interface (swipe on local businesses near you) to build a personal preference profile and discover local shops
- A coupon system that nudges them, offering short-lived contextual based offers to spend, grounded in context data such as weather date, time, location, local events, as well as the personal profile of the consumer and the choice of the business owner to share coupons.

**Merchant side (Next.js dashboard on Vercel):**
- Simple rule editor: set max discount %, trigger conditions (quiet hours), and monthly coupon amount
- Text input to set complex rules for the coupon attribution : 
- Real-time stats: offers shown, swipe-right rate, redemptions
- AI handles all offer copywriting and targeting automatically
- Authentification of the coupons for redemption at the store

### 4. Unique Selling Proposition (USP) *
> *"The offer doesn't exist until the moment the customer needs it. The merchant set one rule. The AI did the rest."*
Swocal’s key differentiator is “offer generation at the moment of intent,” not static coupon publishing. Offers are contextual, short-lived, and constrained by merchant-side economics, combining:
- personal preferences of users, ensuring the coupons are most likely to drive customers for businesses
- real-time context signals (weather/time/day),
- merchant operating constraints (discount caps, quiet-hour logic),
- authenticated redemption and token lifecycle,

### 5. Implementation & Technology *
Implementation is a TypeScript-first stack:
- Mobile: Expo + React Native + `expo-router`.
- Backend/API: Supabase Edge Functions (Deno runtime).
- Database/Auth: Supabase Postgres + Supabase Auth.
- AI generation: Open Router (Open AI).
- Context signal source: OpenWeather API (optional key; deterministic fallback if missing).
- Client-service communication: `supabase.functions.invoke(...)` and typed API contracts.
- Session persistence: AsyncStorage-backed Supabase client on mobile.

### 6. Results & Impact *
The project delivers a functional end-to-end prototype that demonstrates:
- **Privacy-respecting by design:** no user PII leaves the device, making the product GDPR-compliant from day one
- **Mutual value creation:** merchants fill dead time slots with zero creative effort; consumers get genuinely useful, time-sensitive local deals
- **Merchant empowerment:** even the least tech-savvy café owner can configure the system in under 2 minutes with one rule editor screen, and can get access to analytics about their business.
- **Privacy-respecting by design:** no user PII leaves the device, making the product GDPR-compliant from day one

Value created:
- For merchants: more precise demand stimulation during low-volume windows and other conditions chosen by themselves
- For users: relevant, nearby offers instead of generic coupon spam.
- For platform economics: measurable interaction and redemption events to optimize future ranking/generation strategies.

## Additional Information (Optional)

Technical note: the system is designed to degrade gracefully. If OpenWeather or Anthropic keys are unavailable, context and offer generation still function via deterministic fallback logic, which improves demo reliability and operational robustness.

## Live Project URL (optional)
TBD Just the dashboard.

## GitHub Repository URL *
https://github.com/SwotCal-Org/swocal/edit/main/submission.md

## Technologies/Tags
- Expo
- React Native
- TypeScript
- Supabase
- Supabase Edge Functions
- PostgreSQL
- Anthropic Claude API
- OpenWeather API
- Mobile App
- Agentic AI
- Context-Aware Personalization

## Additional Tags
- Local Commerce
- Dynamic Coupons
- Token Redemption
- Real-Time Offers
- Urban Discovery
