import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Every AI-generated suggestion must show which source document grounds it —
 *  this is a trust requirement for a consulting product aimed at minors/parents. */
export function SourceCitation({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Ionicons name="document-text-outline" size={14} color={theme.textSecondary} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.label} numberOfLines={2}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  label: {
    flex: 1,
  },
});
