import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';
import { userNotificationService } from '../services/userNotificationService';

export function NotificationScreen() {
    const navigation = useNavigation<any>();
    const { state, refreshData } = useApp();

    const notifications = state.notifications;

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'insight': return '✨';
            case 'reminder': return '🔔';
            case 'security': return '🛡️';
            case 'system': return 'ℹ️';
            default: return '📢';
        }
    };

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.isRead) {
            await userNotificationService.markAsRead(notif.id);
            await refreshData();
        }
        if (notif.actionUrl) {
            // Convert PWA routes to Expo routes if needed
            const route = notif.actionUrl.replace('/', '');
            if (route === 'trends') navigation.navigate('Trends');
            else if (route === 'history') navigation.navigate('History');
            else if (route === 'documents') navigation.navigate('Documents');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <TouchableOpacity
                            key={notif.id}
                            onPress={() => handleNotificationClick(notif)}
                            style={[styles.card, !notif.isRead && styles.cardUnread]}
                        >
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>{getIcon(notif.type)}</Text>
                            </View>

                            <div style={styles.textContainer}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, !notif.isRead && styles.cardTitleUnread]}>
                                        {notif.title}
                                    </Text>
                                    {!notif.isRead && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.message} numberOfLines={2}>
                                    {notif.message}
                                </Text>
                                <Text style={styles.time}>
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </div>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔔</Text>
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptySubtitle}>You don't have any new notifications.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 24, color: '#0d131b' },
    title: { fontSize: 18, fontWeight: '700', color: '#0d131b' },
    content: { padding: 16, gap: 12 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f0f0f0' },
    cardUnread: { borderColor: '#2b7cee30', backgroundColor: '#f0f7ff' },
    iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    icon: { fontSize: 24 },
    textContainer: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#4c6c9a' },
    cardTitleUnread: { color: '#0d131b', fontWeight: '700' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2b7cee' },
    message: { fontSize: 14, color: '#4c6c9a', lineHeight: 20 },
    time: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 8, textTransform: 'uppercase' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0d131b', marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center' },
});
