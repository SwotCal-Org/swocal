# Hack Nation Submission Draft

## Project Title *
Swocal — Swipe Local, Context-Aware Offers for Nearby Merchants

## Event *
5th-hack-nation - Deadline: Apr 26, 9:00 AM ET (Opens at 5:00 PM CET)

## Challenge *
Earn in the Agent Economy (Agentic AI & Data Engineering)

## Program Type (Auto-filled) *
VC Big Bets

## Short Description *
Swocal is a mobile app that generates short-lived, context-aware local offers in real time. Users swipe through nearby merchant cards, while AI creates emotionally resonant but constrained offer copy based on weather, time-of-day, and merchant rules, then issues redeemable tokens.

## Structured Project Description

### 1. Problem & Challenge *
Local merchants struggle to fill quiet time slots, and traditional coupons are generic, badly timed, and easy to ignore. Users also do not want spammy promotions that are irrelevant to their current context. The core challenge is creating offers that are both timely for consumers and economically sensible for merchants.

### 2. Target Audience *
Primary users are city consumers looking for spontaneous nearby food/drink offers and local merchants (cafes, bakeries, restaurants, bars, dessert shops) that need better conversion during low-traffic periods. The solution is especially relevant for dense urban areas where proximity and timing strongly influence purchase decisions.

### 3. Solution & Core Features *
Swocal provides a swipe-based mobile UX for discovering local offers and a backend that generates offers at request time:
- Supabase Auth-based sign-in/sign-up and protected in-app routing.
- Context retrieval via Edge Function (`context`) using weather + time/day signals.
- Offer generation via Edge Function (`generate-offers`) that ranks merchants, applies merchant rule constraints (such as max discount), and produces structured offer text using Claude (with template fallback).
- Swipe tracking (`swipes`) for interaction analytics.
- Token-based redemption via Edge Function (`redeem`) with ownership, expiry, and status validation, plus redemption logging.

### 4. Unique Selling Proposition (USP) *
Swocal’s key differentiator is “offer generation at the moment of intent,” not static coupon publishing. Offers are contextual, short-lived, and constrained by merchant-side economics, combining:
- real-time context signals (weather/time/day),
- merchant operating constraints (discount caps, quiet-hour logic),
- authenticated redemption and token lifecycle,
- graceful AI fallback path when external AI services are unavailable.

### 5. Implementation & Technology *
Implementation is a TypeScript-first stack:
- Mobile: Expo + React Native + `expo-router`.
- Backend/API: Supabase Edge Functions (Deno runtime).
- Database/Auth: Supabase Postgres + Supabase Auth.
- AI generation: Anthropic Claude API with JSON-schema style structured output contract and fallback templates.
- Context signal source: OpenWeather API (optional key; deterministic fallback if missing).
- Client-service communication: `supabase.functions.invoke(...)` and typed API contracts.
- Session persistence: AsyncStorage-backed Supabase client on mobile.

### 6. Results & Impact *
The project delivers a functional end-to-end prototype that demonstrates:
- authenticated user flow,
- context acquisition,
- top-merchant ranking + offer generation,
- persistence of generated offers,
- swipe event capture,
- secure redemption flow with state transitions (`active` -> `redeemed`) and audit trail insertion.

Value created:
- For merchants: more precise demand stimulation during low-volume windows.
- For users: relevant, nearby offers instead of generic coupon spam.
- For platform economics: measurable interaction and redemption events to optimize future ranking/generation strategies.

## Additional Information (Optional)
This repository currently focuses on the mobile app and Supabase backend functions. Merchant dashboard functionality is referenced conceptually in project materials but is not implemented in this codebase snapshot.  

Technical note: the system is designed to degrade gracefully. If OpenWeather or Anthropic keys are unavailable, context and offer generation still function via deterministic fallback logic, which improves demo reliability and operational robustness.

## Live Project URL (optional)
TBD

## GitHub Repository URL *
https://github.com/<your-username>/swocal

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
