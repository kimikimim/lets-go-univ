import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PrimaryButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'dark';
};

const VARIANT_COLORS = {
  primary: { bg: 'primary', fg: 'onPrimary' },
  secondary: { bg: 'backgroundElement', fg: 'text' },
  dark: { bg: 'text', fg: 'background' },
} as const;

export function PrimaryButton({ label, loading, variant = 'primary', disabled, style, ...rest }: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const colors = VARIANT_COLORS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: theme[colors.bg],
          opacity: isDisabled ? 0.6 : 1,
        },
        style as object,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={theme[colors.fg]} />
      ) : (
        <ThemedText type="smallBold" style={{ color: theme[colors.fg] }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
