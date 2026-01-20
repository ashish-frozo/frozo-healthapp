import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { emergencyService, AlertSettings, EmergencyContact } from '../services/emergencyService';

export function EmergencySettingsPage() {
    const navigate = useNavigate();
    const { state, syncData } = useApp();
    const [settings, setSettings] = useState<AlertSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [syncError, setSyncError] = useState(false);

    // Check if profile ID looks like a mock ID (starts with 'profile-')
    const isMockProfileId = state.currentProfileId?.startsWith('profile-');

    useEffect(() => {
        // If we have a mock profile ID, sync to get real IDs
        if (isMockProfileId && state.isAuthenticated) {
            console.log('Mock profile ID detected, syncing...');
            syncData().then(() => {
                console.log('Sync complete');
            }).catch(err => {
                console.error('Sync failed:', err);
                setSyncError(true);
            });
        } else {
            loadSettings();
        }
    }, [state.currentProfileId, state.isAuthenticated]);

    // Reload settings when profile ID changes (after sync)
    useEffect(() => {
        if (!isMockProfileId && state.currentProfileId) {
            loadSettings();
        }
    }, [state.currentProfileId]);

    const loadSettings = async () => {
        if (!state.currentProfileId || isMockProfileId) return;
        try {
            setLoading(true);
            const data = await emergencyService.getAlertSettings(state.currentProfileId);
            setSettings(data);
            setContacts(data.emergencyContacts || []);
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (updates: Partial<AlertSettings>) => {
        if (!state.currentProfileId || isMockProfileId) {
            alert('Please wait for data to sync');
            return;
        }
        try {
            setSaving(true);
            const updated = await emergencyService.updateAlertSettings(state.currentProfileId, updates);
            setSettings(updated);
            setContacts(updated.emergencyContacts || []);
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addContact = async () => {
        if (!newContact.name.trim() || !newContact.phone.trim()) {
            alert('Please enter both name and phone number');
            return;
        }

        // Validate phone format
        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        const cleanPhone = newContact.phone.replace(/[\s-]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            alert('Please enter a valid phone number with country code (e.g., +919876543210)');
            return;
        }

        const updatedContacts = [...contacts, { name: newContact.name.trim(), phone: cleanPhone }];
        await saveSettings({ emergencyContacts: updatedContacts });
        setContacts(updatedContacts);
        setNewContact({ name: '', phone: '' });
        setShowAddForm(false);
    };

    const removeContact = async (index: number) => {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        await saveSettings({ emergencyContacts: updatedContacts });
        setContacts(updatedContacts);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-12 md:pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            Emergency Settings
                        </h1>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Configure SOS alerts and emergency contacts
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Emergency Contacts Section */}
                <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">emergency</span>
                            <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                Emergency Contacts
                            </h2>
                        </div>
                        <span className="text-sm text-gray-500">{contacts.length}/5</span>
                    </div>

                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                        These contacts will receive WhatsApp alerts when SOS is triggered or abnormal readings are detected.
                    </p>

                    {/* Contact List */}
                    <div className="space-y-3 mb-4">
                        {contacts.map((contact, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                                            person
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                            {contact.name}
                                        </p>
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {contact.phone}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeContact(index)}
                                    className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        ))}

                        {contacts.length === 0 && !showAddForm && (
                            <div className="text-center py-6 text-gray-400">
                                <span className="material-symbols-outlined text-4xl mb-2">contact_phone</span>
                                <p>No emergency contacts added yet</p>
                            </div>
                        )}
                    </div>

                    {/* Add Contact Form */}
                    {showAddForm ? (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                            <input
                                type="text"
                                placeholder="Contact Name"
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <input
                                type="tel"
                                placeholder="Phone (e.g., +919876543210)"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={addContact}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Add Contact'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewContact({ name: '', phone: '' });
                                    }}
                                    className="px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        contacts.length < 5 && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-primary font-medium hover:bg-primary/5 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Add Emergency Contact
                            </button>
                        )
                    )}
                </section>

                {/* Alert Thresholds Section */}
                <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-orange-500">notifications_active</span>
                        <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                            Alert Thresholds
                        </h2>
                    </div>

                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                        Automatically alert emergency contacts when readings exceed these thresholds.
                    </p>

                    {/* BP Thresholds */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">favorite</span>
                                <span className="font-medium">High BP Alert</span>
                            </div>
                            <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                                &gt; {settings?.bpHighSystolic || 140}/{settings?.bpHighDiastolic || 90}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">water_drop</span>
                                <span className="font-medium">High Glucose Alert</span>
                            </div>
                            <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
                                &gt; {settings?.glucoseHighThreshold || 180} mg/dL
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">water_drop</span>
                                <span className="font-medium">Low Glucose Alert</span>
                            </div>
                            <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                                &lt; {settings?.glucoseLowThreshold || 70} mg/dL
                            </span>
                        </div>
                    </div>
                </section>

                {/* Test SOS Section */}
                <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-red-500">warning</span>
                        <h3 className="font-bold text-red-600 dark:text-red-400">Test SOS Alert</h3>
                    </div>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-3">
                        Send a test alert to all emergency contacts to verify they receive messages correctly.
                    </p>
                    <button
                        onClick={async () => {
                            if (!state.currentProfileId) return;
                            if (!confirm('This will send a TEST alert to all emergency contacts. Continue?')) return;
                            try {
                                const result = await emergencyService.triggerSOS(
                                    state.currentProfileId,
                                    undefined,
                                    '🧪 TEST ALERT - Please ignore. This is a test of the emergency alert system.'
                                );
                                alert(`Test alert sent to ${result.notifiedCount} contacts!`);
                            } catch (err) {
                                console.error('Test failed:', err);
                                alert('Failed to send test alert');
                            }
                        }}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Send Test Alert
                    </button>
                </section>
            </main>
        </div>
    );
}
