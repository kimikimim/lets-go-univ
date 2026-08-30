import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { AdmissionScheduleEvent, AdmissionTrack, University } from '@/types/database';

export default function UniversityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [tracks, setTracks] = useState<AdmissionTrack[]>([]);
  const [events, setEvents] = useState<AdmissionScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('universities').select('*').eq('id', id).maybeSingle(),
      supabase.from('admission_tracks').select('*').eq('university_id', id),
      supabase.from('admission_schedule').select('*').eq('university_id', id).order('event_date'),
    ]).then(([universityRes, tracksRes, eventsRes]) => {
      setUniversity(universityRes.data ?? null);
      setTracks(tracksRes.data ?? []);
      setEvents(eventsRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
