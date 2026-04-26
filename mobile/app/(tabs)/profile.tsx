import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarUpload } from '@/components/avatar-upload';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getMyProfile } from '@/services/profile';
import { supabase } from '@/lib/supabase/client';

const PREFS = ['Coffee', 'Local food', 'Cozy spots', 'Quick bites', 'Sweet stuff', 'Wine bar'];
const ACTIVE = new Set(['Coffee', 'Cozy spots', 'Sweet stuff']);

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('Your profile');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const initial = (user?.email ?? '?').charAt(0).toUpperCase();
  const memberSince = user?.created_at?.slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    async function loadName() {
      if (!user?.id) return;
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (cancelled) return;
      const fallback =
        (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
        user.email?.split('@')[0] ||
        'Your profile';
      setFullName((data?.full_name || fallback).trim());
    }
    loadName();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    getMyProfile()
      .then((p) => {
        if (mounted) setAvatarUrl(p?.avatar_url ?? null);
      })
      .catch(() => {
        // ignore — profile may not yet exist
      });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={styles.heroCard}>
          <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} fallback={initial} />
          <Text style={styles.email} numberOfLines={1}>
            {fullName}
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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/profile/edit')}
            style={({ pressed }) => [styles.editLink, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.editLinkText}>Edit profile</Text>
          </Pressable>
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
  actions: { marginTop: Spacing.s2, gap: Spacing.s3 },
  editLink: {
    alignSelf: 'flex-start',
    backgroundColor: Swo.paper,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s2,
    ...Shadow.stickerSoft,
  },
  editLinkText: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink },
});
