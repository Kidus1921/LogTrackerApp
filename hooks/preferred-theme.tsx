import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Animated, Appearance, Easing } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'preferredTheme_v2';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeName;
  setMode: (m: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveTheme = (mode: ThemeMode): ThemeName => {
  if (mode === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return mode;
};

export function PreferredThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<ThemeName>(resolveTheme('system'));

  const opacity = useRef(new Animated.Value(1)).current;

  /** Load persisted preference */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
          setTheme(resolveTheme(stored));
        }
      } catch {
        // ignore storage errors
      }
    })();
  }, []);

  /** Listen to system theme changes */
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme((prev) => {
        if (mode !== 'system') return prev;
        return colorScheme === 'dark' ? 'dark' : 'light';
      });
    });

    return () => subscription.remove();
  }, [mode]);

  /** Animate theme transition */
  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.92,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [theme]);

  /** Set theme mode */
  const setMode = useCallback(async (m: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, m);
    } catch {
      // ignore
    }

    setModeState(m);
    setTheme(resolveTheme(m));
  }, []);

  /** Toggle helper (light <-> dark) */
  const toggleTheme = useCallback(async () => {
    const next =
      theme === 'dark'
        ? 'light'
        : 'dark';

    await setMode(next);
  }, [theme, setMode]);

  const value = useMemo(
    () => ({
      mode,
      theme,
      setMode,
      toggleTheme,
    }),
    [mode, theme, setMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <Animated.View style={{ flex: 1, opacity }}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}

export function usePreferredTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      'usePreferredTheme must be used within PreferredThemeProvider'
    );
  }
  return ctx;
}
