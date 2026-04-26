import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated as RNAnimated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Reanimated from 'react-native-reanimated';
import { SwoEnter } from '@/constants/Motion';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Rect, Circle } from 'react-native-svg';
import { Chip } from '@/components/ui/Chip';
import { ExpiryCountdownBar } from '@/components/coupon/ExpiryCountdownBar';
import {
  AnimatedQrReveal,
  SparkleField,
  StaggerIn,
} from '@/components/coupon/CouponScreenMotion';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import {
  formatTemp,
  mergeContextNoteForDisplay,
  personalMotivation,
  personalOfferLine,
} from '@/lib/coupon-personalization';
import { fetchContext } from '@/services/context';
import { generateCouponUi, type CouponUiSpec } from '@/services/coupon-ui';
import { getSeedDemoOfferById } from '@/dev/seed-demo-coupons';
import { getOffer } from '@/services/offers';
import { getMyProfile, isProfileOnboarded } from '@/services/profile';
import { useAuth } from '@/providers/AuthProvider';
import type { ContextResponse } from '@/types/api';

type RawOffer = Awaited<ReturnType<typeof getOffer>>;

type Merchant = { id: string; name: string; category: string; image_url: string | null };

type OfferDetail = Omit<RawOffer, 'merchant'> & { merchant: Merchant | null };

function normalize(raw: RawOffer): OfferDetail {
  const m = Array.isArray(raw.merchant) ? (raw.merchant[0] ?? null) : raw.merchant;
  return { ...raw, merchant: m as Merchant | null };
}

type Skin = 'morning' | 'noon' | 'golden' | 'dusk';
const TEST_EMAIL = 'bkrinahmed007@gmail.com';
const VALID_SKINS: Skin[] = ['morning', 'noon', 'golden', 'dusk'];
const DISPLAY_CITY = 'Paris';

function isDebugUser(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === TEST_EMAIL;
}

function contextForSkin(skin: Skin): ContextResponse {
  const base = {
    weather: {
      condition: 'clear',
      temp: 21,
      icon: 'sun',
      source: 'debug',
    },
    day_type: 'weekday' as const,
    timestamp: new Date().toISOString(),
    location: { city: 'Debug City', lat: 0, lng: 0 },
  };
  if (skin === 'morning') return { ...base, time_of_day: 'morning' };
  if (skin === 'noon') return { ...base, time_of_day: 'lunch' };
  if (skin === 'golden') return { ...base, time_of_day: 'afternoon' };
  return { ...base, time_of_day: 'evening' };
}

function applySkinToContext(ctx: ContextResponse, skin: Skin): ContextResponse {
  if (skin === 'morning') return { ...ctx, time_of_day: 'morning' };
  if (skin === 'noon') return { ...ctx, time_of_day: 'lunch' };
  if (skin === 'golden') return { ...ctx, time_of_day: 'afternoon' };
  return { ...ctx, time_of_day: 'evening' };
}

function withParisContext(ctx: ContextResponse): ContextResponse {
  return {
    ...ctx,
    location: {
      ...ctx.location,
      city: DISPLAY_CITY,
    },
  };
}

function createDebugOffer(): OfferDetail {
  return {
    id: 'debug-offer',
    token: 'DEBUG-TOKEN',
    headline: 'Debug preview offer',
    subline: 'Use this mode to inspect all coupon skins quickly.',
    discount_percent: 25,
    status: 'active',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    merchant: {
      id: 'debug-merchant',
      name: 'Swocal Test Merchant',
      category: 'Cafe',
      image_url: null,
    },
  };
}

function deriveSkin(ctx: ContextResponse): Skin {
  if (ctx.time_of_day === 'morning') return 'morning';
  if (ctx.time_of_day === 'lunch') return 'noon';
  if (ctx.time_of_day === 'afternoon') return 'golden';
  return 'dusk';
}

function contextNote(ctx: ContextResponse, override?: string): string {
  if (override?.trim()) return override;
  const { time_of_day, day_type, weather } = ctx;
  const isWeekend = day_type === 'weekend';
  const isRainy = ['rain', 'drizzle', 'storm'].some(w =>
    weather.condition.toLowerCase().includes(w)
  );
  if (time_of_day === 'morning') {
    if (isRainy) return 'A grey morning calls for something warm.';
    return isWeekend ? 'Slow morning? Make it golden.' : 'Start the day right.';
  }
  if (time_of_day === 'lunch') return 'You saved this. Now use it.';
  if (time_of_day === 'afternoon') {
    if (isRainy) return 'Rainy afternoon? Sorted.';
    return 'Golden hour, golden deal.';
  }
  return isWeekend ? "Tonight's on the house." : 'End the day on a high.';
}

function skinLabel(ctx: ContextResponse, override?: string): string {
  if (override?.trim()) return override;
  if (ctx.time_of_day === 'morning') return ctx.day_type === 'weekend' ? 'Weekend pick' : 'Morning pick';
  if (ctx.time_of_day === 'lunch') return 'Midday deal';
  if (ctx.time_of_day === 'afternoon') return 'Afternoon treat';
  return "Tonight's pick";
}

function citySeed(city: string): number {
  let h = 0;
  for (let i = 0; i < city.length; i += 1) h = (h * 31 + city.charCodeAt(i)) % 9973;
  return h;
}

function buildDefaultUi(ctx: ContextResponse, forcedSkin?: Skin): CouponUiSpec {
  const skin = forcedSkin ?? deriveSkin(ctx);
  return {
    skin,
    label: skinLabel(ctx),
    context_note: contextNote(ctx),
    headline_override: '',
    subline_override: '',
    ai_attempted: true,
    source: 'openrouter',
  };
}

function Atmosphere({ ctx, dark }: { ctx: ContextResponse; dark?: boolean }) {
  const drift = useRef(new RNAnimated.Value(0)).current;
  const pulse = useRef(new RNAnimated.Value(0.35)).current;

  useEffect(() => {
    const driftLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(drift, { toValue: 1, duration: 7000, useNativeDriver: true }),
        RNAnimated.timing(drift, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ])
    );
    const pulseLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 0.72, duration: 1400, useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 0.32, duration: 1400, useNativeDriver: true }),
      ])
    );
    driftLoop.start();
    pulseLoop.start();
    return () => {
      driftLoop.stop();
      pulseLoop.stop();
    };
  }, [drift, pulse]);

  const weather = ctx.weather.condition.toLowerCase();
  const rainy = weather.includes('rain') || weather.includes('drizzle') || weather.includes('storm');
  const cloudy = weather.includes('cloud') || weather.includes('mist') || weather.includes('fog');
  const weatherTint = rainy ? 'rgba(120,164,196,0.22)' : cloudy ? 'rgba(172,179,194,0.2)' : 'rgba(255,196,100,0.18)';
  const skyline = dark ? 'rgba(255,255,255,0.35)' : 'rgba(42,31,26,0.25)';
  const seed = citySeed(ctx.location.city || 'Paris');

  const cityDrift = {
    transform: [{ translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [8, -6] }) }],
  };

  return (
    <View pointerEvents="none" style={fx.wrap}>
      <RNAnimated.View style={[fx.weatherLayer, { backgroundColor: weatherTint, opacity: pulse }]} />
      <RNAnimated.View style={[fx.cityWrap, cityDrift]}>
        <Svg viewBox="0 0 360 180" width="100%" height="100%">
          <Rect x="0" y="120" width="360" height="60" fill={skyline} />
          {Array.from({ length: 12 }).map((_, i) => {
            const w = 14 + ((seed + i * 13) % 22);
            const h = 40 + ((seed + i * 19) % 70);
            const x = i * 30 + ((seed + i * 7) % 8);
            return <Rect key={i} x={x} y={120 - h} width={w} height={h} rx="2" fill={skyline} />;
          })}
          <Circle cx={300} cy={38} r={20} fill={dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,196,100,0.35)'} />
        </Svg>
        <View style={[fx.cityMask, dark ? { backgroundColor: Swo.ink } : { backgroundColor: Swo.cream }]} />
      </RNAnimated.View>
    </View>
  );
}

// ─── Shared pieces ────────────────────────────────────────────────────────────

function BackButton({ tint, iconColor = Swo.ink }: { tint: string; iconColor?: string }) {
  const router = useRouter();
  return (
    <Reanimated.View entering={SwoEnter.fadeBase()}>
      <Pressable onPress={() => router.back()} style={btn.hit} hitSlop={12}>
        <View style={[btn.circle, { backgroundColor: tint, borderColor: iconColor + '40' }]}>
          <Ionicons name="chevron-down" size={20} color={iconColor} />
        </View>
      </Pressable>
    </Reanimated.View>
  );
}

const btn = StyleSheet.create({
  hit: { alignSelf: 'flex-start' },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    ...Shadow.stickerSoft,
  },
});

function QRFrame({ token, bg, fg }: { token: string; bg: string; fg: string }) {
  return (
    <View style={[qrf.wrap, { backgroundColor: bg, borderColor: fg === Swo.paper ? Swo.ink + '30' : Swo.ink }]}>
      <QRCode value={token} size={160} color={fg} backgroundColor={bg} />
    </View>
  );
}

function buildCouponQrPayload(offer: OfferDetail): string {
  return JSON.stringify({
    v: 1,
    type: 'swocal_coupon',
    token: offer.token ?? offer.id,
    offer_id: offer.id,
    merchant: offer.merchant?.name ?? null,
    category: offer.merchant?.category ?? null,
    discount_percent: offer.discount_percent ?? null,
    status: offer.status,
    expires_at: offer.expires_at ?? null,
    issued_at: new Date().toISOString(),
  });
}

const qrf = StyleSheet.create({
  wrap: {
    padding: Spacing.s4,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    alignSelf: 'center',
    ...Shadow.s2,
  },
});

function RedeemedOverlay() {
  return (
    <Reanimated.View style={ov.wrap} pointerEvents="none" entering={SwoEnter.rightBase()}>
      <Reanimated.View entering={SwoEnter.fade()} style={ov.stamp}>
        <Text style={ov.text}>REDEEMED</Text>
      </Reanimated.View>
    </Reanimated.View>
  );
}

const ov = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42,31,26,0.55)',
    borderRadius: Radius.r5,
    zIndex: 10,
  },
  stamp: {
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s3,
    borderWidth: 3,
    borderColor: Swo.mint,
    borderRadius: Radius.r2,
    transform: [{ rotate: '-12deg' }],
  },
  text: {
    fontFamily: Type.displayBlack,
    fontSize: 28,
    letterSpacing: 4,
    color: Swo.mint,
  },
});

// ─── Morning skin — newspaper / morning receipt ────────────────────────────────

function MorningSkin({ offer, ctx, ui }: { offer: OfferDetail; ctx: ContextResponse; ui: CouponUiSpec }) {
  const redeemed = offer.status === 'redeemed';
  const contextLine = mergeContextNoteForDisplay(ctx, ui, contextNote(ctx, ui.context_note));
  return (
    <SafeAreaView style={[sk.safe, { backgroundColor: Swo.creamDeep }]}>
      <Atmosphere ctx={ctx} />
      <ScrollView contentContainerStyle={sk.scroll} showsVerticalScrollIndicator={false}>
        <BackButton tint={Swo.mustardSoft} />

        <StaggerIn baseDelay={120} step={60}>
          <View style={ms.header}>
            <Text style={ms.eyebrow}>{skinLabel(ctx, ui.label)}</Text>
            <Text style={ms.merchant}>{offer.merchant?.name ?? '—'}</Text>
            <Text style={ms.note}>{contextLine}</Text>
            <Text style={ms.motivation}>{personalMotivation(ctx)}</Text>
            <Text style={ms.personalLine}>{personalOfferLine(offer, ctx, ui)}</Text>
          </View>
        </StaggerIn>

        <Reanimated.View entering={SwoEnter.fade(200)}>
          <View style={ms.divider} />
        </Reanimated.View>

        <View style={ms.qrSection}>
          <Text style={ms.handNote}>scan at the counter in {DISPLAY_CITY} ↓</Text>
          <View style={[ms.qrWrap, redeemed && { opacity: 0.35 }]}>
            <AnimatedQrReveal delay={120}>
              <QRFrame token={buildCouponQrPayload(offer)} bg={Swo.paper} fg={Swo.ink} />
            </AnimatedQrReveal>
            {redeemed && <RedeemedOverlay />}
          </View>
          <Reanimated.View entering={SwoEnter.down(220)} style={ms.chipRow}>
            <Chip
              label={`${offer.discount_percent ?? 0}% off in ${DISPLAY_CITY}`}
              variant="mustard"
            />
          </Reanimated.View>
          {offer.expires_at && (
            <ExpiryCountdownBar
              variant="morning"
              status={offer.status}
              createdAt={offer.created_at}
              expiresAt={offer.expires_at}
              hint={DISPLAY_CITY}
            />
          )}
        </View>

        <Reanimated.View entering={SwoEnter.fade(100)}>
          <View style={ms.divider} />
        </Reanimated.View>

        <StaggerIn baseDelay={160} step={50}>
          <View style={ms.footer}>
            <Text style={ms.headline} numberOfLines={3}>
              {ui.headline_override ?? offer.headline ?? ''}
            </Text>
            {(ui.subline_override ?? offer.subline) && (
              <Text style={ms.subline}>{ui.subline_override ?? offer.subline}</Text>
            )}
          </View>
        </StaggerIn>
      </ScrollView>
      <SparkleField onTop />
    </SafeAreaView>
  );
}

const ms = StyleSheet.create({
  header: { gap: Spacing.s2, marginTop: Spacing.s5, marginBottom: Spacing.s5 },
  eyebrow: {
    fontFamily: Type.bodySemi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Swo.coralDeep,
  },
  merchant: {
    fontFamily: Type.displayBlack,
    fontSize: 36,
    lineHeight: 40,
    color: Swo.ink,
    letterSpacing: -0.8,
  },
  note: {
    fontFamily: Type.body,
    fontSize: 15,
    color: Swo.ink2,
    lineHeight: 22,
    marginTop: Spacing.s1,
  },
  motivation: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink2,
    opacity: 0.9,
  },
  personalLine: {
    fontFamily: Type.bodyMedium,
    fontSize: 12,
    color: Swo.coralDeep,
    lineHeight: 18,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Swo.ink,
    opacity: 0.12,
    marginVertical: Spacing.s5,
  },
  qrSection: { gap: Spacing.s4, alignItems: 'center' },
  handNote: {
    fontFamily: Type.hand,
    fontSize: 18,
    color: Swo.coralDeep,
    letterSpacing: 0.2,
  },
  qrWrap: { position: 'relative' },
  chipRow: { flexDirection: 'row', gap: Spacing.s2 },
  footer: { gap: Spacing.s3, paddingBottom: Spacing.s8 },
  headline: {
    fontFamily: Type.display,
    fontSize: 22,
    lineHeight: 28,
    color: Swo.ink,
    letterSpacing: -0.2,
  },
  subline: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink3,
    lineHeight: 20,
  },
});

// ─── Noon skin — bold diner poster ────────────────────────────────────────────

function NoonSkin({ offer, ctx, ui }: { offer: OfferDetail; ctx: ContextResponse; ui: CouponUiSpec }) {
  const redeemed = offer.status === 'redeemed';
  const contextLine = mergeContextNoteForDisplay(ctx, ui, contextNote(ctx, ui.context_note));
  return (
    <SafeAreaView style={[sk.safe, { backgroundColor: Swo.paper }]}>
      <Atmosphere ctx={ctx} />
      <Reanimated.View entering={SwoEnter.down(60)}>
        <View style={ns.hero}>
          <View style={ns.heroInner}>
            <BackButton tint={Swo.mustard} />
            <Text style={ns.heroLabel}>{skinLabel(ctx, ui.label).toUpperCase()} · {DISPLAY_CITY}</Text>
            <Text style={ns.heroMerchant}>{offer.merchant?.name ?? '—'}</Text>
            <Text style={ns.heroDiscount}>{offer.discount_percent ?? 0}%</Text>
            <Text style={ns.heroOff}>OFF</Text>
            <Text style={ns.localHint}>{formatTemp(ctx)} {ctx.weather.condition} · {DISPLAY_CITY}</Text>
          </View>
        </View>
      </Reanimated.View>

      <Reanimated.View entering={SwoEnter.fade()}>
        <View style={ns.dottedEdge}>
          {Array.from({ length: 14 }).map((_, i) => (
            <View key={i} style={ns.dot} />
          ))}
        </View>
      </Reanimated.View>

      <ScrollView contentContainerStyle={[sk.scroll, ns.body]} showsVerticalScrollIndicator={false}>
        <Text style={ns.note}>{contextLine}</Text>
        <Text style={ns.motivation}>{personalMotivation(ctx)}</Text>
        <Text style={ns.offerHint}>{personalOfferLine(offer, ctx, ui)}</Text>

        <View style={[ns.qrWrap, redeemed && { opacity: 0.35 }]}>
          <AnimatedQrReveal delay={0}>
            <QRFrame token={buildCouponQrPayload(offer)} bg={Swo.paper} fg={Swo.ink} />
          </AnimatedQrReveal>
          {redeemed && <RedeemedOverlay />}
        </View>

        <StaggerIn baseDelay={0} step={45}>
          <Text style={ns.headline} numberOfLines={3}>
            {ui.headline_override ?? offer.headline ?? ''}
          </Text>
          {(ui.subline_override ?? offer.subline) && (
            <Text style={ns.subline}>{ui.subline_override ?? offer.subline}</Text>
          )}
        </StaggerIn>

        <View style={ns.chipBlock}>
          {offer.expires_at && (
            <ExpiryCountdownBar
              variant="noon"
              status={offer.status}
              createdAt={offer.created_at}
              expiresAt={offer.expires_at}
              hint={DISPLAY_CITY}
            />
          )}
          {offer.merchant?.category && (
            <View style={ns.chipRow}>
              <Chip label={offer.merchant.category} variant="soft" />
            </View>
          )}
        </View>
      </ScrollView>
      <SparkleField onTop />
    </SafeAreaView>
  );
}

const ns = StyleSheet.create({
  hero: { backgroundColor: Swo.mustard, paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s6 },
  heroInner: { gap: Spacing.s1 },
  heroLabel: {
    fontFamily: Type.bodySemi,
    fontSize: 11,
    letterSpacing: 2.5,
    color: Swo.mustardDeep,
    marginTop: Spacing.s4,
  },
  heroMerchant: {
    fontFamily: Type.displayBlack,
    fontSize: 28,
    lineHeight: 32,
    color: Swo.ink,
    letterSpacing: -0.5,
  },
  heroDiscount: {
    fontFamily: Type.displayBlack,
    fontSize: 80,
    lineHeight: 80,
    color: Swo.ink,
    letterSpacing: -4,
    marginTop: Spacing.s2,
  },
  heroOff: {
    fontFamily: Type.displayBlack,
    fontSize: 36,
    color: Swo.ink,
    letterSpacing: 2,
    marginTop: -Spacing.s3,
  },
  dottedEdge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.s2,
    marginTop: -8,
    backgroundColor: Swo.paper,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Swo.mustard,
    marginTop: -7,
  },
  localHint: {
    fontFamily: Type.body,
    fontSize: 12,
    color: Swo.mustardDeep,
    textAlign: 'center',
    marginTop: Spacing.s2,
  },
  body: { gap: Spacing.s5, paddingTop: Spacing.s4 },
  note: {
    fontFamily: Type.hand,
    fontSize: 20,
    color: Swo.coralDeep,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  motivation: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink2,
    textAlign: 'center',
    marginTop: -Spacing.s3,
  },
  offerHint: {
    fontFamily: Type.body,
    fontSize: 12,
    color: Swo.ink3,
    textAlign: 'center',
    marginTop: -Spacing.s2,
  },
  qrWrap: { position: 'relative', alignItems: 'center' },
  headline: {
    fontFamily: Type.display,
    fontSize: 22,
    lineHeight: 28,
    color: Swo.ink,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  subline: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink3,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -Spacing.s2,
  },
  chipBlock: { alignSelf: 'stretch', gap: Spacing.s2, paddingBottom: Spacing.s8 },
  chipRow: { flexDirection: 'row', gap: Spacing.s2, justifyContent: 'center' },
});

// ─── Golden skin — afternoon editorial ────────────────────────────────────────

function GoldenSkin({ offer, ctx, ui }: { offer: OfferDetail; ctx: ContextResponse; ui: CouponUiSpec }) {
  const redeemed = offer.status === 'redeemed';
  const contextLine = mergeContextNoteForDisplay(ctx, ui, contextNote(ctx, ui.context_note));
  return (
    <SafeAreaView style={[sk.safe, { backgroundColor: Swo.cream }]}>
      <Atmosphere ctx={ctx} />
      <Reanimated.View entering={SwoEnter.right()} style={gs.accentBar} />
      <ScrollView contentContainerStyle={sk.scroll} showsVerticalScrollIndicator={false}>
        <BackButton tint={Swo.skySoft} />

        <StaggerIn baseDelay={60} step={55}>
          <View style={gs.header}>
            <Text style={gs.eyebrow}>
              {skinLabel(ctx, ui.label)} · {DISPLAY_CITY}
            </Text>
            <Text style={gs.note}>{contextLine}</Text>
            <Text style={gs.motivation}>{personalMotivation(ctx)}</Text>
            <Text style={gs.momentWeather}>
              {formatTemp(ctx)} · {ctx.weather.condition} · {DISPLAY_CITY}
            </Text>
            <Text style={gs.momentSub} numberOfLines={2}>
              {personalOfferLine(offer, ctx, ui)}
            </Text>
          </View>
        </StaggerIn>

        <Reanimated.View entering={SwoEnter.fade(80)} style={gs.row}>
          <View style={[gs.qrCol, redeemed && { opacity: 0.35 }]}>
            <AnimatedQrReveal delay={0}>
              <QRFrame token={buildCouponQrPayload(offer)} bg={Swo.paper} fg={Swo.ink} />
            </AnimatedQrReveal>
            {redeemed && <RedeemedOverlay />}
          </View>

          <View style={gs.copyCol}>
            <Text style={gs.discountBig}>{offer.discount_percent ?? 0}%</Text>
            <Text style={gs.discountLabel}>OFF</Text>
            <View style={gs.divider} />
            <Text style={gs.merchant}>{offer.merchant?.name ?? '—'}</Text>
            {offer.merchant?.category && <Text style={gs.category}>{offer.merchant.category}</Text>}
          </View>
        </Reanimated.View>

        <StaggerIn baseDelay={40} step={40}>
          <View style={gs.headlineBlock}>
            <Text style={gs.headline} numberOfLines={3}>
              {ui.headline_override ?? offer.headline ?? ''}
            </Text>
            {(ui.subline_override ?? offer.subline) && (
              <Text style={gs.subline}>{ui.subline_override ?? offer.subline}</Text>
            )}
          </View>
        </StaggerIn>

        <View style={gs.chipBlock}>
          {offer.expires_at && (
            <ExpiryCountdownBar
              variant="golden"
              status={offer.status}
              createdAt={offer.created_at}
              expiresAt={offer.expires_at}
            />
          )}
          <Reanimated.View entering={SwoEnter.down(180)} style={gs.chipRow}>
            <Chip label={`Show in ${DISPLAY_CITY}`} variant="sticker" />
          </Reanimated.View>
        </View>
      </ScrollView>
      <SparkleField onTop />
    </SafeAreaView>
  );
}

const gs = StyleSheet.create({
  accentBar: { height: 5, backgroundColor: Swo.sky },
  header: { gap: Spacing.s2, marginTop: Spacing.s4, marginBottom: Spacing.s5 },
  eyebrow: {
    fontFamily: Type.bodySemi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Swo.sky,
  },
  note: {
    fontFamily: Type.hand,
    fontSize: 22,
    color: Swo.ink2,
    letterSpacing: 0.2,
  },
  motivation: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink2,
  },
  momentWeather: {
    fontFamily: Type.body,
    fontSize: 12,
    color: Swo.sky,
    marginTop: Spacing.s1,
  },
  momentSub: {
    fontFamily: Type.body,
    fontSize: 11,
    color: Swo.ink3,
    marginTop: 4,
    lineHeight: 16,
  },
  row: { flexDirection: 'row', gap: Spacing.s5, alignItems: 'center', marginBottom: Spacing.s5 },
  qrCol: { flex: 1, position: 'relative' },
  copyCol: { flex: 1, gap: Spacing.s1 },
  discountBig: {
    fontFamily: Type.displayBlack,
    fontSize: 64,
    lineHeight: 64,
    color: Swo.ink,
    letterSpacing: -3,
  },
  discountLabel: {
    fontFamily: Type.displayBlack,
    fontSize: 28,
    color: Swo.sky,
    letterSpacing: 2,
    marginTop: -Spacing.s2,
  },
  divider: { height: 1.5, backgroundColor: Swo.borderSoft, marginVertical: Spacing.s3 },
  merchant: {
    fontFamily: Type.displaySemi,
    fontSize: 18,
    color: Swo.ink,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  category: {
    fontFamily: Type.body,
    fontSize: 13,
    color: Swo.ink3,
  },
  headlineBlock: { gap: Spacing.s2, marginBottom: Spacing.s4 },
  headline: {
    fontFamily: Type.display,
    fontSize: 22,
    lineHeight: 28,
    color: Swo.ink,
    letterSpacing: -0.2,
  },
  subline: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink3,
    lineHeight: 20,
  },
  chipBlock: { alignSelf: 'stretch', gap: Spacing.s3 },
  chipRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap', paddingBottom: Spacing.s8 },
});

// ─── Dusk skin — dark / evening luxe ──────────────────────────────────────────

function DuskSkin({ offer, ctx, ui }: { offer: OfferDetail; ctx: ContextResponse; ui: CouponUiSpec }) {
  const redeemed = offer.status === 'redeemed';
  const contextLine = mergeContextNoteForDisplay(ctx, ui, contextNote(ctx, ui.context_note));
  return (
    <SafeAreaView style={[sk.safe, { backgroundColor: Swo.ink }]}>
      <Atmosphere ctx={ctx} dark />
      <ScrollView contentContainerStyle={sk.scroll} showsVerticalScrollIndicator={false}>
        <BackButton tint={Swo.ink2} iconColor={Swo.paper} />

        <StaggerIn baseDelay={50} step={50}>
          <Text style={ds.stars}>✦  ✦  ✦</Text>
          <View style={ds.header}>
            <Text style={ds.eyebrow}>
              {skinLabel(ctx, ui.label)} · {DISPLAY_CITY} · {formatTemp(ctx)}
            </Text>
            <Text style={ds.merchant}>{offer.merchant?.name ?? '—'}</Text>
            <Text style={ds.note}>{contextLine}</Text>
            <Text style={ds.motivation}>{personalMotivation(ctx)}</Text>
            <Text style={ds.personalDusk}>{personalOfferLine(offer, ctx, ui)}</Text>
          </View>
        </StaggerIn>

        <Reanimated.View entering={SwoEnter.down(100)} style={[ds.qrWrap, redeemed && { opacity: 0.4 }]}>
          <AnimatedQrReveal delay={0}>
            <QRFrame token={buildCouponQrPayload(offer)} bg={Swo.paper} fg={Swo.ink} />
          </AnimatedQrReveal>
          {redeemed && <RedeemedOverlay />}
        </Reanimated.View>

        <Reanimated.View entering={SwoEnter.fade(100)} style={ds.badge}>
          <Text style={ds.badgeNum}>{offer.discount_percent ?? 0}%</Text>
          <Text style={ds.badgeLabel}>
            {ctx.time_of_day === 'evening' ? 'off this evening' : 'off'} · {DISPLAY_CITY}
          </Text>
        </Reanimated.View>

        <Reanimated.View entering={SwoEnter.fade()}>
          <View style={ds.divider} />
        </Reanimated.View>

        <StaggerIn baseDelay={0} step={40}>
          <Text style={ds.headline} numberOfLines={3}>
            {ui.headline_override ?? offer.headline ?? ''}
          </Text>
          {(ui.subline_override ?? offer.subline) && <Text style={ds.subline}>{ui.subline_override ?? offer.subline}</Text>}
        </StaggerIn>

        <View style={ds.chipBlock}>
          {offer.expires_at && (
            <ExpiryCountdownBar
              variant="dusk"
              status={offer.status}
              createdAt={offer.created_at}
              expiresAt={offer.expires_at}
            />
          )}
          {offer.merchant?.category && (
            <Reanimated.View entering={SwoEnter.down(90)} style={ds.chipRow}>
              <Chip label={`${offer.merchant.category} · ${DISPLAY_CITY}`} variant="soft" />
            </Reanimated.View>
          )}
        </View>
      </ScrollView>
      <SparkleField dark onTop />
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  header: { gap: Spacing.s2, marginTop: Spacing.s5, marginBottom: Spacing.s6 },
  stars: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.mustard,
    letterSpacing: 4,
  },
  eyebrow: {
    fontFamily: Type.bodySemi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Swo.coralDeep,
  },
  merchant: {
    fontFamily: Type.displayBlack,
    fontSize: 36,
    lineHeight: 40,
    color: Swo.paper,
    letterSpacing: -0.8,
  },
  note: {
    fontFamily: Type.hand,
    fontSize: 20,
    color: Swo.ink4,
    letterSpacing: 0.2,
    marginTop: Spacing.s1,
  },
  motivation: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink4,
  },
  personalDusk: {
    fontFamily: Type.body,
    fontSize: 12,
    color: Swo.ink3,
    marginTop: 4,
  },
  qrWrap: { position: 'relative', alignItems: 'center', marginBottom: Spacing.s5 },
  badge: { alignItems: 'center', gap: 0, marginBottom: Spacing.s5 },
  badgeNum: {
    fontFamily: Type.displayBlack,
    fontSize: 72,
    lineHeight: 72,
    color: Swo.mustard,
    letterSpacing: -4,
  },
  badgeLabel: {
    fontFamily: Type.hand,
    fontSize: 22,
    color: Swo.ink4,
    marginTop: -Spacing.s2,
  },
  divider: {
    height: 1,
    backgroundColor: Swo.ink2,
    marginBottom: Spacing.s4,
  },
  headline: {
    fontFamily: Type.display,
    fontSize: 22,
    lineHeight: 28,
    color: Swo.paper,
    letterSpacing: -0.2,
    marginBottom: Spacing.s3,
  },
  subline: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink3,
    lineHeight: 20,
    marginBottom: Spacing.s4,
  },
  chipBlock: { alignSelf: 'stretch', gap: Spacing.s3, marginTop: Spacing.s1 },
  chipRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap', paddingBottom: Spacing.s8 },
});

// ─── Shared scroll container ───────────────────────────────────────────────────

const sk = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.s6, flexGrow: 1 },
});

const fx = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  weatherLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  cityWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    overflow: 'hidden',
  },
  city: {
    width: '100%',
    height: '100%',
  },
  cityMask: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
});

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function CouponScreen() {
  const { id, debugSkin } = useLocalSearchParams<{ id: string; debugSkin?: string }>();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [ctx, setCtx] = useState<ContextResponse | null>(null);
  const [ui, setUi] = useState<CouponUiSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const validDebugSkin = useMemo(
    () => (VALID_SKINS.includes(debugSkin as Skin) ? (debugSkin as Skin) : null),
    [debugSkin]
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setUi(null);
    const isDebugRoute = id === 'debug' && validDebugSkin;
    if (isDebugRoute) {
      const debugOffer = createDebugOffer();
      fetchContext()
        .then((liveCtx) => {
          const debugCtx = applySkinToContext(liveCtx, validDebugSkin);
          setOffer(debugOffer);
          setCtx(debugCtx);
          setUi(buildDefaultUi(debugCtx, validDebugSkin));
          setError(null);
          setLoading(false);

          generateCouponUi({
            offer: {
              id: debugOffer.id,
              headline: debugOffer.headline,
              subline: debugOffer.subline,
              discount_percent: debugOffer.discount_percent,
              merchant: debugOffer.merchant ? { name: debugOffer.merchant.name, category: debugOffer.merchant.category } : null,
            },
            context: debugCtx,
            debugSkin: validDebugSkin,
          })
            .then((generatedUi) => setUi(generatedUi))
            .catch(() => {});
        })
        .catch(() => {
          const debugCtx = contextForSkin(validDebugSkin);
          setOffer(debugOffer);
          setCtx(debugCtx);
          setUi(buildDefaultUi(debugCtx, validDebugSkin));
          setError(null);
          setLoading(false);
        });
      return;
    }

    const seedRow = getSeedDemoOfferById(id);
    if (seedRow) {
      if (user?.id == null) {
        return;
      }
      getMyProfile()
        .then((profile) => {
          if (!isProfileOnboarded(profile?.intent_vector)) {
            setError('Finish onboarding in the Swipe tab to open these preview coupons.');
            return null;
          }
          const demoOffer: OfferDetail = {
            id: seedRow.id,
            token: seedRow.token,
            headline: seedRow.headline,
            subline: seedRow.subline,
            discount_percent: seedRow.discount_percent,
            status: seedRow.status,
            created_at: seedRow.created_at,
            expires_at: seedRow.expires_at,
            merchant: seedRow.merchant,
          };
          return Promise.all([Promise.resolve(demoOffer), fetchContext()]) as Promise<
            [OfferDetail, ContextResponse]
          >;
        })
        .then((res) => {
          if (res == null) return;
          const [o, c] = res;
          setOffer(o);
          setCtx(c);
          setUi(buildDefaultUi(c, validDebugSkin ?? undefined));
          setError(null);

          generateCouponUi({
            offer: {
              id: o.id,
              headline: o.headline,
              subline: o.subline,
              discount_percent: o.discount_percent,
              merchant: o.merchant ? { name: o.merchant.name, category: o.merchant.category } : null,
            },
            context: c,
            debugSkin: validDebugSkin ?? undefined,
          })
            .then((generatedUi) => setUi(generatedUi))
            .catch(() => {});
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load coupon.'))
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    Promise.all([getOffer(id), fetchContext()])
      .then(([o, c]) => {
        const normalized = normalize(o);
        setOffer(normalized);
        setCtx(c);
        setUi(buildDefaultUi(c, validDebugSkin ?? undefined));
        setError(null);
        setLoading(false);

        generateCouponUi({
          offer: {
            id: normalized.id,
            headline: normalized.headline,
            subline: normalized.subline,
            discount_percent: normalized.discount_percent,
            merchant: normalized.merchant ? { name: normalized.merchant.name, category: normalized.merchant.category } : null,
          },
          context: c,
          debugSkin: validDebugSkin ?? undefined,
        })
          .then((generatedUi) => setUi(generatedUi))
          .catch(() => {});
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load coupon.'))
      .finally(() => {
        setLoading(false);
      });
  }, [id, debugSkin, validDebugSkin, user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={[sk.safe, root.center, { backgroundColor: Swo.cream }]}>
        <ActivityIndicator color={Swo.mustard} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !offer || !ctx || !ui) {
    return (
      <SafeAreaView style={[sk.safe, root.center, { backgroundColor: Swo.cream }]}>
        <Text style={root.err}>{error ?? 'Something went wrong.'}</Text>
      </SafeAreaView>
    );
  }

  const isTestUser = isDebugUser(user?.email);
  const forcedSkin = isTestUser && VALID_SKINS.includes(debugSkin as Skin) ? (debugSkin as Skin) : null;
  const displayCtx = withParisContext(ctx);
  const skin = forcedSkin ?? ui.skin ?? deriveSkin(displayCtx);

  if (skin === 'morning') return <MorningSkin offer={offer} ctx={displayCtx} ui={ui} />;
  if (skin === 'noon') return <NoonSkin offer={offer} ctx={displayCtx} ui={ui} />;
  if (skin === 'golden') return <GoldenSkin offer={offer} ctx={displayCtx} ui={ui} />;
  return <DuskSkin offer={offer} ctx={displayCtx} ui={ui} />;
}

const root = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  err: { fontFamily: Type.body, fontSize: 15, color: Swo.ink3 },
});
