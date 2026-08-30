import { Colors } from '@/constants/theme';

// Fixed light theme (white background, blue accent) — the app doesn't follow
// the system/browser dark mode preference.
export function useTheme() {
  return Colors.light;
}
