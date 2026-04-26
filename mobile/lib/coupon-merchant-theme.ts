import { createContext, useContext } from 'react';

import { Swo } from '@/constants/Colors';

export type CouponPalette = 'default' | 'coffee';

const CouponThemeContext = createContext<CouponPalette>('default');
CouponThemeContext.displayName = 'CouponThemeContext';

export const CouponThemeProvider = CouponThemeContext.Provider;

export function useCouponPalette(): CouponPalette {
  return useContext(CouponThemeContext);
}

const COFFEE = {
  mocha: '#7A4D32',
  mochaLight: '#9B6B4A',
  mochaSoft: '#D4B5A0',
  mochaDeep: '#4E2E1F',
  creamWarm: '#F0E6DA',
  paperWarm: '#FAF4EC',
  terracotta: '#9B5A3D',
  accentMocha: '#6B4D3A',
  bar: '#5C4030',
} as const;

/**
 * Picks a visual palette from merchant category so the screen matches the offer
 * (e.g. warm browns for coffee / café).
 */
export function couponPaletteForOffer(offer: { merchant?: { category?: string } | null } | null): CouponPalette {
  const raw = offer?.merchant?.category ?? '';
  const c = raw.toLowerCase();
  if (!c) return 'default';
  if (c.includes('internet') || c.includes('cyber')) return 'default';
  if (
    /\b(café|cafe|coffee|espresso|roastery|roaster|roasters|barista|latte|cappuccino|mocha|americano|frapp|flat white)\b/.test(
      c
    ) ||
    /\bcoffee\b/.test(c)
  ) {
    return 'coffee';
  }
  return 'default';
}

export function atmosphereForPalette(p: CouponPalette, dark: boolean) {
  if (p === 'default') {
    return {
      sunnyTint: 'rgba(255,196,100,0.18)',
      skyline: dark ? 'rgba(255,255,255,0.35)' : 'rgba(42,31,26,0.25)',
      cityMask: dark ? Swo.ink : Swo.cream,
      sun: dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,196,100,0.35)',
    };
  }
  return {
    sunnyTint: 'rgba(180, 130, 90, 0.22)',
    skyline: dark ? 'rgba(255,255,255,0.32)' : 'rgba(90, 58, 42, 0.3)',
    cityMask: dark ? Swo.ink : COFFEE.creamWarm,
    sun: dark ? 'rgba(220, 180, 140, 0.28)' : 'rgba(200, 140, 95, 0.38)',
  };
}

export function morningSkinColors(p: CouponPalette) {
  if (p === 'default') {
    return {
      safeBg: Swo.creamDeep,
      backTint: Swo.mustardSoft,
      eyebrow: Swo.coralDeep,
      handNote: Swo.coralDeep,
      personalLine: Swo.coralDeep,
      chip: { backgroundColor: Swo.mustard, borderColor: Swo.ink } as const,
    };
  }
  return {
    safeBg: COFFEE.creamWarm,
    backTint: COFFEE.mochaSoft,
    eyebrow: COFFEE.terracotta,
    handNote: COFFEE.terracotta,
    personalLine: COFFEE.terracotta,
    chip: { backgroundColor: COFFEE.mochaLight, borderColor: COFFEE.mochaDeep } as const,
  };
}

export function noonSkinColors(p: CouponPalette) {
  if (p === 'default') {
    return {
      hero: Swo.mustard,
      back: Swo.mustard,
      heroLabel: Swo.mustardDeep,
      localHint: Swo.mustardDeep,
      dot: Swo.mustard,
      paperBg: Swo.paper,
      handNote: Swo.coralDeep,
    };
  }
  return {
    hero: COFFEE.mocha,
    back: COFFEE.mochaLight,
    heroLabel: COFFEE.creamWarm,
    localHint: COFFEE.mochaSoft,
    dot: COFFEE.mochaLight,
    paperBg: COFFEE.paperWarm,
    handNote: COFFEE.terracotta,
  };
}

export function goldenSkinColors(p: CouponPalette) {
  if (p === 'default') {
    return {
      safeBg: Swo.cream,
      backTint: Swo.skySoft,
      bar: Swo.sky,
      eyebrow: Swo.sky,
      momentWeather: Swo.sky,
      discountLabel: Swo.sky,
    };
  }
  return {
    safeBg: COFFEE.creamWarm,
    backTint: COFFEE.mochaSoft,
    bar: COFFEE.accentMocha,
    eyebrow: COFFEE.mochaLight,
    momentWeather: COFFEE.mochaLight,
    discountLabel: COFFEE.terracotta,
  };
}

export function duskSkinColors(p: CouponPalette) {
  if (p === 'default') {
    return { stars: Swo.mustard, badgeNum: Swo.mustard, backTint: Swo.ink2, eyebrow: Swo.coralDeep };
  }
  return {
    stars: COFFEE.mochaLight,
    badgeNum: COFFEE.mochaLight,
    backTint: COFFEE.bar,
    eyebrow: COFFEE.terracotta,
  };
}

export function heroPillHighlight(p: CouponPalette) {
  return p === 'coffee' ? { backgroundColor: COFFEE.mochaSoft } : undefined;
}

export function activityIndicatorColor(p: CouponPalette) {
  return p === 'coffee' ? COFFEE.mocha : Swo.mustard;
}
