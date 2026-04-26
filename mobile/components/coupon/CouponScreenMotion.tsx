import { Children, useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { SwoDuration, SwoEasing, SwoEnter } from '@/constants/Motion';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { dayTypeChip, formatTemp, heroWeatherMoodLine, personalHeroMessage } from '@/lib/coupon-personalization';
import { heroPillHighlight, useCouponPalette } from '@/lib/coupon-merchant-theme';
import { weatherIcon } from '@/lib/coupon-weather-icon';
import type { ContextResponse } from '@/types/api';

type OfferMini = {
  merchant?: { name?: string; category?: string } | null;
  discount_percent?: number | null;
};

type Props = {
  ctx: ContextResponse;
  userName: string;
  offer: OfferMini;
  dark?: boolean;
  delayBase?: number;
};

/** City · temp · day-type pills + animated live weather. */
export function WeatherPillsRow({ ctx, dark }: { ctx: ContextResponse; dark?: boolean }) {
  const palette = useCouponPalette();
  const hot = heroPillHighlight(palette);
  return (
    <Animated.View
      entering={FadeInRight.duration(SwoDuration.slow).delay(100).easing(SwoEasing.snap)}
      style={wp.row}
    >
      <View style={[wp.pill, dark && wp.pillDark]}>
        <Text style={[wp.pillText, dark && wp.pillTextDark]}>📍 {ctx.location.city}</Text>
      </View>
      <View style={[wp.pill, dark && wp.pillDark, wp.pillHighlight, hot]}>
        <Text style={[wp.pillText, dark && wp.pillTextDark]}>🌡 {formatTemp(ctx)}</Text>
      </View>
      <View style={[wp.pill, dark && wp.pillDark]}>
        <Text style={[wp.pillText, dark && wp.pillTextDark]}>{dayTypeChip(ctx)}</Text>
      </View>
    </Animated.View>
  );
}

const wp = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
    marginTop: Spacing.s2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
    borderColor: Swo.ink,
    ...Shadow.stickerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: Swo.ink3,
  },
  pillHighlight: { backgroundColor: Swo.mustardSoft },
  pillText: { fontFamily: Type.bodySemi, fontSize: 12, color: Swo.ink, textAlign: 'center' },
  pillTextDark: { color: Swo.paper },
});

export function PersonalizedPlayfulHero({ ctx, userName, offer, dark, delayBase = 0 }: Props) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [o]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: o.value * -3 }, { scale: 1 + o.value * 0.02 }],
  }));

  return (
    <Animated.View
      entering={SwoEnter.down(delayBase)}
      style={[ph.wrap, dark && ph.wrapDark]}
    >
      <LinearGradient
        colors={
          dark
            ? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)']
            : ['rgba(255,255,255,0.9)', 'rgba(251,245,234,0.5)']}
        style={ph.grad}
      />
      <View style={ph.rowTop}>
        <View style={ph.titles}>
          <Text style={[ph.city, dark && ph.cityLight]} numberOfLines={1}>
            {ctx.location.city}
          </Text>
          <Text style={[ph.subline, dark && ph.mutedOnDark]} numberOfLines={2}>
            {heroWeatherMoodLine(ctx)}
          </Text>
        </View>
        <Animated.View style={[ph.iconBox, floatStyle, dark && ph.iconBoxDark]}>
          <Ionicons name={weatherIcon(ctx)} size={26} color={dark ? Swo.paper : Swo.ink} />
        </Animated.View>
      </View>

      <Text style={[ph.greetMain, dark && ph.greetOnDark]}>
        {personalHeroMessage(userName, offer, ctx)}
      </Text>

      <WeatherPillsRow ctx={ctx} dark={dark} />
    </Animated.View>
  );
}

const ph = StyleSheet.create({
  wrap: {
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    gap: Spacing.s2,
    marginBottom: Spacing.s3,
    overflow: 'hidden',
  },
  wrapDark: { borderColor: Swo.ink3 },
  grad: { ...StyleSheet.absoluteFillObject, borderRadius: Radius.r4 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titles: { flex: 1, paddingRight: Spacing.s2, gap: 4 },
  city: { fontFamily: Type.displayBlack, fontSize: 24, lineHeight: 28, color: Swo.ink, letterSpacing: -0.4 },
  cityLight: { color: Swo.paper },
  subline: { fontFamily: Type.bodyMedium, fontSize: 13, lineHeight: 18, color: Swo.ink2 },
  mutedOnDark: { color: Swo.ink3 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: Swo.borderSoft,
  },
  iconBoxDark: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: Swo.ink3 },
  greetMain: { fontFamily: Type.body, fontSize: 14, lineHeight: 21, color: Swo.ink, marginTop: Spacing.s1 },
  greetOnDark: { color: Swo.ink3 },
});

/** Staggering wrapper for a vertical list of children. */
export function StaggerIn({
  children,
  baseDelay = 0,
  step = 48,
}: {
  children: ReactNode;
  baseDelay?: number;
  step?: number;
}) {
  return (
    <>
      {Children.toArray(children).map((el: ReactNode, i: number) => (
        <Animated.View
          key={i}
          entering={FadeInDown.duration(SwoDuration.slow)
            .delay(baseDelay + i * step)
            .easing(SwoEasing.snap)}
        >
          {el}
        </Animated.View>
      ))}
    </>
  );
}

type QrProps = { children: React.ReactNode; delay?: number };

export function AnimatedQrReveal({ children, delay = 0 }: QrProps) {
  return (
    <Animated.View entering={SwoEnter.zoom(delay)}>
      {children}
    </Animated.View>
  );
}

type SparkleProps = { dark?: boolean; /** Paints above scroll content, still no pointer capture. */ onTop?: boolean };

/** Decorative sparkles with opacity drift. */
export function SparkleField({ dark, onTop }: SparkleProps) {
  const a = useSharedValue(0.35);
  const b = useSharedValue(0.2);
  useEffect(() => {
    a.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
    b.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.2, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [a, b]);
  const s1 = useAnimatedStyle(() => ({ opacity: a.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: b.value }));
  const tint = dark ? Swo.paper : Swo.ink2;
  return (
    <View style={[sp.wrap, onTop && sp.onTop]} pointerEvents="none">
      <Animated.Text style={[sp.emoji, { color: tint }, s1, { top: 4, right: 18 }]}>✨</Animated.Text>
      <Animated.Text style={[sp.emoji, { color: tint }, s2, { top: 48, left: 12 }]}>✦</Animated.Text>
      <Animated.Text style={[sp.emoji, { color: tint }, s1, { bottom: 80, right: 8 }]}>·</Animated.Text>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  onTop: { zIndex: 4, elevation: 4 },
  emoji: { position: 'absolute', fontSize: 18, opacity: 0.5 },
});