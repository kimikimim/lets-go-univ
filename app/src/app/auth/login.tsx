import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import {
  sendEmailOtp,
  sendPhoneOtp,
  signInWithKakao,
  verifyEmailOtp,
  verifyPhoneOtp,
} from '@/lib/auth';

type Mode = 'select' | 'phone' | 'phone-code' | 'email' | 'email-code';

export default function LoginScreen() {
  const router = useRouter();
  const { session, needsOnboarding } = useProfile();
  const [mode, setMode] = useState<Mode>('select');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Login is pushed on top of whichever tab asked for it — once a session
  // shows up, leave (age-gate for a brand new account, otherwise just back).
  useEffect(() => {
    if (!session) return;
    if (needsOnboarding) {
      router.replace('/onboarding/age-gate');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [session, needsOnboarding, router]);

  async function withLoading(fn: () => Promise<unknown>) {
    setLoading(true);
    try {
      await fn();
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            생기부{'\n'}뭐쓰지?
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            비밀번호 없이 간편하게 시작해요
          </ThemedText>

          {mode === 'select' ? (
            <ThemedView style={styles.form}>
              <PrimaryButton
                label="카카오로 시작하기"
                loading={loading}
                onPress={() => withLoading(signInWithKakao)}
              />
              <PrimaryButton label="휴대폰 번호로 시작하기" variant="secondary" onPress={() => setMode('phone')} />
              <PrimaryButton label="이메일로 시작하기" variant="secondary" onPress={() => setMode('email')} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.ageNote}>
                만 14세 이상만 가입할 수 있어요.
              </ThemedText>
            </ThemedView>
          ) : null}

          {mode === 'phone' ? (
            <ThemedView style={styles.form}>
              <TextField
                label="휴대폰 번호"
                placeholder="01012345678"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <PrimaryButton
                label="인증번호 받기"
                loading={loading}
                onPress={() => withLoading(async () => {
                  await sendPhoneOtp(phone);
                  setMode('phone-code');
                })}
              />
              <PrimaryButton label="뒤로" variant="secondary" onPress={() => setMode('select')} />
            </ThemedView>
          ) : null}

          {mode === 'phone-code' ? (
            <ThemedView style={styles.form}>
              <TextField
                label="인증번호"
                placeholder="6자리 숫자"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <PrimaryButton
                label="확인"
                loading={loading}
                onPress={() => withLoading(() => verifyPhoneOtp(phone, code).then(() => undefined))}
              />
            </ThemedView>
          ) : null}

          {mode === 'email' ? (
            <ThemedView style={styles.form}>
              <TextField
                label="이메일"
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <PrimaryButton
                label="인증번호 받기"
                loading={loading}
                onPress={() => withLoading(async () => {
                  await sendEmailOtp(email);
                  setMode('email-code');
                })}
              />
              <PrimaryButton label="뒤로" variant="secondary" onPress={() => setMode('select')} />
            </ThemedView>
          ) : null}

          {mode === 'email-code' ? (
            <ThemedView style={styles.form}>
              <TextField
                label="인증번호"
                placeholder="6자리 숫자"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <PrimaryButton
                label="확인"
                loading={loading}
                onPress={() => withLoading(() => verifyEmailOtp(email, code).then(() => undefined))}
              />
            </ThemedView>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.two,
  },
  ageNote: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
