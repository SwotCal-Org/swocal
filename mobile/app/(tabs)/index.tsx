import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

import { SwocalCard, type Offer } from '@/components/swocal-card';
import {
  makeRedemptionToken,
  MatchAfterSwipeOverlay,
  SwipeCouponScreen,
} from '@/components/swipe/match-coupon-overlays';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase/client';

type NearbyStore = {
  id: string;
  name: string;
  category: string;
  address: string;
  distance_m: number | null;
  lat: number | null;
  lng: number | null;
  photo_name?: string | null;
  rating?: number | null;
  review_count?: number | null;
};

const DEV_GOOGLE_PLACES_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? '';
const GOOGLE_INCLUDED_TYPES = [
  'restaurant',
  'cafe',
  'bakery',
  'bar',
  'beauty_salon',
  'spa',
  'gym',
  'clothing_store',
  'shopping_mall',
  'supermarket',
  'store',
] as const;

const INTEREST_OPTIONS = [
  { label: 'Coffee & cafes', icon: '☕' },
  { label: 'Restaurants', icon: '🍽️' },
  { label: 'Beauty & wellness', icon: '💅' },
  { label: 'Fitness', icon: '🏋️' },
  { label: 'Retail & fashion', icon: '🛍️' },
  { label: 'Home services', icon: '🛠️' },
  { label: 'Entertainment', icon: '🎭' },
  { label: 'Groceries', icon: '🛒' },
] as const;
const SPEND_OPTIONS = [
  { label: 'Budget-friendly', icon: '💸' },
  { label: 'Mid-range', icon: '💳' },
  { label: 'Premium', icon: '✨' },
] as const;
const VIBE_OPTIONS = [
  { label: 'Cozy', icon: '🛋️' },
  { label: 'Trendy', icon: '🔥' },
  { label: 'Quiet', icon: '🤫' },
  { label: 'Family-friendly', icon: '👨‍👩‍👧‍👦' },
  { label: 'Fast and convenient', icon: '⚡' },
] as const;
const BUDGET_OPTIONS = ['€', '€€', '€€€'] as const;
const TAB_BAR_VISIBLE_STYLE = {
  backgroundColor: Swo.paper,
  borderTopWidth: 1,
  borderTopColor: Swo.borderSoft,
  height: Platform.select({ ios: 84, default: 68 }),
  paddingBottom: Platform.select({ ios: 24, default: Spacing.s2 }),
  paddingTop: Spacing.s1,
};
const TAB_BAR_HIDDEN_STYLE = { ...TAB_BAR_VISIBLE_STYLE, display: 'none' as const };

// ─── SwipeStack ───────────────────────────────────────────────────────────────

function SwipeStack({
  offers,
  onOpenPlace,
  onSwipe,
}: {
  offers: Offer[];
  onOpenPlace: (offer: Offer) => void;
  onSwipe: (direction: 'left' | 'right', offer: Offer) => void;
}) {
  const [topIdx, setTopIdx] = useState(0);
  const { width: SW } = useWindowDimensions();
  const offerCount = offers.length;

  // Shared values live on the UI thread — zero JS bridge cost during drag.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // Called on JS thread after card flies off screen.
  function advance() {
    if (offerCount === 0) return;
    setTopIdx(i => (i + 1) % offerCount);
  }

  function handleSwipeCommit(direction: 'left' | 'right', offerId: string) {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;
    onSwipe(direction, offer);
  }

  // When live offer data refreshes, keep index in bounds.
  useEffect(() => {
    if (offerCount === 0) {
      setTopIdx(0);
      return;
    }
    setTopIdx((i) => (i >= offerCount ? 0 : i));
  }, [offerCount]);

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
      if (offerCount === 0) return;
      const farEnough = (tx.value < 0 ? -tx.value : tx.value) > SW * 0.32;
      const fastEnough = (e.velocityX < 0 ? -e.velocityX : e.velocityX) > 700;

      if (farEnough || fastEnough) {
        // Fling off screen, then advance to next card.
        const dir = tx.value > 0 ? 1 : -1;
        const direction: 'left' | 'right' = dir > 0 ? 'right' : 'left';
        if (top) {
          runOnJS(handleSwipeCommit)(direction, top.id);
        }
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

  if (offerCount === 0) {
    return <View style={swipeStyles.stack} />;
  }

  const safeTopIdx = topIdx >= offerCount ? 0 : topIdx;
  const top = offers[safeTopIdx];
  const peek = offers[(safeTopIdx + 1) % offerCount];

  if (!top || !peek) {
    return <View style={swipeStyles.stack} />;
  }

  return (
    <View style={swipeStyles.stack}>
      {/* Peek card sits behind — no gesture, just observes tx */}
      <Animated.View style={[StyleSheet.absoluteFillObject, peekCardStyle]} pointerEvents="none">
        <SwocalCard offer={peek} />
      </Animated.View>

      {/* Top card — receives the pan gesture */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[StyleSheet.absoluteFillObject, topCardStyle]}>
          <SwocalCard offer={top} onPress={() => onOpenPlace(top)} />

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
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const { user } = useAuth();
  const [locationLabel, setLocationLabel] = useState('Your area');
  const [weatherLabel, setWeatherLabel] = useState('🌤️  --°C');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState<'intro' | 'form'>('intro');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSpend, setSelectedSpend] = useState<string>('Mid-range');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>('€€');
  const [firstName, setFirstName] = useState('there');
  const [selectedPlace, setSelectedPlace] = useState<Offer | null>(null);
  const [matchOffer, setMatchOffer] = useState<Offer | null>(null);
  const [couponSession, setCouponSession] = useState<{ offer: Offer; token: string } | null>(null);

  const stepAnim = useSharedValue(1);
  const introAnim = useSharedValue(0);
  const placeModalProgress = useSharedValue(0);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    stepAnim.value = 0;
    stepAnim.value = withTiming(1, { duration: 260 });
  }, [onboardingStep, stepAnim]);

  const onboardingStepStyle = useAnimatedStyle(() => ({
    opacity: stepAnim.value,
    transform: [{ translateY: interpolate(stepAnim.value, [0, 1], [14, 0], Extrapolation.CLAMP) }],
  }));

  const introStyle = useAnimatedStyle(() => ({
    opacity: introAnim.value,
    transform: [{ translateY: interpolate(introAnim.value, [0, 1], [22, 0], Extrapolation.CLAMP) }],
  }));

  const placeBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(placeModalProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const placeContentStyle = useAnimatedStyle(() => ({
    opacity: placeModalProgress.value,
    transform: [
      { translateY: interpolate(placeModalProgress.value, [0, 1], [34, 0], Extrapolation.CLAMP) },
      { scale: interpolate(placeModalProgress.value, [0, 1], [0.98, 1], Extrapolation.CLAMP) },
    ],
  }));

  useEffect(() => {
    placeModalProgress.value = withTiming(selectedPlace ? 1 : 0, { duration: 260 });
  }, [selectedPlace, placeModalProgress]);

  useEffect(() => {
    let cancelled = false;

    async function loadOnboarding() {
      if (!user?.id) return;
      try {
        const [profileRes, permRes] = await Promise.all([
          supabase.from('profiles').select('intent_vector, full_name').eq('id', user.id).maybeSingle(),
          Location.getForegroundPermissionsAsync(),
        ]);
        if (cancelled) return;

        const vector = profileRes.data?.intent_vector;
        const hasPrefs = hasPreferences(vector);
        const sourceName =
          profileRes.data?.full_name ??
          (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null) ??
          user.email ??
          null;
        setFirstName(extractFirstName(sourceName));

        const currentPermission =
          permRes.status === 'granted' ? 'granted' : permRes.status === 'denied' ? 'denied' : 'unknown';
        setPermission(currentPermission);

        if (!hasPrefs) {
          setOnboardingStep(0);
          setOnboardingPhase('intro');
          setOnboardingOpen(true);
        }
      } catch {
        // Fallback: keep app usable even if profile check fails.
      }
    }

    loadOnboarding();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      setOffersLoading(true);
      setOffersError(null);
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        let granted = perm.status === 'granted';

        if (!granted) {
          const requested = await Location.requestForegroundPermissionsAsync();
          granted = requested.status === 'granted';
        }

        if (!granted || cancelled) return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        const { latitude, longitude } = pos.coords;

        // Keep copy short and human-friendly for the top context chip.
        try {
          const places = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (!cancelled && places.length > 0) {
            const place = places[0];
            const label = place.city || place.subregion || place.region || 'Nearby';
            setLocationLabel(label);
          }
        } catch {
          // If reverse geocoding fails, keep generic fallback label.
        }

        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
          );
          if (!weatherRes.ok || cancelled) return;
          const payload = await weatherRes.json();
          if (cancelled) return;
          const temp = Math.round(payload?.current?.temperature_2m);
          const weatherCode = payload?.current?.weather_code;
          const emoji = weatherCodeToEmoji(weatherCode);
          if (Number.isFinite(temp)) {
            setWeatherLabel(`${emoji}  ${temp}°C`);
          }
        } catch {
          // If weather request fails, keep fallback weather chip.
        }

        try {
          const { stores } = await fetchNearbyStores(latitude, longitude);
          if (cancelled) return;
          const nextOffers = stores
            .map((store) => toOffer(store, latitude, longitude))
            .filter((offer): offer is Offer => offer != null)
            .sort((a, b) => a.distanceM - b.distanceM)
            .slice(0, 20);
          setOffers(nextOffers);
        } catch (err) {
          setOffersError(formatApiError(err));
          setOffers([]);
        }
      } catch {
        // Permission/location failures gracefully fall back to defaults.
        setOffersError('Enable location to load nearby stores.');
      } finally {
        if (!cancelled) setOffersLoading(false);
      }
    }

    loadContext();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!onboardingOpen || onboardingPhase !== 'intro') return;
    introAnim.value = 0;
    introAnim.value = withTiming(1, { duration: 420 });

    const fadeOutId = setTimeout(() => {
      introAnim.value = withTiming(0, { duration: 260 });
    }, 1300);
    const advanceId = setTimeout(() => {
      setOnboardingPhase('form');
    }, 1700);

    return () => {
      clearTimeout(fadeOutId);
      clearTimeout(advanceId);
    };
  }, [onboardingOpen, onboardingPhase, introAnim]);

  useEffect(() => {
    // Apply on this screen and parent navigator to avoid tab bar bleed-through.
    const hideTabBar = onboardingOpen || !!selectedPlace || !!matchOffer || !!couponSession;
    navigation.setOptions({
      tabBarStyle: hideTabBar ? TAB_BAR_HIDDEN_STYLE : TAB_BAR_VISIBLE_STYLE,
    });

    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarStyle: hideTabBar ? TAB_BAR_HIDDEN_STYLE : TAB_BAR_VISIBLE_STYLE,
    });

    return () => {
      navigation.setOptions({ tabBarStyle: TAB_BAR_VISIBLE_STYLE });
      parent?.setOptions({ tabBarStyle: TAB_BAR_VISIBLE_STYLE });
    };
  }, [navigation, onboardingOpen, selectedPlace, matchOffer, couponSession]);

  useFocusEffect(
    useCallback(() => {
      const hideTabBar = onboardingOpen || !!selectedPlace || !!matchOffer || !!couponSession;
      navigation.setOptions({
        tabBarStyle: hideTabBar ? TAB_BAR_HIDDEN_STYLE : TAB_BAR_VISIBLE_STYLE,
      });
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: hideTabBar ? TAB_BAR_HIDDEN_STYLE : TAB_BAR_VISIBLE_STYLE,
      });
      return () => {
        navigation.setOptions({ tabBarStyle: TAB_BAR_VISIBLE_STYLE });
        parent?.setOptions({ tabBarStyle: TAB_BAR_VISIBLE_STYLE });
      };
    }, [navigation, onboardingOpen, selectedPlace, matchOffer, couponSession])
  );

  const onboardingScreens = useMemo(
    () => [
      ...(permission !== 'granted'
        ? [
            {
              key: 'location',
              title: 'Enable location',
              subtitle: 'We need it for nearby offers, distance ranking, and live context.',
            },
          ]
        : []),
      {
        key: 'tastes',
        title: 'What interests you most?',
        subtitle: 'Pick at least 2 business categories.',
      },
      {
        key: 'style',
        title: 'Your style',
        subtitle: 'Help us match places to your spending style and vibe.',
      },
      {
        key: 'budget',
        title: 'Budget comfort',
        subtitle: 'We prioritize offers in your preferred range.',
      },
    ],
    [firstName, permission]
  );

  const isLastStep = onboardingStep >= onboardingScreens.length - 1;

  async function handleAllowLocation() {
    const res = await Location.requestForegroundPermissionsAsync();
    const next = res.status === 'granted' ? 'granted' : 'denied';
    setPermission(next);
    if (next === 'granted') {
      setOnboardingStep((s) => Math.min(s + 1, onboardingScreens.length - 1));
    }
  }

  async function handleFinishOnboarding() {
    if (!user?.id) return;
    setOnboardingBusy(true);
    try {
      const intentVector = {
        interests: selectedInterests,
        spend_style: selectedSpend,
        vibes: selectedVibes,
        budget: selectedBudget,
        weather_sensitive: true,
        location_enabled: permission === 'granted',
        onboarding_completed_at: new Date().toISOString(),
      };

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          full_name: firstName === 'there' ? null : firstName,
          intent_vector: intentVector,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      setOnboardingOpen(false);
    } finally {
      setOnboardingBusy(false);
    }
  }

  function recordSwipe(direction: 'left' | 'right', offer: Offer) {
    if (!user?.id) return;
    // Fire-and-forget: we don't block swipe UX on network latency.
    void supabase
      .from('user_swipes')
      .insert({
        user_id: user.id,
        direction,
        business_id: offer.id,
        business_name: offer.merchant,
        business_address: offer.address,
        business_category: offer.category,
        distance_m: offer.distanceM,
        swiped_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) {
          console.warn('Failed to store swipe:', error.message);
        }
      });
  }

  function onDeckSwipe(direction: 'left' | 'right', offer: Offer) {
    recordSwipe(direction, offer);
    if (direction === 'right') {
      setMatchOffer(offer);
    }
  }

  if (onboardingOpen) {
    if (onboardingPhase === 'intro') {
      return (
        <SafeAreaView style={screenStyles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={screenStyles.onboardingIntroScreen}>
            <Animated.View style={introStyle}>
              <Text style={screenStyles.onboardingIntroTitle}>Hi {firstName} 👋</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={screenStyles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={screenStyles.onboardingScreen}>
          <View style={[screenStyles.onboardingFrame, isWide && screenStyles.onboardingFrameWide]}>
            <View style={screenStyles.onboardingProgressRow}>
              {onboardingScreens.map((screen, idx) => (
                <View
                  key={screen.key}
                  style={[screenStyles.progressDot, idx <= onboardingStep && screenStyles.progressDotActive]}
                />
              ))}
            </View>

            <Animated.View style={[screenStyles.onboardingContent, onboardingStepStyle]}>
              <Animated.View
                key={onboardingScreens[onboardingStep]?.key}
                entering={FadeInUp.duration(260)}
                exiting={FadeOutUp.duration(180)}
                style={screenStyles.stepAnimatedWrap}
              >
                <Text style={screenStyles.onboardingTitle}>{onboardingScreens[onboardingStep]?.title}</Text>
                <Text style={screenStyles.onboardingBody}>{onboardingScreens[onboardingStep]?.subtitle}</Text>

                {onboardingScreens[onboardingStep]?.key === 'location' && (
                  <Animated.View
                    entering={FadeInUp.delay(70).duration(260)}
                    exiting={FadeOutUp.duration(150)}
                    style={screenStyles.stepBlock}
                  >
                    <Chip
                      label={permission === 'granted' ? '✅ Location enabled' : '📍 Location access needed'}
                      variant={permission === 'granted' ? 'mint' : 'sticker'}
                    />
                    <Button
                      title={permission === 'granted' ? 'Continue' : 'Allow location'}
                      onPress={
                        permission === 'granted'
                          ? () => setOnboardingStep((s) => Math.min(s + 1, onboardingScreens.length - 1))
                          : handleAllowLocation
                      }
                    />
                  </Animated.View>
                )}

                {onboardingScreens[onboardingStep]?.key === 'tastes' && (
                  <Animated.View
                    entering={FadeInUp.delay(70).duration(260)}
                    exiting={FadeOutUp.duration(150)}
                    style={screenStyles.stepBlock}
                  >
                    <View style={screenStyles.choiceWrap}>
                      {INTEREST_OPTIONS.map((item) => (
                        <ChoicePill
                          key={item.label}
                          label={item.label}
                          icon={item.icon}
                          active={selectedInterests.includes(item.label)}
                          onPress={() =>
                            setSelectedInterests((prev) =>
                              prev.includes(item.label)
                                ? prev.filter((v) => v !== item.label)
                                : [...prev, item.label]
                            )
                          }
                        />
                      ))}
                    </View>
                  </Animated.View>
                )}

                {onboardingScreens[onboardingStep]?.key === 'style' && (
                  <Animated.View
                    entering={FadeInUp.delay(70).duration(260)}
                    exiting={FadeOutUp.duration(150)}
                    style={screenStyles.stepBlock}
                  >
                    <Text style={screenStyles.stepLabel}>Spending style</Text>
                    <View style={screenStyles.choiceWrap}>
                      {SPEND_OPTIONS.map((item) => (
                        <ChoicePill
                          key={item.label}
                          label={item.label}
                          icon={item.icon}
                          active={selectedSpend === item.label}
                          onPress={() => setSelectedSpend(item.label)}
                        />
                      ))}
                    </View>
                    <Text style={[screenStyles.stepLabel, { marginTop: Spacing.s3 }]}>Preferred vibe</Text>
                    <View style={screenStyles.choiceWrap}>
                      {VIBE_OPTIONS.map((item) => (
                        <ChoicePill
                          key={item.label}
                          label={item.label}
                          icon={item.icon}
                          active={selectedVibes.includes(item.label)}
                          onPress={() =>
                            setSelectedVibes((prev) =>
                              prev.includes(item.label)
                                ? prev.filter((v) => v !== item.label)
                                : [...prev, item.label]
                            )
                          }
                        />
                      ))}
                    </View>
                  </Animated.View>
                )}

                {onboardingScreens[onboardingStep]?.key === 'budget' && (
                  <Animated.View
                    entering={FadeInUp.delay(70).duration(260)}
                    exiting={FadeOutUp.duration(150)}
                    style={screenStyles.stepBlock}
                  >
                    <View style={screenStyles.choiceWrap}>
                      {BUDGET_OPTIONS.map((item) => (
                        <ChoicePill
                          key={item}
                          label={item}
                          active={selectedBudget === item}
                          onPress={() => setSelectedBudget(item)}
                        />
                      ))}
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            </Animated.View>

            <View style={screenStyles.onboardingActions}>
              <View style={screenStyles.onboardingBackWrap}>
                {onboardingStep > 0 && (
                  <Button
                    title="Back"
                    variant="ghost"
                    size="md"
                    fullWidth={false}
                    disabled={onboardingBusy}
                    onPress={() => setOnboardingStep((s) => Math.max(0, s - 1))}
                  />
                )}
              </View>
              <View style={screenStyles.onboardingNextWrap}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isLastStep ? 'Finish setup' : 'Next step'}
                  disabled={
                    onboardingBusy ||
                    (onboardingScreens[onboardingStep]?.key === 'tastes' && selectedInterests.length < 2) ||
                    (onboardingScreens[onboardingStep]?.key === 'style' && selectedVibes.length === 0)
                  }
                  style={({ pressed }) => [
                    screenStyles.nextArrowBtn,
                    (onboardingBusy ||
                      (onboardingScreens[onboardingStep]?.key === 'tastes' && selectedInterests.length < 2) ||
                      (onboardingScreens[onboardingStep]?.key === 'style' && selectedVibes.length === 0)) &&
                      screenStyles.nextArrowBtnDisabled,
                    pressed && { transform: [{ scale: 0.96 }] },
                  ]}
                  onPress={
                    isLastStep
                      ? handleFinishOnboarding
                      : () => setOnboardingStep((s) => Math.min(s + 1, onboardingScreens.length - 1))
                  }
                >
                  <Text style={screenStyles.nextArrowText}>{isLastStep ? '✓' : '→'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.safe} edges={['top', 'left', 'right']}>
      {/* Context bar — weather + city + time */}
      <View style={screenStyles.contextBar}>
        <View style={screenStyles.contextLeft}>
          <Chip label={weatherLabel} variant="soft" />
          <Chip label={`📍 ${locationLabel}`} variant="soft" />
        </View>
      </View>

      {/* Heading */}
      <View style={[screenStyles.heading, isWide && screenStyles.headingWide]}>
        <Text style={screenStyles.eyebrow}>{greeting}</Text>
        <Text style={screenStyles.title}>What sounds good today?</Text>
      </View>

      {/* Deck — fills remaining space */}
      <View style={[screenStyles.deck, isWide && screenStyles.deckWide]}>
        {offersLoading ? (
          <View style={screenStyles.deckState}>
            <Text style={screenStyles.deckStateTitle}>Finding nearby stores…</Text>
            <Text style={screenStyles.deckStateBody}>We are loading live places around your current location.</Text>
          </View>
        ) : offers.length > 0 ? (
          <SwipeStack
            offers={offers}
            onOpenPlace={(offer) => setSelectedPlace(offer)}
            onSwipe={onDeckSwipe}
          />
        ) : (
          <View style={screenStyles.deckState}>
            <Text style={screenStyles.deckStateTitle}>No nearby stores yet</Text>
            <Text style={screenStyles.deckStateBody}>
              {offersError ?? 'Try again in a moment or move to a busier area.'}
            </Text>
          </View>
        )}
      </View>

      {/* Subtle directional hints */}
      <View style={screenStyles.hints}>
        <Text style={screenStyles.hintText}>← not for now</Text>
        <Text style={screenStyles.hintText}>yes please →</Text>
      </View>

      {selectedPlace && (
        <View style={screenStyles.placeModalRoot} pointerEvents="box-none">
          <Animated.View style={[screenStyles.placeBackdrop, placeBackdropStyle]}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSelectedPlace(null)} />
          </Animated.View>

          <Animated.View style={[screenStyles.placeModalContent, placeContentStyle]}>
            <SafeAreaView style={screenStyles.placeModalSafe} edges={['top', 'left', 'right', 'bottom']}>
              <View style={screenStyles.placeModalTopBar}>
                <Pressable
                  onPress={() => setSelectedPlace(null)}
                  style={({ pressed }) => [screenStyles.placeBackBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={screenStyles.placeBackText}>← Back</Text>
                </Pressable>
              </View>

              <View style={screenStyles.placeHero}>
                {selectedPlace.imageUrl ? (
                  <Animated.Image
                    source={{ uri: selectedPlace.imageUrl }}
                    style={screenStyles.placeHeroImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[screenStyles.placeHeroFallback, { backgroundColor: selectedPlace.photoBg }]}>
                    <Text style={screenStyles.placeHeroFallbackEmoji}>{selectedPlace.photoEmoji}</Text>
                  </View>
                )}
              </View>

              <View style={screenStyles.placeInfoCard}>
                <Text style={screenStyles.placeName}>{selectedPlace.merchant}</Text>
                <Text style={screenStyles.placeCategory}>{selectedPlace.category}</Text>

                <View style={screenStyles.placeMetaRow}>
                  <View style={screenStyles.placeMetaPill}>
                    <Text style={screenStyles.placeMetaPillText}>
                      {selectedPlace.commuteEmoji} {selectedPlace.distanceM}m
                    </Text>
                  </View>
                  {selectedPlace.rating != null ? (
                    <View style={screenStyles.placeMetaPill}>
                      <Text style={screenStyles.placeMetaPillText}>⭐ {selectedPlace.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                  {selectedPlace.reviewCount != null ? (
                    <View style={screenStyles.placeMetaPill}>
                      <Text style={screenStyles.placeMetaPillText}>🗣 {selectedPlace.reviewCount}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={screenStyles.placeSectionLabel}>Address</Text>
                <Text style={screenStyles.placeBody}>{selectedPlace.address}</Text>

                <Text style={screenStyles.placeSectionLabel}>About</Text>
                <Text style={screenStyles.placeBody}>
                  Local spot in your current area. Swipe right to save and check available offers in your wallet.
                </Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

      {matchOffer && !couponSession && (
        <MatchAfterSwipeOverlay
          offer={matchOffer}
          onShowCoupon={() => {
            setCouponSession({ offer: matchOffer, token: makeRedemptionToken(matchOffer) });
            setMatchOffer(null);
          }}
          onKeepSwiping={() => setMatchOffer(null)}
        />
      )}

      {couponSession && (
        <SwipeCouponScreen
          offer={couponSession.offer}
          token={couponSession.token}
          contextLine={`${weatherLabel} · ${locationLabel} · matched to your area`}
          onBack={() => setCouponSession(null)}
        />
      )}
    </SafeAreaView>
  );
}

function hasPreferences(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.keys(value as Record<string, unknown>).length > 0;
}

function extractFirstName(raw: string | null) {
  if (!raw) return 'there';
  const trimmed = raw.trim();
  if (!trimmed) return 'there';
  if (trimmed.includes('@')) {
    const local = trimmed.split('@')[0]?.trim();
    if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return trimmed.split(/\s+/)[0];
}

function ChoicePill({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        screenStyles.choicePill,
        active && screenStyles.choicePillActive,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text style={[screenStyles.choicePillText, active && screenStyles.choicePillTextActive]}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function categoryEmoji(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('cafe')) return '☕';
  if (lower.includes('restaurant') || lower.includes('food')) return '🍽️';
  if (lower.includes('bakery')) return '🥐';
  if (lower.includes('bar') || lower.includes('pub')) return '🍸';
  if (lower.includes('beauty') || lower.includes('spa')) return '💅';
  if (lower.includes('fitness') || lower.includes('gym')) return '🏋️';
  if (lower.includes('fashion') || lower.includes('retail') || lower.includes('store')) return '🛍️';
  if (lower.includes('entertain')) return '🎭';
  if (lower.includes('grocery') || lower.includes('market')) return '🛒';
  return '🏪';
}

function photoBgByCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('cafe')) return Swo.coralSoft;
  if (lower.includes('beauty') || lower.includes('spa')) return Swo.plumSoft;
  if (lower.includes('fitness')) return Swo.mintSoft;
  if (lower.includes('fashion') || lower.includes('retail')) return Swo.mustardSoft;
  if (lower.includes('entertain')) return Swo.skySoft;
  return Swo.creamDeep;
}

function timeLeftByDistance(distanceM: number) {
  if (distanceM <= 500) return '2 hours';
  if (distanceM <= 1500) return '4 hours';
  return 'Today';
}

function commuteEmoji(distanceM: number) {
  return distanceM > 1800 ? '🚗' : '🚶';
}

function toOffer(store: NearbyStore, userLat: number, userLng: number): Offer | null {
  let distanceM = store.distance_m ?? null;
  if (store.lat != null && store.lng != null) {
    distanceM = haversineMeters(userLat, userLng, store.lat, store.lng);
  }
  if (distanceM == null) return null;
  const emoji = categoryEmoji(store.category);
  const idHash = store.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const discount = 8 + (idHash % 12);
  return {
    id: store.id,
    category: store.category,
    categoryEmoji: emoji,
    headline: store.name,
    merchant: store.name,
    address: store.address,
    distanceM,
    commuteEmoji: commuteEmoji(distanceM),
    imageUrl: store.photo_name
      ? `https://places.googleapis.com/v1/${store.photo_name}/media?maxWidthPx=1000&key=${DEV_GOOGLE_PLACES_KEY}`
      : undefined,
    rating: Number.isFinite(store.rating) ? Number(store.rating) : undefined,
    reviewCount: Number.isFinite(store.review_count) ? Number(store.review_count) : undefined,
    timeLeft: timeLeftByDistance(distanceM),
    discount,
    photoBg: photoBgByCategory(store.category),
    photoEmoji: emoji,
  };
}

async function fetchNearbyStores(lat: number, lng: number) {
  if (!DEV_GOOGLE_PLACES_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in mobile/.env');
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Goog-Api-Key': DEV_GOOGLE_PLACES_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.photos,places.rating,places.userRatingCount',
    },
    body: JSON.stringify({
      maxResultCount: 20,
      includedTypes: GOOGLE_INCLUDED_TYPES,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 3000,
        },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Direct Google Places error ${res.status}: ${text}`);
  }
  const payload = (await res.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      primaryTypeDisplayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
      types?: string[];
      distanceMeters?: number;
      photos?: Array<{ name?: string }>;
      rating?: number;
      userRatingCount?: number;
    }>;
  };
  const stores: NearbyStore[] = (payload.places ?? []).map((p) => ({
    id: p.id ?? '',
    name: p.displayName?.text ?? '',
    category:
      p.types?.[0] ? p.types[0].replace(/_/g, ' ') : 'Local business',
    distance_m: Number.isFinite(p.distanceMeters) ? Number(p.distanceMeters) : null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    address: p.formattedAddress ?? 'Nearby',
    photo_name: p.photos?.[0]?.name ?? null,
    rating: Number.isFinite(p.rating) ? Number(p.rating) : null,
    review_count: Number.isFinite(p.userRatingCount) ? Number(p.userRatingCount) : null,
  }));
  return { stores: stores.filter((s) => s.id && s.name), source: 'direct' as const };
}

function weatherCodeToEmoji(code: number | undefined) {
  // Open-Meteo WMO weather codes.
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return '🌦️';
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) return '🌧️';
  if (code === 71 || code === 73 || code === 75 || code === 77) return '🌨️';
  if (code === 80 || code === 81 || code === 82) return '🌧️';
  if (code === 85 || code === 86) return '❄️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '🌤️';
}

function formatApiError(err: unknown) {
  const raw = String((err as Error)?.message ?? err ?? 'Unknown error');
  const start = raw.indexOf('{');
  if (start === -1) return raw;
  const maybeJson = raw.slice(start);
  try {
    return `${raw.slice(0, start).trim()}\n${JSON.stringify(JSON.parse(maybeJson), null, 2)}`;
  } catch {
    return raw;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  contextBar: {
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  deckState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s6,
    gap: Spacing.s2,
  },
  deckStateTitle: {
    fontFamily: Type.displaySemi,
    fontSize: 24,
    color: Swo.ink,
    textAlign: 'center',
  },
  deckStateBody: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink2,
    lineHeight: 20,
    textAlign: 'center',
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
  onboardingScreen: {
    flex: 1,
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s5,
  },
  onboardingIntroScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s6,
  },
  onboardingIntroTitle: {
    fontFamily: Type.displayBlack,
    fontSize: 48,
    lineHeight: 52,
    color: Swo.ink,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  onboardingFrame: {
    flex: 1,
    gap: Spacing.s4,
  },
  onboardingFrameWide: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  onboardingContent: {
    flex: 1,
  },
  stepAnimatedWrap: {
    flex: 1,
  },
  onboardingProgressRow: { flexDirection: 'row', gap: Spacing.s2 },
  progressDot: {
    flex: 1,
    height: 7,
    backgroundColor: Swo.creamDeep,
    borderRadius: Radius.pill,
  },
  progressDotActive: { backgroundColor: Swo.mustard },
  onboardingTitle: {
    fontFamily: Type.displayBlack,
    fontSize: 32,
    lineHeight: 36,
    color: Swo.ink,
    letterSpacing: -0.6,
  },
  onboardingBody: {
    marginTop: Spacing.s1,
    fontFamily: Type.body,
    fontSize: 16,
    lineHeight: 22,
    color: Swo.ink2,
  },
  stepBlock: { marginTop: Spacing.s4, gap: Spacing.s3 },
  stepLabel: { fontFamily: Type.bodySemi, fontSize: 13, color: Swo.ink3, letterSpacing: 0.3 },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s2 },
  choicePill: {
    minHeight: 48,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Swo.ink3,
    backgroundColor: Swo.paper,
    justifyContent: 'center',
  },
  choicePillActive: {
    borderColor: Swo.ink,
    backgroundColor: Swo.mustardSoft,
    ...Shadow.stickerSoft,
  },
  choicePillText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink2 },
  choicePillTextActive: { color: Swo.ink },
  onboardingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    paddingBottom: Spacing.s2,
  },
  onboardingBackWrap: { minWidth: 88 },
  onboardingNextWrap: { marginLeft: 'auto' },
  nextArrowBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    ...Shadow.stickerSoft,
  },
  nextArrowBtnDisabled: {
    opacity: 0.45,
  },
  nextArrowText: {
    fontFamily: Type.displayBlack,
    fontSize: 28,
    color: Swo.ink,
    lineHeight: 30,
  },
  placeModalRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  placeBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 14, 10, 0.32)',
  },
  placeModalContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Swo.cream,
  },
  placeModalSafe: { flex: 1 },
  placeModalTopBar: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
  placeBackBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s2,
    borderRadius: Radius.r3,
    backgroundColor: Swo.paper,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
  },
  placeBackText: { fontFamily: Type.bodySemi, color: Swo.ink },
  placeHero: {
    marginHorizontal: Spacing.s5,
    borderRadius: Radius.r5,
    overflow: 'hidden',
    height: 260,
    backgroundColor: Swo.paper,
    ...Shadow.s2,
  },
  placeHeroImage: { width: '100%', height: '100%' },
  placeHeroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeHeroFallbackEmoji: { fontSize: 92, opacity: 0.9 },
  placeInfoCard: {
    marginTop: Spacing.s4,
    marginHorizontal: Spacing.s5,
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s5,
    gap: Spacing.s2,
    ...Shadow.s2,
  },
  placeName: { fontFamily: Type.displayBlack, fontSize: 34, lineHeight: 38, color: Swo.ink, letterSpacing: -0.6 },
  placeCategory: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink3, textTransform: 'capitalize' },
  placeMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s2, marginTop: Spacing.s2 },
  placeMetaPill: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Swo.creamDeep,
  },
  placeMetaPillText: { fontFamily: Type.bodySemi, fontSize: 12, color: Swo.ink2 },
  placeSectionLabel: {
    marginTop: Spacing.s2,
    fontFamily: Type.bodyBold,
    fontSize: 11,
    color: Swo.coralDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  placeBody: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 21 },
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
