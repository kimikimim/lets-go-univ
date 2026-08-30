import { Redirect, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';

/** Gates a single tab's content behind login, instead of the whole app —
 *  홈/모집요강 stay browsable without an account. */
export function LoginRequired({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, needsOnboarding, loading } = useProfile();

  if (loading) return null;
  if (session && needsOnboarding) return <Redirect href="/onboarding/age-gate" />;

  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="smallBold" style={styles.text}>
          로그인이 필요해요
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
          이 탭은 로그인한 학생만 이용할 수 있어요.
        </ThemedText>
        <PrimaryButton label="로그인하기" onPress={() => router.push('/auth/login')} />
      </ThemedView>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  text: {
    textAlign: 'center',
  },
});
