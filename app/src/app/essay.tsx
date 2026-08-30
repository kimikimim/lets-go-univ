import { Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { mockAdmissionTracks } from '@/data/mock';
import { useTargetPreference } from '@/hooks/use-target-preference';
import { useTheme } from '@/hooks/use-theme';

export default function EssayScreen() {
  const theme = useTheme();
  const { preference } = useTargetPreference();
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedTrack = useMemo(
    () => mockAdmissionTracks.find((t) => t.id === preference?.admission_track_id),
    [preference],
  );
  const showSelfIntroNote = !selectedTrack?.requires_self_intro;

  async function handleCopy() {
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleReview() {
    if (!content.trim()) return;
    setReviewing(true);
    try {
      // Real implementation: send `content` to the AI 첨삭 endpoint, which must
      // only suggest edits to what the student already wrote — never generate
      // new passages. Placeholder feedback stands in until that's wired up.
      setFeedback(
        '문단 2의 활동 설명이 다소 나열식이에요. 어떤 과정을 통해 그 결론에 도달했는지 본인의 생각을 한두 문장 추가해보세요.',
      );
    } finally {
      setReviewing(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '자소서' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {showSelfIntroNote ? (
          <Card>
            <ThemedText type="small">
              일반 4년제 대학은 2026학년도부터 자기소개서가 폐지되었어요. 이 탭은 KAIST·GIST·DGIST·UNIST와
              편입, 그 외 자소서가 필요한 전형을 준비하는 학생을 위한 공간이에요. 모집요강 탭에서 지원할
              전형을 먼저 선택해보세요.
            </ThemedText>
          </Card>
        ) : null}

        <TextInput
          multiline
          placeholder="자기소개서 내용을 작성해보세요"
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          style={[
            styles.editor,
            { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        />

        <ThemedView style={styles.actionRow}>
          <PrimaryButton
            label={copied ? '복사됨' : '복붙하기'}
            variant="secondary"
            onPress={handleCopy}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="AI 첨삭 받기"
            loading={reviewing}
            onPress={handleReview}
            style={styles.actionButton}
          />
        </ThemedView>

        {feedback ? (
          <Card>
            <ThemedText type="smallBold">AI 첨삭 의견</ThemedText>
            <ThemedText type="small">{feedback}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              이 의견은 참고용 피드백이에요. 문장은 반드시 본인이 직접 다듬어주세요.
            </ThemedText>
          </Card>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  editor: {
    minHeight: 240,
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
