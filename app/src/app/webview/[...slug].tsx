import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedView } from '@/components/themed-view';
import { contentUrlForSlug } from '@/lib/content-urls';

const TITLES: Record<string, string> = {
  terms: '이용약관',
};

export default function WebviewScreen() {
  const { slug } = useLocalSearchParams<{ slug: string | string[] }>();
  const slugPath = Array.isArray(slug) ? slug.join('/') : (slug ?? '');
  const url = contentUrlForSlug(slugPath);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: TITLES[slugPath] ?? '안내' }} />
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => (
          <ThemedView style={[StyleSheet.absoluteFill, styles.loading]}>
            <ActivityIndicator />
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
