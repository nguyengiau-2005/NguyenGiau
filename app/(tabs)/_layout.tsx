import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Heart, Home, ShoppingCart, User } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Favorites"
        options={{
          title: 'Yêu thích',
          tabBarIcon: ({ color }) => <Heart size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color }) => <ShoppingCart size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <User size={28} color={color} />,
          headerShown: false,
        }}
      />

    </Tabs>
  );
}
