import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Strong primary color for active tab
  const activeTabColor = theme.primary;

  // Softer complementary tone for inactive tab (refined for slate/indigo)
  const inactiveTabColor =
    colorScheme === 'dark'
      ? 'rgba(148, 163, 184, 0.45)' // Slate 400 with opacity
      : 'rgba(71, 85, 105, 0.45)'; // Slate 600 with opacity

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: activeTabColor,
        tabBarInactiveTintColor: inactiveTabColor,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          height: 72,
          borderRadius: 36,
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 20,
          elevation: 10,
          borderWidth: colorScheme === 'dark' ? 1 : 0,
          borderColor: theme.border,
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={26}
              name={focused ? 'house.fill' : 'house'}
              color={color}
            />
          ),
        }}
      />

      {/* Records */}
      <Tabs.Screen
        name="records"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={26}
              name={focused ? 'bag.fill' : 'bag'}
              color={color}
            />
          ),
        }}
      />

      {/* Add (FAB Style) */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: activeTabColor,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: activeTabColor,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 12,
                marginTop: Platform.OS === 'ios' ? -5 : 0,
              }}
            >
              <IconSymbol
                name="plus"
                size={32}
                color="#ffffff"
              />
            </View>
          ),
        }}
      />

      {/* Tasks */}
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="checklist" color={color} />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'person.fill' : 'person'}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden */}
      <Tabs.Screen name="reports" options={{ href: null }} />
    </Tabs>
  );
}