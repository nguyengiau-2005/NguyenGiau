import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/Auth';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { RecentProvider } from '@/contexts/RecentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootLayoutNav() {
  const { isLoggedIn } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);

  useEffect(() => {
    checkIntroStatus();
  }, []);

  const checkIntroStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('HAS_SEEN_INTRO');
      setHasSeenIntro(value === 'true');
    } catch {
      setHasSeenIntro(false);
    }
  };

  // Đợi cho đến khi kiểm tra xong AsyncStorage
  if (hasSeenIntro === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Nếu chưa xem Intro, hiện trang Welcome/Intro đầu tiên */}
      {!hasSeenIntro ? (
        <Stack.Screen name="welcome" />
      ) : null}

      {/* 2. Kiểm tra Logic Auth */}
      {!isLoggedIn ? (
        <Stack.Screen name="auth" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}

      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    AsyncStorage.clear();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <OrdersProvider>
              <RecentProvider>
                <RootLayoutNav />
                <StatusBar style="auto" />
              </RecentProvider>
            </OrdersProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}