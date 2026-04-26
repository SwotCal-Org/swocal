import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

const PREFS = ['Coffee', 'Local food', 'Cozy spots', 'Quick bites', 'Sweet stuff', 'Wine bar'];
const ACTIVE = new Set(['Coffee', 'Cozy spots', 'Sweet stuff']);

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const initial = (user?.email ?? '?').charAt(0).toUpperCase();
  const memberSince = user?.created_at?.slice(0, 10);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
          {memberSince ? (
            <Text style={styles.muted}>Member since {memberSince}</Text>
          ) : null}
          <View style={styles.statsRow}>
            <Stat value="12" label="Swipes" />
            <View style={styles.statDivider} />
            <Stat value="3" label="Saved" />
            <View style={styles.statDivider} />
            <Stat value="1" label="Redeemed" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>What sounds good</Text>
          <Text style={styles.sectionTitle}>Your three things</Text>
          <Text style={styles.sectionBody}>
            We use this to generate offers for the moment you&rsquo;re in. Tap to toggle.
          </Text>
          <View style={styles.prefRow}>
            {PREFS.map((p) => (
              <Chip
                key={p}
                label={p}
                variant={ACTIVE.has(p) ? 'mustard' : 'sticker'}
                style={{ marginBottom: Spacing.s2 }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Privacy</Text>
          <Text style={styles.sectionTitle}>Your preferences live on this device.</Text>
          <Text style={styles.sectionBody}>
            Only an abstract intent vector ever reaches the server &mdash; never your raw choices.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Sign out" variant="secondary" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s5 },
  scrollWide: { paddingHorizontal: Spacing.s9, maxWidth: 720, alignSelf: 'center', width: '100%' },
  heroCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s6,
    alignItems: 'center',
    gap: Spacing.s2,
    ...Shadow.s2,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s2,
    ...Shadow.stickerSoft,
  },
  avatarText: { color: Swo.ink, fontSize: 36, fontFamily: Type.displayBlack },
  email: {
    fontFamily: Type.displaySemi,
    fontSize: 18,
    color: Swo.ink,
    maxWidth: '100%',
  },
  muted: { fontFamily: Type.body, fontSize: 13, color: Swo.ink3 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.s4,
    paddingTop: Spacing.s4,
    borderTopWidth: 1,
    borderTopColor: Swo.borderSoft,
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center', gap: 2, flex: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: Swo.borderSoft },
  statValue: { fontFamily: Type.displayBlack, fontSize: 22, color: Swo.ink },
  statLabel: {
    fontFamily: Type.bodyMedium,
    fontSize: 11,
    color: Swo.ink3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  section: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s5,
    gap: Spacing.s2,
  },
  sectionEyebrow: {
    fontFamily: Type.bodyBold,
    fontSize: 11,
    color: Swo.coralDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  sectionTitle: {
    fontFamily: Type.display,
    fontSize: 20,
    lineHeight: 24,
    color: Swo.ink,
    letterSpacing: -0.2,
  },
  sectionBody: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 20 },
  prefRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
    marginTop: Spacing.s2,
  },
  actions: { marginTop: Spacing.s2 },
});
