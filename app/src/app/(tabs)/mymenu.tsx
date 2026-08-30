import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { mockAdmissionTracks, mockUniversities } from '@/data/mock';
import { useProfile } from '@/hooks/use-profile';
import { useTargetPreference } from '@/hooks/use-target-preference';
import { useTheme } from '@/hooks/use-theme';
import { signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function MyMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const { preference, loading } = useTargetPreference();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentUniversity = mockUniversities.find(
    (u) => u.id === mockAdmissionTracks.find((t) => t.id === preference?.admission_track_id)?.university_id,
  );
  const currentTrack = mockAdmissionTracks.find((t) => t.id === preference?.admission_track_id);

  async function selectTrack(trackId: string, universityId: string) {
    if (!profile) return;
    setSaving(true);
    try {
      await supabase.from('target_preferences').insert({
        student_id: profile.id,
        university_id: universityId,
        admission_track_id: trackId,
      });
      setPickerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">마이메뉴</ThemedText>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            인적사항
          </ThemedText>
          <Card>
            <ThemedText type="small">이름: {profile?.display_name ?? '미설정'}</ThemedText>
            <ThemedText type="small">생년월일: {profile?.birth_date}</ThemedText>
            <ThemedText type="small">편입 준비생: {profile?.is_transfer_applicant ? '예' : '아니오'}</ThemedText>
          </Card>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            희망 대학/학과 설정
          </ThemedText>
          <Card>
            {loading ? (
              <ThemedText type="small">불러오는 중...</ThemedText>
            ) : currentTrack && currentUniversity ? (
              <ThemedText type="small">
                {currentUniversity.name_kr} · {currentTrack.track_name}
              </ThemedText>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                아직 설정하지 않았어요. 설정하면 생기부 탭 추천이 더 정확해져요.
              </ThemedText>
            )}
            <PrimaryButton
              label={pickerOpen ? '닫기' : '설정하기'}
              variant="secondary"
              onPress={() => setPickerOpen((v) => !v)}
            />
          </Card>

          {pickerOpen ? (
            <Card>
              {mockUniversities.map((university) => (
                <ThemedView key={university.id} style={styles.pickerGroup}>
                  <ThemedText type="small">{university.name_kr}</ThemedText>
                  {mockAdmissionTracks
                    .filter((t) => t.university_id === university.id)
                    .map((track) => (
                      <Pressable key={track.id} onPress={() => selectTrack(track.id, university.id)}>
                        <ThemedView style={[styles.pickerRow, { borderColor: theme.border }]}>
                          <ThemedText type="small">{track.track_name}</ThemedText>
                        </ThemedView>
                      </Pressable>
                    ))}
                </ThemedView>
              ))}
              {saving ? <ThemedText type="small">저장 중...</ThemedText> : null}
            </Card>
          ) : null}

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            계정
          </ThemedText>
          <Card>
            <Pressable onPress={() => router.push('/guardian/consent')}>
              <ThemedText type="small">결제 · 보호자 동의 관리</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push('/webview/terms')}>
              <ThemedText type="small">이용약관 · 개인정보처리방침</ThemedText>
            </Pressable>
          </Card>

          <PrimaryButton label="로그아웃" variant="secondary" onPress={signOut} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  pickerGroup: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  pickerRow: {
    paddingVertical: Spacing.two,
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
  },
});
