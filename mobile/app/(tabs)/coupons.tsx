import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { SEED_DEMO_IDS, SEED_DEMO_OFFERS } from '@/dev/seed-demo-coupons';
import { getMyProfile, isProfileOnboarded } from '@/services/profile';
import { listMyOffers } from '@/services/offers';
import { useAuth } from '@/providers/AuthProvider';

type Offer = Awaited<ReturnType<typeof listMyOffers>>[number];
const TEST_EMAIL = 'bkrinahmed007@gmail.com';

function isDebugUser(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === TEST_EMAIL;
}

function createDebugCoupon(): Offer {
  return {
    id: 'debug',
    token: 'DEBUG-TOKEN',
    headline: 'Debug preview offer',
    subline: 'Use this coupon to test all skins.',
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

function getEmoji(category: string | undefined): string {
  if (!category) return '🏪';
  const lower = category.toLowerCase();
  const map: [string, string][] = [
    ['cafe', '☕'], ['coffee', '☕'], ['bakery', '🥐'], ['pastry', '🥐'],
    ['dessert', '🍰'], ['sweet', '🍰'], ['bar', '🍺'], ['pizza', '🍕'],
    ['burger', '🍔'], ['sushi', '🍱'], ['ice', '🍦'], ['restaurant', '🍽️'],
  ];
  return map.find(([k]) => lower.includes(k))?.[1] ?? '🏪';
}

function getBg(category: string | undefined): string {
  if (!category) return Swo.skySoft;
  const lower = category.toLowerCase();
  if (lower.includes('cafe') || lower.includes('coffee')) return Swo.coralSoft;
  if (lower.includes('bakery') || lower.includes('pastry')) return Swo.mustardSoft;
  if (lower.includes('dessert') || lower.includes('sweet')) return Swo.mintSoft;
  return Swo.skySoft;
}

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return '';
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m left`;
}

export default function CouponsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const router = useRouter();

  const { user } = useAuth();
  const isTestUser = isDebugUser(user?.email);
  const showDebugSkins = isTestUser;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setOffers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const debugUser = isDebugUser(user?.email);
    Promise.all([listMyOffers(), getMyProfile()])
      .then(([rows, profile]) => {
        const onboarded = isProfileOnboarded(profile?.intent_vector);
        if (onboarded) {
          const seed = SEED_DEMO_OFFERS as unknown as Offer[];
          const rest = rows.filter((r) => !SEED_DEMO_IDS.has(r.id));
          setOffers([...seed, ...rest]);
        } else if (debugUser && rows.length === 0) {
          setOffers([createDebugCoupon()]);
        } else {
          setOffers(rows);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, user?.email]);

  const active = offers.filter(o => o.status === 'active');
  const past = offers.filter(o => o.status === 'redeemed');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your coupons</Text>
          <Text style={styles.title}>Saved for the right moment</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Swo.mustard} style={{ marginTop: Spacing.s8 }} />
        ) : (
          <>
            <Text style={styles.section}>Ready to redeem · {active.length}</Text>
            <View style={styles.list}>
              {active.length === 0 ? (
                <EmptyState />
              ) : (
                active.map(o => (
                  <CouponRow
                    key={o.id}
                    offer={o}
                    onPress={() =>
                      router.push(o.id === 'debug' ? '/coupon/debug?debugSkin=morning' : `/coupon/${o.id}`)
                    }
                  />
                ))
              )}
            </View>

            {past.length > 0 && (
              <>
                <Text style={[styles.section, styles.sectionMt]}>Used</Text>
                <View style={styles.list}>
                  {past.map(o => (
                    <CouponRow
                      key={o.id}
                      offer={o}
                      onPress={() =>
                        router.push(o.id === 'debug' ? '/coupon/debug?debugSkin=morning' : `/coupon/${o.id}`)
                      }
                    />
                  ))}
                </View>
              </>
            )}

            {showDebugSkins && (
              <DebugSection
                onNavigate={(skin) => router.push(`/coupon/debug?debugSkin=${skin}`)}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CouponRow({ offer, onPress }: { offer: Offer; onPress: () => void }) {
  const redeemed = offer.status === 'redeemed';
  const merchant = Array.isArray(offer.merchant) ? offer.merchant[0] : offer.merchant;
  const emoji = getEmoji(merchant?.category ?? undefined);
  const bg = getBg(merchant?.category ?? undefined);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, redeemed && styles.cardRedeemed, pressed && styles.cardPressed]}
    >
      <View style={[styles.thumb, { backgroundColor: bg }]}>
        <Text style={styles.thumbEmoji}>{emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <Chip
            label={redeemed ? 'Redeemed' : `${offer.discount_percent ?? 0}% off`}
            variant={redeemed ? 'mint' : 'mustard'}
          />
          {offer.expires_at && !redeemed && (
            <Chip label={`Time ${formatExpiry(offer.expires_at)}`} variant="soft" />
          )}
        </View>
        <Text style={styles.headline} numberOfLines={2}>
          {offer.headline ?? ''}
        </Text>
        <Text style={styles.merchant}>{merchant?.name ?? ''}</Text>
      </View>
      {!redeemed && (
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      )}
    </Pressable>
  );
}

const DEBUG_SKINS = [
  { key: 'morning', emoji: '🌅', label: 'Morning', sub: 'Warm parchment · newspaper' },
  { key: 'noon',    emoji: '☀️', label: 'Noon',    sub: 'Bold mustard poster' },
  { key: 'golden',  emoji: '🌇', label: 'Golden',  sub: 'Afternoon editorial' },
  { key: 'dusk',    emoji: '🌙', label: 'Dusk',    sub: 'Dark luxe · evening' },
] as const;

function DebugSection({ onNavigate }: { onNavigate: (skin: string) => void }) {
  return (
    <View style={dbg.wrap}>
      <View style={dbg.header}>
        <Text style={dbg.eyebrow}>⚙ Debug</Text>
        <Text style={dbg.title}>Preview all skins</Text>
      </View>
      {DEBUG_SKINS.map(s => (
        <Pressable key={s.key} onPress={() => onNavigate(s.key)}
          style={({ pressed }) => [dbg.row, pressed && dbg.rowPressed]}>
          <Text style={dbg.rowEmoji}>{s.emoji}</Text>
          <View style={dbg.rowText}>
            <Text style={dbg.rowLabel}>{s.label}</Text>
            <Text style={dbg.rowSub}>{s.sub}</Text>
          </View>
          <Text style={dbg.rowArrow}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const dbg = StyleSheet.create({
  wrap: {
    marginTop: Spacing.s6,
    borderWidth: 1,
    borderColor: Swo.mustardDeep + '40',
    borderRadius: Radius.r4,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: Swo.mustardSoft,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    gap: Spacing.s1,
  },
  eyebrow: {
    fontFamily: Type.bodySemi,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Swo.mustardDeep,
  },
  title: {
    fontFamily: Type.displaySemi,
    fontSize: 16,
    color: Swo.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    backgroundColor: Swo.paper,
    borderTopWidth: 1,
    borderTopColor: Swo.borderSoft,
    gap: Spacing.s3,
  },
  rowPressed: { backgroundColor: Swo.creamDeep },
  rowEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: Type.bodyMedium, fontSize: 15, color: Swo.ink },
  rowSub: { fontFamily: Type.body, fontSize: 12, color: Swo.ink3 },
  rowArrow: { fontFamily: Type.bodySemi, fontSize: 20, color: Swo.ink3 },
});

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🌤</Text>
      <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
      <Text style={styles.emptyBody}>
        Right-swiped offers will live here, ready to redeem at the merchant.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s4 },
  scrollWide: { paddingHorizontal: Spacing.s9, maxWidth: 720, alignSelf: 'center', width: '100%' },
  header: { gap: Spacing.s2, marginBottom: Spacing.s3 },
  eyebrow: {
    fontFamily: Type.bodySemi,
    fontSize: 12,
    color: Swo.coralDeep,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Type.displayBlack,
    fontSize: 30,
    lineHeight: 34,
    color: Swo.ink,
    letterSpacing: -0.5,
  },
  section: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: Spacing.s2,
  },
  sectionMt: { marginTop: Spacing.s5 },
  list: { gap: Spacing.s3 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    overflow: 'hidden',
    ...Shadow.s1,
  },
  cardRedeemed: { opacity: 0.65 },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.85 },
  thumb: {
    width: 96,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  thumbEmoji: { fontSize: 40, opacity: 0.85 },
  cardBody: {
    flex: 1,
    padding: Spacing.s4,
    gap: Spacing.s2,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap' },
  headline: {
    fontFamily: Type.display,
    fontSize: 17,
    lineHeight: 22,
    color: Swo.ink,
    letterSpacing: -0.1,
  },
  merchant: {
    fontFamily: Type.bodyMedium,
    fontSize: 13,
    color: Swo.ink3,
  },
  arrow: { paddingRight: Spacing.s4 },
  arrowText: { fontFamily: Type.bodySemi, fontSize: 22, color: Swo.ink3 },
  empty: {
    alignItems: 'center',
    padding: Spacing.s8,
    gap: Spacing.s3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Swo.ink4,
    borderRadius: Radius.r4,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: Type.displaySemi, fontSize: 20, color: Swo.ink },
  emptyBody: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink2,
    textAlign: 'center',
    lineHeight: 20,
  },
});
