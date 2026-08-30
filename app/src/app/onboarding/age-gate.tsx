import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

const MIN_AGE = 14;

function isOldEnough(year: number, month: number, day: number) {
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - MIN_AGE);
  return birthDate <= cutoff;
}

export default function AgeGateScreen() {
  const theme = useTheme();
  const { session, profile, refresh } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [saving, setSaving] = useState(false);

  if (profile) return <Redirect href="/" />;
  if (!session) return <Redirect href="/auth/login" />;

  async function handleSubmit() {
    if (!agreedToTerms) {
      Alert.alert('약관 동의가 필요해요', '이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!y || !m || !d) {
      Alert.alert('생년월일을 입력해주세요', '연도, 월, 일을 모두 입력해주세요.');
      return;
    }
    if (!isOldEnough(y, m, d)) {
      Alert.alert(
        '가입할 수 없어요',
        '정보통신망법에 따라 만 14세 이상만 가입할 수 있어요.',
      );
      return;
    }

    setSaving(true);
    try {
      const birthDate = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d
        .toString()
        .padStart(2, '0')}`;
      const { error } = await supabase.from('profiles').insert({
        id: session!.user.id,
        display_name: displayName.trim() || null,
        birth_date: birthDate,
      });
      if (error) throw error;
      await refresh();
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '프로필을 저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">프로필을 완성해주세요</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            만 14세 이상만 서비스를 이용할 수 있어요.
          </ThemedText>

          <TextField label="이름" placeholder="홍길동" value={displayName} onChangeText={setDisplayName} />

          <ThemedText type="smallBold">생년월일</ThemedText>
          <ThemedView style={styles.dateRow}>
            <ThemedView style={styles.yearInput}>
              <TextField placeholder="YYYY" keyboardType="number-pad" value={year} onChangeText={setYear} maxLength={4} />
            </ThemedView>
            <ThemedView style={styles.smallInput}>
              <TextField placeholder="MM" keyboardType="number-pad" value={month} onChangeText={setMonth} maxLength={2} />
            </ThemedView>
            <ThemedView style={styles.smallInput}>
              <TextField placeholder="DD" keyboardType="number-pad" value={day} onChangeText={setDay} maxLength={2} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.termsRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreedToTerms }}
              onPress={() => setAgreedToTerms((v) => !v)}
              style={[
                styles.checkbox,
                { borderColor: agreedToTerms ? theme.primary : theme.border },
                agreedToTerms && { backgroundColor: theme.primary },
              ]}>
              {agreedToTerms ? <Ionicons name="checkmark" size={16} color={theme.onPrimary} /> : null}
            </Pressable>
            <ThemedText type="small" style={styles.termsText}>
              이용약관 및 개인정보처리방침에 동의합니다
            </ThemedText>
            <Link href="/webview/terms" asChild>
              <Pressable>
                <ThemedText type="small" themeColor="primary">
                  약관 보기
                </ThemedText>
              </Pressable>
            </Link>
          </ThemedView>

          <PrimaryButton label="시작하기" loading={saving} onPress={handleSubmit} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  yearInput: {
    flex: 2,
  },
  smallInput: {
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
  },
});
