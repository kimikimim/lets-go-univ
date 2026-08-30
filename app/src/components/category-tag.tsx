import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { SourceCategory } from '@/types/database';

const CATEGORY_STYLES: Record<SourceCategory, { bg: string; fg: string }> = {
  인재상: { bg: '#EEF2FF', fg: '#3355DD' },
  연구방향: { bg: '#F4EEFF', fg: '#7C3AED' },
  학과소개: { bg: '#E7F9F1', fg: '#0E9F6E' },
  모집요강: { bg: '#FFF6E5', fg: '#B45309' },
};

export function CategoryTag({ category }: { category: SourceCategory }) {
  const { bg, fg } = CATEGORY_STYLES[category];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <ThemedText type="small" style={[styles.label, { color: fg }]}>
        {category}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
