# Swocal Graphs (Stack, Architecture, Implementation)

Use these directly in your presentation where Mermaid is supported.

## 1) Tech Stack Graph

```mermaid
flowchart LR
  subgraph Mobile["Mobile App"]
    M1["Expo"]
    M2["React Native + TypeScript"]
    M3["expo-router"]
    M4["Supabase JS Client"]
    M5["AsyncStorage Session Persistence"]
  end

  subgraph Backend["Backend"]
    B1["Supabase Edge Functions (Deno)"]
    B2["context"]
    B3["generate-offers"]
    B4["redeem"]
  end

  subgraph Data["Data Layer"]
    D1["Supabase Auth"]
    D2["Supabase Postgres"]
  end

  subgraph Integrations["Optional External Services"]
    X1["OpenWeather API"]
    X2["Anthropic Claude API"]
  end

  M1 --> M2 --> M3 --> M4 --> D1
  M4 --> B1
  B1 --> B2
  B1 --> B3
  B1 --> B4
  B2 --> X1
  B3 --> X2
  B2 --> D2
  B3 --> D2
  B4 --> D2
```

## 2) Runtime Architecture Graph

```mermaid
flowchart TB
  U["User"]
  A["Expo Mobile App"]
  G["Route Guard + AuthProvider"]
  S["Service Layer (context.ts / offers.ts / redeem.ts)"]
  C["Edge Function: context"]
  O["Edge Function: generate-offers"]
  R["Edge Function: redeem"]
  DB[("Supabase Postgres")]
  AU["Supabase Auth"]
  W["OpenWeather (fallback to mock)"]
  L["Claude (fallback to template)"]

  U --> A
  A --> G
  G --> AU
  A --> S
  S --> C
  S --> O
  S --> R
  C --> W
  O --> L
  C --> DB
  O --> DB
  R --> DB
```

## 3) Implementation Graph (What Exists in Repo)

```mermaid
flowchart LR
  subgraph App["mobile/app"]
    A1["(auth)/login + signup routes"]
    A2["(tabs)/index (swipe)"]
    A3["(tabs)/coupons"]
    A4["(tabs)/profile"]
    A5["(auth)/_layout.tsx\nStack header hidden"]
    A6["root _layout.tsx\nRouteGuard + providers"]
  end

  subgraph Services["mobile/services"]
    S1["fetchContext()"]
    S2["generateOffers()"]
    S3["recordSwipe()"]
    S4["listMyOffers()"]
    S5["redeemToken()"]
  end

  subgraph Functions["supabase/functions"]
    F1["context"]
    F2["generate-offers"]
    F3["redeem"]
  end

  subgraph Tables["Supabase tables used by code"]
    T1["merchants"]
    T2["generated_offers"]
    T3["swipes"]
    T4["redemptions"]
    T5["auth.users"]
  end

  A1 --> A5 --> A6
  A2 --> S2
  A2 --> S3
  A3 --> S4
  A3 --> S5
  S1 --> F1
  S2 --> F2
  S5 --> F3
  F2 --> T1
  F2 --> T2
  S3 --> T3
  F3 --> T2
  F3 --> T4
  A6 --> T5
```
