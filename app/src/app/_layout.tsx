import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { useProfile } from '@/hooks/use-profile';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loading } = useProfile();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="onboarding/age-gate" />
        <Stack.Screen name="guardian/consent" options={{ headerShown: true, title: '보호자 동의' }} />
        <Stack.Screen name="webview/[...slug]" options={{ headerShown: true }} />
        <Stack.Screen name="university/[id]" options={{ headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}
