import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { mockAdmissionTracks, mockUniversities } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';
import type { TrackType } from '@/types/database';

const TRACK_TYPES: TrackType[] = ['학종', '교과', '논술', '정시'];

export default function AdmissionsScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [trackType, setTrackType] = useState<TrackType | null>(null);
  const [selfIntroOnly, setSelfIntroOnly] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim();

    return mockUniversities
      .map((university) => ({
        university,
        tracks: mockAdmissionTracks.filter((track) => {
          if (track.university_id !== university.id) return false;
          if (trackType && track.track_type !== trackType) return false;
          if (selfIntroOnly && !track.requires_self_intro) return false;
          return true;
        }),
      }))
      .filter(({ university, tracks }) => {
        if (!q) return true;
        const matchesUniversity = university.name_kr.includes(q);
        const matchesTrack = tracks.some(
          (t) => t.track_name.includes(q) || (t.min_grade_requirement ?? '').includes(q),
        );
        return matchesUniversity || matchesTrack;
      })
      .filter(({ tracks }) => (trackType || selfIntroOnly ? tracks.length > 0 : true))
      .sort((a, b) => a.university.name_kr.localeCompare(b.university.name_kr, 'ko'));
  }, [query, trackType, selfIntroOnly]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <TextField
            placeholder="대학명, 최저학력기준, 전형명으로 검색"
            value={query}
            onChangeText={setQuery}
          />
          <ThemedView style={styles.filterRow}>
            {TRACK_TYPES.map((type) => (
              <Pressable key={type} onPress={() => setTrackType(trackType === type ? null : type)}>
                <ThemedView
                  style={[
                    styles.filterChip,
                    { borderColor: theme.border },
                    trackType === type && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}>
                  <ThemedText
                    type="small"
                    style={trackType === type ? { color: theme.onPrimary } : undefined}>
                    {type}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
            <Pressable onPress={() => setSelfIntroOnly((v) => !v)}>
              <ThemedView
                style={[
                  styles.filterChip,
                  { borderColor: theme.border },
                  selfIntroOnly && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}>
                <ThemedText type="small" style={selfIntroOnly ? { color: theme.onPrimary } : undefined}>
                  자소서 필요
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <FlatList
          data={rows}
          keyExtractor={(item) => item.university.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="검색 결과가 없어요" description="다른 검색어나 필터를 사용해보세요." />}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/university/[id]', params: { id: item.university.id } }} asChild>
              <Pressable>
                <ThemedView style={[styles.row, { borderBottomColor: theme.border }]}>
                  <ThemedView style={styles.rowHeader}>
                    <ThemedText type="smallBold">{item.university.name_kr}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.university.region}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.chipRow}>
                    {item.tracks.map((track) => (
                      <Chip
                        key={track.id}
                        label={track.requires_self_intro ? `${track.track_name} · 자소서 필요` : track.track_name}
                      />
                    ))}
                  </ThemedView>
                </ThemedView>
              </Pressable>
            </Link>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  filterChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  row: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.one,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
