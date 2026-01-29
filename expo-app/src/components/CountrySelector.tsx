import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { COUNTRIES, Country } from '../data/countries';

interface CountrySelectorProps {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
    disabled?: boolean;
}

export function CountrySelector({ selectedCountry, onSelect, disabled }: CountrySelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dialCode.includes(search) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (country: Country) => {
        onSelect(country);
        setModalVisible(false);
        setSearch('');
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
                style={styles.trigger}
            >
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Select Country</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search country..."
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                    </View>

                    <FlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.countryItem,
                                    selectedCountry.code === item.code && styles.selectedItem
                                ]}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.itemFlag}>{item.flag}</Text>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDialCode}>{item.dialCode}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
        marginRight: 12,
    },
    flag: {
        fontSize: 24,
        marginRight: 8,
    },
    dialCode: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0d131b',
        marginRight: 4,
    },
    arrow: {
        fontSize: 10,
        color: '#94a3b8',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0d131b',
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        color: '#2b7cee',
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    searchInput: {
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    selectedItem: {
        backgroundColor: '#f0f7ff',
    },
    itemFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        color: '#0d131b',
        fontWeight: '500',
    },
    itemDialCode: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
});
