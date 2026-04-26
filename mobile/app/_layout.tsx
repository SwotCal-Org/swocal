import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_900Black,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { Swo } from '@/constants/Colors';

// Single warm-cream theme — Swocal has no dark mode by design.
const SwocalNavTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Swo.cream,
    card: Swo.paper,
    text: Swo.ink,
    border: Swo.borderSoft,
    primary: Swo.mustard,
    notification: Swo.coral,
  },
};

function RouteGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inMerchantGroup = segments[0] === 'merchant';
    const role = session?.user?.user_metadata?.role;
    const isMerchant = role === 'merchant';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (!session) return;

    // Merchants should not land in consumer tabs/user onboarding flow.
    if (isMerchant && !inMerchantGroup) {
      router.replace('/merchant/(tabs)');
      return;
    }

    if (!isMerchant && inMerchantGroup) {
      router.replace('/(tabs)');
      return;
    }

    if (inAuthGroup) {
      router.replace(isMerchant ? '/merchant/(tabs)' : '/(tabs)');
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Swo.cream }}>
        <ActivityIndicator color={Swo.mustard} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_900Black,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Caveat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Swo.cream }}>
        <ActivityIndicator color={Swo.mustard} />
      </View>
    );
  }

  return (
    // GestureHandlerRootView must be the outermost view — required for new arch (Fabric)
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={SwocalNavTheme}>
          <RouteGuard>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Swo.cream } }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="merchant" />
            </Stack>
          </RouteGuard>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
