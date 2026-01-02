import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getBPStatus } from '../data/mockData';

export function BPEntryScreen() {
    const navigation = useNavigation<any>();
    const { addBPReading } = useApp();
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [activeField, setActiveField] = useState<'systolic' | 'diastolic'>('systolic');

    const handleKeyPress = (key: string) => {
        const setter = activeField === 'systolic' ? setSystolic : setDiastolic;
        const value = activeField === 'systolic' ? systolic : diastolic;

        if (key === 'del') {
            setter(v => v.slice(0, -1));
        } else if (value.length < 3) {
            setter(v => v + key);
        }
    };

    const handleSave = () => {
        if (systolic && diastolic) {
            addBPReading(parseInt(systolic), parseInt(diastolic));
            navigation.goBack();
        }
    };

    const getStatusColor = () => {
        if (!systolic || !diastolic) return '#94a3b8';
        const status = getBPStatus(parseInt(systolic), parseInt(diastolic));
        switch (status) {
            case 'normal': return '#22c55e';
            case 'elevated': return '#f59e0b';
            case 'high': case 'crisis': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Blood Pressure</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Display */}
            <View style={styles.display}>
                <TouchableOpacity
                    style={[styles.valueBox, activeField === 'systolic' && styles.valueBoxActive]}
                    onPress={() => setActiveField('systolic')}
                >
                    <Text style={styles.valueLabel}>Systolic</Text>
                    <Text style={[styles.value, { color: getStatusColor() }]}>{systolic || '---'}</Text>
                </TouchableOpacity>

                <Text style={styles.divider}>/</Text>

                <TouchableOpacity
                    style={[styles.valueBox, activeField === 'diastolic' && styles.valueBoxActive]}
                    onPress={() => setActiveField('diastolic')}
                >
                    <Text style={styles.valueLabel}>Diastolic</Text>
                    <Text style={[styles.value, { color: getStatusColor() }]}>{diastolic || '---'}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.unit}>mmHg</Text>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, (!systolic || !diastolic) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!systolic || !diastolic}
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
    display: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    valueBox: { alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
    valueBoxActive: { borderColor: '#2b7cee', backgroundColor: '#f0f7ff' },
    valueLabel: { fontSize: 14, color: '#4c6c9a', marginBottom: 8 },
    value: { fontSize: 56, fontWeight: '700' },
    divider: { fontSize: 48, color: '#94a3b8', marginHorizontal: 8 },
    unit: { fontSize: 18, color: '#4c6c9a', textAlign: 'center' },
    saveButton: { backgroundColor: '#2b7cee', marginHorizontal: 24, marginTop: 24, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    saveButtonDisabled: { backgroundColor: '#94a3b8' },
    saveText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, paddingTop: 24, justifyContent: 'center' },
    key: { width: '30%', aspectRatio: 1.8, alignItems: 'center', justifyContent: 'center', margin: 4 },
    keyEmpty: { opacity: 0 },
    keyText: { fontSize: 28, fontWeight: '600', color: '#0d131b' },
});
