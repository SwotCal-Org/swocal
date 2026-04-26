import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase/client';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setFullName(data?.full_name ?? '');
      setUsername(data?.username ?? '');
      setLoading(false);
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function onSave() {
    if (!user?.id) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    const payload = {
      id: user.id,
      full_name: fullName.trim() || null,
      username: username.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSuccess('Profile saved.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.eyebrow}>You</Text>
            <Text style={styles.title}>Edit profile</Text>
            <Text style={styles.body}>Update your public info used across your account.</Text>

            {loading ? (
              <Text style={styles.body}>Loading profile…</Text>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Mia Müller"
                  autoCapitalize="words"
                />
                <Input
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="mia"
                  autoCapitalize="none"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}

                <View style={styles.actions}>
                  <Button title="Back" variant="ghost" fullWidth={false} onPress={() => router.back()} />
                  <Button title="Save changes" loading={saving} fullWidth={false} onPress={onSave} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.s6, justifyContent: 'center' },
  card: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s6,
    gap: Spacing.s3,
    ...Shadow.s2,
  },
  eyebrow: {
    fontFamily: Type.bodyBold,
    fontSize: 12,
    color: Swo.coralDeep,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { fontFamily: Type.displayBlack, fontSize: 32, lineHeight: 36, color: Swo.ink, letterSpacing: -0.5 },
  body: { fontFamily: Type.body, fontSize: 15, color: Swo.ink2, lineHeight: 22 },
  form: { marginTop: Spacing.s2, gap: Spacing.s4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.s2 },
  error: { color: Swo.danger, fontSize: 13, fontFamily: Type.bodyMedium },
  success: { color: Swo.mintDeep, fontSize: 13, fontFamily: Type.bodyMedium },
});
