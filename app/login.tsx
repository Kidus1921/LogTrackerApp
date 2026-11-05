import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

    const router = useRouter();
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const errorColor = useThemeColor({}, 'error');
    const successColor = useThemeColor({}, 'success');

    const handleAuth = async () => {
        setFeedback(null);

        if (!email || !password) {
            setFeedback({ type: 'error', message: 'Please enter both email and password.' });
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setFeedback({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        if (isSignUp && !fullName.trim()) {
            setFeedback({ type: 'error', message: 'Please enter your full name.' });
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim(),
                        }
                    }
                });

                if (error) {
                    throw error;
                }

                if (data.session === null) {
                    setIsSignUp(false);
                    setFeedback({
                        type: 'success',
                        message: `We sent a confirmation link to ${email}. Please check your inbox and spam folder.`,
                    });
                } else {
                    router.replace('/(tabs)');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    throw error;
                }
                router.replace('/(tabs)');
            }
        } catch (error: unknown) {
            let message = error instanceof Error ? error.message : 'Unable to authenticate. Please try again.';
            if (message.includes('Invalid login credentials')) {
                message = 'Incorrect email or password. Please try again.';
            } else if (message.includes('Email not confirmed')) {
                message = 'Please confirm your email address before signing in.';
            } else if (message.includes('rate limit exceeded')) {
                message = 'Too many attempts. Please wait a few minutes and try again.';
            }
            setFeedback({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInUp.delay(200).duration(600)}
                    style={styles.header}
                >
                    <View style={[styles.logoPlaceholder, { backgroundColor: tintColor + '15' }]}>
                        <ThemedText style={{ fontSize: 40 }}>📝</ThemedText>
                    </View>
                    <ThemedText style={styles.title}>LogTracker</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
                        Track Repairs, Purchases & Tasks Easily
                    </ThemedText>
                </Animated.View>

                <Animated.View
                    layout={Layout.springify()}
                    entering={FadeInDown.delay(400).duration(600)}
                >
                    <ThemedCard style={styles.card}>
                        <Animated.View layout={Layout.springify()}>
                            {isSignUp && (
                                <Animated.View
                                    entering={FadeInDown}
                                    exiting={FadeInUp}
                                >
                                    <ThemedInput
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChangeText={(value) => {
                                            setFullName(value);
                                            setFeedback(null);
                                        }}
                                        icon="person.fill"
                                    />
                                </Animated.View>
                            )}

                            <ThemedInput
                                placeholder="Email"
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    setFeedback(null);
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon="envelope.fill"
                            />

                            <ThemedInput
                                placeholder="Password"
                                value={password}
                                onChangeText={(value) => {
                                    setPassword(value);
                                    setFeedback(null);
                                }}
                                secureTextEntry
                                icon="lock.fill"
                            />

                            {feedback && (
                                <View
                                    style={[
                                        styles.feedback,
                                        { backgroundColor: (feedback.type === 'error' ? errorColor : successColor) + '12' },
                                    ]}
                                >
                                    <ThemedText
                                        accessibilityRole={feedback.type === 'error' ? 'alert' : 'text'}
                                        style={{ color: feedback.type === 'error' ? errorColor : successColor }}
                                    >
                                        {feedback.message}
                                    </ThemedText>
                                </View>
                            )}

                            {isSignUp && (
                                <Animated.View
                                    entering={FadeInDown}
                                    exiting={FadeInUp}
                                >
                                    <ThemedInput
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChangeText={(value) => {
                                            setConfirmPassword(value);
                                            setFeedback(null);
                                        }}
                                        secureTextEntry
                                        icon="lock.fill"
                                    />
                                </Animated.View>
                            )}

                            {!isSignUp && (
                                <TouchableOpacity style={styles.forgotPassword}>
                                    <ThemedText style={[styles.forgotText, { color: tintColor }]}>
                                        Forgot Password?
                                    </ThemedText>
                                </TouchableOpacity>
                            )}

                            <ThemedButton
                                title={isSignUp ? 'Create Account' : 'Sign In'}
                                onPress={handleAuth}
                                loading={loading}
                                style={styles.mainButton}
                            />
                        </Animated.View>
                    </ThemedCard>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(600).duration(600)}
                    style={styles.footer}
                >
                    <View style={styles.dividerRow}>
                        <View style={[styles.divider, { backgroundColor: textSecondary + '30' }]} />
                        <ThemedText style={[styles.dividerText, { color: textSecondary }]}>
                            Or continue with
                        </ThemedText>
                        <View style={[styles.divider, { backgroundColor: textSecondary + '30' }]} />
                    </View>

                    <View style={styles.toggleRow}>
                        <ThemedText style={{ color: textSecondary }}>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        </ThemedText>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSignUp(!isSignUp);
                                setFeedback(null);
                            }}
                        >
                            <ThemedText style={{ color: tintColor, fontWeight: '700' }}>
                                {isSignUp ? 'Log In' : 'Sign Up'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        fontFamily: Fonts.rounded,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 5,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -4,
        marginBottom: 8,
        paddingVertical: 4,
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
    },
    feedback: {
        borderRadius: 12,
        marginTop: 4,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    mainButton: {
        marginTop: 12,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 13,
        fontWeight: '500',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
