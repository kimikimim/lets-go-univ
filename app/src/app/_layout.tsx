import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { useProfile } from '@/hooks/use-profile';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loading } = useProfile();
  // Kick off the icon font load, but don't block the whole app on it — if it
  // fails or is slow, icons should just show a brief fallback glyph instead
  // of the entire screen staying blank.
  useFonts(Ionicons.font);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="onboarding/age-gate" />
        <Stack.Screen name="guardian/consent" options={{ headerShown: true, title: '보호자 동의' }} />
        <Stack.Screen name="webview/[...slug]" options={{ headerShown: true }} />
        <Stack.Screen name="university/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="essay" options={{ headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}
