import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { state, dispatch, currentProfile } = useApp();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('family-health-app-state');
        dispatch({ type: 'LOGOUT' });
    };

    const settings = [
        { icon: '📊', title: 'Health Thresholds', subtitle: 'Set limits for BP, Sugar' },
        { icon: '🔔', title: 'Reminders', subtitle: 'Medications & Appointments' },
        { icon: '📤', title: 'Export Data', subtitle: 'PDF or CSV format' },
        { icon: '🔒', title: 'Privacy & Security' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{currentProfile?.name?.[0] || 'G'}</Text>
                    </View>
                    <Text style={styles.name}>{currentProfile?.name || 'Guest'}</Text>
                    <Text style={styles.role}>
                        {currentProfile?.relationship === 'myself' ? 'Self' : 'Primary Caregiver'}
                    </Text>
                </View>

                {/* Dark Mode Toggle */}
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>🌙</Text>
                        <Text style={styles.settingTitle}>Dark Mode</Text>
                        <Switch
                            value={state.darkMode}
                            onValueChange={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                            trackColor={{ false: '#e2e8f0', true: '#2b7cee' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Settings List */}
                <View style={styles.card}>
                    {settings.map((setting, i) => (
                        <TouchableOpacity key={i} style={[styles.settingRow, i < settings.length - 1 && styles.settingRowBorder]}>
                            <Text style={styles.settingIcon}>{setting.icon}</Text>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingTitle}>{setting.title}</Text>
                                {setting.subtitle && <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>}
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    content: { padding: 20 },
    header: { alignItems: 'center', paddingVertical: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2b7cee', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
    name: { fontSize: 24, fontWeight: '700', color: '#0d131b' },
    role: { fontSize: 14, color: '#2b7cee', fontWeight: '600', marginTop: 4 },
    card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    settingIcon: { fontSize: 24, marginRight: 12 },
    settingContent: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: '600', color: '#0d131b' },
    settingSubtitle: { fontSize: 13, color: '#4c6c9a', marginTop: 2 },
    chevron: { fontSize: 24, color: '#94a3b8' },
    logoutButton: { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: '#e2e8f0' },
    logoutText: { fontSize: 16, fontWeight: '600', color: '#4c6c9a' },
    version: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 24 },
});
