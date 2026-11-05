import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedCardProps = (TouchableOpacityProps | ViewProps) & {
    lightColor?: string;
    darkColor?: string;
    elevated?: boolean;
    onPress?: () => void;
};

/**
 * Themed card component with elevation and shadow support.
 * Automatically adapts styling for light and dark modes.
 */
export function ThemedCard({
    style,
    lightColor,
    darkColor,
    elevated = true,
    onPress,
    ...otherProps
}: ThemedCardProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        'cardBackground'
    );
    const shadowColor = useThemeColor({}, 'shadow');

    const elevationStyles = elevated
        ? Platform.select({
            ios: {
                shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0 8px 16px ${shadowColor}15`,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.05)',
            },
            default: {},
        })
        : {};

    const combinedStyle = [
        styles.card,
        { backgroundColor },
        elevationStyles,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={combinedStyle}
                onPress={onPress}
                activeOpacity={0.9}
                {...(otherProps as TouchableOpacityProps)}
            />
        );
    }

    return (
        <View
            style={combinedStyle}
            {...(otherProps as ViewProps)}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24, // Softer rounding
        padding: 16,
    },
});
