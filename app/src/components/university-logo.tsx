import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Placeholder avatar until real university logo images are sourced — a
// deterministic color + initial per school, not a random one per render.
const PALETTE = ['#3366FF', '#7C3AED', '#0E9F6E', '#F59E0B', '#EF4444', '#0EA5E9', '#EC4899', '#84CC16'];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function UniversityLogo({ name, size = 56 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: colorForName(name) },
      ]}>
      <ThemedText style={{ color: '#ffffff', fontSize: size * 0.4, fontWeight: '700' }}>{initial}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
