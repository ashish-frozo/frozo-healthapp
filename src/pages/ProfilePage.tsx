import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ToggleSwitch, MedicalIDModal } from '../components/ui';
import { settingsService, UserSettings } from '../services/settingsService';

export function ProfilePage() {
    const navigate = useNavigate();
    const { state, dispatch, currentProfile, addNotification, updateMedicalID } = useApp();
    const [showMedicalID, setShowMedicalID] = useState(false);
    const [preferredLanguage, setPreferredLanguage] = useState<'english' | 'hindi' | 'hinglish'>('hinglish');
    const [savingLanguage, setSavingLanguage] = useState(false);

    // Fetch user settings on mount
    useEffect(() => {
        if (state.isAuthenticated) {
            settingsService.getSettings()
                .then((settings) => setPreferredLanguage(settings.preferredLanguage))
                .catch((err) => console.error('Failed to load settings:', err));
        }
    }, [state.isAuthenticated]);

    const handleLanguageChange = async (lang: 'english' | 'hindi' | 'hinglish') => {
        setSavingLanguage(true);
        try {
            await settingsService.updateSettings({ preferredLanguage: lang });
            setPreferredLanguage(lang);
            addNotification('Settings Updated', `WhatsApp replies will now be in ${lang === 'english' ? 'English' : lang === 'hindi' ? 'Hindi' : 'Hinglish'}`, 'system', 'low');
        } catch (error) {
            console.error('Failed to update language:', error);
        } finally {
            setSavingLanguage(false);
        }
    };

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('family-health-app-state');
        localStorage.removeItem('frozo_auth_token'); // Clear auth token
        navigate('/login');
    };

    interface SettingsItem {
        icon: string;
        iconBg: string;
        iconColor: string;
        title: string;
        subtitle?: string;
        toggle?: boolean;
        danger?: boolean;
        onClick?: () => void;
        comingSoon?: boolean;
    }

    interface SettingsSection {
        title: string;
        items: SettingsItem[];
    }

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // TODO: Implement actual delete
            addNotification('Account Deletion', 'Please contact support to delete your account.', 'system', 'high');
        }
    };

    const showComingSoon = (feature: string) => {
        addNotification('Coming Soon', `${feature} will be available in a future update!`, 'system', 'low');
    };

    const settingsSections: SettingsSection[] = [
        {
            title: 'Health Preferences',
            items: [
                {
                    icon: 'emergency',
                    iconBg: 'bg-red-50 dark:bg-red-900/20',
                    iconColor: 'text-red-500',
                    title: 'Emergency Settings',
                    subtitle: 'SOS contacts & alerts',
                    onClick: () => navigate('/emergency-settings'),
                },
                {
                    icon: 'vital_signs',
                    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
                    iconColor: 'text-orange-500',
                    title: 'Thresholds',
                    subtitle: 'Coming Soon',
                    comingSoon: true,
                    onClick: () => showComingSoon('Health Thresholds'),
                },
                {
                    icon: 'notifications',
                    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
                    iconColor: 'text-purple-500',
                    title: 'Reminders',
                    subtitle: 'Coming Soon',
                    comingSoon: true,
                    onClick: () => showComingSoon('Reminders'),
                },
            ],
        },
        {
            title: 'Security & Access',
            items: [
                {
                    icon: 'face',
                    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
                    iconColor: 'text-primary',
                    title: 'App Lock',
                    subtitle: 'Coming Soon',
                    comingSoon: true,
                    onClick: () => showComingSoon('App Lock'),
                },
            ],
        },
        {
            title: 'Data Management',
            items: [
                {
                    icon: 'download',
                    iconBg: 'bg-gray-100 dark:bg-gray-800',
                    iconColor: 'text-gray-700 dark:text-gray-300',
                    title: 'Export Health Data',
                    subtitle: 'PDF or CSV format',
                    onClick: () => navigate('/export'),
                },
                {
                    icon: 'delete',
                    iconBg: 'bg-red-50 dark:bg-red-900/20',
                    iconColor: 'text-red-600',
                    title: 'Delete Account',
                    danger: true,
                    onClick: handleDeleteAccount,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-center border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-tight">Profile</h2>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center pt-6 px-4 pb-6">
                <div className="relative group cursor-pointer">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full h-28 w-28 shadow-lg border-4 border-surface-light dark:border-surface-dark bg-gray-200 dark:bg-gray-700"
                        style={currentProfile?.avatarUrl ? { backgroundImage: `url(${currentProfile.avatarUrl})` } : {}}
                    >
                        {!currentProfile?.avatarUrl && (
                            <span className="material-symbols-outlined text-gray-400 text-5xl flex items-center justify-center h-full">person</span>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </div>
                </div>
                <div className="mt-4 flex flex-col items-center justify-center">
                    <h1 className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold leading-tight tracking-tight text-center">
                        {currentProfile?.name || 'Guest'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-semibold">
                            {currentProfile?.relationship === 'myself' ? 'Self' : 'Primary Caregiver'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center w-full px-4 mb-8">
                <div className="flex w-full gap-3 max-w-[480px]">
                    <button
                        onClick={() => navigate('/create-profile')}
                        className="group flex flex-1 items-center justify-center gap-2 rounded-xl h-14 px-4 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-primary text-[24px]">person_add</span>
                        <span className="text-text-primary-light dark:text-text-primary-dark text-sm font-bold truncate">Add Profile</span>
                    </button>
                    <button className="group flex flex-1 items-center justify-center gap-2 rounded-xl h-14 px-4 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-primary text-[24px]">mail</span>
                        <span className="text-text-primary-light dark:text-text-primary-dark text-sm font-bold truncate">Invite Caregiver</span>
                    </button>
                </div>
            </div>

            {/* Settings Content */}
            <div className="flex flex-col gap-6 px-4 max-w-[600px] mx-auto w-full">
                {/* Dark Mode Toggle */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 p-4">
                        <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 size-10">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-[24px]">
                                {state.darkMode ? 'dark_mode' : 'light_mode'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-text-primary-light dark:text-text-primary-dark text-base font-semibold">Dark Mode</p>
                        </div>
                        <ToggleSwitch
                            checked={state.darkMode}
                            onChange={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                        />
                    </div>
                </div>

                {settingsSections.map((section, i) => (
                    <div key={i}>
                        <h3 className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-bold uppercase tracking-wider mb-2 ml-1">
                            {section.title}
                        </h3>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                            {section.items.map((item, j) => (
                                <button
                                    key={j}
                                    onClick={item.onClick}
                                    className={`flex items-center gap-4 p-4 w-full text-left transition-colors ${j < section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''
                                        } ${item.danger ? 'active:bg-red-50 dark:active:bg-red-900/10' : 'active:bg-gray-50 dark:active:bg-gray-700/50'} ${item.comingSoon ? 'opacity-70' : ''}`}
                                >
                                    <div className={`flex items-center justify-center rounded-lg ${item.iconBg} shrink-0 size-10`}>
                                        <span className={`material-symbols-outlined ${item.iconColor} text-[24px]`}>{item.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-base font-semibold ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                                                {item.title}
                                            </p>
                                            {item.comingSoon && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                        {item.subtitle && (
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">{item.subtitle}</p>
                                        )}
                                    </div>
                                    <span className={`material-symbols-outlined ${item.danger ? 'text-red-300 dark:text-red-800' : 'text-gray-400 dark:text-gray-500'}`}>
                                        chevron_right
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {/* WhatsApp Language Setting */}
                <div className="mb-6">
                    <h3 className="px-1 text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium mb-2 uppercase tracking-wider">
                        WhatsApp Settings
                    </h3>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 shrink-0 size-10">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[24px]">translate</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">Reply Language</p>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Choose language for WhatsApp replies</p>
                            </div>
                        </div>
                        <div className="px-4 pb-4">
                            <div className="flex gap-2">
                                {(['english', 'hinglish', 'hindi'] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => handleLanguageChange(lang)}
                                        disabled={savingLanguage}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${preferredLanguage === lang
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                                            } ${savingLanguage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {lang === 'english' ? 'English' : lang === 'hindi' ? 'हिंदी' : 'Hinglish'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl overflow-hidden shadow-md text-white p-5 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-[120px] leading-none">diamond</span>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Premium Plan</h3>
                                <p className="text-blue-100 text-sm">Unlock unlimited history & sharing.</p>
                            </div>
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">PRO</span>
                        </div>
                        <button className="mt-2 w-full bg-white text-primary font-bold py-3 rounded-lg shadow-sm active:bg-gray-100 transition-colors text-center">
                            Upgrade Now
                        </button>
                    </div>
                </div>

                {showMedicalID && currentProfile && (
                    <MedicalIDModal
                        profile={currentProfile}
                        onClose={() => setShowMedicalID(false)}
                    />
                )}

                {/* Medical ID Section */}
                <div className="px-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Medical ID</h2>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest">Edit</button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                        <span className="material-symbols-outlined">emergency</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Emergency Medical ID</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Visible to caregivers in emergencies</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMedicalID(true)}
                                    className="px-4 py-2 bg-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/20"
                                >
                                    VIEW
                                </button>
                            </div>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Type</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white">{currentProfile?.bloodType || 'Not Set'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Allergies</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white">
                                    {currentProfile?.allergies?.length ? `${currentProfile.allergies.length} Listed` : 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug/Demo Buttons */}
                <button
                    onClick={() => dispatch({ type: 'LOAD_DEMO_DATA' })}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 text-primary font-bold"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">restart_alt</span>
                        <span>Reset Demo Data</span>
                    </div>
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>

                <button
                    onClick={() => addNotification(
                        'Family Alert: Robert',
                        'Robert just logged a high BP reading (155/98). You might want to check in on him.',
                        'security',
                        'high',
                        '/'
                    )}
                    className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-600 font-bold"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">family_restroom</span>
                        <span>Simulate Family Alert</span>
                    </div>
                    <span className="material-symbols-outlined text-sm">emergency</span>
                </button>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all font-bold text-lg mt-2"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Log Out
                </button>

                {/* App Version */}
                <div className="py-4 text-center">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Version 2.4.0 (Build 102)</p>
                </div>
            </div>
        </div >
    );
}
