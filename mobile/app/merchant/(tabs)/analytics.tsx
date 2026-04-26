import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Spacing, Swo, Type } from '@/constants/Colors';

export default function MerchantAnalyticsTab() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.body}>See performance trends and optimize campaign timing.</Text>

        <MetricRow label="Redemption rate" value="14.7%" />
        <MetricRow label="Top campaign" value="Happy hour special" />
        <MetricRow label="Best time" value="12:00 - 14:00" />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s3 },
  title: { fontFamily: Type.displayBlack, fontSize: 34, lineHeight: 38, color: Swo.ink },
  body: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, marginBottom: Spacing.s2 },
  row: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2 },
  rowValue: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink },
});
