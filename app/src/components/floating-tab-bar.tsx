import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  admissions: { active: 'document-text', inactive: 'document-text-outline' },
  saenggibu: { active: 'search', inactive: 'search-outline' },
  essay: { active: 'create', inactive: 'create-outline' },
  mymenu: { active: 'person', inactive: 'person-outline' },
};

/** Floating "liquid glass" style pill tab bar — a frosted, rounded bar that
 *  floats above the content instead of a flat bar docked to the screen edge. */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + Spacing.two }]} pointerEvents="box-none">
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={[styles.tint, { backgroundColor: 'rgba(255,255,255,0.55)' }]} />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const label = (options.title ?? route.name) as string;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button">
                <View
                  style={[
                    styles.iconBubble,
                    focused && { backgroundColor: `${theme.primary}1F` },
                  ]}>
                  <Ionicons
                    name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
                    size={26}
                    color={focused ? theme.primary : theme.textSecondary}
                  />
                </View>
                <ThemedText
                  type="small"
                  style={[styles.label, { color: focused ? theme.primary : theme.textSecondary }]}
                  numberOfLines={1}>
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const BAR_HEIGHT = 88;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.two,
    right: Spacing.two,
    alignItems: 'center',
  },
  blur: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconBubble: {
    width: 56,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
  },
});
