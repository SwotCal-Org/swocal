import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function MerchantOnboardingScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const firstName =
    (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.split(' ')[0]) || 'there';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Merchant mode</Text>
          <Text style={styles.title}>Hi {firstName} 👋</Text>
          <Text style={styles.body}>
            Set up your business dashboard to publish offers, track redemptions, and reach nearby users in real time.
          </Text>
        </View>

        <View style={styles.steps}>
          <StepRow label="Business profile" status="Add name, location, category" />
          <StepRow label="Offer templates" status="Create reusable campaign cards" />
          <StepRow label="Coupon limits" status="Control stock and expiration" />
          <StepRow label="Launch" status="Publish and monitor performance" />
        </View>

        <View style={styles.actions}>
          <Button title="Open business dashboard" onPress={() => router.replace('/merchant/business')} />
          <Pressable onPress={signOut} style={({ pressed }) => [styles.signOutLink, pressed && { opacity: 0.7 }]}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StepRow({ label, status }: { label: string; status: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepDot} />
      <View style={styles.stepCopy}>
        <Text style={styles.stepLabel}>{label}</Text>
        <Text style={styles.stepStatus}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s5 },
  hero: {
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
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { fontFamily: Type.displayBlack, fontSize: 36, lineHeight: 40, color: Swo.ink, letterSpacing: -0.6 },
  body: { fontFamily: Type.body, fontSize: 15, lineHeight: 22, color: Swo.ink2 },
  steps: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s5,
    gap: Spacing.s4,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.s3 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    backgroundColor: Swo.mustardDeep,
  },
  stepCopy: { flex: 1, gap: 2 },
  stepLabel: { fontFamily: Type.displaySemi, fontSize: 18, color: Swo.ink },
  stepStatus: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2 },
  actions: { gap: Spacing.s3 },
  signOutLink: { alignItems: 'center', paddingVertical: Spacing.s2 },
  signOutText: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.coralDeep },
});
