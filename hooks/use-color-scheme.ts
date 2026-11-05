import { Appearance } from 'react-native';
import { usePreferredTheme } from './preferred-theme';

/**
 * Unified color scheme hook
 * Source priority:
 * 1. PreferredThemeProvider
 * 2. System Appearance
 */
export function useColorScheme(): 'light' | 'dark' {
  try {
    const { theme } = usePreferredTheme();
    return theme;
  } catch {
    const system = Appearance.getColorScheme();
    return system === 'dark' ? 'dark' : 'light';
  }
}
