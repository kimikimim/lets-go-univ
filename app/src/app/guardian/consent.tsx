import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import type { GuardianConsent } from '@/types/database';

const STATUS_LABEL: Record<GuardianConsent['status'], string> = {
  pending: '승인 대기',
  verified: '승인 완료',
  expired: '만료됨',
};

export default function GuardianConsentScreen() {
  const { profile } = useProfile();
  const [guardianPhone, setGuardianPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [consents, setConsents] = useState<GuardianConsent[]>([]);

  async function loadConsents() {
    if (!profile) return;
    const { data } = await supabase
      .from('guardian_consents')
      .select('*')
      .eq('student_id', profile.id)
      .order('requested_at', { ascending: false });
    setConsents(data ?? []);
  }

  useEffect(() => {
    loadConsents();
  }, [profile]);

  async function handleSend() {
    if (!profile || !guardianPhone.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-guardian-consent', {
        body: { student_id: profile.id, guardian_phone: guardianPhone.trim() },
      });
      if (error) throw error;
      setGuardianPhone('');
      await loadConsents();
      Alert.alert('전송 완료', '보호자님께 동의 링크를 보냈어요.');
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '동의 요청을 보내지 못했어요.');
    } finally {
      setSending(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          만 19세 미만은 결제 전 보호자 동의가 필요해요. 보호자님의 휴대폰 번호로 별도의 동의 링크를
          보내드려요.
        </ThemedText>

        <TextField
          label="보호자 휴대폰 번호"
          placeholder="01012345678"
          keyboardType="phone-pad"
          value={guardianPhone}
          onChangeText={setGuardianPhone}
        />
        <PrimaryButton label="동의 요청 보내기" loading={sending} onPress={handleSend} />

        <ThemedText type="smallBold" style={styles.historyTitle}>
          요청 내역
        </ThemedText>
        <FlatList
          data={consents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.historyCard}>
              <ThemedView style={styles.historyRow}>
                <ThemedText type="small">{item.guardian_phone}</ThemedText>
                <Chip label={STATUS_LABEL[item.status]} />
              </ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                요청일 {new Date(item.requested_at).toLocaleDateString('ko-KR')}
              </ThemedText>
            </Card>
          )}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  historyTitle: {
    marginTop: Spacing.two,
  },
  historyCard: {
    marginBottom: Spacing.two,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
