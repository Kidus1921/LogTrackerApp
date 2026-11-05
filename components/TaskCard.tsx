import { useThemeColor } from '@/hooks/use-theme-color';
import { Task } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Animated as RNAnimated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ThemedText } from './themed-text';
import { ThemedCard } from './ThemedCard';
import { IconSymbol } from './ui/icon-symbol';

interface TaskCardProps {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onPress?: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onDelete, onPress }: TaskCardProps) {
    const isCompleted = task.status === 'completed';
    const tintColor = useThemeColor({}, 'tint');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const errorColor = useThemeColor({}, 'error');
    const successColor = useThemeColor({}, 'success');
    const borderColor = useThemeColor({}, 'border');
    const surfaceColor = useThemeColor({}, 'surface');
    const chartOrange = useThemeColor({}, 'chartSecondary');

    const priorityColors = {
        High: errorColor,
        Medium: chartOrange,
        Low: successColor,
    };

    const renderRightActions = (
        progress: RNAnimated.AnimatedInterpolation<number>,
        dragX: RNAnimated.AnimatedInterpolation<number>
    ) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
        });

        return (
            <RectButton
                style={[styles.deleteAction, { backgroundColor: errorColor }]}
                onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    onDelete(task.id);
                }}
            >
                <RNAnimated.View style={{ transform: [{ translateX: trans }] }}>
                    <IconSymbol name="trash.fill" size={24} color="#fff" />
                </RNAnimated.View>
            </RectButton>
        );
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={40}
        >
            <ThemedCard
                style={[
                    styles.card,
                    isCompleted && styles.completedCard,
                ]}
                onPress={() => onPress?.(task)}
                elevated={false}
            >
                <View style={styles.container}>
                    {/* Checkbox */}
                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            { borderColor: isCompleted ? successColor : tintColor + '40' },
                            isCompleted && { backgroundColor: successColor }
                        ]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onToggle(task.id, !isCompleted);
                        }}
                    >
                        {isCompleted && <IconSymbol name="checkmark" size={14} color="#fff" />}
                    </TouchableOpacity>

                    {/* Content */}
                    <View style={styles.content}>
                        <ThemedText
                            style={[
                                styles.title,
                                isCompleted && styles.completedText
                            ]}
                            type="defaultSemiBold"
                            numberOfLines={1}
                        >
                            {task.title}
                        </ThemedText>

                        <View style={styles.meta}>
                            {task.due_date && (
                                <View style={styles.dueContainer}>
                                    <IconSymbol
                                        name="calendar"
                                        size={12}
                                        color={isOverdue ? errorColor : textSecondary}
                                    />
                                    <ThemedText style={[styles.dueText, { color: isOverdue ? errorColor : textSecondary }]}>
                                        {formatDate(task.due_date)}
                                    </ThemedText>
                                </View>
                            )}

                            {task.category !== 'General' && (
                                <View style={[styles.categoryBadge, { backgroundColor: surfaceColor }]}>
                                    <ThemedText style={[styles.categoryText, { color: textSecondary }]}>
                                        {task.category}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Priority Indicator */}
                    <View style={[styles.priorityLine, { backgroundColor: priorityColors[task.priority] || tintColor }]} />
                </View>
            </ThemedCard>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        padding: 0,
        backgroundColor: 'transparent',
    },
    completedCard: {
        opacity: 0.5,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    checkbox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    completedText: {
        textDecorationLine: 'line-through',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 12,
    },
    dueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dueText: {
        fontSize: 12,
        fontWeight: '500',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
    },
    priorityLine: {
        width: 4,
        height: 24,
        borderRadius: 2,
        marginLeft: 12,
    },
    deleteAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '70%',
        marginTop: '5%',
        borderRadius: 20,
        marginRight: 0,
    },
});
