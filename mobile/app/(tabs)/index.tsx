import { useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { SwocalCard, type Offer } from '@/components/swocal-card';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

// ─── Sample data ─────────────────────────────────────────────────────────────

const OFFERS: Offer[] = [
  {
    id: '1',
    category: 'Coffee',
    categoryEmoji: '☕',
    headline: 'Cold outside? Your cappuccino is waiting.',
    merchant: 'Café Mayer',
    address: 'Marktplatz 4, Stuttgart',
    distanceM: 200,
    timeLeft: '2 hours',
    discount: 15,
    photoBg: Swo.coralSoft,
    photoEmoji: '☕',
  },
  {
    id: '2',
    category: 'Bakery',
    categoryEmoji: '🥐',
    headline: 'Fresh croissants, butter still warm.',
    merchant: 'Bäckerei Anna',
    address: 'Königstraße 18, Stuttgart',
    distanceM: 90,
    timeLeft: '1 hour',
    discount: 20,
    photoBg: Swo.mustardSoft,
    photoEmoji: '🥐',
  },
  {
    id: '3',
    category: 'Wine bar',
    categoryEmoji: '🍷',
    headline: 'A glass of Trollinger, the hour just before dusk.',
    merchant: 'Weinstube Klink',
    address: 'Bohnenviertel 12, Stuttgart',
    distanceM: 340,
    timeLeft: '3 hours',
    discount: 10,
    photoBg: Swo.plumSoft,
    photoEmoji: '🍷',
  },
  {
    id: '4',
    category: 'Cake',
    categoryEmoji: '🍰',
    headline: 'Cherry tart, straight from the oven.',
    merchant: 'Konditorei Nest',
    address: 'Schillerplatz 3, Stuttgart',
    distanceM: 150,
    timeLeft: '45 min',
    discount: 25,
    photoBg: Swo.mintSoft,
    photoEmoji: '🍰',
  },
];

// ─── SwipeStack ───────────────────────────────────────────────────────────────

function SwipeStack({ offers }: { offers: Offer[] }) {
  const [topIdx, setTopIdx] = useState(0);
  const { width: SW } = useWindowDimensions();

  // Shared values live on the UI thread — zero JS bridge cost during drag.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // Called on JS thread after card flies off screen.
  function advance() {
    setTopIdx(i => (i + 1) % offers.length);
  }

  // Reset the drag offset *after* the new top card has mounted. Resetting it
  // inside `advance` would snap the still-mounted old card back to center for
  // one frame before React swaps in the next card.
  useLayoutEffect(() => {
    tx.value = 0;
    ty.value = 0;
  }, [topIdx, tx, ty]);

  const gesture = Gesture.Pan()
    .onUpdate(e => {
      tx.value = e.translationX;
      // Dampen vertical movement so the card mostly slides horizontally.
      ty.value = e.translationY * 0.35;
    })
    .onEnd(e => {
      const farEnough = (tx.value < 0 ? -tx.value : tx.value) > SW * 0.32;
      const fastEnough = (e.velocityX < 0 ? -e.velocityX : e.velocityX) > 700;

      if (farEnough || fastEnough) {
        // Fling off screen, then advance to next card.
        const dir = tx.value > 0 ? 1 : -1;
        tx.value = withTiming(dir * SW * 1.6, { duration: 320 }, () => {
          runOnJS(advance)();
        });
        // Slight arc on exit adds physicality.
        ty.value = withTiming(ty.value * 2, { duration: 320 });
      } else {
        // Bouncy snap back — matches the design system's --ease-bounce feel.
        tx.value = withSpring(0, { damping: 12, stiffness: 140, mass: 0.85 });
        ty.value = withSpring(0, { damping: 12, stiffness: 140, mass: 0.85 });
      }
    });

  // Top card: translate + rotate tied to drag.
  // Rotation clamps at ±22° so the card doesn't over-rotate during fly-off.
  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-SW, SW], [-22, 22], Extrapolation.CLAMP)}deg` },
    ],
  }));

  // Peek card: scales up and rises as the top card moves away.
  // CLAMP is critical here — without it, fly-off (tx = ±1.6·SW) would extrapolate
  // the scale far past 1.0, then snap back to 0.94 when tx resets.
  const peekCardStyle = useAnimatedStyle(() => {
    const absX = tx.value < 0 ? -tx.value : tx.value;
    return {
      transform: [
        { scale: interpolate(absX, [0, SW * 0.3], [0.94, 1.0], Extrapolation.CLAMP) },
        { translateY: interpolate(absX, [0, SW * 0.3], [14, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  // "YES PLEASE" stamp fades in when dragging right.
  const yesStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [30, 110], [0, 1], Extrapolation.CLAMP),
  }));

  // "NOT FOR NOW" stamp fades in when dragging left.
  const noStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-110, -30], [1, 0], Extrapolation.CLAMP),
  }));

  const top = offers[topIdx];
  const peek = offers[(topIdx + 1) % offers.length];

  return (
    <View style={swipeStyles.stack}>
      {/* Peek card sits behind — no gesture, just observes tx */}
      <Animated.View style={[StyleSheet.absoluteFillObject, peekCardStyle]} pointerEvents="none">
        <SwocalCard offer={peek} />
      </Animated.View>

      {/* Top card — receives the pan gesture */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[StyleSheet.absoluteFillObject, topCardStyle]}>
          <SwocalCard offer={top} />

          {/* Printed-sticker ghost labels appear as you drag */}
          <Animated.View
            style={[swipeStyles.stamp, swipeStyles.stampYes, yesStampStyle]}
            pointerEvents="none"
          >
            <Text style={swipeStyles.stampYesText}>YES PLEASE</Text>
          </Animated.View>

          <Animated.View
            style={[swipeStyles.stamp, swipeStyles.stampNo, noStampStyle]}
            pointerEvents="none"
          >
            <Text style={swipeStyles.stampNoText}>NOT FOR NOW</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SwipeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView style={screenStyles.safe} edges={['top', 'left', 'right']}>
      {/* Context bar — weather + city + time */}
      <View style={screenStyles.contextBar}>
        <View style={screenStyles.contextLeft}>
          <Chip label="☁️  11°C" variant="soft" />
          <Chip label="Stuttgart" variant="soft" />
        </View>
        <Chip label="🕐  Lunch" variant="mustard" />
      </View>

      {/* Heading */}
      <View style={[screenStyles.heading, isWide && screenStyles.headingWide]}>
        <Text style={screenStyles.eyebrow}>{greeting}</Text>
        <Text style={screenStyles.title}>What sounds good today?</Text>
      </View>

      {/* Deck — fills remaining space */}
      <View style={[screenStyles.deck, isWide && screenStyles.deckWide]}>
        <SwipeStack offers={OFFERS} />
      </View>

      {/* Subtle directional hints */}
      <View style={screenStyles.hints}>
        <Text style={screenStyles.hintText}>← not for now</Text>
        <Text style={screenStyles.hintText}>yes please →</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  contextBar: {
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contextLeft: { flexDirection: 'row', gap: Spacing.s2 },
  heading: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s1,
    paddingBottom: Spacing.s4,
    gap: 2,
  },
  headingWide: { maxWidth: 500, alignSelf: 'center', width: '100%' },
  eyebrow: {
    fontFamily: Type.bodyMedium,
    fontSize: 13,
    color: Swo.ink3,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: Type.displayBlack,
    fontSize: 26,
    lineHeight: 30,
    color: Swo.ink,
    letterSpacing: -0.4,
  },
  deck: {
    flex: 1,
    paddingHorizontal: Spacing.s5,
    paddingBottom: Spacing.s2,
  },
  deckWide: {
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  hints: {
    paddingHorizontal: Spacing.s6,
    paddingVertical: Spacing.s4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hintText: {
    fontFamily: Type.bodyMedium,
    fontSize: 13,
    color: Swo.ink4,
    letterSpacing: 0.2,
  },
});

const swipeStyles = StyleSheet.create({
  stack: {
    flex: 1,
    position: 'relative',
  },
  stamp: {
    position: 'absolute',
    top: 36,
    paddingHorizontal: Spacing.s5,
    paddingVertical: 10,
    borderRadius: Radius.r2,
    borderWidth: 3,
    borderColor: Swo.ink,
    ...Shadow.sticker,
  },
  stampYes: {
    left: 20,
    backgroundColor: Swo.mint,
    transform: [{ rotate: '-12deg' }],
  },
  stampYesText: {
    fontFamily: Type.displayBlack,
    fontSize: 18,
    color: Swo.paper,
    letterSpacing: 2,
  },
  stampNo: {
    right: 20,
    backgroundColor: Swo.paper,
    transform: [{ rotate: '12deg' }],
  },
  stampNoText: {
    fontFamily: Type.displayBlack,
    fontSize: 18,
    color: Swo.ink,
    letterSpacing: 2,
  },
});
