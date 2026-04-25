import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.email ?? '?').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.muted}>Account active since {user?.created_at?.slice(0, 10)}</Text>
        <View style={styles.actions}>
          <Button title="Sign out" variant="secondary" onPress={signOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  email: { fontSize: 18, fontWeight: '600', color: Brand.text },
  muted: { fontSize: 13, color: Brand.textMuted },
  actions: { width: '100%', marginTop: 24 },
});
