# Swocal Design System

> **Swocal — Swipe Local.** Tinder for the businesses around you. Match with the café 80m away that just dropped a quiet-hour offer made for your mood, the weather, and the next 12 minutes of your life.

This folder is the source of truth for Swocal's visual + verbal brand. Designers, product folks, and AI agents working on Swocal mocks should read `README.md` first, then pull from `colors_and_type.css`, the `assets/` folder, and the `ui_kits/` recreations.

---

## Sources

| Source | Location | Notes |
|---|---|---|
| Product brief | `SwotCal-Org/swotcal` (GitHub, private) → `README.md` | The only file in the repo at time of writing. Pitch + system design + Supabase schema + 3 demo screens + API spec. |
| User-provided notes | "Playful color palette… connected to your community… discover it" | Drives the warm/sticker direction below. |

> ⚠️ **No design source-of-truth code yet.** The repo currently has only a written brief — no React Native components, no theme tokens, no Figma file. Everything in this design system is a **fresh interpretation** of the brief by the design team. When the Expo app gets built, port these tokens into it (don't re-derive from screenshots).

---

## What is Swocal?

A two-sided product:

1. **Mobile app (consumer)** — Expo / React Native. You set 3 preferences. The app sees the weather, time, and which nearby merchants are quiet. Every card you swipe is an offer that didn't exist 30 seconds ago — generated for *this* moment.
2. **Merchant dashboard (web)** — Next.js. The shop owner sets one rule ("max 20% discount, fill quiet hours"). The AI does everything else. They see swipe stats and redemptions.

Hyper-local. Stuttgart for the demo. Privacy-first — preferences live on-device; only an abstract `intent_vector` ever hits the server.

The emotional core: **"the offer doesn't exist until you need it."** Cold day → warm coffee. Empty afternoon → cake at half price. The AI is invisible; what you feel is a neighborhood that knows you.

---

## Index — what's in this folder

```
Swocal Design System/
├── README.md                  ← you are here
├── SKILL.md                   ← agent skill manifest
├── colors_and_type.css        ← CSS variables (color, type, spacing, motion, shadow, radius)
├── fonts/                     ← Google Fonts links (Fraunces, DM Sans, Caveat — see Type)
├── assets/
│   ├── logo/                  ← wordmarks + app icon
│   ├── stickers/              ← decorative SVG stickers (sun, cloud, heart, sparkle, location pin)
│   └── photos/                ← Unsplash placeholders for merchant categories
├── preview/                   ← cards rendered in the Design System tab
│   ├── colors-*.html
│   ├── type-*.html
│   ├── spacing.html, radii.html, shadows.html, motion.html
│   ├── components-*.html
│   └── brand-*.html
├── ui_kits/
│   └── mobile-app/            ← Expo / RN-style swipe app recreation
│       ├── README.md
│       ├── index.html         ← interactive click-thru demo
│       └── *.jsx              ← components
└── (slides/)                  ← not generated — no slide template was provided
```

---

## Content fundamentals

Voice is the single most important thing in Swocal. Without warm, specific, sensory copy the whole product collapses into "another deals app." Read every line out loud — if it sounds like a marketing email, rewrite it.

### Tone in three words
**Warm. Sensory. Particular.**

### Voice principles

1. **Talk to one person, on one street, in one moment.** Not "users." Not "customers." Not even "you all." Just *you*, right now, slightly cold, mildly hungry, twelve minutes free.
2. **Lead with the feeling, follow with the fact.** The headline says *why this is for you*. The subline says *what / where / how long*.
   - ✅ "Cold outside? Your cappuccino is waiting." → `15% off · 200m away · Next 2 hours`
   - ❌ "Get 15% off cappuccinos at Café Mayer between 12 and 14."
3. **Sensory verbs. Concrete nouns.** *Toasted, dripping, melt, simmer, fold, sweat, bloom.* Avoid: *enjoy, experience, discover, unlock, explore.*
4. **Specific over generic.** "Oat flat white" not "coffee." "Marktplatz 4" not "city center." "12 minutes" not "soon."
5. **Show the why.** When an offer is generated, surface the signals that made it: `Generated for: ☁️ 11°C + Quiet afternoon`. Trust comes from transparency, not magic.
6. **Never beg.** No "Don't miss out!", no countdown panic, no "Last chance!". The offer is a gift, not a trap.

### Person, casing, punctuation

- **First person:** "you" (the consumer) or "your shop" (the merchant). Never "we" except in legal/system messages ("We saved your preferences.").
- **Casing:** **Sentence case everywhere.** Headlines, buttons, nav, settings. The only Title Case is proper nouns (Café Mayer, Stuttgart, Tuesday). No ALL CAPS except micro-labels (`NEW`, `MATCH`, `2H LEFT`) — these read as physical stickers/stamps.
- **Punctuation:** Em-dashes for asides. Periods on body sentences. **No periods on standalone headlines or buttons.** Question marks are gold — they invite the swipe ("Cold outside?" beats "It's cold.")
- **Numbers:** Numerals always (`15% off`, `2 hours`, `200m`). Use `m` for meters, `min` for minutes, `°C` for temp. Use German address format with a comma: "Marktplatz 4, Stuttgart".

### Emoji policy

**Yes, sparingly, and only as iconographic shorthand for context.** Emoji are part of the brand because the app deals in *moments* and emoji compress a moment to one glyph.

| Use | Don't use |
|---|---|
| ☁️ ☀️ 🌧 🌙 — weather in the context bar | 🚀 💯 🔥 — hype emoji |
| ☕ 🥐 🍷 🍰 🍜 — category shorthand on cards | 😀 😍 🥰 — face emoji |
| ⏱ ❤️ ✨ — micro-affordances | 👇 👈 👉 — directional emoji |

Rule: **at most one emoji per line.** Emoji never replace a noun in a body sentence; they sit at the end of a headline ("Your cappuccino is waiting. ☕") or as standalone glyphs in chips/context bars.

### Voice examples — copy palette

| Surface | Copy |
|---|---|
| App icon tagline | Swipe local |
| Onboarding prompt | What sounds good today? |
| Pref tile labels | Coffee · Local food · Cozy spots · Quick bites · Sweet stuff · Wine bar |
| Empty state, no nearby offers | Nothing close to you right now. Try again in 20 minutes — the lunch crowd is about to thin out. |
| Match screen header | It's a match |
| Match screen subhead | Show this at Café Mayer before 13:47 |
| Why-this-offer chip | Generated for ☁️ 11°C · Quiet afternoon |
| Swipe-left ghost label | Not for now |
| Swipe-right ghost label | Yes please |
| Merchant dashboard hero | Café Mayer · Today |
| Merchant rule editor | Set one rule. The AI does the rest. |
| Merchant insight | Best signal today: ☁️ Weather match → 71% swipe right |
| Push notification (production) | A bakery 90m away just put out fresh croissants. ⏱ Next hour. |
| Error state | That coupon already got used — at 12:41, by you. ☕ |

### Words to use / avoid

- **Use:** local, around you, around the corner, quiet, fresh, just-baked, tonight, before, until, swipe, match, made for, generated for, because.
- **Avoid:** *deal, discount, save, savings, members, exclusive, premium, redeem now, claim now, offer, voucher* (the noun "offer" is fine in product/code; in user-facing copy prefer "this" or the headline itself), *unlock, drop, hot, hot deal, blowout, AI-powered, smart, intelligent.*

---

## Visual foundations

Swocal looks like a printed neighborhood zine that learned to swipe. Warm cream paper, chunky serif headlines, thick black ink, sticker accents in coral/mustard/mint. Photography is real, food-forward, slightly grainy. Nothing is pristine.

### The five visual motifs

1. **Warm paper, never white.** Default page is `--swo-cream` (#FBF5EA). Cards lift to `--swo-paper` (#FFFEFB). Shadows are warm brown, never blue-black.
2. **Sticker shadow.** A 3px hard offset shadow in espresso-brown (`--sh-sticker`) on chips, badges, the match stamp — like printed stickers slapped on the page. Used sparingly: chips, the "MATCH" stamp, the redeemed seal.
3. **Chunky serif + clean grotesque.** Fraunces (display) does the emotional headlines. DM Sans (body) keeps everything else legible. Caveat (handwritten) appears once or twice — a chalkboard-style note from the merchant ("today's special").
4. **Real photography, slightly oversaturated, slightly grainy.** Merchant cards lean into food/place imagery. Black-and-white is allowed for deliberate moments (closed shops, "missed it" states); never the default.
5. **Coral as the one true accent.** The swipe-right CTA, the heart, the active tab, the redeem button — all coral. Mustard is for context (sun, weather, time chips). Mint is reserved for confirmed/redeemed/match states. Plum + sky are evening/weather flavor only.

### Color (full reference in `colors_and_type.css`)

| Role | Token | Hex | Use |
|---|---|---|---|
| Primary | `--swo-coral` | `#FF6A4D` | Swipe-right, CTAs, heart, match stamp |
| Primary press | `--swo-coral-deep` | `#E04A2E` | Hover/press for coral |
| Primary tint | `--swo-coral-soft` | `#FFD9CD` | Coral chip background, like-toast tint |
| Secondary | `--swo-mustard` | `#F5B945` | Sun/weather/time-of-day, "fresh" tags |
| Success | `--swo-mint` | `#4CB6A0` | Redeemed seal, confirmation, "saved" |
| Evening | `--swo-plum` | `#5B3F8C` | Bars, nightlife, evening context |
| Weather | `--swo-sky` | `#6BB6E3` | Cold/overcast accents |
| Page bg | `--swo-cream` | `#FBF5EA` | Default canvas |
| Card bg | `--swo-paper` | `#FFFEFB` | Elevated surface |
| Ink | `--swo-ink` | `#2A1F1A` | Primary type — espresso, never #000 |
| Ink-2 | `--swo-ink-2` | `#5C4A3F` | Secondary type |
| Danger | `--swo-danger` | `#D14B3C` | Swipe-left/dismiss only — almost never used as a fill |

### Typography

Three families. Always Google Fonts; no licensed type.

- **Fraunces** (display) — variable serif with adjustable optical size. Used at 24–96px for emotional headlines and merchant names. Set `font-variation-settings: "opsz" 144` at large sizes for the soft-shouldered, slightly chunky feel.
- **DM Sans** (body) — geometric grotesque, 14–18px. Buttons, body, UI labels. Weight 400 default; 500–600 for emphasis.
- **Caveat** (hand) — used for small accents only: today's-special chalk notes, the occasional sticker scribble. Never as body type.

Type scale tokens (`--t-*`) live in `colors_and_type.css`. The display sizes go from 28px (h1) up to 72px (display-xl); body goes 12 → 16 → 18.

### Spacing & layout

- **4px grid.** All spacing tokens (`--s-1` through `--s-10`) are 4×N.
- **Cozy density.** Card interiors lean toward `--s-5`/`--s-6` (20/24px) — warm, not minimal. Lists are 56–72px tall (touch-friendly).
- **Mobile-first.** Mobile app is designed at 390×844 (iPhone 14). Web dashboard at 1280×800.
- **One-thumb rule.** All primary actions sit in the lower 60% of the mobile screen. The match modal's CTA is bottom-pinned.

### Backgrounds

- **Default:** flat warm cream (`--swo-cream`).
- **Section variation:** alternate between cream and `--swo-shell` (#F7ECD9). Never gradients between them.
- **Hero/match:** soft radial wash from coral-soft → cream-deep. Subtle. Never full-saturation gradients.
- **No textures by default.** Optional 2% grain overlay (`background-image: url(grain.png)`) on hero surfaces only.
- **No patterns.** No dot grids, no chevrons, no waves. The visual interest comes from photos + stickers, not background flourish.

### Borders & strokes

- **Default border:** 1px `--border-soft` (#E8DCC6) — barely visible.
- **Sticker border:** 2–3px solid `--swo-ink` (espresso) — only on chips, the match stamp, and "today's special" labels.
- **Inputs:** 1.5px `--border` at rest, 2px `--swo-coral` on focus.
- **No double borders, no dashed by default.** Dashed is reserved for "drag here" empty states.

### Corner radii

- Buttons & inputs: `--r-3` (12px).
- Default cards: `--r-4` (18px).
- Swipe cards & match modals: `--r-5` (24px) — generous, almost playful.
- Hero / onboarding panels: `--r-6` (32px).
- Pills & chips: `--r-pill`.

The system **never** uses square corners. Even sharp "cut sticker" stickers have a 1–2px chamfer.

### Shadow system (`--sh-*`)

Four soft elevations + a dedicated **sticker shadow** (`--sh-sticker`, hard 3×4px offset, espresso color). Soft shadows for elevation, sticker shadow for printed-feel chips/stamps.

```
--sh-1   subtle lift           (default cards on the feed)
--sh-2   floating              (modal headers, raised buttons)
--sh-3   modal / sheet         (the match overlay, sheets)
--sh-4   above-everything      (toast, the active swipe card)
--sh-sticker / -soft           printed-sticker offset, on chips & badges
--sh-inner                     1px highlight + 1px bottom shade for warm cards
```

Never `box-shadow: 0 0 ... rgba(0,0,0,...)`. Always brown-tinted (rgba(70, 40, 20, …)).

### Motion

Swipe is a tactile product. Motion is **bouncy, kinetic, physical** — never glassy or ghostly.

- **Default ease:** `--ease-bounce` (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for buttons, modal entries, sticker reveals.
- **Snap ease:** `--ease-snap` for sheets/drawers.
- **Durations:** 140 / 220 / 420 / 600ms (fast → swipe).
- **Hover (web):** scale to `1.02`, no color shift. Bigger, not different.
- **Press:** scale to `0.96`. Always `--ease-bounce`.
- **Swipe card:** card travels +/-300px on the X axis with a 12° rotation in `--dur-swipe` on `--ease-bounce`. Next card lifts from below with a 0.95 → 1 scale and 8px Y translate.
- **Match moment:** the "MATCH" sticker spins in from -45° rotation to 0°, scale 0 → 1.1 → 1, sequenced over 600ms.
- **No fades alone.** Always pair fade with a small scale or translate. A pure opacity transition feels lifeless — wrong product.
- **No infinite loops.** No bouncing arrows, no spinning sun. Animations resolve.

### Hover, press, focus

| State | Treatment |
|---|---|
| Hover (web) | scale(1.02) + slightly stronger shadow (e.g. --sh-1 → --sh-2). Color does NOT change. |
| Press / active | scale(0.96), shadow drops to --sh-1, optional 4% darker fill on coral via `--swo-coral-deep`. |
| Focus | 2px outline, color = `--swo-coral` at 60% opacity, 3px outline-offset. Never the default browser blue. |
| Disabled | opacity 0.45, no shadow, cursor not-allowed. Never grey-fill. |
| Swipe-left ghost | 12° tilt, 60% opacity, no fill change. |
| Swipe-right ghost | 12° tilt, coral chip "Yes please" appears top-right of the card. |

### Transparency & blur

- **Glass blur is RARE.** Only used on:
  1. The mobile context bar (`backdrop-filter: blur(12px)` over photo headers).
  2. The bottom tab bar on the swipe screen (same).
- **No translucent modals.** Modals are solid `--swo-paper`.
- **No frosted everything.** This is a paper product, not a glass one.

### Layout rules — fixed elements

- **Mobile context bar** (top, 56px, blur on photo screens, solid cream on others): always visible. Shows weather + time + city.
- **Mobile bottom nav**: 4 tabs — Swipe / Coupons / Map / You. Always visible except in the match modal and the onboarding flow.
- **Match modal**: full-screen sheet from the bottom, dragdown to dismiss.
- **Merchant dashboard sidebar**: 240px fixed left, contains brand mark + 5 nav items.

### Imagery

- **Real food, real places.** Unsplash for the demo (per the brief). Production hires local photographers per Stuttgart.
- **Color vibe:** warm. Magic-hour, indoor lamp light, never cold fluorescent. Slightly grainy is fine and encouraged.
- **Crop:** food fills 70–80% of the frame. No empty plates, no empty rooms.
- **Avoid:** stock-y staged smiling people, computer-generated-looking food, drone shots of empty streets, isometric illustration.

### Cards — the canonical Swocal card

```
[ photo, fills 60% of card height, top-rounded to match card radius ]
[ category chip · time chip · distance chip ]    ← horizontal sticker chips
[ headline                                  ]    ← Fraunces 28–32px
[ subline                                   ]    ← DM Sans 14px, fg-2
[ merchant name + tiny location pin · address — DM Sans 14, fg-3 ]
```

- Background: `--swo-paper`. Border: 1px `--border-soft`. Radius: `--r-5`.
- Shadow at rest: `--sh-2`. Active swipe: `--sh-4`.
- Internal padding: `--s-5` (20px) on horizontal, `--s-4` (16px) vertical.
- Photo has a 2px inner cream border to "lift" it from the card.
- The **sticker shadow** is reserved for the chips inside the card, not the card itself.

---

## Iconography

Swocal mixes three icon vocabularies:

1. **Lucide icons (CDN)** — for utility/UI icons. 24×24, 1.75px stroke, rounded line caps. Coral for active, ink-2 for default. Tabs, settings, navigation, form affordances. We picked Lucide because the rounded, friendly stroke matches DM Sans's roundness; it's also CDN-loadable so any prototype can hot-link it.

   ```html
   <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
   ```

   ⚠️ **Substitution flagged:** the codebase doesn't ship its own icon set yet. Lucide is our chosen substitute. When the Expo app picks an icon library (likely `lucide-react-native` or Phosphor), update this and `assets/`.

2. **Custom SVG stickers** (`assets/stickers/`) — printed-sticker-style decorative glyphs: sun, cloud, raindrop, heart, sparkle, location pin, chef's hat, croissant, coffee cup. 2.5–3px stroke, filled, with a 3px hard offset shadow when used on cards. These are *not* utility icons — they're branding moments, used at 24–48px in chips and on the match modal.

3. **Emoji** — see Content Fundamentals. Used as a 4th iconographic layer for **moment** signaling (weather, food category) on cards and chips. Never replaces a Lucide icon.

| Usage | Icon system |
|---|---|
| Tab bar, settings, "edit", "back", "search" | Lucide |
| Heart on swipe, location pin on cards, sun/cloud/sparkle stickers | Custom SVG sticker |
| Weather glyph in context bar; food category on cards | Emoji |
| App icon, wordmark | Custom (in `assets/logo/`) |

**Unicode-as-icon:** allowed sparingly — `·` for inline separators ("15% off · 200m away · Next 2 hours"), `→` for "next", `⏱` (⏱ U+23F1) for time chips. Never use ASCII art.

**Strict no:** Material Icons (too neutral), Font Awesome (too generic), Heroicons (too thin/cold), iconjar custom hand-drawn except in the sticker set.

---

## What's missing / known gaps

- **No font files copied locally.** All three faces (Fraunces, DM Sans, Caveat) load from Google Fonts via `@import` in `colors_and_type.css`. If you need offline assets, run them through google-webfonts-helper and drop `.woff2` files in `fonts/`. **Flagged for the user — confirm Google Fonts loading is acceptable; if you want self-hosted fonts shipped, ask and I'll vendor them.**
- **No real photography.** All merchant imagery in mocks uses Unsplash placeholders, per the original brief.
- **No slide template.** The brief mentions a pitch deck outline but didn't supply one — `slides/` is intentionally empty. If you want deck templates, ask.
- **Merchant dashboard UI kit** is not built yet — only the mobile app kit. Dashboard is documented in the README with a mock; it can be added on request.
- **No production icon set picked yet.** Lucide is our pick for prototyping; the Expo app may want `@expo/vector-icons` (Feather) or Phosphor — re-flag this once chosen.

---

## See also

- `SKILL.md` — how an agent should use this skill.
- `colors_and_type.css` — paste-ready CSS variables.
- `ui_kits/mobile-app/` — interactive recreation of the swipe / match / coupon flow.
- `preview/` — design-system tab cards.
