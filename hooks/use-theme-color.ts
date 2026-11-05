import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor<
  T extends keyof typeof Colors.light & keyof typeof Colors.dark
>(
  props: { light?: string; dark?: string },
  colorName: T
) {
  const theme = useColorScheme();
  return props[theme] ?? Colors[theme][colorName];
}
