import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime } from '../data/mockData';

export function HistoryScreen() {
    const navigation = useNavigation<any>();
    const [filter, setFilter] = useState<'all' | 'bp' | 'glucose'>('all');
    const { state } = useApp();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return '#22c55e';
            case 'elevated': return '#f59e0b';
            case 'high': case 'crisis': return '#ef4444';
            case 'low': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    const allReadings = [
        ...state.bpReadings.map(r => ({ ...r, type: 'bp' as const })),
        ...state.glucoseReadings.map(r => ({ ...r, type: 'glucose' as const })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filteredReadings = filter === 'all'
        ? allReadings
        : allReadings.filter(r => r.type === filter);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
                <TouchableOpacity
                    style={styles.trendsButton}
                    onPress={() => navigation.navigate('Trends')}
                >
                    <Text style={styles.trendsButtonText}>📈 Trends</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {(['all', 'bp', 'glucose'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, filter === f && styles.chipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                            {f === 'all' ? 'All' : f === 'bp' ? '❤️ BP' : '💧 Glucose'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {filteredReadings.length > 0 ? (
                    filteredReadings.map(reading => (
                        <View key={reading.id} style={styles.card}>
                            <View style={styles.cardLeft}>
                                <Text style={styles.cardIcon}>{reading.type === 'bp' ? '❤️' : '💧'}</Text>
                                <View>
                                    <Text style={styles.cardType}>{reading.type === 'bp' ? 'Blood Pressure' : 'Glucose'}</Text>
                                    <Text style={styles.cardTime}>
                                        {formatDate(reading.timestamp)} • {formatTime(reading.timestamp)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardRight}>
                                <Text style={styles.cardValue}>
                                    {reading.type === 'bp'
                                        ? `${reading.systolic}/${reading.diastolic}`
                                        : `${reading.value} mg/dL`}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reading.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(reading.status) }]}>
                                        {reading.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No readings yet</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    title: { fontSize: 28, fontWeight: '700', color: '#0d131b' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
    trendsButton: { backgroundColor: '#f0f7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#2b7cee30' },
    trendsButtonText: { color: '#2b7cee', fontWeight: '700', fontSize: 14 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    chipActive: { backgroundColor: '#2b7cee', borderColor: '#2b7cee' },
    chipText: { fontSize: 14, fontWeight: '600', color: '#4c6c9a' },
    chipTextActive: { color: '#fff' },
    list: { padding: 20, gap: 12 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLeft: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { fontSize: 28, marginRight: 12 },
    cardType: { fontSize: 16, fontWeight: '600', color: '#0d131b' },
    cardTime: { fontSize: 13, color: '#4c6c9a', marginTop: 2 },
    cardRight: { alignItems: 'flex-end' },
    cardValue: { fontSize: 20, fontWeight: '700', color: '#0d131b' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginTop: 40 },
});
