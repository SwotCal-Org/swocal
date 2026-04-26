import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function MerchantBusinessScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>@business</Text>
          <Text style={styles.title}>Merchant dashboard</Text>
          <Text style={styles.body}>
            Track live offer performance, redemption conversion, and campaign status in one place.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard value="12" label="Active offers" />
          <StatCard value="184" label="Views today" />
          <StatCard value="27" label="Redemptions" />
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Quick actions</Text>
          <View style={styles.quickGrid}>
            <ActionCard emoji="🎟️" title="Create coupon" />
            <ActionCard emoji="📍" title="Update location" />
            <ActionCard emoji="🖼️" title="Edit storefront" />
            <ActionCard emoji="📈" title="See analytics" />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Campaign status</Text>
          <Text style={styles.body}>
            Your offer feed is healthy. Peak engagement windows are 12:00–14:00 and 18:00–20:00 nearby.
          </Text>
        </View>

        <Button title="Sign out" variant="secondary" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s4 },
  headerCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 2,
    borderColor: Swo.ink,
    padding: Spacing.s6,
    gap: Spacing.s2,
    ...Shadow.sticker,
  },
  eyebrow: {
    fontFamily: Type.bodyBold,
    fontSize: 12,
    color: Swo.coralDeep,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: { fontFamily: Type.displayBlack, fontSize: 34, lineHeight: 38, color: Swo.ink, letterSpacing: -0.5 },
  body: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 21 },
  statsRow: { flexDirection: 'row', gap: Spacing.s2 },
  statCard: {
    flex: 1,
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    paddingVertical: Spacing.s4,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontFamily: Type.displayBlack, fontSize: 26, color: Swo.ink },
  statLabel: { fontFamily: Type.bodyMedium, fontSize: 12, color: Swo.ink3, textAlign: 'center' },
  block: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s5,
    gap: Spacing.s3,
  },
  blockTitle: { fontFamily: Type.displaySemi, fontSize: 20, color: Swo.ink },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
  },
  actionCard: {
    width: '48.5%',
    minHeight: 98,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    backgroundColor: Swo.mustardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s3,
    gap: Spacing.s1,
    ...Shadow.stickerSoft,
  },
  actionEmoji: { fontSize: 26 },
  actionTitle: { fontFamily: Type.bodySemi, fontSize: 13, color: Swo.ink, textAlign: 'center' },
});
