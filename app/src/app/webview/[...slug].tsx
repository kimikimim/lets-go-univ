import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { unstable_createElement as createElement } from 'react-native-web';
import { WebView } from 'react-native-webview';

import { ThemedView } from '@/components/themed-view';
import { contentUrlForSlug } from '@/lib/content-urls';

const TITLES: Record<string, string> = {
  terms: '이용약관',
};

// react-native-webview has no web implementation at all (it renders "does
// not support this platform" there), so the web build uses a plain iframe —
// same content, no native module needed.
export default function WebviewScreen() {
  const { slug } = useLocalSearchParams<{ slug: string | string[] }>();
  const slugPath = Array.isArray(slug) ? slug.join('/') : (slug ?? '');
  const url = contentUrlForSlug(slugPath);
  const title = TITLES[slugPath] ?? '안내';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />
      {Platform.OS === 'web' ? (
        createElement('iframe', {
          src: url,
          title,
          style: { flex: 1, border: 'none', width: '100%', height: '100%' },
        })
      ) : (
        <WebView
          source={{ uri: url }}
          startInLoadingState
          renderLoading={() => (
            <ThemedView style={[StyleSheet.absoluteFill, styles.loading]}>
              <ActivityIndicator />
            </ThemedView>
          )}
        />
      )}
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
