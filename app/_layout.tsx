import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { PreferredThemeProvider, usePreferredTheme } from '@/hooks/preferred-theme';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const { theme } = usePreferredTheme();
  const navTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!session && !inAuthGroup) {
      // Redirect to the login page if not logged in
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect to the home page if already logged in
      router.replace('/(tabs)');
    }
  }, [session, segments, loading]);

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferredThemeProvider>
      <InnerLayout />
    </PreferredThemeProvider>
  );
}
