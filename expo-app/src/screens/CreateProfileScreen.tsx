import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Profile } from '../types';
import { generateId } from '../data/mockData';

export function CreateProfileScreen() {
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState<Profile['relationship']>('myself');
    const { dispatch } = useApp();

    const relationships: { value: Profile['relationship']; label: string }[] = [
        { value: 'myself', label: '🙋 Myself' },
        { value: 'parent', label: '👴 Parent' },
        { value: 'spouse', label: '💑 Spouse' },
        { value: 'child', label: '👶 Child' },
        { value: 'other', label: '👥 Other' },
    ];

    const handleCreate = () => {
        if (name.trim()) {
            const profile: Profile = {
                id: generateId(),
                name: name.trim(),
                relationship,
                createdAt: new Date().toISOString(),
            };
            dispatch({ type: 'ADD_PROFILE', payload: profile });
        }
    };

    const handleSkipWithDemo = () => {
        dispatch({ type: 'LOAD_DEMO_DATA' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Create Your First Profile</Text>
                <Text style={styles.subtitle}>Who will you be tracking health for?</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter name"
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Relationship</Text>
                    <View style={styles.relationshipGrid}>
                        {relationships.map(rel => (
                            <TouchableOpacity
                                key={rel.value}
                                style={[styles.relationshipButton, relationship === rel.value && styles.relationshipButtonActive]}
                                onPress={() => setRelationship(rel.value)}
                            >
                                <Text style={[styles.relationshipText, relationship === rel.value && styles.relationshipTextActive]}>
                                    {rel.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, !name.trim() && styles.buttonDisabled]}
                    onPress={handleCreate}
                    disabled={!name.trim()}
                >
                    <Text style={styles.buttonText}>Create Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkipWithDemo}>
                    <Text style={styles.skipText}>Skip with demo data</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    content: { padding: 24, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: '700', color: '#0d131b', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#4c6c9a', marginBottom: 32 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '600', color: '#0d131b', marginBottom: 8 },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: '#0d131b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    relationshipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    relationshipButton: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    relationshipButtonActive: {
        borderColor: '#2b7cee',
        backgroundColor: '#f0f7ff',
    },
    relationshipText: { fontSize: 16, color: '#4c6c9a' },
    relationshipTextActive: { color: '#2b7cee', fontWeight: '600' },
    button: {
        backgroundColor: '#2b7cee',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: { backgroundColor: '#94a3b8' },
    buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
    skipButton: { alignItems: 'center', marginTop: 24 },
    skipText: { fontSize: 16, color: '#2b7cee', fontWeight: '600' },
});
