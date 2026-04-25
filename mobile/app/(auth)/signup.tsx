import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    const { error: e, needsConfirmation } = await signUp(email.trim(), password, fullName.trim() || undefined);
    setSubmitting(false);
    if (e) {
      setError(e);
      return;
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>Create account</Text>
            <Text style={styles.tagline}>Local offers, made for the moment you need them.</Text>
          </View>

          <View style={styles.form}>
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
              error={error}
            />
            {info ? <Text style={styles.info}>{info}</Text> : null}
            <Button title="Create account" onPress={onSubmit} loading={submitting} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 28 },
  header: { gap: 6 },
  brand: { fontSize: 32, fontWeight: '800', color: Brand.text, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: Brand.textMuted, lineHeight: 22 },
  form: { gap: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: Brand.textMuted, fontSize: 14 },
  footerLink: { color: Brand.primary, fontSize: 14, fontWeight: '600' },
  info: { color: Brand.success, fontSize: 13 },
});
