import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

export type TaskFilterType = 'All' | 'Pending' | 'High Priority' | 'Completed' | 'Today' | 'Upcoming';

interface TaskFilterProps {
    activeFilter: TaskFilterType;
    onFilterChange: (filter: TaskFilterType) => void;
}

const FILTERS: TaskFilterType[] = ['All', 'Pending', 'Today', 'Upcoming', 'High Priority', 'Completed'];

export function TaskFilter({ activeFilter, onFilterChange }: TaskFilterProps) {
    const tintColor = useThemeColor({}, 'tint');
    const surfaceColor = useThemeColor({}, 'surface');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const border = useThemeColor({}, 'border');

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FILTERS.map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.pill,
                                {
                                    backgroundColor: isActive ? tintColor : surfaceColor,
                                    borderColor: isActive ? tintColor : border,
                                },
                            ]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onFilterChange(filter);
                            }}
                        >
                            <ThemedText
                                style={[
                                    styles.pillText,
                                    { color: isActive ? '#fff' : textSecondary },
                                ]}
                            >
                                {filter}
                            </ThemedText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 10,
    },
    pill: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
