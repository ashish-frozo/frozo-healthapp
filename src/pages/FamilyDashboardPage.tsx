import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { householdService, HouseholdDashboard, DashboardMember } from '../services/householdService';
import { formatTime } from '../data/mockData';
import { useElderMode } from '../hooks/useElderMode';

export function FamilyDashboardPage() {
    const navigate = useNavigate();
    const { state } = useApp();
    const { isElderMode } = useElderMode();
    const [dashboard, setDashboard] = useState<HouseholdDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            // Get user's households first
            const households = await householdService.getHouseholds();
            if (households.length > 0) {
                const data = await householdService.getDashboard(households[0].id);
                setDashboard(data);
            }
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('Could not load family dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OK':
                return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            case 'Attention':
                return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
        }
    };

    const getReadingStatusColor = (status: string) => {
        if (status === 'normal') return 'text-green-600 dark:text-green-400';
        if (status === 'elevated') return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className={`min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8 ${isElderMode ? 'elder-mode' : ''}`}>
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-12 md:pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                                Family Health
                            </h1>
                            {dashboard && (
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    {dashboard.summary.total} members • {dashboard.summary.needsAttention > 0 && (
                                        <span className="text-red-500 font-medium">
                                            {dashboard.summary.needsAttention} need attention
                                        </span>
                                    )}
                                    {dashboard.summary.needsAttention === 0 && 'All OK'}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={loadDashboard}
                        className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading family health...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => navigate('/family')}
                            className="mt-3 text-primary font-medium"
                        >
                            Go to Family Management
                        </button>
                    </div>
                )}

                {!loading && !error && dashboard && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dashboard.members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => {
                                    // Switch to this profile
                                    navigate('/');
                                }}
                                className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-left transition-all hover:shadow-md active:scale-[0.99]"
                            >
                                {/* Member Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="size-14 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center flex items-center justify-center"
                                        style={member.avatarUrl ? { backgroundImage: `url(${member.avatarUrl})` } : {}}
                                    >
                                        {!member.avatarUrl && (
                                            <span className="material-symbols-outlined text-gray-400 text-2xl">person</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark capitalize">
                                            {member.relationship}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(member.status)}`}>
                                        {member.status === 'OK' ? '✓ OK' : '⚠ Attention'}
                                    </span>
                                </div>

                                {/* Alerts */}
                                {member.alerts.length > 0 && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        {member.alerts.map((alert, idx) => (
                                            <p key={idx} className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                ⚠️ {alert}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Vitals Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* BP */}
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-red-500 text-sm">favorite</span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">BP</span>
                                        </div>
                                        {member.latestBP ? (
                                            <>
                                                <p className={`text-xl font-bold ${getReadingStatusColor(member.latestBP.status)}`}>
                                                    {member.latestBP.systolic}/{member.latestBP.diastolic}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatTime(member.latestBP.timestamp)}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400">No reading</p>
                                        )}
                                    </div>

                                    {/* Glucose */}
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-blue-500 text-sm">water_drop</span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sugar</span>
                                        </div>
                                        {member.latestGlucose ? (
                                            <>
                                                <p className={`text-xl font-bold ${getReadingStatusColor(member.latestGlucose.status)}`}>
                                                    {member.latestGlucose.value}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {member.latestGlucose.context}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400">No reading</p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Symptoms */}
                                {member.recentSymptoms.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Recent Symptoms:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {member.recentSymptoms.slice(0, 3).map((symptom, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`text-xs px-2 py-0.5 rounded-full ${symptom.severity === 'severe'
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                        : symptom.severity === 'moderate'
                                                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {symptom.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}

                        {dashboard.members.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">group</span>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                    No family members in this household yet.
                                </p>
                                <button
                                    onClick={() => navigate('/family')}
                                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium"
                                >
                                    Add Family Members
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
