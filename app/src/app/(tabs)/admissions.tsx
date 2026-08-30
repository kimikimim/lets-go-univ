import { Link } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAdmissionTracks } from '@/hooks/use-admission-tracks';
import { useTheme } from '@/hooks/use-theme';
import { useUniversities } from '@/hooks/use-universities';
import type { TrackType } from '@/types/database';

const TRACK_TYPES: TrackType[] = ['학종', '교과', '논술', '정시'];

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

type TriState = 'all' | 'has' | 'none';

function ChipToggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <ThemedView
        style={[
          styles.filterChip,
          { borderColor: theme.border },
          active && { backgroundColor: theme.primary, borderColor: theme.primary },
        ]}>
        <ThemedText type="small" style={active ? { color: theme.onPrimary } : undefined}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ThemedView style={styles.filterSection}>
      <ThemedText type="small" themeColor="textSecondary">
        {title}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ThemedView style={styles.filterRow}>{children}</ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function TriStateSection({
  title,
  value,
  onChange,
  hasLabel,
  noneLabel,
}: {
  title: string;
  value: TriState;
  onChange: (value: TriState) => void;
  hasLabel: string;
  noneLabel: string;
}) {
  return (
    <FilterSection title={title}>
      <ChipToggle label="전체" active={value === 'all'} onPress={() => onChange('all')} />
      <ChipToggle label={hasLabel} active={value === 'has'} onPress={() => onChange('has')} />
      <ChipToggle label={noneLabel} active={value === 'none'} onPress={() => onChange('none')} />
    </FilterSection>
  );
}

function toggleInSet<T>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function AdmissionsScreen() {
  const theme = useTheme();
  const { universities, loading: universitiesLoading } = useUniversities();
  const { tracks: admissionTracks, loading: tracksLoading } = useAdmissionTracks();
  const loading = universitiesLoading || tracksLoading;
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [trackTypes, setTrackTypes] = useState<Set<TrackType>>(new Set());
  const [regions, setRegions] = useState<Set<string>>(new Set());
  const [minGradeFilter, setMinGradeFilter] = useState<TriState>('all');
  const [selfIntroFilter, setSelfIntroFilter] = useState<TriState>('all');
  const [interviewFilter, setInterviewFilter] = useState<TriState>('all');

  const activeFilterCount =
    trackTypes.size +
    regions.size +
    (minGradeFilter !== 'all' ? 1 : 0) +
    (selfIntroFilter !== 'all' ? 1 : 0) +
    (interviewFilter !== 'all' ? 1 : 0);

  function resetFilters() {
    setTrackTypes(new Set());
    setRegions(new Set());
    setMinGradeFilter('all');
    setSelfIntroFilter('all');
    setInterviewFilter('all');
  }

  const rows = useMemo(() => {
    const q = query.trim();

    return universities
      .filter((university) => regions.size === 0 || regions.has(university.region ?? ''))
      .map((university) => ({
        university,
        tracks: admissionTracks.filter((track) => {
          if (track.university_id !== university.id) return false;
          if (trackTypes.size > 0 && !trackTypes.has(track.track_type)) return false;
          if (minGradeFilter === 'has' && !track.min_grade_requirement) return false;
          if (minGradeFilter === 'none' && track.min_grade_requirement) return false;
          if (selfIntroFilter === 'has' && !track.requires_self_intro) return false;
          if (selfIntroFilter === 'none' && track.requires_self_intro) return false;
          if (interviewFilter === 'has' && !track.requires_interview) return false;
          if (interviewFilter === 'none' && track.requires_interview) return false;
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
      .filter(({ tracks }) => (activeFilterCount > 0 ? tracks.length > 0 : true))
      .sort((a, b) => a.university.name_kr.localeCompare(b.university.name_kr, 'ko'));
  }, [universities, admissionTracks, query, trackTypes, regions, minGradeFilter, selfIntroFilter, interviewFilter, activeFilterCount]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <TextField
            placeholder="대학명, 최저학력기준, 전형명으로 검색"
            value={query}
            onChangeText={setQuery}
          />
          <Pressable onPress={() => setFiltersOpen((v) => !v)}>
            <ThemedView style={styles.filterToggleRow}>
              <ThemedText type="smallBold" themeColor="primary">
                필터{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {filtersOpen ? '접기' : '펼치기'}
              </ThemedText>
            </ThemedView>
          </Pressable>

          {filtersOpen ? (
            <ThemedView style={styles.filterPanel}>
              <FilterSection title="전형">
                {TRACK_TYPES.map((type) => (
                  <ChipToggle
                    key={type}
                    label={type}
                    active={trackTypes.has(type)}
                    onPress={() => setTrackTypes((prev) => toggleInSet(prev, type))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="지역">
                {REGIONS.map((region) => (
                  <ChipToggle
                    key={region}
                    label={region}
                    active={regions.has(region)}
                    onPress={() => setRegions((prev) => toggleInSet(prev, region))}
                  />
                ))}
              </FilterSection>

              <TriStateSection
                title="수능최저 유무"
                value={minGradeFilter}
                onChange={setMinGradeFilter}
                hasLabel="최저 있음"
                noneLabel="최저 없음"
              />

              <TriStateSection
                title="자소서 유무"
                value={selfIntroFilter}
                onChange={setSelfIntroFilter}
                hasLabel="자소서 필요"
                noneLabel="자소서 불필요"
              />

              <TriStateSection
                title="면접 유무"
                value={interviewFilter}
                onChange={setInterviewFilter}
                hasLabel="면접 있음"
                noneLabel="면접 없음"
              />

              {activeFilterCount > 0 ? (
                <Pressable onPress={resetFilters}>
                  <ThemedText type="small" themeColor="danger" style={styles.resetLabel}>
                    필터 초기화
                  </ThemedText>
                </Pressable>
              ) : null}
            </ThemedView>
          ) : null}
        </ThemedView>

        <FlatList
          data={rows}
          keyExtractor={(item) => item.university.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator style={styles.loading} />
            ) : (
              <EmptyState title="검색 결과가 없어요" description="다른 검색어나 필터를 사용해보세요." />
            )
          }
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
                  {item.tracks.map((track) => (
                    <ThemedView key={track.id} style={styles.trackBlock}>
                      <ThemedText type="small">
                        {track.track_name} · {track.track_type}
                      </ThemedText>
                      <ThemedView style={styles.chipRow}>
                        {track.min_grade_requirement ? <Chip label="최저 있음" /> : null}
                        {track.requires_self_intro ? <Chip label="자소서 필요" /> : null}
                        {track.requires_interview ? <Chip label="면접" /> : null}
                      </ThemedView>
                    </ThemedView>
                  ))}
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  filterToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  filterPanel: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  filterSection: {
    gap: Spacing.one,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  filterChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    borderWidth: 1,
  },
  resetLabel: {
    textAlign: 'center',
    paddingVertical: Spacing.one,
  },
  loading: {
    marginTop: Spacing.five,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  row: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackBlock: {
    gap: Spacing.half,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
