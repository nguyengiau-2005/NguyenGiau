import { Stack } from 'expo-router';

export function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="address" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-history" />
    </Stack>
  );
}

export default UserLayout;
