# constants/

Design tokens — the single source of truth for colors, spacing, type, radius,
and shadow used across the app.

## Files

| File         | Exports                                                          |
| ------------ | ---------------------------------------------------------------- |
| `Colors.ts`  | `Swo`, `Brand`, `Spacing`, `Radius`, `Shadow`, `Type`            |

## Tokens

- **`Swo`** — palette. Mustard primary, coral secondary, mint success, plum
  evening, sky weather, warm cream surfaces, espresso ink. Mirrors
  `../../Swocal Design System/colors_and_type.css`.
- **`Spacing`** — 4-pt scale `s1`..`s10`.
- **`Radius`** — `r1` (4) … `r6` (32) and `pill`.
- **`Shadow`** — warm-brown tinted, never blue-black. Includes `sticker`
  (hard offset shadow) for the printed-sticker look.
- **`Type`** — font-family names matching the loaded Google Fonts.

## Rule

Never hard-code a hex, font, spacing pixel, or radius in app code. If a token
is missing, add it here first.
