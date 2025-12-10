import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/Auth';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { RecentProvider } from '@/contexts/RecentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // Force the initial route to welcome so it shows first.
  useEffect(() => {
    try {
      router.replace('/welcome' as any);
    } catch (e) {
      // ignore if router not ready
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      {!isLoggedIn ? (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
