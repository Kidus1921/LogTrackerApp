import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

export type ThemedInputProps = TextInputProps & {
    lightColor?: string;
    darkColor?: string;
    icon?: IconSymbolName;
};

export function ThemedInput({
    style,
    lightColor,
    darkColor,
    icon,
    secureTextEntry,
    ...otherProps
}: ThemedInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'surface');
    const textSecondary = useThemeColor({ light: lightColor, dark: darkColor }, 'textSecondary');
    const tintColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

    const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.inputWrapper,
                    {
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                    }
                ]}
            >
                {icon && (
                    <IconSymbol
                        name={icon}
                        size={20}
                        color={textSecondary}
                        style={styles.leftIcon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        { color: textColor },
                        style,
                    ]}
                    placeholderTextColor={textSecondary + '80'}
                    secureTextEntry={actualSecureTextEntry}
                    {...otherProps}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.rightIcon}
                    >
                        <IconSymbol
                            name={isPasswordVisible ? 'eye.slash.fill' : 'eye.fill'}
                            size={20}
                            color={isPasswordVisible ? tintColor : textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
    },
    inputWrapper: {
        height: 56,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    rightIcon: {
        padding: 4,
    },
});
