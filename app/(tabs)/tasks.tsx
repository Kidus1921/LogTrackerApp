import { TaskCard } from '@/components/TaskCard';
import { TaskFilter, TaskFilterType } from '@/components/TaskFilter';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as db from '@/lib/database';
import { Task } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<TaskFilterType>('All');

    const tintColor = useThemeColor({}, 'tint');
    const backgroundColor = useThemeColor({}, 'background');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const surfaceColor = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const chartPurple = useThemeColor({}, 'chartPrimary');
    const chartOrange = useThemeColor({}, 'chartSecondary');
    const chartYellow = useThemeColor({}, 'chartTertiary');

    const loadTasks = useCallback(async () => {
        try {
            const data = await db.loadTasks();
            setTasks(data);
        } catch (e) {
            console.error('Failed to load tasks', e);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [loadTasks])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTasks();
        setRefreshing(false);
    };

    const handleToggleTask = async (id: string, completed: boolean) => {
        try {
            await db.updateTask(id, { status: completed ? 'completed' : 'pending' });
            setTasks(current =>
                current.map(t => t.id === id ? { ...t, status: completed ? 'completed' as const : 'pending' as const } : t)
            );
        } catch (e) {
            Alert.alert('Error', 'Failed to update task');
            loadTasks();
        }
    };

    const handleDeleteTask = (id: string) => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.deleteTask(id);
                            setTasks(current => current.filter(t => t.id !== id));
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete task');
                        }
                    }
                }
            ]
        );
    };

    const { completedCount, pendingCount, totalCount, overdueCount } = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const completed = tasks.filter(t => t.status === 'completed').length;
        const total = tasks.length;
        const overdue = tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < today).length;
        return {
            completedCount: completed,
            pendingCount: total - completed,
            totalCount: total,
            overdueCount: overdue
        };
    }, [tasks]);

    const taskProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const filteredTasks = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        switch (activeFilter) {
            case 'Pending':
                return tasks.filter(t => t.status !== 'completed');
            case 'Completed':
                return tasks.filter(t => t.status === 'completed');
            case 'High Priority':
                return tasks.filter(t => t.priority === 'High');
            case 'Today':
                return tasks.filter(t => t.due_date && t.due_date.startsWith(today));
            case 'Upcoming':
                return tasks.filter(t => t.due_date && t.due_date > today && t.status !== 'completed');
            default:
                return tasks;
        }
    }, [tasks, activeFilter]);

    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (a.status !== 'completed' && b.status === 'completed') return -1;
            if (!a.due_date && b.due_date) return 1;
            if (a.due_date && !b.due_date) return -1;
            if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            return 0;
        });
    }, [filteredTasks]);

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Tasks</ThemedText>
                    <TouchableOpacity style={[styles.filterIcon, { backgroundColor: surfaceColor, borderColor: border }]}>
                        <IconSymbol name="slider.horizontal.3" size={20} color={tintColor} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
                }
            >
                {/* Visual Overview Section */}
                <ThemedCard style={styles.chartCard} elevated={false}>
                    <View style={styles.chartContainer}>
                        <View style={styles.chartWrapper}>
                            <View style={[styles.chartCircleBase, { borderColor: border }]} />
                            <View style={[styles.chartCircleProgress, { borderColor: tintColor, borderTopColor: 'transparent', transform: [{ rotate: `${(taskProgress * 3.6 - 90)}deg` }] }]} />
                            <View style={styles.chartContent}>
                                <ThemedText style={styles.chartValue}>{totalCount}</ThemedText>
                                <ThemedText style={[styles.chartLabel, { color: textSecondary }]}>Total tasks</ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.dot, { backgroundColor: tintColor }]} />
                            <ThemedText style={styles.breakdownValue}>{completedCount}</ThemedText>
                            <ThemedText style={[styles.breakdownLabel, { color: textSecondary }]}>Done</ThemedText>
                        </View>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.dot, { backgroundColor: chartOrange }]} />
                            <ThemedText style={styles.breakdownValue}>{pendingCount}</ThemedText>
                            <ThemedText style={[styles.breakdownLabel, { color: textSecondary }]}>Pending</ThemedText>
                        </View>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.dot, { backgroundColor: chartPurple }]} />
                            <ThemedText style={styles.breakdownValue}>{overdueCount}</ThemedText>
                            <ThemedText style={[styles.breakdownLabel, { color: textSecondary }]}>Overdue</ThemedText>
                        </View>
                    </View>
                </ThemedCard>

                <View style={styles.listHeader}>
                    <ThemedText style={styles.listTitle}>All Tasks</ThemedText>
                    <TaskFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </View>

                {sortedTasks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
                            {tasks.length === 0 ? "Relax! No tasks yet." : "No tasks matching filter"}
                        </ThemedText>
                    </View>
                ) : (
                    <View style={styles.taskList}>
                        {sortedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggle={handleToggleTask}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </View>
                )}
                <View style={{ height: 120 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    chartCard: {
        marginHorizontal: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    chartContainer: {
        marginBottom: 24,
    },
    chartWrapper: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartCircleBase: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 12,
        position: 'absolute',
    },
    chartCircleProgress: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 12,
        position: 'absolute',
    },
    chartContent: {
        alignItems: 'center',
    },
    chartValue: {
        fontSize: 32,
        fontWeight: '800',
    },
    chartLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    breakdownRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    breakdownItem: {
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    breakdownLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    listHeader: {
        marginTop: 24,
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 24,
        marginBottom: 8,
    },
    taskList: {
        paddingHorizontal: 24,
    },
    emptyContainer: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

