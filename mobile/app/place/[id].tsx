import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    category?: string;
    address?: string;
    distanceM?: string;
    commuteEmoji?: string;
    rating?: string;
    reviewCount?: string;
    imageUrl?: string;
    photoEmoji?: string;
    photoBg?: string;
  }>();

  const name = params.name || 'Place';
  const category = params.category || 'Local business';
  const address = params.address || 'Nearby';
  const distance = params.distanceM ? Number(params.distanceM) : null;
  const rating = params.rating ? Number(params.rating) : null;
  const reviewCount = params.reviewCount ? Number(params.reviewCount) : null;
  const photoBg = params.photoBg || Swo.creamDeep;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.wrap}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          {params.imageUrl ? (
            <Animated.Image
              source={{ uri: params.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
              sharedTransitionTag={`place-photo-${params.id}`}
            />
          ) : (
            <View style={[styles.heroFallback, { backgroundColor: photoBg }]}>
              <Text style={styles.heroFallbackEmoji}>{params.photoEmoji || '🏪'}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.category}>{category}</Text>

          <View style={styles.metaRow}>
            {distance != null ? (
              <MetaPill text={`${params.commuteEmoji || '🚶'} ${distance}m`} />
            ) : null}
            {rating != null ? <MetaPill text={`⭐ ${rating.toFixed(1)}`} /> : null}
            {reviewCount != null ? <MetaPill text={`🗣 ${reviewCount} reviews`} /> : null}
          </View>

          <Text style={styles.sectionLabel}>Address</Text>
          <Text style={styles.address}>{address}</Text>

          <Text style={styles.sectionLabel}>About this place</Text>
          <Text style={styles.about}>
            Popular local spot in your area. Swipe right to keep it and see any available offers in your wallet.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function MetaPill({ text }: { text: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  wrap: { flex: 1 },
  topBar: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s2,
    borderRadius: Radius.r3,
    backgroundColor: Swo.paper,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
  },
  backText: { fontFamily: Type.bodySemi, color: Swo.ink },
  hero: {
    marginHorizontal: Spacing.s5,
    borderRadius: Radius.r5,
    overflow: 'hidden',
    height: 260,
    backgroundColor: Swo.paper,
    ...Shadow.s2,
  },
  heroImage: { width: '100%', height: '100%' },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroFallbackEmoji: { fontSize: 96, opacity: 0.9 },
  card: {
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
  name: { fontFamily: Type.displayBlack, fontSize: 34, lineHeight: 38, color: Swo.ink, letterSpacing: -0.7 },
  category: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink3, textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap', marginTop: Spacing.s2, marginBottom: Spacing.s2 },
  metaPill: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Swo.creamDeep,
  },
  metaPillText: { fontFamily: Type.bodySemi, fontSize: 12, color: Swo.ink2 },
  sectionLabel: {
    fontFamily: Type.bodyBold,
    fontSize: 11,
    color: Swo.coralDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: Spacing.s2,
  },
  address: { fontFamily: Type.body, fontSize: 15, color: Swo.ink, lineHeight: 22 },
  about: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 21 },
});
