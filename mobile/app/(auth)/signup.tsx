import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'user' | 'merchant'>('user');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const { error: e, needsConfirmation, userId } = await signUp(
      email.trim(),
      password,
      fullName.trim() || undefined,
      role
    );
    setSubmitting(false);
    if (e) {
      setError(e);
      return;
    }
    if (userId) {
      // Best-effort profile seed: if email confirmation is required, this may be blocked by RLS until first login.
      await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: fullName.trim() || null,
            role,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .then(() => undefined);
    }
    if (needsConfirmation) {
      setInfo('Check your email to confirm your account.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, isWide && styles.containerWide]}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Swocal</Text>
              <Text style={styles.brand}>Make it yours</Text>
              <Text style={styles.tagline}>
                Local offers, made for the moment you need them.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.roleWrap}>
                <Text style={styles.roleLabel}>Are you...</Text>
                <View style={styles.roleSegment}>
                  <Pressable
                    onPress={() => setRole('user')}
                    style={({ pressed }) => [
                      styles.roleBtn,
                      role === 'user' && styles.roleBtnActive,
                      pressed && role !== 'user' && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>User</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setRole('merchant')}
                    style={({ pressed }) => [
                      styles.roleBtn,
                      role === 'merchant' && styles.roleBtnActive,
                      pressed && role !== 'merchant' && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.roleText, role === 'merchant' && styles.roleTextActive]}>Merchant</Text>
                  </Pressable>
                </View>
              </View>
              <Input label="Full name (optional)" value={fullName} onChangeText={setFullName} placeholder="Mia Müller" />
              <Input
                label="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Password"
                autoCapitalize="none"
                secureTextEntry
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
              />
              <Input
                label="Confirm password"
                autoCapitalize="none"
                secureTextEntry
                placeholder="Re-enter password"
                value={confirm}
                onChangeText={setConfirm}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {info ? <Text style={styles.info}>{info}</Text> : null}
              <Button title="Create account" onPress={onSubmit} loading={submitting} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.footerLink}>
                Sign in
              </Link>
            </View>
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
  scrollWide: { paddingHorizontal: Spacing.s8, paddingVertical: Spacing.s9 },
  container: { gap: Spacing.s7, width: '100%' },
  containerWide: {
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: Swo.paper,
    borderRadius: Radius.r6,
    padding: Spacing.s8,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    ...Shadow.s2,
  },
  header: { gap: Spacing.s2 },
  eyebrow: {
    fontFamily: Type.bodyBold,
    fontSize: 12,
    color: Swo.coralDeep,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  brand: {
    fontFamily: Type.displayBlack,
    fontSize: 36,
    color: Swo.ink,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  tagline: { fontFamily: Type.body, fontSize: 15, color: Swo.ink2, lineHeight: 22 },
  form: { gap: Spacing.s4 },
  roleWrap: { gap: Spacing.s2 },
  roleLabel: { fontFamily: Type.bodySemi, fontSize: 13, color: Swo.ink2, letterSpacing: 0.2 },
  roleSegment: {
    flexDirection: 'row',
    backgroundColor: Swo.creamDeep,
    borderRadius: Radius.r3,
    padding: 4,
    gap: 4,
  },
  roleBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: Radius.r2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBtnActive: {
    backgroundColor: Swo.mustard,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    ...Shadow.s1,
  },
  roleText: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink3 },
  roleTextActive: { color: Swo.ink },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  footerText: { color: Swo.ink2, fontSize: 14, fontFamily: Type.body },
  footerLink: { color: Swo.coralDeep, fontSize: 14, fontFamily: Type.bodySemi },
  info: { color: Swo.mintDeep, fontSize: 13, fontFamily: Type.bodyMedium },
  error: { color: Swo.danger, fontSize: 13, fontFamily: Type.bodyMedium },
});
