import { Redirect, Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { useProfile } from '@/hooks/use-profile';

// Demo-only bypass so the tabs can be previewed without a live Supabase
// project. Never set EXPO_PUBLIC_DEMO_MODE in a real deployment.
const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export default function TabsLayout() {
  const { session, needsOnboarding, loading } = useProfile();

  if (!DEMO_MODE) {
    if (loading) return null;
    if (!session) return <Redirect href="/auth/login" />;
    if (needsOnboarding) return <Redirect href="/onboarding/age-gate" />;
  }

  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="admissions" options={{ title: '모집요강' }} />
      <Tabs.Screen name="saenggibu" options={{ title: '생기부' }} />
      <Tabs.Screen name="mymenu" options={{ title: '마이메뉴' }} />
    </Tabs>
  );
}
