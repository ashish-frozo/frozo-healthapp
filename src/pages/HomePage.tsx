import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    BottomNav,
    FamilyMemberCard,
} from '../components/ui';
import { formatTime, isToday } from '../data/mockData';

export function HomePage() {
    const navigate = useNavigate();
    const { state, currentProfile, dispatch } = useApp();
    const unreadCount = state.notifications.filter(n => !n.isRead).length;

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
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Top App Bar */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-12 pb-2 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {/* Profile Switcher */}
                    <button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">expand_more</span>
                    </button>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
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
            <main className="max-w-md mx-auto">
                {/* Greeting */}
                <div className="px-5 pt-6 pb-2">
                    <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight">
                        Hello, {currentProfile?.name.split(' ')[0]}
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mt-1">
                        Here's your health summary.
                    </p>
                </div>

                {/* Family Health Section */}
                <div className="px-6 mt-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Family Health</h2>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            Manage
                            <span className="material-symbols-outlined text-sm">settings</span>
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
                        {state.profiles
                            .filter(p => p.id !== state.currentProfileId)
                            .map(profile => (
                                <FamilyMemberCard key={profile.id} profile={profile} />
                            ))
                        }
                    </div>
                </div>

                {/* Trends & Insights Card */}
                <div className="px-4 mt-4">
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
                </div>

                {/* Share Doctor Brief Button */}
                <div className="px-4 mt-4 mb-2">
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

                {/* Today's Status */}
                <section className="mt-4">
                    <div className="flex items-center justify-between px-5 pb-3 pt-2">
                        <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-tight">Today's Status</h2>
                        <button
                            onClick={() => navigate('/history')}
                            className="text-primary text-sm font-semibold p-2 hover:bg-primary/10 rounded-lg"
                        >
                            View History
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 px-4">
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

                {/* Reminders */}
                <section className="mt-8 mb-6">
                    <div className="flex items-center justify-between px-5 pb-3">
                        <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-tight">Reminders</h2>
                        {pendingReminders.length > 0 && (
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                {pendingReminders.length} Left
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 px-4">
                        {todayReminders.map((reminder) => (
                            <button
                                key={reminder.id}
                                onClick={() => handleToggleReminder(reminder.id)}
                                className={`flex items-center gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-left ${reminder.completed ? 'opacity-60' : 'shadow-sm active:bg-gray-50 dark:active:bg-gray-800'
                                    }`}
                            >
                                <div className={`flex items-center justify-center size-8 rounded-full shrink-0 ${reminder.completed
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'border-2 border-primary bg-transparent'
                                    }`}>
                                    {reminder.completed && <span className="material-symbols-outlined text-xl">check</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-text-primary-light dark:text-text-primary-dark text-lg font-medium truncate ${reminder.completed ? 'line-through decoration-gray-400' : 'font-bold'
                                        }`}>
                                        {reminder.title}
                                    </p>
                                    <p className={`text-sm font-medium ${reminder.completed
                                            ? 'text-text-secondary-light dark:text-text-secondary-dark'
                                            : 'text-red-500 dark:text-red-400'
                                        }`}>
                                        {reminder.completed
                                            ? `${reminder.time} • Completed`
                                            : `Due at ${reminder.time}${reminder.description ? ` • ${reminder.description}` : ''}`
                                        }
                                    </p>
                                </div>
                                {!reminder.completed && (
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/quick-add')}
                className="fixed bottom-24 right-5 z-30 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl rounded-2xl px-5 py-4 transition-all active:scale-95 max-w-md"
                style={{ right: 'max(1.25rem, calc((100vw - 28rem) / 2 + 1.25rem))' }}
            >
                <span className="material-symbols-outlined text-[28px]">add</span>
                <span className="font-bold text-base tracking-wide">Quick Add</span>
            </button>

            <BottomNav />
        </div>
    );
}
