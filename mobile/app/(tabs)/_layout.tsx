import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/haptic-tab';
import { Spacing, Swo, Type } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Swo.coralDeep,
        tabBarInactiveTintColor: Swo.ink3,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: Type.bodySemi,
          fontSize: 11,
          letterSpacing: 0.4,
          marginTop: 2,
        },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { paddingTop: 6 },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coupons"
        options={{
          title: 'Coupons',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pricetag' : 'pricetag-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Swo.paper,
    borderTopWidth: 1,
    borderTopColor: Swo.borderSoft,
    height: Platform.select({ ios: 84, default: 68 }),
    paddingBottom: Platform.select({ ios: 24, default: Spacing.s2 }),
    paddingTop: Spacing.s1,
  },
});
