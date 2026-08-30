import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/floating-tab-bar';

// 홈/모집요강 are open to everyone. 생기부/마이메뉴 need an account — each of
// those screens gates itself with <LoginRequired>, so browsing the other two
// tabs never forces a login.
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="admissions" options={{ title: '모집요강' }} />
      <Tabs.Screen name="saenggibu" options={{ title: '생기부' }} />
      <Tabs.Screen name="mymenu" options={{ title: '마이메뉴' }} />
    </Tabs>
  );
}
