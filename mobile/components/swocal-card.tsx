import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

export type Offer = {
  id: string;
  category: string;
  categoryEmoji: string;
  headline: string;
  merchant: string;
  address: string;
  distanceM: number;
  timeLeft: string;
  discount: number;
  photoBg: string;
  photoEmoji: string;
};

export function SwocalCard({ offer }: { offer: Offer }) {
  const { width } = useWindowDimensions();
  // Photo emoji scales with card width — bigger phones, bigger food.
  const photoSize = Math.min(width * 0.32, 140);
  return (
    <View style={styles.card}>
      <View style={[styles.photo, { backgroundColor: offer.photoBg }]}>
        <Text style={[styles.photoEmoji, { fontSize: photoSize }]}>{offer.photoEmoji}</Text>
        <View style={styles.photoFade} />
        <View style={styles.categoryChip}>
          <Chip label={`${offer.categoryEmoji}  ${offer.category}`} variant="sticker" />
        </View>
        <View style={styles.discountChip}>
          <Chip label={`${offer.discount}% off`} variant="mustard" />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Chip label={`⏱ ${offer.timeLeft}`} variant="soft" />
          <Chip label={`${offer.distanceM}m away`} variant="soft" />
        </View>
        <Text style={styles.headline} numberOfLines={3}>
          {offer.headline}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.merchant}>{offer.merchant}</Text>
          <Text style={styles.dot}> · </Text>
          <Text style={styles.address} numberOfLines={1}>
            {offer.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    overflow: 'hidden',
    ...Shadow.s3,
  },
  photo: {
    flex: 0.58,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoEmoji: { opacity: 0.5 },
  photoFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  categoryChip: { position: 'absolute', top: Spacing.s4, left: Spacing.s4 },
  discountChip: { position: 'absolute', top: Spacing.s4, right: Spacing.s4, transform: [{ rotate: '4deg' }] },
  body: {
    flex: 0.42,
    padding: Spacing.s5,
    gap: Spacing.s3,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap' },
  headline: {
    fontFamily: Type.display,
    fontSize: 24,
    lineHeight: 28,
    color: Swo.ink,
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.s3,
    borderTopWidth: 1,
    borderTopColor: Swo.borderSoft,
  },
  merchant: { fontFamily: Type.displaySemi, fontSize: 14, color: Swo.ink },
  dot: { color: Swo.ink3 },
  address: { fontFamily: Type.body, fontSize: 13, color: Swo.ink3, flexShrink: 1 },
});
