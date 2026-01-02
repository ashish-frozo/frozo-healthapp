import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatDate } from '../data/mockData';

export function DocumentsScreen() {
    const { state, toggleDocumentVisitPack } = useApp();

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'prescription': return '💊';
            case 'lab_result': return '🔬';
            case 'bill': return '🧾';
            case 'insurance': return '🛡️';
            default: return '📄';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Documents</Text>

            <ScrollView contentContainerStyle={styles.list}>
                {state.documents.length > 0 ? (
                    state.documents.map(doc => (
                        <TouchableOpacity key={doc.id} style={styles.card}>
                            <View style={styles.cardMain}>
                                <Text style={styles.cardIcon}>{getCategoryIcon(doc.category)}</Text>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{doc.title}</Text>
                                    <Text style={styles.cardMeta}>
                                        {doc.category.replace('_', ' ')} • {formatDate(doc.date)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.visitPackBadge, doc.inVisitPack && styles.visitPackBadgeActive]}
                                onPress={() => toggleDocumentVisitPack(doc.id)}
                            >
                                <Text style={[styles.visitPackText, doc.inVisitPack && styles.visitPackTextActive]}>
                                    {doc.inVisitPack ? '✓ Visit Pack' : '+ Visit Pack'}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No documents yet</Text>
                )}
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add Document</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7f8' },
    title: { fontSize: 28, fontWeight: '700', color: '#0d131b', padding: 20, paddingBottom: 12 },
    list: { padding: 20, gap: 12 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
    cardMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardIcon: { fontSize: 32, marginRight: 12 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#0d131b' },
    cardMeta: { fontSize: 14, color: '#4c6c9a', marginTop: 2, textTransform: 'capitalize' },
    visitPackBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
    visitPackBadgeActive: { backgroundColor: '#dcfce7' },
    visitPackText: { fontSize: 13, fontWeight: '600', color: '#4c6c9a' },
    visitPackTextActive: { color: '#22c55e' },
    emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginTop: 40 },
    addButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#2b7cee', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
