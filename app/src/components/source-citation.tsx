import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Every AI-generated suggestion must show which source document grounds it —
 *  this is a trust requirement for a consulting product aimed at minors/parents. */
export function SourceCitation({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderTopColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary">
        출처
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  label: {
    flex: 1,
  },
});
