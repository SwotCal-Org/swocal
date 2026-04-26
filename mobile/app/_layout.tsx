import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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
import { useColorScheme } from '@/hooks/use-color-scheme';

function RouteGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
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
  const colorScheme = useColorScheme();
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
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RouteGuard>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Swo.cream } }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </RouteGuard>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
