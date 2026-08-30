import * as Linking from 'expo-linking';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { createSessionFromUrl } from '@/lib/auth';

/** Defensive landing screen: openAuthSessionAsync normally resolves the Kakao
 *  OAuth redirect directly inside lib/auth.ts, but the OS can still route the
 *  deep link here first on some Android configurations. */
export default function AuthCallbackScreen() {
  const url = Linking.useURL();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!url) return;
    createSessionFromUrl(url).catch(() => undefined).finally(() => setDone(true));
  }, [url]);

  if (done) return <Redirect href="/" />;

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </ThemedView>
  );
}
