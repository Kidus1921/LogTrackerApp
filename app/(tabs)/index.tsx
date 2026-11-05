import { ThemedCard } from '@/components/ThemedCard';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as db from '@/lib/database';
import { Activity } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0, dueToday: 0 });
  const [recent, setRecent] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Theme colors
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const separator = useThemeColor({}, 'separator');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const chartPurple = useThemeColor({}, 'chartPrimary');
  const chartOrange = useThemeColor({}, 'chartSecondary');

  const loadDashboardData = useCallback(async () => {
    try {
      const stats = await db.getStatistics();
      const recentActivity = await db.loadRecentActivity(6);
      const tStats = await db.getTaskStats();

      setTotalPurchases(stats.totalPurchases);
      setTotalRepairCost(stats.totalRepairCost);
      setTotalSpend(stats.totalSpend);
      setRecent(recentActivity as Activity[]);
      setTaskStats(tStats);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const taskProgress = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>{getGreeting()}, User</ThemedText>
          <ThemedText style={[styles.dateText, { color: textSecondary }]}>{currentDay}</ThemedText>
        </View>
        <Image
          source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }}
          style={styles.profileImg}
        />
      </View>

      {/* Featured Overview Card (Feeling/Status) */}
      <ThemedCard style={styles.featuredCard} elevated={false}>
        <View style={styles.featuredContent}>
          <View style={styles.featuredIconContainer}>
            <ThemedText style={{ fontSize: 32 }}>🛠️</ThemedText>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <ThemedText style={{ color: textSecondary, fontSize: 13 }}>System Status</ThemedText>
            <ThemedText type="subtitle" style={{ fontWeight: '700' }}>Maintainance Mode</ThemedText>
          </View>
          <View style={styles.featuredProgress}>
            <ThemedText style={styles.featuredProgressText}>{Math.round(taskProgress)}%</ThemedText>
            <View style={[styles.featuredProgressCircle, { borderColor: border }]}>
              <View style={[styles.featuredProgressFill, { backgroundColor: tintColor, height: `${taskProgress}%` }]} />
            </View>
          </View>
        </View>
      </ThemedCard>

      <ThemedText style={styles.sectionTitle}>Overview</ThemedText>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Total Purchases */}
        <ThemedCard style={styles.statCard}>
          <View style={styles.statHeader}>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>{totalPurchases}</ThemedText>
            <View style={[styles.statIconSmall, { backgroundColor: chartPurple + '15' }]}>
              <ThemedText style={{ color: chartPurple, fontSize: 12 }}>🛒</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>Purchases</ThemedText>
          <View style={styles.sparkline}>
            {[40, 70, 45, 90, 65, 80].map((h, i) => (
              <View key={i} style={[styles.sparkBar, { height: h * 0.2, backgroundColor: chartPurple + '30' }]} />
            ))}
          </View>
        </ThemedCard>

        {/* Total Repair Cost */}
        <ThemedCard style={styles.statCard}>
          <View style={styles.statHeader}>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>${totalRepairCost.toFixed(0)}</ThemedText>
            <View style={[styles.statIconSmall, { backgroundColor: chartOrange + '15' }]}>
              <ThemedText style={{ color: chartOrange, fontSize: 12 }}>🔧</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>Repair Cost</ThemedText>
          <View style={styles.sparkline}>
            {[30, 50, 80, 40, 90, 70].map((h, i) => (
              <View key={i} style={[styles.sparkBar, { height: h * 0.2, backgroundColor: chartOrange + '30' }]} />
            ))}
          </View>
        </ThemedCard>

        {/* Total Tasks */}
        <ThemedCard style={styles.statCard}>
          <View style={styles.statHeader}>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>{taskStats.total}</ThemedText>
            <View style={[styles.statIconSmall, { backgroundColor: tintColor + '15' }]}>
              <ThemedText style={{ color: tintColor, fontSize: 12 }}>📋</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>Total Tasks</ThemedText>
          <View style={[styles.miniProgress, { backgroundColor: border }]}>
            <View style={[styles.miniProgressBar, { backgroundColor: tintColor, width: `${taskProgress}%` }]} />
          </View>
        </ThemedCard>

        {/* Pending Tasks */}
        <ThemedCard style={styles.statCard}>
          <View style={styles.statHeader}>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>{taskStats.pending}</ThemedText>
            <View style={[styles.statIconSmall, { backgroundColor: errorColor + '15' }]}>
              <ThemedText style={{ color: errorColor, fontSize: 12 }}>⚠️</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.statLabel, { color: textSecondary }]}>Pending</ThemedText>
          <View style={[styles.dueBadge, { backgroundColor: errorColor + '10' }]}>
            <ThemedText style={{ color: errorColor, fontSize: 10, fontWeight: '700' }}>{taskStats.dueToday} DUE</ThemedText>
          </View>
        </ThemedCard>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <ThemedText style={{ color: tintColor, fontSize: 14, fontWeight: '600' }}>View all</ThemedText>
      </View>

      <View style={styles.activityContainer}>
        {recent.map((activity, index) => (
          <ThemedCard key={activity.id} style={styles.activityCard} elevated={false}>
            <View style={styles.activityContent}>
              <View style={[styles.activityIconCircle, { backgroundColor: activity.type === 'purchase' ? chartPurple + '10' : chartOrange + '10' }]}>
                <ThemedText style={{ fontSize: 18 }}>
                  {activity.type === 'purchase' ? '🛒' : '🔧'}
                </ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText style={styles.activityName}>{activity.item_name}</ThemedText>
                <ThemedText style={[styles.activitySub, { color: textSecondary }]}>
                  {activity.type === 'purchase' ? activity.category : activity.issue}
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText style={styles.activityValue}>
                  ${activity.price?.toFixed(0) || activity.cost?.toFixed(0)}
                </ThemedText>
                <ThemedText style={[styles.activityTime, { color: textSecondary }]}>
                  {formatDate(activity.date)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>
        ))}
        {recent.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={{ color: textSecondary }}>No activity yet</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  dateText: {
    fontSize: 14,
    marginTop: 2,
  },
  profileImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  featuredCard: {
    marginHorizontal: 24,
    padding: 20,
    borderWidth: 1,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Subtle tint background
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredProgress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredProgressText: {
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
    zIndex: 1,
  },
  featuredProgressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  featuredProgressFill: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  statCard: {
    width: '44%',
    margin: '3%',
    padding: 18,
    justifyContent: 'space-between',
    minHeight: 130,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 12,
    height: 20,
  },
  sparkBar: {
    width: 4,
    borderRadius: 2,
  },
  miniProgress: {
    height: 6,
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  miniProgressBar: {
    height: '100%',
  },
  dueBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginRight: 24,
  },
  activityContainer: {
    paddingHorizontal: 24,
  },
  activityCard: {
    padding: 0,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
  },
  activitySub: {
    fontSize: 12,
    marginTop: 2,
  },
  activityValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 10,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
