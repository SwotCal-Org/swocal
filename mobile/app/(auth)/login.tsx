import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { signIn } = useAuth();
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>Swocal</Text>
            <Text style={styles.tagline}>Welcome back.</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 32 },
  header: { gap: 6 },
  brand: { fontSize: 36, fontWeight: '800', color: Brand.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: Brand.textMuted },
  form: { gap: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: Brand.textMuted, fontSize: 14 },
  footerLink: { color: Brand.primary, fontSize: 14, fontWeight: '600' },
  error: { color: Brand.danger, fontSize: 13 },
});
