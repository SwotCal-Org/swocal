import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/haptic-tab';
import { Radius, Spacing, Swo, Type } from '@/constants/Colors';

function QrTabButton({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <View style={styles.qrWrap}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.qrBtn, pressed && { transform: [{ scale: 0.96 }] }]}>
        {children}
      </Pressable>
    </View>
  );
}

export default function MerchantTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Swo.coralDeep,
        tabBarInactiveTintColor: Swo.ink3,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: Type.bodySemi,
          fontSize: 11,
          letterSpacing: 0.35,
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
          title: 'Business',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pricetag' : 'pricetag-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: () => <Ionicons name="qr-code" size={28} color={Swo.ink} />,
          tabBarButton: (props) => <QrTabButton onPress={props.onPress}>{props.children}</QrTabButton>,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />
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
    height: Platform.select({ ios: 90, default: 72 }),
    paddingBottom: Platform.select({ ios: 24, default: Spacing.s2 }),
    paddingTop: Spacing.s1,
  },
  qrWrap: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBtn: {
    width: 62,
    height: 62,
    borderRadius: Radius.pill,
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
