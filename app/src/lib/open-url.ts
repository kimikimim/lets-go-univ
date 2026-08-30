import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/** Opens an external (non-in-app) URL. On web this must be a new tab —
 *  Linking.openURL there just does `window.location = url`, which would
 *  navigate the whole app away instead of leaving it running in the
 *  background. Native platforms open the system browser as usual. */
export function openExternalUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url);
}
