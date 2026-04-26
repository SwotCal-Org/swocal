import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export default function MerchantDashboardTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linked, setLinked] = useState<{
    google_place_id: string;
    google_place_name: string;
    google_place_address: string | null;
  } | null>(null);
  const [placeId, setPlaceId] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');

  const canSave = useMemo(() => placeId.trim().length > 0 && placeName.trim().length > 0, [placeId, placeName]);

  useEffect(() => {
    let cancelled = false;
    async function loadLink() {
      if (!user?.id) return;
      const { data, error: queryError } = await supabase
        .from('merchant_business_links')
        .select('google_place_id, google_place_name, google_place_address')
        .eq('merchant_user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (queryError && queryError.code !== 'PGRST116') {
        setError(queryError.message);
      } else if (data) {
        setLinked(data);
      }
      setLoading(false);
    }
    loadLink();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleLinkBusiness() {
    if (!user?.id || !canSave) return;
    setSaving(true);
    setError(null);
    const payload = {
      merchant_user_id: user.id,
      google_place_id: placeId.trim(),
      google_place_name: placeName.trim(),
      google_place_address: placeAddress.trim() || null,
      link_status: 'linked',
      linked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error: upsertError } = await supabase
      .from('merchant_business_links')
      .upsert(payload, { onConflict: 'merchant_user_id' });
    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setLinked({
      google_place_id: payload.google_place_id,
      google_place_name: payload.google_place_name,
      google_place_address: payload.google_place_address,
    });
  }

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

        {loading ? (
          <View style={styles.linkCard}>
            <Text style={styles.linkTitle}>Checking business link…</Text>
          </View>
        ) : linked ? (
          <View style={styles.linkCard}>
            <Text style={styles.linkEyebrow}>Linked Google Business</Text>
            <Text style={styles.linkTitle}>{linked.google_place_name}</Text>
            {linked.google_place_address ? (
              <Text style={styles.linkBody}>{linked.google_place_address}</Text>
            ) : null}
            <Text style={styles.linkMeta}>Place ID: {linked.google_place_id}</Text>
          </View>
        ) : (
          <View style={styles.linkCard}>
            <Text style={styles.linkEyebrow}>Merchant setup</Text>
            <Text style={styles.linkTitle}>Link your Swocal business</Text>
            <Text style={styles.linkBody}>
              Connect your Google Maps Business so we can map merchant ownership to the places users see.
            </Text>

            <TextInput
              value={placeId}
              onChangeText={setPlaceId}
              placeholder="Google Place ID"
              placeholderTextColor={Swo.ink3}
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="Business name on Google Maps"
              placeholderTextColor={Swo.ink3}
              style={styles.input}
            />
            <TextInput
              value={placeAddress}
              onChangeText={setPlaceAddress}
              placeholder="Business address (optional)"
              placeholderTextColor={Swo.ink3}
              style={styles.input}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={!canSave || saving}
              onPress={handleLinkBusiness}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!canSave || saving) && { opacity: 0.5 },
                pressed && canSave && !saving && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.primaryBtnText}>{saving ? 'Linking…' : 'Link business'}</Text>
            </Pressable>
          </View>
        )}
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
  linkCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 2,
    borderColor: Swo.ink,
    padding: Spacing.s5,
    gap: Spacing.s3,
  },
  linkEyebrow: {
    fontFamily: Type.bodyBold,
    fontSize: 11,
    color: Swo.coralDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  linkTitle: { fontFamily: Type.displaySemi, fontSize: 24, color: Swo.ink, lineHeight: 28 },
  linkBody: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 21 },
  linkMeta: { fontFamily: Type.bodyMedium, fontSize: 12, color: Swo.ink3 },
  input: {
    minHeight: 48,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    borderColor: Swo.borderSoft,
    backgroundColor: Swo.paper,
    color: Swo.ink,
    fontFamily: Type.body,
    fontSize: 14,
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s2,
  },
  errorText: { color: Swo.danger, fontFamily: Type.bodyMedium, fontSize: 13 },
  primaryBtn: {
    minHeight: 48,
    borderRadius: Radius.r3,
    borderWidth: 2,
    borderColor: Swo.ink,
    backgroundColor: Swo.mustard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  primaryBtnText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink },
});
