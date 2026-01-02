import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Symptom } from '../types';

export function SymptomEntryScreen() {
    const [name, setName] = useState('');
    const [severity, setSeverity] = useState<Symptom['severity']>('mild');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { addSymptom, state } = useApp();

    const handleSave = async () => {
        if (name.trim() && state.currentProfileId) {
            setLoading(true);
            try {
                await addSymptom({
                    name: name.trim(),
                    severity,
                    notes,
                    timestamp: new Date().toISOString(),
                });
                navigation.goBack();
            } catch (error: any) {
                console.error('Save Symptom error:', error);
                Alert.alert('Error', 'Failed to save symptom. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const isValid = name.trim().length > 0;

    const severities: { value: Symptom['severity']; label: string; color: string; icon: string }[] = [
        { value: 'mild', label: 'Mild', color: 'bg-green-500', icon: '😊' },
        { value: 'moderate', label: 'Moderate', color: 'bg-orange-500', icon: '😐' },
        { value: 'severe', label: 'Severe', color: 'bg-red-500', icon: '😫' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Text className="text-2xl">←</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-primary-light">Log Symptom</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Symptom Name */}
                <View className="mb-6">
                    <Text className="text-sm font-semibold text-text-secondary-light mb-2 pl-1">
                        What symptom are you feeling?
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Headache, Fatigue, Nausea"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium text-text-primary-light"
                    />
                </View>

                {/* Severity Selector */}
                <View className="mb-6">
                    <Text className="text-sm font-semibold text-text-secondary-light mb-3 pl-1">
                        How severe is it?
                    </Text>
                    <View className="flex-row gap-3">
                        {severities.map((sev) => (
                            <TouchableOpacity
                                key={sev.value}
                                onPress={() => setSeverity(sev.value)}
                                className={`flex-1 flex-col items-center justify-center p-4 rounded-xl border-2 ${severity === sev.value
                                        ? `${sev.color} border-transparent shadow-md`
                                        : 'bg-white border-gray-100'
                                    }`}
                            >
                                <Text className="text-2xl mb-1">{sev.icon}</Text>
                                <Text className={`text-sm font-bold ${severity === sev.value ? 'text-white' : 'text-text-secondary-light'}`}>
                                    {sev.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notes */}
                <View className="mb-6">
                    <Text className="text-sm font-semibold text-text-secondary-light mb-2 pl-1">
                        Notes (Optional)
                    </Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add any details about when it started or what triggered it..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-medium text-text-primary-light h-32"
                    />
                </View>

                {/* Info Box */}
                <View className="bg-blue-50 rounded-xl p-4 flex-row items-center gap-3">
                    <Text className="text-blue-500 text-xl">ℹ️</Text>
                    <Text className="text-sm text-blue-700 font-medium flex-1">
                        This symptom will be logged for today, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}.
                    </Text>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!isValid || loading}
                    className={`w-full h-14 rounded-xl items-center justify-center flex-row gap-2 ${!isValid || loading ? 'bg-gray-300' : 'bg-primary shadow-lg shadow-primary/30'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg">Save Symptom</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
