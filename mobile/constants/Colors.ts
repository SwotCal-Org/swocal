// Swocal design tokens — mirrors design_rr/colors_and_type.css.
// Mustard is PRIMARY (CTAs, swipe-right). Coral is SECONDARY (heart/love accent).

export const Swo = {
  mustard: '#F2B23A',
  mustardDeep: '#C98F1C',
  mustardSoft: '#FBE5A6',

  coral: '#E36A4D',
  coralDeep: '#C04A30',
  coralSoft: '#F7CFC0',

  mint: '#8DB36B',
  mintDeep: '#5F8842',
  mintSoft: '#E1EBC9',

  plum: '#A14E5E',
  plumSoft: '#F1D7DA',

  sky: '#6E9C9B',
  skySoft: '#D9E5E2',

  cream: '#FBF5EA',
  creamDeep: '#F2E9D6',
  paper: '#FFFEFB',
  shell: '#F7ECD9',

  ink: '#2A1F1A',
  ink2: '#5C4A3F',
  ink3: '#8B7969',
  ink4: '#C9B9A6',

  danger: '#B94A35',
  borderSoft: '#E8DCC6',
} as const;

// Back-compat alias for code that still imports `Brand`.
export const Brand = {
  primary: Swo.mustard,
  primaryDark: Swo.mustardDeep,
  bg: Swo.cream,
  surface: Swo.paper,
  text: Swo.ink,
  textMuted: Swo.ink2,
  border: Swo.borderSoft,
  danger: Swo.danger,
  success: Swo.mintDeep,
} as const;

export const Spacing = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s7: 32, s8: 40, s9: 56, s10: 72,
} as const;

export const Radius = {
  r1: 4, r2: 8, r3: 12, r4: 18, r5: 24, r6: 32, pill: 999,
} as const;

// Shadows are warm-brown tinted, never blue-black.
// React Native props differ between iOS (shadow*) and Android (elevation).
export const Shadow = {
  s1: { shadowColor: '#462814', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  s2: { shadowColor: '#462814', shadowOpacity: 0.10, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  s3: { shadowColor: '#462814', shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  s4: { shadowColor: '#462814', shadowOpacity: 0.18, shadowRadius: 48, shadowOffset: { width: 0, height: 20 }, elevation: 14 },
  // Sticker shadow — hard, offset, espresso. Mimic with offset + 0 radius.
  sticker: { shadowColor: Swo.ink, shadowOpacity: 0.95, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 3 },
  stickerSoft: { shadowColor: Swo.ink, shadowOpacity: 0.18, shadowRadius: 0, shadowOffset: { width: 2, height: 3 }, elevation: 2 },
} as const;

export const Type = {
  display: 'Fraunces_700Bold',
  displayBlack: 'Fraunces_900Black',
  displaySemi: 'Fraunces_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemi: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
  hand: 'Caveat_700Bold',
} as const;
