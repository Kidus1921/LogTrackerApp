import { ThemedCard } from '@/components/ThemedCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as db from '@/lib/database';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type RecordType = 'purchase' | 'repair';

export default function RecordsScreen() {
    const [allRecords, setAllRecords] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'purchase' | 'repair'>('all');
    const [query, setQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Edit State
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);

    // Unified Edit Form Fields
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editIssue, setEditIssue] = useState('');
    const [editCost, setEditCost] = useState('');
    const [editStatus, setEditStatus] = useState<'pending' | 'completed'>('pending');
    const [editDate, setEditDate] = useState(new Date());

    const [categories, setCategories] = useState<any[]>([]);

    // Theme colors
    const borderColor = useThemeColor({}, 'border');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'error');
    const successColor = useThemeColor({}, 'success');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceColor = useThemeColor({}, 'surface');
    const chartPurple = useThemeColor({}, 'chartPrimary');
    const chartOrange = useThemeColor({}, 'chartSecondary');

    const loadData = useCallback(async () => {
        try {
            const data = await db.loadAllRecords();
            setAllRecords(data);
        } catch (e) {
            console.error('Failed to load records', e);
        }
    }, []);

    const loadCategories = async () => {
        try {
            const data = await db.loadCategories();
            setCategories(data);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
            loadCategories();
        }, [loadData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const totals = useMemo(() => {
        const purchaseTotal = allRecords
            .filter(r => r.type === 'purchase')
            .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
        const repairTotal = allRecords
            .filter(r => r.type === 'repair')
            .reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
        const total = purchaseTotal + repairTotal;
        return {
            purchaseTotal,
            repairTotal,
            total,
            purchasePercent: total > 0 ? (purchaseTotal / total) * 100 : 0
        };
    }, [allRecords]);

    const onEdit = (record: any) => {
        setEditingRecord(record);
        setEditName(record.item_name || '');
        setEditDate(new Date(record.purchase_date || record.repair_date || Date.now()));

        if (record.type === 'purchase') {
            setEditCategory(record.category || '');
            setEditPrice(record.price?.toString() || '');
        } else {
            setEditIssue(record.issue || '');
            setEditCost(record.cost?.toString() || '');
            setEditStatus(record.status || 'pending');
        }
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!editingRecord) return;
        if (!editName.trim()) return Alert.alert('Required', 'Item name is required');

        try {
            if (editingRecord.type === 'purchase') {
                await db.updatePurchase(editingRecord.id, {
                    item_name: editName.trim(),
                    category: editCategory,
                    price: editPrice ? Number(editPrice) : undefined,
                    purchase_date: editDate.toISOString(),
                });
            } else {
                await db.updateRepair(editingRecord.id, {
                    item_name: editName.trim(),
                    issue: editIssue.trim(),
                    cost: editCost ? Number(editCost) : undefined,
                    status: editStatus,
                    repair_date: editDate.toISOString(),
                });
            }
            setEditModalVisible(false);
            loadData();
            Alert.alert('Success', 'Record updated');
        } catch (e) {
            Alert.alert('Error', 'Failed to update record');
        }
    };

    const onDelete = (id: string, type: RecordType) => {
        Alert.alert(
            type === 'purchase' ? 'Delete Purchase?' : 'Delete Repair?',
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (type === 'purchase') await db.deletePurchase(id);
                            else await db.deleteRepair(id);
                            loadData();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete');
                        }
                    }
                },
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filtered = allRecords
        .filter(r => filter === 'all' || r.type === filter)
        .filter(r => (r.item_name || '').toLowerCase().includes(query.toLowerCase()));

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Records</ThemedText>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
                }
            >
                {/* Spending Overview Chart */}
                <ThemedCard style={styles.chartCard} elevated={false}>
                    <View style={styles.chartTitleContainer}>
                        <ThemedText style={{ color: textSecondary, fontSize: 13, fontWeight: '600' }}>TOTAL SPENT</ThemedText>
                        <ThemedText style={styles.totalValue}>${totals.total.toFixed(0)}</ThemedText>
                    </View>

                    <View style={styles.chartContainer}>
                        <View style={styles.chartWrapper}>
                            <View style={[styles.chartCircleBase, { borderColor: borderColor }]} />
                            <View style={[styles.chartCircleProgress, {
                                borderColor: chartPurple,
                                borderTopColor: 'transparent',
                                borderRightColor: totals.purchasePercent > 25 ? chartPurple : 'transparent',
                                borderBottomColor: totals.purchasePercent > 50 ? chartPurple : 'transparent',
                                borderLeftColor: totals.purchasePercent > 75 ? chartPurple : 'transparent',
                                transform: [{ rotate: '-45deg' }]
                            }]} />
                            <View style={styles.chartContent}>
                                <ThemedText style={{ fontSize: 24 }}>💰</ThemedText>
                            </View>
                        </View>
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: chartPurple }]} />
                                <View>
                                    <ThemedText style={styles.legendLabel}>Purchases</ThemedText>
                                    <ThemedText style={styles.legendValue}>${totals.purchaseTotal.toFixed(0)}</ThemedText>
                                </View>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: chartOrange }]} />
                                <View>
                                    <ThemedText style={styles.legendLabel}>Repairs</ThemedText>
                                    <ThemedText style={styles.legendValue}>${totals.repairTotal.toFixed(0)}</ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>
                </ThemedCard>

                {/* Search and Filters */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
                        <IconSymbol name="magnifyingglass" size={18} color={textSecondary} />
                        <TextInput
                            placeholder="Search records..."
                            placeholderTextColor={textSecondary}
                            value={query}
                            onChangeText={setQuery}
                            style={[styles.searchInput, { color: textColor }]}
                        />
                    </View>

                    <View style={styles.filterTabs}>
                        {['all', 'purchase', 'repair'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFilter(f as any)}
                                style={[
                                    styles.filterTab,
                                    { borderColor: borderColor },
                                    filter === f && { backgroundColor: tintColor, borderColor: tintColor }
                                ]}
                            >
                                <ThemedText style={[styles.filterTabText, { color: filter === f ? '#ffffff' : textSecondary }]}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Records List */}
                <View style={styles.recordList}>
                    {filtered.map((item) => (
                        <ThemedCard key={item.id} style={styles.recordCard} elevated={false}>
                            <TouchableOpacity
                                style={styles.recordContent}
                                onLongPress={() => onDelete(item.id, item.type)}
                                onPress={() => onEdit(item)}
                            >
                                <View style={[styles.recordIcon, { backgroundColor: item.type === 'purchase' ? chartPurple + '10' : chartOrange + '10' }]}>
                                    <ThemedText style={{ fontSize: 18 }}>{item.type === 'purchase' ? '🛒' : '🔧'}</ThemedText>
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <ThemedText style={styles.recordName}>{item.item_name}</ThemedText>
                                    <ThemedText style={[styles.recordMeta, { color: textSecondary }]}>
                                        {formatDate(item.purchase_date || item.repair_date)} • {item.type === 'purchase' ? item.category : 'Repair'}
                                    </ThemedText>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <ThemedText style={styles.recordValue}>${(item.price || item.cost || 0).toFixed(0)}</ThemedText>
                                    <IconSymbol name="chevron.right" size={14} color={textSecondary + '40'} style={{ marginTop: 4 }} />
                                </View>
                            </TouchableOpacity>
                        </ThemedCard>
                    ))}

                    {filtered.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={{ color: textSecondary }}>No records found</ThemedText>
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Unified Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ThemedCard style={[styles.modalContent, { backgroundColor: surfaceColor }]} elevated={false}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <ThemedText type="subtitle" style={styles.modalTitle}>
                                    Edit {editingRecord?.type === 'purchase' ? 'Purchase' : 'Repair'}
                                </ThemedText>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                    <IconSymbol name="xmark.circle.fill" size={24} color={textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ThemedText style={styles.label}>Item Name</ThemedText>
                            <TextInput
                                style={[styles.input, { borderColor: borderColor + '40', color: textColor }]}
                                value={editName}
                                onChangeText={setEditName}
                            />

                            {editingRecord?.type === 'purchase' ? (
                                <>
                                    <ThemedText style={styles.label}>Category</ThemedText>
                                    <TextInput
                                        style={[styles.input, { borderColor: borderColor + '40', color: textColor }]}
                                        value={editCategory}
                                        onChangeText={setEditCategory}
                                    />
                                    <ThemedText style={styles.label}>Price ($)</ThemedText>
                                    <TextInput
                                        style={[styles.input, { borderColor: borderColor + '40', color: textColor }]}
                                        value={editPrice}
                                        onChangeText={setEditPrice}
                                        keyboardType="numeric"
                                    />
                                </>
                            ) : (
                                <>
                                    <ThemedText style={styles.label}>Issue</ThemedText>
                                    <TextInput
                                        style={[styles.input, { borderColor: borderColor + '40', color: textColor }]}
                                        value={editIssue}
                                        onChangeText={setEditIssue}
                                    />
                                    <ThemedText style={styles.label}>Repair Cost ($)</ThemedText>
                                    <TextInput
                                        style={[styles.input, { borderColor: borderColor + '40', color: textColor }]}
                                        value={editCost}
                                        onChangeText={setEditCost}
                                        keyboardType="numeric"
                                    />
                                </>
                            )}

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: tintColor }]}
                                    onPress={handleUpdate}
                                >
                                    <ThemedText style={{ color: '#ffffff', fontWeight: '700' }}>Save Changes</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </ThemedCard>
                </View>
            </Modal>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    chartCard: {
        marginHorizontal: 24,
        padding: 24,
        borderWidth: 1,
    },
    chartTitleContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: '800',
        marginTop: 4,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    chartWrapper: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartCircleBase: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 10,
        position: 'absolute',
    },
    chartCircleProgress: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 10,
        position: 'absolute',
    },
    chartContent: {
        alignItems: 'center',
    },
    chartLegend: {
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendLabel: {
        fontSize: 11,
        fontWeight: '500',
        opacity: 0.6,
    },
    legendValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    searchContainer: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
    },
    filterTabs: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    recordList: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    recordCard: {
        padding: 0,
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    recordContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    recordIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordName: {
        fontSize: 16,
        fontWeight: '600',
    },
    recordMeta: {
        fontSize: 12,
        marginTop: 4,
    },
    recordValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.6,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    modalActions: {
        marginTop: 32,
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
});
