import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SourceCitation } from '@/components/source-citation';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { mockSaenggibuSuggestions } from '@/data/mock';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';

export default function SaenggibuScreen() {
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(mockSaenggibuSuggestions);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      if (profile) {
        await supabase.from('search_history').insert({ student_id: profile.id, query: query.trim() });
      }
      // Real implementation: call the rag-saenggibu-match edge function with the
      // student's saved target university/department + this query, and render
      // its grounded, cited suggestions. Mock results stand in until that's wired up.
      setResults(mockSaenggibuSuggestions);
    } finally {
      setSearching(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <TextField
            placeholder="활동, 키워드로 검색해보세요"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <PrimaryButton label="검색" loading={searching} onPress={handleSearch} />
        </ThemedView>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="아직 추천 소재가 없어요"
              description="마이메뉴에서 희망 대학/학과를 설정하면 더 정확한 추천을 받을 수 있어요."
            />
          }
          renderItem={({ item }) => (
            <Card>
              <ThemedView style={styles.cardHeader}>
                <ThemedText type="smallBold" style={styles.title}>
                  {item.title}
                </ThemedText>
                <Chip label={item.category} />
              </ThemedView>
              <ThemedText type="small">{item.summary}</ThemedText>
              <SourceCitation label={item.sourceLabel} />
            </Card>
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
  listContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
  },
});
