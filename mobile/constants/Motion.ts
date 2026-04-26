import { Easing, FadeIn, FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';

/**
 * Motion tokens — mirrors `Swocal Design System/preview/motion.html`
 * (--ease-bounce, --ease-snap, 140 / 220 / 420 / 600ms).
 * Prefer **snap** for layout reveals; **bounce** only for playful micro-moments.
 */
export const SwoEasing = {
  /** --ease-bounce — playful overshoot; use sparingly (can feel “jumpy” in stacks) */
  bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** --ease-snap — default UI / sheets; smooth, no spring overshoot */
  snap: Easing.bezier(0.2, 0.8, 0.2, 1),
} as const;

export const SwoDuration = {
  fast: 140,
  base: 220,
  slow: 420,
  swipe: 600,
} as const;

/** Reanimated entering() presets; all use snap easing, not springify(). */
export const SwoEnter = {
  down: (delay = 0) =>
    FadeInDown.duration(SwoDuration.slow).delay(delay).easing(SwoEasing.snap),
  downBase: (delay = 0) =>
    FadeInDown.duration(SwoDuration.base).delay(delay).easing(SwoEasing.snap),
  fade: (delay = 0) => FadeIn.duration(SwoDuration.slow).delay(delay).easing(SwoEasing.snap),
  fadeBase: (delay = 0) => FadeIn.duration(SwoDuration.base).delay(delay).easing(SwoEasing.snap),
  right: (delay = 0) => FadeInRight.duration(SwoDuration.slow).delay(delay).easing(SwoEasing.snap),
  rightBase: (delay = 0) => FadeInRight.duration(SwoDuration.base).delay(delay).easing(SwoEasing.snap),
  /** QR / hero focus — still timing-based, not spring, to avoid scale bounce */
  zoom: (delay = 0) =>
    ZoomIn.duration(SwoDuration.swipe).delay(delay).easing(SwoEasing.snap),
} as const;
