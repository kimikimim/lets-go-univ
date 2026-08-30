import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { mockAdmissionTracks, mockScheduleEvents, mockUniversities } from '@/data/mock';

export default function UniversityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const university = mockUniversities.find((u) => u.id === id);
  const tracks = mockAdmissionTracks.filter((t) => t.university_id === id);
  const events = mockScheduleEvents.filter((e) => e.university_id === id);

  if (!university) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>대학 정보를 찾을 수 없어요.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: university.name_kr }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">{university.name_kr}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {university.region} · {university.type}
        </ThemedText>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          전형
        </ThemedText>
        {tracks.map((track) => (
          <Card key={track.id}>
            <ThemedView style={styles.trackHeader}>
              <ThemedText type="smallBold">{track.track_name}</ThemedText>
              <Chip label={track.track_type} />
            </ThemedView>
            {track.min_grade_requirement ? (
              <ThemedText type="small">수능최저: {track.min_grade_requirement}</ThemedText>
            ) : null}
            <ThemedText type="small" themeColor="textSecondary">
              접수기간 {track.application_period_start} ~ {track.application_period_end}
            </ThemedText>
            {track.requires_self_intro ? (
              <Link href="/essay" asChild>
                <Pressable>
                  <ThemedText type="small" themeColor="primary">
                    이 전형은 자기소개서 제출이 필요해요 — 여기서 준비해보세요.
                  </ThemedText>
                </Pressable>
              </Link>
            ) : null}
            {track.requires_interview ? <ThemedText type="small">면접이 있어요.</ThemedText> : null}
          </Card>
        ))}

        {events.length > 0 ? (
          <>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              일정
            </ThemedText>
            <Card>
              {events.map((event) => (
                <ThemedView key={event.id} style={styles.eventRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {event.event_date}
                  </ThemedText>
                  <ThemedText type="small" style={styles.eventName}>
                    {event.event_name}
                  </ThemedText>
                </ThemedView>
              ))}
            </Card>
          </>
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
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  eventName: {
    flex: 1,
  },
});
