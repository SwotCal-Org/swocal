# Swocal — Mobile UI kit

Interactive recreation of the consumer mobile app described in the brief: onboarding → swipe → match → coupon. Built as a click-thru prototype, not production code.

- `index.html` — runs the demo. Tap to swipe, tap a heart to match, tap "Show coupon" to view the saved coupon, etc.
- `SwocalCard.jsx` — the canonical swipe card with photo, sticker discount, chips, headline, merchant.
- `SwocalScreens.jsx` — `ContextBar`, `BottomNav`, `OnboardingScreen`, `MatchOverlay`, `CouponScreen`.
- `ios-frame.jsx` — starter component (iOS device chrome).

The Merchant Dashboard kit isn't built yet; see top-level README.

To use any of these in a Swocal mock, copy the file + `colors_and_type.css` and load with `<script type="text/babel" src="...">`.
