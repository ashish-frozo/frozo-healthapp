import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { GlucoseReading } from '../types';
import { getGlucoseStatus } from '../data/mockData';

export function GlucoseEntryScreen() {
    const navigation = useNavigation<any>();
    const { addGlucoseReading } = useApp();
    const [value, setValue] = useState('');
    const [context, setContext] = useState<GlucoseReading['context']>('fasting');

    const contexts: { value: GlucoseReading['context']; label: string }[] = [
        { value: 'fasting', label: 'Fasting' },
        { value: 'before_meal', label: 'Before Meal' },
        { value: 'after_meal', label: 'After Meal' },
        { value: 'bedtime', label: 'Bedtime' },
    ];

    const handleKeyPress = (key: string) => {
        if (key === 'del') {
            setValue(v => v.slice(0, -1));
        } else if (value.length < 3) {
            setValue(v => v + key);
        }
    };

    const handleSave = () => {
        if (value) {
            addGlucoseReading(parseInt(value), context);
            navigation.goBack();
        }
    };

    const getStatusColor = () => {
        if (!value) return '#94a3b8';
        const status = getGlucoseStatus(parseInt(value), context);
        switch (status) {
            case 'normal': return '#22c55e';
            case 'elevated': return '#f59e0b';
            case 'high': return '#ef4444';
            case 'low': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Glucose</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Context Selector */}
            <View style={styles.contextRow}>
                {contexts.map(c => (
                    <TouchableOpacity
                        key={c.value}
                        style={[styles.contextButton, context === c.value && styles.contextButtonActive]}
                        onPress={() => setContext(c.value)}
                    >
                        <Text style={[styles.contextText, context === c.value && styles.contextTextActive]}>
                            {c.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Display */}
            <View style={styles.display}>
                <Text style={[styles.value, { color: getStatusColor() }]}>{value || '---'}</Text>
                <Text style={styles.unit}>mg/dL</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, !value && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!value}
            >
                <Text style={styles.saveText}>Save Reading</Text>
            </TouchableOpacity>

            {/* Keypad */}
            <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.key, !key && styles.keyEmpty]}
                        onPress={() => key && handleKeyPress(key)}
                        disabled={!key}
                    >
                        <Text style={styles.keyText}>{key === 'del' ? '⌫' : key}</Text>
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
    contextRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 8 },
    contextButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 2, borderColor: '#e2e8f0' },
    contextButtonActive: { borderColor: '#2b7cee', backgroundColor: '#f0f7ff' },
    contextText: { fontSize: 13, fontWeight: '600', color: '#4c6c9a' },
    contextTextActive: { color: '#2b7cee' },
    display: { alignItems: 'center', paddingVertical: 48 },
    value: { fontSize: 72, fontWeight: '700' },
    unit: { fontSize: 20, color: '#4c6c9a', marginTop: 8 },
    saveButton: { backgroundColor: '#2b7cee', marginHorizontal: 24, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    saveButtonDisabled: { backgroundColor: '#94a3b8' },
    saveText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, paddingTop: 24, justifyContent: 'center' },
    key: { width: '30%', aspectRatio: 1.8, alignItems: 'center', justifyContent: 'center', margin: 4 },
    keyEmpty: { opacity: 0 },
    keyText: { fontSize: 28, fontWeight: '600', color: '#0d131b' },
});
