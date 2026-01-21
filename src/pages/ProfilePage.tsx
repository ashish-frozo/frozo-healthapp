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
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8 md:pl-64 transition-all duration-300">
            {/* Top Bar (Mobile Only) */}
            <div className="md:hidden sticky top-0 z-10 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-center border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-tight">Profile</h2>
            </div>

            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-8 py-6 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Profile & Settings</h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage your account and preferences</p>
                </div>
            </header>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: Profile Info & Quick Actions */}
                    <div className="md:col-span-4 lg:col-span-4 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                                <div
                                    className="bg-center bg-no-repeat bg-cover rounded-full h-32 w-32 shadow-lg border-4 border-surface-light dark:border-surface-dark bg-gray-200 dark:bg-gray-700"
                                    style={currentProfile?.avatarUrl ? { backgroundImage: `url(${currentProfile.avatarUrl})` } : {}}
                                >
                                    {!currentProfile?.avatarUrl && (
                                        <span className="material-symbols-outlined text-gray-400 text-6xl flex items-center justify-center h-full">person</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary-dark transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col items-center justify-center text-center">
                                <h1 className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold leading-tight tracking-tight">
                                    {currentProfile?.name || 'Guest'}
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-semibold">
                                        {currentProfile?.relationship === 'myself' ? 'Self' : 'Primary Caregiver'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3 w-full mt-8">
                                <button
                                    onClick={() => navigate('/create-profile')}
                                    className="group flex flex-col items-center justify-center gap-2 rounded-xl h-24 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-primary text-[28px]">person_add</span>
                                    <span className="text-text-primary-light dark:text-text-primary-dark text-xs font-bold">Add Profile</span>
                                </button>
                                <button className="group flex flex-col items-center justify-center gap-2 rounded-xl h-24 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
                                    <span className="text-text-primary-light dark:text-text-primary-dark text-xs font-bold">Invite Caregiver</span>
                                </button>
                            </div>
                        </div>

                        {/* Medical ID Card (Desktop) */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-gray-50 dark:border-gray-700/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                            <span className="material-symbols-outlined">emergency</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Emergency Medical ID</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Visible in emergencies</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowMedicalID(true)}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/20 transition-colors"
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

                        {/* Premium Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-md text-white p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-[140px] leading-none">diamond</span>
                            </div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">Premium Plan</h3>
                                        <p className="text-blue-100 text-sm mt-1">Unlock unlimited history & sharing.</p>
                                    </div>
                                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">PRO</span>
                                </div>
                                <button className="mt-2 w-full bg-white text-primary font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-center">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="md:col-span-8 lg:col-span-8 space-y-6">
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
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Adjust app appearance</p>
                                </div>
                                <ToggleSwitch
                                    checked={state.darkMode}
                                    onChange={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                                />
                            </div>
                        </div>

                        {settingsSections.map((section, i) => (
                            <div key={i}>
                                <h3 className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-bold uppercase tracking-wider mb-3 ml-1">
                                    {section.title}
                                </h3>
                                <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                                    {section.items.map((item, j) => (
                                        <button
                                            key={j}
                                            onClick={item.onClick}
                                            className={`flex items-center gap-4 p-4 w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${j < section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''
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
                        <div>
                            <h3 className="px-1 text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium mb-3 uppercase tracking-wider">
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

                        {/* Debug/Demo Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => dispatch({ type: 'LOAD_DEMO_DATA' })}
                                className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 text-primary font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
                                className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-600 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined">family_restroom</span>
                                    <span>Simulate Family Alert</span>
                                </div>
                                <span className="material-symbols-outlined text-sm">emergency</span>
                            </button>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all font-bold text-lg"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            Log Out
                        </button>

                        {/* App Version */}
                        <div className="py-4 text-center">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Version 2.4.0 (Build 102)</p>
                        </div>
                    </div>
                </div>
            </div>

            {showMedicalID && currentProfile && (
                <MedicalIDModal
                    profile={currentProfile}
                    onClose={() => setShowMedicalID(false)}
                />
            )}
        </div >
    );
}
