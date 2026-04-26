import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const { error: e } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (e) setError(e);
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
              <View style={styles.logoMark}>
                <Text style={styles.logoEmoji}>☀️</Text>
              </View>
              <Text style={styles.brand}>Swocal</Text>
              <Text style={styles.tagline}>Swipe local. Welcome back.</Text>
            </View>

            <View style={styles.form}>
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
                autoComplete="password"
                secureTextEntry
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button title="Sign in" onPress={onSubmit} loading={submitting} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <Link href="/(auth)/signup" style={styles.footerLink}>
                Create an account
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
  scroll: {
    flexGrow: 1,
    padding: Spacing.s6,
    justifyContent: 'center',
  },
  scrollWide: { paddingHorizontal: Spacing.s8, paddingVertical: Spacing.s9 },
  container: { gap: Spacing.s8, width: '100%' },
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
  header: { gap: Spacing.s2, alignItems: 'flex-start' },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: Radius.r4,
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s3,
    ...Shadow.stickerSoft,
  },
  logoEmoji: { fontSize: 28 },
  brand: {
    fontFamily: Type.displayBlack,
    fontSize: 44,
    color: Swo.ink,
    letterSpacing: -1,
    lineHeight: 48,
  },
  tagline: { fontFamily: Type.body, fontSize: 16, color: Swo.ink2, lineHeight: 22 },
  form: { gap: Spacing.s4 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  footerText: { color: Swo.ink2, fontSize: 14, fontFamily: Type.body },
  footerLink: { color: Swo.coralDeep, fontSize: 14, fontFamily: Type.bodySemi },
  error: { color: Swo.danger, fontSize: 13, fontFamily: Type.bodyMedium },
});
