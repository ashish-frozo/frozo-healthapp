import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    FamilyMemberCard,
} from '../components/ui';
import { formatTime, isToday } from '../data/mockData';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useElderMode } from '../hooks/useElderMode';
import { SOSButton } from '../components/SOSButton';
import { useCredits } from '../hooks/useCredits';
import { CreditBalanceChip } from '../components/ui/CreditBalanceChip';
import { PurchaseCreditsModal } from '../components/ui/PurchaseCreditsModal';

export function HomePage() {
    const navigate = useNavigate();
    const { state, currentProfile, dispatch } = useApp();
    const unreadCount = state.notifications.filter(n => !n.isRead).length;
    const isDesktop = useIsDesktop();
    const { isElderMode } = useElderMode();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    // Credits system
    const { balance, isLoading: creditsLoading, packages, initiatePurchase } = useCredits();

    const handleSwitchProfile = (profileId: string) => {
        dispatch({ type: 'SET_CURRENT_PROFILE', payload: profileId });
        setShowProfileMenu(false);
    };

    // Get latest readings for current profile
    const latestBP = state.bpReadings
        .filter(r => r.profileId === state.currentProfileId && isToday(r.timestamp))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const latestGlucose = state.glucoseReadings
        .filter(r => r.profileId === state.currentProfileId && isToday(r.timestamp))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const todayReminders = state.reminders.filter(r => r.profileId === state.currentProfileId);
    const pendingReminders = todayReminders.filter(r => !r.completed);

    const handleToggleReminder = (id: string) => {
        dispatch({ type: 'TOGGLE_REMINDER', payload: id });
    };

    return (
        <div className={`min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8 ${isElderMode ? 'elder-mode' : ''}`}>
            {/* Top App Bar - Hidden on desktop (sidebar has branding) */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-12 md:pt-6 pb-2 border-b border-gray-200 dark:border-gray-800 md:border-none">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    {/* Profile Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="relative">
                                <div
                                    className="rounded-full size-10 border-2 border-primary bg-cover bg-center bg-gray-200 dark:bg-gray-700"
                                    style={currentProfile?.avatarUrl ? { backgroundImage: `url(${currentProfile.avatarUrl})` } : {}}
                                >
                                    {!currentProfile?.avatarUrl && (
                                        <span className="material-symbols-outlined text-gray-400 text-2xl flex items-center justify-center h-full">person</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-text-primary-light dark:text-text-primary-dark text-base font-bold leading-tight">
                                    {currentProfile?.relationship === 'myself' ? 'My Health' : `${currentProfile?.name.split(' ')[0]}'s Health`}
                                </h2>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-medium">
                                    {currentProfile?.name}
                                </p>
                            </div>
                            <span className={`material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div className="absolute left-0 top-full mt-2 z-40 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[220px]">
                                    <p className="px-4 py-1 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Switch Profile</p>
                                    {state.profiles.map((profile) => (
                                        <button
                                            key={profile.id}
                                            onClick={() => handleSwitchProfile(profile.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${profile.id === state.currentProfileId ? 'bg-primary/10' : ''}`}
                                        >
                                            <div
                                                className="rounded-full size-8 bg-cover bg-center bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                                style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})` } : {}}
                                            >
                                                {!profile.avatarUrl && (
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">person</span>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{profile.name}</p>
                                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize">{profile.relationship}</p>
                                            </div>
                                            {profile.id === state.currentProfileId && (
                                                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                            )}
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                                    <button
                                        onClick={() => { setShowProfileMenu(false); navigate('/family'); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-primary"
                                    >
                                        <span className="material-symbols-outlined text-lg">group_add</span>
                                        <span className="text-sm font-medium">Manage Family</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3">
                        {/* Credit Balance */}
                        <CreditBalanceChip
                            balance={balance}
                            isLoading={creditsLoading}
                            onClick={() => setShowPurchaseModal(true)}
                        />

                        {/* Notification Bell - Only on mobile */}
                        {!isDesktop && (
                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-text-primary-light dark:text-text-primary-dark"
                                aria-label="Notifications"
                            >
                                <span className="material-symbols-outlined text-2xl">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background-light dark:border-background-dark">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Sync Status */}
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-sm animate-pulse">sync</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6">
                {/* Greeting */}
                <div className="pt-6 pb-2">
                    <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl md:text-4xl font-bold leading-tight">
                        Hello, {currentProfile?.name.split(' ')[0]}
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mt-1">
                        Here's your health summary.
                    </p>
                </div>

                {/* Desktop: 2-column grid layout */}
                <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 mt-4">
                    {/* Left Column / Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Trends & Insights Card */}
                        <button
                            onClick={() => navigate('/trends')}
                            className="w-full flex items-center gap-4 bg-gradient-to-br from-primary to-blue-600 p-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl text-white">auto_awesome</span>
                            </div>
                            <div className="flex items-center justify-center size-12 rounded-xl bg-white/20 text-white shrink-0 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-[28px]">monitoring</span>
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                    <p className="text-white text-lg font-bold leading-tight">Trends & Insights</p>
                                    <span className="material-symbols-outlined text-white text-sm animate-pulse">auto_awesome</span>
                                </div>
                                <p className="text-white/80 text-sm font-medium">View health charts & AI analysis</p>
                            </div>
                            <span className="material-symbols-outlined text-white/60 group-hover:text-white transition-colors">chevron_right</span>
                        </button>

                        {/* Today's Status - Grid on desktop */}
                        <section>
                            <div className="flex items-center justify-between pb-3 pt-2">
                                <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-tight">Today's Status</h2>
                                <button
                                    onClick={() => navigate('/history')}
                                    className="text-primary text-sm font-semibold p-2 hover:bg-primary/10 rounded-lg"
                                >
                                    View History
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Blood Pressure Card */}
                                <button
                                    onClick={() => navigate('/bp-entry')}
                                    className="flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 active:scale-[0.99] transition-transform text-left"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                                                <span className="material-symbols-outlined text-red-600 dark:text-red-400">favorite</span>
                                            </div>
                                            <span className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium">Blood Pressure</span>
                                        </div>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
                                            {latestBP ? formatTime(latestBP.timestamp) : 'No reading'}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-4xl font-bold leading-none tabular-nums">
                                            {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
                                        </p>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark text-lg font-medium">mmHg</span>
                                    </div>
                                    {latestBP && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className={`flex items-center px-2 py-0.5 rounded text-sm font-medium ${latestBP.status === 'normal'
                                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                                                : latestBP.status === 'elevated'
                                                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                                                    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                                }`}>
                                                <span className="material-symbols-outlined text-base mr-1">
                                                    {latestBP.status === 'normal' ? 'trending_flat' : 'trending_up'}
                                                </span>
                                                {latestBP.status.charAt(0).toUpperCase() + latestBP.status.slice(1)}
                                            </div>
                                        </div>
                                    )}
                                </button>

                                {/* Glucose Card */}
                                <button
                                    onClick={() => navigate('/glucose-entry')}
                                    className="flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 active:scale-[0.99] transition-transform text-left"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">water_drop</span>
                                            </div>
                                            <span className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium">Glucose</span>
                                        </div>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
                                            {latestGlucose ? latestGlucose.context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No reading'}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-4xl font-bold leading-none tabular-nums">
                                            {latestGlucose ? latestGlucose.value : '--'}
                                        </p>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark text-lg font-medium">mg/dL</span>
                                    </div>
                                    {latestGlucose && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className={`flex items-center px-2 py-0.5 rounded text-sm font-medium ${latestGlucose.status === 'normal'
                                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                                                : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                                }`}>
                                                <span className="material-symbols-outlined text-base mr-1">check</span>
                                                {latestGlucose.status.charAt(0).toUpperCase() + latestGlucose.status.slice(1)}
                                            </div>
                                            <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Target: 70-100</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </section>

                        {/* Share Doctor Brief Button */}
                        <button
                            onClick={() => navigate('/export')}
                            className="w-full flex items-center gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-xl border-2 border-primary/20 shadow-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors group"
                        >
                            <div className="flex items-center justify-center size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[26px]">ios_share</span>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight">Share doctor brief</p>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">Create report for visit</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                        </button>
                    </div>

                    {/* Right Column / Sidebar Content - Desktop Only */}
                    <div className="space-y-6 mt-6 md:mt-0">
                        {/* Family Health Section */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">KinCare</h2>
                                <button
                                    onClick={() => navigate('/family-dashboard')}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1"
                                >
                                    Dashboard
                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {state.profiles
                                    .filter(p => p.id !== state.currentProfileId)
                                    .slice(0, isDesktop ? 4 : 2)
                                    .map(profile => (
                                        <FamilyMemberCard key={profile.id} profile={profile} compact />
                                    ))
                                }
                                {state.profiles.filter(p => p.id !== state.currentProfileId).length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">No family members added</p>
                                )}
                            </div>
                        </div>

                        {/* Reminders */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Reminders</h2>
                                {pendingReminders.length > 0 && (
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                        {pendingReminders.length} Left
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                {todayReminders.slice(0, 3).map((reminder) => (
                                    <button
                                        key={reminder.id}
                                        onClick={() => handleToggleReminder(reminder.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors text-left ${reminder.completed ? 'opacity-60' : 'active:bg-gray-50 dark:active:bg-gray-800'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center size-6 rounded-full shrink-0 ${reminder.completed
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'border-2 border-primary bg-transparent'
                                            }`}>
                                            {reminder.completed && <span className="material-symbols-outlined text-sm">check</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${reminder.completed ? 'line-through decoration-gray-400 text-gray-400' : 'text-text-primary-light dark:text-text-primary-dark'
                                                }`}>
                                                {reminder.title}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {reminder.time}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                {todayReminders.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">No reminders today</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* SOS Button - Fixed position (to right of sidebar on desktop) */}
            <div className={`fixed z-50 ${isDesktop ? 'bottom-8 left-[220px]' : 'bottom-24 left-5'}`}>
                <SOSButton size={isElderMode ? 'large' : 'normal'} />
            </div>

            {/* Floating Action Button - Mobile only */}
            {!isDesktop && (
                <button
                    onClick={() => navigate('/quick-add')}
                    className={`fixed bottom-24 right-5 z-30 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl rounded-2xl px-5 py-4 transition-all active:scale-95 ${isElderMode ? 'py-5 px-6' : ''}`}
                >
                    <span className={`material-symbols-outlined ${isElderMode ? 'text-[32px]' : 'text-[28px]'}`}>add</span>
                    <span className={`font-bold tracking-wide ${isElderMode ? 'text-lg' : 'text-base'}`}>Quick Add</span>
                </button>
            )}

            {/* Purchase Credits Modal */}
            <PurchaseCreditsModal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                packages={packages}
                onPurchase={initiatePurchase}
            />
        </div>
    );
}
