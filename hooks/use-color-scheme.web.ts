import { usePreferredTheme } from './preferred-theme';

/**
 * Web-safe color scheme hook
 * respects PreferredThemeProvider
 */
export function useColorScheme(): 'light' | 'dark' {
  try {
    const { theme } = usePreferredTheme();
    return theme;
  } catch {
    return 'light';
  }
}
