import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { mockNews } from '@/data/mock';
import { useAdmissionSchedule } from '@/hooks/use-admission-schedule';
import { useProfile } from '@/hooks/use-profile';
import { useTargetPreferences } from '@/hooks/use-target-preferences';
import { useUniversities } from '@/hooks/use-universities';
import { estimateHakbeon } from '@/lib/hakbeon';
import { supabase } from '@/lib/supabase';
import type { SearchHistoryEntry } from '@/types/database';

export default function HomeScreen() {
  const { profile } = useProfile();
  const { events: upcomingEvents } = useAdmissionSchedule();
  const { preferences } = useTargetPreferences();
  const { universities } = useUniversities();
  const [recentSearches, setRecentSearches] = useState<SearchHistoryEntry[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('search_history')
      .select('*')
      .eq('student_id', profile.id)
      .order('viewed_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentSearches(data ?? []));
  }, [profile]);

  const name = profile?.display_name ?? '학생';

  // Picks one of the student's saved target schools at random each time the
  // home screen loads — only when they've actually set one, and a matching
  // university row can be found.
  const targetSchoolName = useMemo(() => {
    if (preferences.length === 0) return null;
    const candidates = preferences
      .map((p) => universities.find((u) => u.id === p.university_id)?.name_kr)
      .filter((name): name is string => !!name);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [preferences, universities]);

  const greeting =
    targetSchoolName && profile
      ? `${targetSchoolName} ${estimateHakbeon(profile.birth_date)}학번 ${name}님 반가워요`
      : `${name}님 반가워요`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">{greeting}</ThemedText>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            입시 일정
          </ThemedText>
          <Card>
            {upcomingEvents.map((event) => (
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

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            최근 살펴본 생기부 소재
          </ThemedText>
          <Card>
            {recentSearches.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                아직 검색 기록이 없어요. 생기부 탭에서 소재를 찾아보세요.
              </ThemedText>
            ) : (
              recentSearches.map((entry) => (
                <ThemedText key={entry.id} type="small">
                  {entry.query}
                </ThemedText>
              ))
            )}
          </Card>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            입시 뉴스
          </ThemedText>
          <Card>
            {mockNews.map((item) => (
              <Link key={item.id} href={`/webview/${item.slug}`} asChild>
                <ThemedView style={styles.newsRow}>
                  <ThemedText type="small">{item.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.publishedAt}
                  </ThemedText>
                </ThemedView>
              </Link>
            ))}
          </Card>

          <Card style={styles.adSlot}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              광고 영역 (준비 중)
            </ThemedText>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  eventRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  eventName: {
    flex: 1,
  },
  newsRow: {
    gap: Spacing.half,
  },
  adSlot: {
    minHeight: 80,
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
