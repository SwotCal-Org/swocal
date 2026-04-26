import { Stack } from 'expo-router';
import { Swo } from '@/constants/Colors';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Swo.cream } }} />;
}
