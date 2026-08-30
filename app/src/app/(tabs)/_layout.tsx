import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { session, needsOnboarding, loading } = useProfile();

  if (loading) return null;
  if (!session) return <Redirect href="/auth/login" />;
  if (needsOnboarding) return <Redirect href="/onboarding/age-gate" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: '홈', tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="admissions"
        options={{ title: '모집요강', tabBarIcon: ({ focused }) => <TabIcon glyph="📋" focused={focused} /> }}
      />
      <Tabs.Screen
        name="saenggibu"
        options={{ title: '생기부', tabBarIcon: ({ focused }) => <TabIcon glyph="🔍" focused={focused} /> }}
      />
      <Tabs.Screen
        name="essay"
        options={{ title: '자소서', tabBarIcon: ({ focused }) => <TabIcon glyph="✍️" focused={focused} /> }}
      />
      <Tabs.Screen
        name="mymenu"
        options={{ title: '마이메뉴', tabBarIcon: ({ focused }) => <TabIcon glyph="👤" focused={focused} /> }}
      />
    </Tabs>
  );
}
