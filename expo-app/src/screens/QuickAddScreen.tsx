import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function QuickAddScreen() {
    const navigation = useNavigation<any>();

    const options = [
        { icon: '❤️', title: 'Blood Pressure', subtitle: 'Log your BP reading', screen: 'BPEntry', color: '#fef2f2' },
        { icon: '💧', title: 'Glucose', subtitle: 'Log your blood sugar', screen: 'GlucoseEntry', color: '#f0fdfa' },
        { icon: '😫', title: 'Symptom', subtitle: 'Log how you feel', screen: 'SymptomEntry', color: '#f5f3ff' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Quick Add</Text>
                <View style={{ width: 40 }} />
            </View>

            <Text style={styles.subtitle}>What would you like to log?</Text>

            <View style={styles.options}>
                {options.map((option, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.card, { backgroundColor: option.color }]}
                        onPress={() => navigation.replace(option.screen)}
                    >
                        <Text style={styles.cardIcon}>{option.icon}</Text>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{option.title}</Text>
                            <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    closeText: { fontSize: 20, color: '#4c6c9a' },
    title: { fontSize: 18, fontWeight: '700', color: '#0d131b' },
    subtitle: { fontSize: 24, fontWeight: '700', color: '#0d131b', padding: 20, paddingTop: 32 },
    options: { padding: 20, gap: 16 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16 },
    cardIcon: { fontSize: 40, marginRight: 16 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 20, fontWeight: '700', color: '#0d131b' },
    cardSubtitle: { fontSize: 14, color: '#4c6c9a', marginTop: 4 },
    chevron: { fontSize: 28, color: '#94a3b8' },
});
