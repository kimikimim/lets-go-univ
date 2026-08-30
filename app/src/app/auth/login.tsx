import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { sendEmailOtp, sendPhoneOtp, signInWithKakao, verifyEmailOtp, verifyPhoneOtp } from '@/lib/auth';

type Mode = 'input' | 'code';
type IdentifierType = 'phone' | 'email';

const KAKAO_YELLOW = '#FEE500';
const KAKAO_TEXT = '#191919';

function KakaoButton({ loading, onPress }: { loading: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={[styles.kakaoButton, { opacity: loading ? 0.6 : 1 }]}>
      <Ionicons name="chatbubble" size={18} color={KAKAO_TEXT} style={styles.kakaoIcon} />
      <ThemedText type="smallBold" style={styles.kakaoLabel}>
        카카오로 시작하기
      </ThemedText>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { session, needsOnboarding } = useProfile();
  const [mode, setMode] = useState<Mode>('input');
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('phone');
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

  function handleSubmitIdentifier() {
    if (!identifier.trim()) return;
    const type: IdentifierType = identifier.includes('@') ? 'email' : 'phone';
    setIdentifierType(type);
    withLoading(async () => {
      if (type === 'email') {
        await sendEmailOtp(identifier.trim());
      } else {
        await sendPhoneOtp(identifier.trim());
      }
      setMode('code');
    });
  }

  function handleVerifyCode() {
    withLoading(() =>
      identifierType === 'email'
        ? verifyEmailOtp(identifier.trim(), code)
        : verifyPhoneOtp(identifier.trim(), code),
    );
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

          {mode === 'input' ? (
            <ThemedView style={styles.form}>
              <TextField
                placeholder="전화번호 또는 이메일"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
                onSubmitEditing={handleSubmitIdentifier}
                returnKeyType="next"
              />
              <PrimaryButton
                label="로그인"
                variant="dark"
                loading={loading}
                onPress={handleSubmitIdentifier}
              />

              <KakaoButton loading={loading} onPress={() => withLoading(signInWithKakao)} />

              <ThemedText type="small" themeColor="textSecondary" style={styles.ageNote}>
                만 14세 이상만 가입할 수 있어요.
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.form}>
              <TextField
                label="인증번호"
                placeholder="6자리 숫자"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                onSubmitEditing={handleVerifyCode}
                returnKeyType="done"
              />
              <PrimaryButton label="확인" variant="dark" loading={loading} onPress={handleVerifyCode} />
              <PrimaryButton label="뒤로" variant="secondary" onPress={() => setMode('input')} />
            </ThemedView>
          )}

          <Pressable
            onPress={() =>
              Alert.alert('회원가입', '전화번호나 이메일 인증만으로 가입과 로그인이 함께 진행돼요.')
            }>
            <ThemedText type="small" themeColor="textSecondary" style={styles.footerLink}>
              회원가입하기
            </ThemedText>
          </Pressable>
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
  kakaoButton: {
    height: 52,
    borderRadius: Spacing.two,
    backgroundColor: KAKAO_YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoIcon: {
    marginRight: Spacing.one,
  },
  kakaoLabel: {
    color: KAKAO_TEXT,
  },
  footerLink: {
    textAlign: 'center',
  },
});
