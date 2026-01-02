import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime } from '../data/mockData';

export function HomeScreen() {
    const navigation = useNavigation<any>();
    const { state, currentProfile } = useApp();

    const latestBP = state.bpReadings[0];
    const latestGlucose = state.glucoseReadings[0];
    const activeReminders = state.reminders.filter(r => !r.completed);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return '#22c55e';
            case 'elevated': return '#f59e0b';
            case 'high': case 'crisis': return '#ef4444';
            case 'low': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {currentProfile?.name || 'Guest'} 👋</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.notificationBtn}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Text style={styles.notificationIcon}>🔔</Text>
                            {state.notifications.some(n => !n.isRead) && <View style={styles.notificationDot} />}
                        </TouchableOpacity>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{currentProfile?.name?.[0] || 'G'}</Text>
                        </View>
                    </View>
                </View>

                {/* Today's Summary */}
                <Text style={styles.sectionTitle}>Today's Summary</Text>

                <View style={styles.cardRow}>
                    {/* BP Card */}
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BPEntry')}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>❤️</Text>
                            <Text style={styles.cardLabel}>Blood Pressure</Text>
                        </View>
                        {latestBP ? (
                            <>
                                <Text style={styles.cardValue}>{latestBP.systolic}/{latestBP.diastolic}</Text>
                                <Text style={[styles.cardStatus, { color: getStatusColor(latestBP.status) }]}>
                                    {latestBP.status.charAt(0).toUpperCase() + latestBP.status.slice(1)}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.cardEmpty}>No readings</Text>
                        )}
                    </TouchableOpacity>

                    {/* Glucose Card */}
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GlucoseEntry')}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>💧</Text>
                            <Text style={styles.cardLabel}>Glucose</Text>
                        </View>
                        {latestGlucose ? (
                            <>
                                <Text style={styles.cardValue}>{latestGlucose.value} <Text style={styles.cardUnit}>mg/dL</Text></Text>
                                <Text style={[styles.cardStatus, { color: getStatusColor(latestGlucose.status) }]}>
                                    {latestGlucose.status.charAt(0).toUpperCase() + latestGlucose.status.slice(1)}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.cardEmpty}>No readings</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Reminders */}
                <Text style={styles.sectionTitle}>Reminders</Text>
                {activeReminders.length > 0 ? (
                    <View style={styles.reminderList}>
                        {activeReminders.slice(0, 3).map(reminder => (
                            <View key={reminder.id} style={styles.reminderItem}>
                                <Text style={styles.reminderIcon}>
                                    {reminder.title.toLowerCase().includes('med') ? '💊' : '📊'}
                                </Text>
                                <View style={styles.reminderContent}>
                                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>No active reminders</Text>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('QuickAdd')}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    content: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 26, fontWeight: '700', color: '#0d131b' },
    date: { fontSize: 14, color: '#4c6c9a', marginTop: 4 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2b7cee', alignItems: 'center', justifyContent: 'center' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    notificationIcon: { fontSize: 20 },
    notificationDot: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0d131b', marginBottom: 12 },
    cardRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardIcon: { fontSize: 20, marginRight: 8 },
    cardLabel: { fontSize: 14, color: '#4c6c9a', fontWeight: '600' },
    cardValue: { fontSize: 32, fontWeight: '700', color: '#0d131b' },
    cardUnit: { fontSize: 16, fontWeight: '500', color: '#4c6c9a' },
    cardStatus: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    cardEmpty: { fontSize: 16, color: '#94a3b8', fontStyle: 'italic' },
    reminderList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
    reminderItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    reminderIcon: { fontSize: 24, marginRight: 12 },
    reminderContent: { flex: 1 },
    reminderTitle: { fontSize: 16, fontWeight: '600', color: '#0d131b' },
    reminderTime: { fontSize: 14, color: '#4c6c9a', marginTop: 2 },
    emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', padding: 24 },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2b7cee', alignItems: 'center', justifyContent: 'center', shadowColor: '#2b7cee', shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
    fabText: { fontSize: 32, color: '#fff', fontWeight: '300', marginTop: -2 },
});
