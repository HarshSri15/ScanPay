import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ShopProvider, useShop } from '../context/ShopContext';
import { StatusBar } from 'expo-status-bar';

function AuthGuard() {
  const { user, isLoadingUser } = useShop();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingUser) return;

    const isCheckout = segments[0] === 'checkout';
    if (!user && isCheckout) {
      router.replace('/signin');
    }
  }, [user, segments, isLoadingUser]);

  return null;
}

export default function RootLayout() {
  return (
    <ShopProvider>
      <AuthGuard />
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </ShopProvider>
  );
}
