/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Refined brand colors for premium look
const tintColorLight = '#6366f1'; // Indigo 500
const tintColorDark = '#818cf8'; // Indigo 400

export const Colors = {
  light: {
    // Text colors
    text: '#0f172a', // Slate 900
    textSecondary: '#64748b', // Slate 500

    // Background and surfaces
    background: '#f8fafc', // Slate 50
    surface: '#ffffff',
    cardBackground: '#ffffff',

    // Interactive elements
    tint: tintColorLight,
    primary: tintColorLight,
    secondary: '#8b5cf6', // Violet 500

    // UI elements
    icon: '#475569', // Slate 600
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: tintColorLight,

    // Borders and dividers
    border: '#e2e8f0', // Slate 200
    separator: '#f1f5f9', // Slate 100

    // Status colors
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500

    // Chart specific colors
    chartPrimary: '#6366f1', // Indigo 500
    chartSecondary: '#ec4899', // Pink 500
    chartTertiary: '#f59e0b', // Amber 500

    // Shadows (for elevation)
    shadow: '#000000',
  },
  dark: {
    // Text colors
    text: '#f8fafc', // Slate 50
    textSecondary: '#94a3b8', // Slate 400

    // Background and surfaces
    background: '#0f172a', // Slate 900
    surface: '#1e293b', // Slate 800
    cardBackground: '#1e293b',

    // Interactive elements
    tint: tintColorDark,
    primary: tintColorDark,
    secondary: '#a78bfa', // Violet 400

    // UI elements
    icon: '#94a3b8', // Slate 400
    tabIconDefault: '#475569', // Slate 600
    tabIconSelected: tintColorDark,

    // Borders and dividers
    border: '#334155', // Slate 700
    separator: '#1e293b', // Slate 800

    // Status colors
    success: '#34d399', // Emerald 400
    warning: '#fbbf24', // Amber 400
    error: '#f87171', // Red 400
    info: tintColorDark,

    // Chart specific colors
    chartPrimary: '#818cf8', // Indigo 400
    chartSecondary: '#f472b6', // Pink 400
    chartTertiary: '#fbbf24', // Amber 400

    // Shadows (for elevation)
    shadow: '#000000',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
