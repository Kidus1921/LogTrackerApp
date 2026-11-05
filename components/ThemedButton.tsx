import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export type ThemedButtonProps = TouchableOpacityProps & {
    lightColor?: string;
    darkColor?: string;
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
};

export function ThemedButton({
    style,
    lightColor,
    darkColor,
    title,
    loading,
    variant = 'primary',
    ...otherProps
}: ThemedButtonProps) {
    const primaryColor = useThemeColor({ light: lightColor, dark: darkColor }, 'primary');
    const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const surfaceColor = useThemeColor({ light: lightColor, dark: darkColor }, 'surface');
    const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');

    let backgroundColor = primaryColor;
    let titleColor = '#ffffff';
    let borderW = 0;

    if (variant === 'secondary') {
        backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondary');
    } else if (variant === 'outline') {
        backgroundColor = 'transparent';
        titleColor = primaryColor;
        borderW = 1;
    }

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderColor: primaryColor,
                    borderWidth: borderW,
                },
                style,
                loading && styles.disabled,
            ]}
            disabled={loading}
            activeOpacity={0.7}
            {...otherProps}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? primaryColor : '#ffffff'} />
            ) : (
                <Text style={[styles.text, { color: titleColor }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginVertical: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
});
