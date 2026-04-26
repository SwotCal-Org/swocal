import { Stack } from 'expo-router';
import { Swo } from '@/constants/Colors';

export default function MerchantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Swo.cream },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="business" />
    </Stack>
  );
}
