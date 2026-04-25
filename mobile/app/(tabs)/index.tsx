import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SwipeScreen() {
  const { user } = useAuth();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.contextBar}>
        <Text style={styles.contextText}>☁️  11°C  ·  Stuttgart  ·  🕐  Lunch</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Swipe deck</Text>
        <Text style={styles.subtitle}>Coming up next: AI-generated offers, swipeable like Tinder.</Text>
        <Text style={styles.signedIn}>Signed in as {user?.email}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  contextBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  contextText: { color: Brand.text, fontSize: 14, fontWeight: '500' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: Brand.text },
  subtitle: { fontSize: 15, color: Brand.textMuted, textAlign: 'center' },
  signedIn: { marginTop: 24, fontSize: 13, color: Brand.textMuted },
});
