import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { type Offer } from '@/components/swocal-card';
import { Button } from '@/components/ui/Button';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

const CREAM = '#FBE5A6';
const CREAM_MID = '#FBF5EA';
const CREAM_DEEP = '#F2E9D6';

export function makeRedemptionToken(offer: Offer) {
  const base = offer.id + Date.now().toString(36);
  let h = 2166136261;
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `SWO-${hex}-${offer.id.slice(0, 6).toUpperCase()}`;
}

type MatchProps = {
  offer: Offer;
  onShowCoupon: () => void;
  onKeepSwiping: () => void;
};

export function MatchAfterSwipeOverlay({ offer, onShowCoupon, onKeepSwiping }: MatchProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.matchRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]} pointerEvents="auto">
      <LinearGradient
        colors={[CREAM, CREAM_MID, CREAM_DEEP]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.Text entering={FadeInDown.duration(420).delay(40)} style={styles.sparkleTL}>
        ✨
      </Animated.Text>
      <Animated.Text entering={FadeInDown.duration(500).delay(80)} style={styles.sparkleTR}>
        ✨
      </Animated.Text>

      <Animated.View entering={FadeIn.duration(360)} style={styles.matchStamp}>
        <Text style={styles.matchStampText}>{"IT'S A MATCH"}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(420).delay(120)}
        style={styles.matchCard}
      >
        <View
          style={[
            styles.matchHero,
            { backgroundColor: offer.photoBg },
            offer.imageUrl ? { padding: 0, overflow: 'hidden' } : null,
          ]}
        >
          {offer.imageUrl ? (
            <Animated.Image
              source={{ uri: offer.imageUrl }}
              style={styles.matchHeroImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.matchHeroEmoji}>{offer.photoEmoji}</Text>
          )}
        </View>
        <Text style={styles.matchHeadline} numberOfLines={3}>
          {offer.headline}
        </Text>
        {offer.discount > 0 ? (
          <Text style={styles.matchDiscountLine}>Up to {offer.discount}% off at {offer.merchant}</Text>
        ) : (
          <Text style={styles.matchDiscountLine}>Saved for {offer.merchant}</Text>
        )}
        <Text style={styles.matchSub}>Show the QR in store within your {offer.timeLeft} window.</Text>

        <View style={styles.matchCtas}>
          <Button title="Show coupon" onPress={onShowCoupon} />
          <Pressable
            onPress={onKeepSwiping}
            accessibilityRole="button"
            accessibilityLabel="Keep swiping"
            style={({ pressed }) => [styles.ghostTextBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.ghostTextBtnLabel}>Keep swiping</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

type CouponProps = {
  offer: Offer;
  token: string;
  /** Shown in the “Generated for” shell — e.g. weather + area + a hint. */
  contextLine: string;
  onBack: () => void;
};

export function SwipeCouponScreen({ offer, token, contextLine, onBack }: CouponProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.couponRoot} pointerEvents="auto">
      <ScrollView
        contentContainerStyle={[
          styles.couponScroll,
          { paddingTop: insets.top + Spacing.s2, paddingBottom: insets.bottom + Spacing.s4 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to swipe"
          style={({ pressed }) => [styles.couponBack, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.couponBackText}>← Back to swipe</Text>
        </Pressable>

        <View style={styles.couponCard}>
          <View style={styles.savedPill}>
            <Text style={styles.savedPillText}>SAVED</Text>
          </View>

          <View
            style={[
              styles.couponHero,
              { backgroundColor: offer.photoBg },
              offer.imageUrl ? { padding: 0, overflow: 'hidden' } : null,
            ]}
          >
            {offer.imageUrl ? (
              <Animated.Image
                source={{ uri: offer.imageUrl }}
                style={styles.couponHeroImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.couponHeroEmoji}>{offer.photoEmoji}</Text>
            )}
          </View>

          <Text style={styles.couponTitle} numberOfLines={3}>
            {offer.headline}
          </Text>
          <Text style={styles.couponMeta}>
            {offer.merchant} · {offer.address}
          </Text>

          {offer.discount > 0 ? (
            <Text style={styles.couponPct}>{offer.discount}% off this visit</Text>
          ) : null}

          <View style={styles.qrFrame}>
            <QRCode value={token} size={192} color={Swo.ink} backgroundColor={Swo.paper} />
          </View>
          <Text style={styles.tokenHint}>{token.slice(0, 12).toUpperCase()}…</Text>

          <View style={styles.contextShell}>
            <Text style={styles.contextLabel}>Generated for</Text>
            <Text style={styles.contextBody}>{contextLine}</Text>
          </View>

          <Text style={styles.expiresLine}>⏱ Use within {offer.timeLeft}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  matchRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s5,
  },
  sparkleTL: { position: 'absolute', top: 72, left: 32, fontSize: 32 },
  sparkleTR: { position: 'absolute', top: 56, right: 40, fontSize: 26 },
  matchStamp: {
    marginBottom: Spacing.s4,
    paddingHorizontal: Spacing.s5,
    paddingVertical: 12,
    backgroundColor: Swo.mustard,
    borderWidth: 3,
    borderColor: Swo.ink,
    borderRadius: Radius.r2,
    ...Shadow.sticker,
    transform: [{ rotate: '-4deg' }],
  },
  matchStampText: {
    fontFamily: Type.displayBlack,
    fontSize: 24,
    color: Swo.ink,
    letterSpacing: 1,
  },
  matchCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s5,
    ...Shadow.s3,
  },
  matchHero: {
    height: 130,
    borderRadius: Radius.r4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s3,
  },
  matchHeroImage: { width: '100%', height: '100%' },
  matchHeroEmoji: { fontSize: 72, opacity: 0.9 },
  matchHeadline: {
    fontFamily: Type.displaySemi,
    fontSize: 22,
    lineHeight: 26,
    color: Swo.ink,
    textAlign: 'center',
  },
  matchDiscountLine: {
    marginTop: Spacing.s2,
    fontFamily: Type.bodySemi,
    fontSize: 14,
    color: Swo.ink2,
    textAlign: 'center',
  },
  matchSub: {
    marginTop: Spacing.s2,
    fontFamily: Type.body,
    fontSize: 13,
    color: Swo.ink3,
    textAlign: 'center',
  },
  matchCtas: { marginTop: Spacing.s4, gap: Spacing.s2 },
  ghostTextBtn: { alignItems: 'center', paddingVertical: Spacing.s2 },
  ghostTextBtnLabel: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink3 },
  couponRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 70,
    backgroundColor: Swo.cream,
  },
  couponScroll: {
    paddingHorizontal: Spacing.s5,
  },
  couponBack: { alignSelf: 'flex-start', marginBottom: Spacing.s3 },
  couponBackText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink2 },
  couponCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s5,
    ...Shadow.s2,
  },
  savedPill: {
    position: 'absolute',
    top: -10,
    right: 20,
    zIndex: 2,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Swo.mint,
    borderWidth: 2,
    borderColor: Swo.ink,
    borderRadius: 6,
    ...Shadow.sticker,
    transform: [{ rotate: '3deg' }],
  },
  savedPillText: {
    fontFamily: Type.displayBlack,
    fontSize: 12,
    color: Swo.paper,
    letterSpacing: 0.5,
  },
  couponHero: {
    height: 120,
    borderRadius: Radius.r4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s3,
  },
  couponHeroImage: { width: '100%', height: '100%' },
  couponHeroEmoji: { fontSize: 70 },
  couponTitle: {
    fontFamily: Type.displaySemi,
    fontSize: 22,
    lineHeight: 26,
    color: Swo.ink,
    textAlign: 'center',
  },
  couponMeta: {
    marginTop: Spacing.s1,
    fontFamily: Type.body,
    fontSize: 13,
    color: Swo.ink3,
    textAlign: 'center',
  },
  couponPct: {
    marginTop: Spacing.s2,
    fontFamily: Type.bodySemi,
    fontSize: 15,
    color: Swo.coralDeep,
    textAlign: 'center',
  },
  qrFrame: {
    marginTop: Spacing.s4,
    alignSelf: 'center',
    padding: Spacing.s3,
    backgroundColor: Swo.paper,
    borderWidth: 2,
    borderColor: Swo.ink,
    borderRadius: Radius.r3,
    ...Shadow.sticker,
  },
  tokenHint: {
    marginTop: Spacing.s2,
    fontFamily: Type.bodyMedium,
    fontSize: 12,
    color: Swo.ink3,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  contextShell: {
    marginTop: Spacing.s4,
    backgroundColor: Swo.shell,
    borderRadius: Radius.r3,
    padding: Spacing.s3,
  },
  contextLabel: {
    fontFamily: Type.bodyMedium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Swo.ink3,
    marginBottom: 4,
  },
  contextBody: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 20 },
  expiresLine: {
    marginTop: Spacing.s4,
    fontFamily: Type.body,
    fontSize: 12,
    color: Swo.ink3,
    textAlign: 'center',
  },
});
