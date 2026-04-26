import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

type Coupon = {
  id: string;
  emoji: string;
  headline: string;
  merchant: string;
  expires: string;
  discount: number;
  bg: string;
  status: 'active' | 'redeemed';
};

const SAMPLE_COUPONS: Coupon[] = [
  {
    id: '1',
    emoji: '☕',
    headline: 'Oat flat white, on the house',
    merchant: 'Café Mayer',
    expires: 'Today, 13:47',
    discount: 100,
    bg: Swo.coralSoft,
    status: 'active',
  },
  {
    id: '2',
    emoji: '🥐',
    headline: 'Two croissants for one',
    merchant: 'Bäckerei Anna',
    expires: 'Today, 11:30',
    discount: 50,
    bg: Swo.mustardSoft,
    status: 'active',
  },
  {
    id: '3',
    emoji: '🍰',
    headline: 'Slice of cherry tart',
    merchant: 'Konditorei Nest',
    expires: 'Yesterday',
    discount: 30,
    bg: Swo.mintSoft,
    status: 'redeemed',
  },
];

export default function CouponsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const active = SAMPLE_COUPONS.filter((c) => c.status === 'active');
  const past = SAMPLE_COUPONS.filter((c) => c.status === 'redeemed');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your coupons</Text>
          <Text style={styles.title}>Saved for the right moment</Text>
        </View>

        <Text style={styles.section}>Ready to redeem · {active.length}</Text>
        <View style={styles.list}>
          {active.length === 0 ? (
            <EmptyState />
          ) : (
            active.map((c) => <CouponRow key={c.id} c={c} />)
          )}
        </View>

        {past.length > 0 && (
          <>
            <Text style={[styles.section, styles.sectionMt]}>Used</Text>
            <View style={styles.list}>
              {past.map((c) => (
                <CouponRow key={c.id} c={c} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CouponRow({ c }: { c: Coupon }) {
  const redeemed = c.status === 'redeemed';
  return (
    <View style={[styles.card, redeemed && styles.cardRedeemed]}>
      <View style={[styles.thumb, { backgroundColor: c.bg }]}>
        <Text style={styles.thumbEmoji}>{c.emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <Chip
            label={redeemed ? 'Redeemed' : `${c.discount}% off`}
            variant={redeemed ? 'mint' : 'mustard'}
          />
          <Chip label={`⏱ ${c.expires}`} variant="soft" />
        </View>
        <Text style={styles.headline} numberOfLines={2}>
          {c.headline}
        </Text>
        <Text style={styles.merchant}>{c.merchant}</Text>
      </View>
    </View>
  );
}

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
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    overflow: 'hidden',
    ...Shadow.s1,
  },
  cardRedeemed: { opacity: 0.7 },
  thumb: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyBody: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, textAlign: 'center', lineHeight: 20 },
});
