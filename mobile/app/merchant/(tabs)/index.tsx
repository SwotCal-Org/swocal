import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

export default function MerchantDashboardTab() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>@business</Text>
          <Text style={styles.title}>Business dashboard</Text>
          <Text style={styles.body}>Manage offers, monitor redemptions, and see what is converting nearby.</Text>
        </View>

        <View style={styles.statsCol}>
          <StatCard value="12" label="Active offers" />
          <StatCard value="184" label="Views today" />
          <StatCard value="27" label="Redemptions" />
        </View>
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
  statsCol: { gap: Spacing.s2 },
  statCard: {
    width: '100%',
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s4,
    alignItems: 'flex-start',
    gap: 4,
  },
  statValue: { fontFamily: Type.displayBlack, fontSize: 30, color: Swo.ink },
  statLabel: { fontFamily: Type.bodyMedium, fontSize: 13, color: Swo.ink3 },
});
