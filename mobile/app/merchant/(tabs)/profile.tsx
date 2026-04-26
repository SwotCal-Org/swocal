import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function MerchantProfileTab() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? 'merchant@swocal.app';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Merchant profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
        <Button title="Sign out" variant="secondary" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s3 },
  title: { fontFamily: Type.displayBlack, fontSize: 34, lineHeight: 38, color: Swo.ink },
  card: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s4,
    gap: Spacing.s1,
  },
  label: { fontFamily: Type.bodyMedium, fontSize: 12, color: Swo.ink3, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontFamily: Type.displaySemi, fontSize: 17, color: Swo.ink },
});
