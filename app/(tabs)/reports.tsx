import { ThemedCard } from '@/components/ThemedCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as db from '@/lib/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import BarChart from 'react-native-chart-kit/dist/BarChart';
import LineChart from 'react-native-chart-kit/dist/line-chart/LineChart';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 10;
const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Theme Colors
    const tintColor = useThemeColor({}, 'tint');
    const backgroundColor = useThemeColor({}, 'background');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const borderColor = useThemeColor({}, 'border');
    const successColor = useThemeColor({}, 'success');
    const errorColor = useThemeColor({}, 'error');
    const textColor = useThemeColor({}, 'text');
    const surfaceColor = useThemeColor({}, 'surface');
    const chartPurple = useThemeColor({}, 'chartPrimary');
    const chartOrange = useThemeColor({}, 'chartSecondary');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const filtered = await db.loadFilteredActivity(
                startDate.toISOString(),
                endDate.toISOString()
            );
            setData(filtered);
            setCurrentPage(1);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    // Pagination Logic
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(start, start + ITEMS_PER_PAGE);
    }, [data, currentPage]);

    // Chart Data Preparation
    const chartData = useMemo(() => {
        const totalPurchase = data.filter(i => i.type === 'purchase').reduce((sum, i) => sum + (i.cost || 0), 0);
        const totalRepair = data.filter(i => i.type === 'repair').reduce((sum, i) => sum + (i.cost || 0), 0);

        const groupedByDate: Record<string, { purchase: number, repair: number }> = {};
        data.forEach(item => {
            const d = new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!groupedByDate[d]) groupedByDate[d] = { purchase: 0, repair: 0 };
            if (item.type === 'purchase') groupedByDate[d].purchase += item.cost || 0;
            else groupedByDate[d].repair += item.cost || 0;
        });

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const labels = sortedDates.slice(-6);
        const purchases = labels.map(l => groupedByDate[l].purchase);
        const repairs = labels.map(l => groupedByDate[l].repair);

        return {
            totalPurchase,
            totalRepair,
            lineLabels: labels.length > 0 ? labels : ["No data"],
            linePurchases: purchases.length > 0 ? purchases : [0],
            lineRepairs: repairs.length > 0 ? repairs : [0]
        };
    }, [data]);

    const exportToExcel = async () => {
        if (data.length === 0) {
            return Alert.alert('No Data', 'There is no data to export in the selected range.');
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
                Type: item.type,
                Label: item.label,
                Date: new Date(item.date).toLocaleDateString(),
                Cost: item.cost || 0,
                Category_Status: item.category || '-'
            })));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

            const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
            const filename = `Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;

            if (Platform.OS === 'web') {
                const s2ab = (s: string) => {
                    const buf = new ArrayBuffer(s.length);
                    const view = new Uint8Array(buf);
                    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                };
                const blob = new Blob([s2ab(atob(wbout))], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const fileUri = (FileSystem as any).cacheDirectory + filename;
                await (FileSystem as any).writeAsStringAsync(fileUri, wbout, { encoding: (FileSystem as any).EncodingType.Base64 });
                await Sharing.shareAsync(fileUri);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Export Failed', 'Failed to generate Excel file');
        }
    };

    const chartConfig = {
        backgroundColor: surfaceColor,
        backgroundGradientFrom: surfaceColor,
        backgroundGradientTo: surfaceColor,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => textSecondary,
        style: { borderRadius: 16 },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: tintColor
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Reports</ThemedText>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Date Filters Card */}
                <ThemedCard style={styles.filterCard} elevated={false}>
                    <View style={styles.dateRow}>
                        <TouchableOpacity
                            style={[styles.dateBtn, { backgroundColor: surfaceColor }]}
                            onPress={() => setShowStartPicker(true)}
                        >
                            <ThemedText style={styles.dateLabel}>FROM</ThemedText>
                            <ThemedText style={styles.dateValue}>{startDate.toLocaleDateString()}</ThemedText>
                        </TouchableOpacity>

                        <View style={styles.dateArrow}>
                            <IconSymbol name="arrow.right" size={16} color={textSecondary} />
                        </View>

                        <TouchableOpacity
                            style={[styles.dateBtn, { backgroundColor: surfaceColor }]}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <ThemedText style={styles.dateLabel}>TO</ThemedText>
                            <ThemedText style={styles.dateValue}>{endDate.toLocaleDateString()}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.exportBtn, { backgroundColor: tintColor }]}
                        onPress={exportToExcel}
                    >
                        <IconSymbol name="square.and.arrow.down" size={18} color="#fff" />
                        <ThemedText style={styles.exportText}>Export as Excel</ThemedText>
                    </TouchableOpacity>
                </ThemedCard>

                {/* Summary Grid */}
                <View style={styles.summaryGrid}>
                    <ThemedCard style={styles.summaryItem} elevated={false}>
                        <View style={[styles.summaryIcon, { backgroundColor: chartPurple + '15' }]}>
                            <IconSymbol name="cart.fill" size={20} color={chartPurple} />
                        </View>
                        <ThemedText style={styles.summaryLabel}>Purchases</ThemedText>
                        <ThemedText style={styles.summaryValue}>${chartData.totalPurchase.toFixed(0)}</ThemedText>
                    </ThemedCard>

                    <ThemedCard style={styles.summaryItem} elevated={false}>
                        <View style={[styles.summaryIcon, { backgroundColor: chartOrange + '15' }]}>
                            <IconSymbol name="wrench.fill" size={20} color={chartOrange} />
                        </View>
                        <ThemedText style={styles.summaryLabel}>Repairs</ThemedText>
                        <ThemedText style={styles.summaryValue}>${chartData.totalRepair.toFixed(0)}</ThemedText>
                    </ThemedCard>
                </View>

                {/* Charts Section */}
                <View style={styles.chartsSection}>
                    <ThemedCard style={styles.chartBlock} elevated={false}>
                        <ThemedText style={styles.chartTitle}>Spending Distribution</ThemedText>
                        <BarChart
                            data={{
                                labels: ["Purchases", "Repairs"],
                                datasets: [{ data: [chartData.totalPurchase, chartData.totalRepair] }]
                            }}
                            width={screenWidth - 80}
                            height={180}
                            yAxisLabel="$"
                            yAxisSuffix=""
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => chartPurple,
                                strokeWidth: 2,
                                barPercentage: 0.6,
                            }}
                            style={{ marginVertical: 8, borderRadius: 16 }}
                            fromZero
                            showValuesOnTopOfBars
                        />
                    </ThemedCard>

                    <ThemedCard style={styles.chartBlock} elevated={false}>
                        <ThemedText style={styles.chartTitle}>Trend Analysis</ThemedText>
                        <LineChart
                            data={{
                                labels: chartData.lineLabels,
                                datasets: [
                                    { data: chartData.linePurchases, color: () => chartPurple, strokeWidth: 3 },
                                    { data: chartData.lineRepairs, color: () => chartOrange, strokeWidth: 3 }
                                ],
                                legend: ["Purchases", "Repairs"]
                            }}
                            width={screenWidth - 80}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </ThemedCard>
                </View>

                {/* Activity Table */}
                <View style={styles.tableSection}>
                    <View style={styles.tableHeader}>
                        <ThemedText type="defaultSemiBold">Activity Log</ThemedText>
                        <ThemedText style={{ color: textSecondary, fontSize: 12 }}>{data.length} total</ThemedText>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 20 }} />
                    ) : (
                        paginatedData.map(item => (
                            <View key={item.id} style={styles.tableRow}>
                                <View style={[styles.rowDot, { backgroundColor: item.type === 'purchase' ? chartPurple : chartOrange }]} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <ThemedText style={styles.rowLabel} numberOfLines={1}>{item.label}</ThemedText>
                                    <ThemedText style={styles.rowDate}>{new Date(item.date).toLocaleDateString()}</ThemedText>
                                </View>
                                <ThemedText style={styles.rowCost}>${(item.cost || 0).toFixed(0)}</ThemedText>
                            </View>
                        ))
                    )}

                    {totalPages > 1 && (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                disabled={currentPage === 1}
                                onPress={() => setCurrentPage(p => p - 1)}
                                style={[styles.pageBtn, { borderColor: borderColor + '20' }, currentPage === 1 && { opacity: 0.3 }]}
                            >
                                <IconSymbol name="chevron.left" size={16} color={tintColor} />
                            </TouchableOpacity>
                            <ThemedText style={styles.pageText}>{currentPage} / {totalPages}</ThemedText>
                            <TouchableOpacity
                                disabled={currentPage === totalPages}
                                onPress={() => setCurrentPage(p => p + 1)}
                                style={[styles.pageBtn, { borderColor: borderColor + '20' }, currentPage === totalPages && { opacity: 0.3 }]}
                            >
                                <IconSymbol name="chevron.right" size={16} color={tintColor} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                />
            )}
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
    filterCard: {
        marginHorizontal: 24,
        padding: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        opacity: 0.5,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    dateArrow: {
        paddingHorizontal: 12,
        opacity: 0.3,
    },
    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    exportText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    summaryGrid: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 24,
        gap: 16,
    },
    summaryItem: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.5,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 4,
    },
    chartsSection: {
        paddingHorizontal: 24,
        marginTop: 24,
        gap: 16,
    },
    chartBlock: {
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    chartTitle: {
        alignSelf: 'flex-start',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 16,
        opacity: 0.7,
    },
    tableSection: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#f0f0f0',
    },
    rowDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    rowDate: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    rowCost: {
        fontSize: 14,
        fontWeight: '700',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 20,
    },
    pageBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageText: {
        fontSize: 14,
        fontWeight: '700',
        opacity: 0.7,
    },
});
