import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatTime } from '../data/mockData';
import { useElderMode } from '../hooks/useElderMode';

export function FamilyDashboardPage() {
    const navigate = useNavigate();
    const { state, dispatch, syncData } = useApp();
    const { isElderMode } = useElderMode();

    // Sync data on mount if not already loaded
    useEffect(() => {
        if (state.isAuthenticated && state.profiles.length === 0) {
            syncData();
        }
    }, [state.isAuthenticated]);

    // Get latest readings for each profile
    const getProfileData = (profileId: string) => {
        const latestBP = state.bpReadings.find(r => r.profileId === profileId);
        const latestGlucose = state.glucoseReadings.find(r => r.profileId === profileId);
        const recentSymptoms = state.symptoms.filter(s => s.profileId === profileId).slice(0, 3);

        // Determine status
        let status: 'OK' | 'Attention' = 'OK';
        const alerts: string[] = [];

        if (latestBP && latestBP.status === 'high') {
            status = 'Attention';
            alerts.push(`High BP: ${latestBP.systolic}/${latestBP.diastolic}`);
        }
        if (latestGlucose && (latestGlucose.status === 'high' || latestGlucose.status === 'low')) {
            status = 'Attention';
            alerts.push(`${latestGlucose.status === 'high' ? 'High' : 'Low'} Sugar: ${latestGlucose.value}`);
        }

        return { latestBP, latestGlucose, recentSymptoms, status, alerts };
    };

    const needsAttention = state.profiles.filter(p => getProfileData(p.id).status === 'Attention').length;

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

    const handleSelectProfile = (profileId: string) => {
        dispatch({ type: 'SET_CURRENT_PROFILE', payload: profileId });
        navigate('/');
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
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                {state.profiles.length} members • {needsAttention > 0 ? (
                                    <span className="text-red-500 font-medium">
                                        {needsAttention} need attention
                                    </span>
                                ) : 'All OK'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.profiles.map((member) => {
                        const data = getProfileData(member.id);
                        return (
                            <button
                                key={member.id}
                                onClick={() => handleSelectProfile(member.id)}
                                className={`bg-surface-light dark:bg-surface-dark rounded-xl p-4 border text-left transition-all hover:shadow-md active:scale-[0.99] ${member.id === state.currentProfileId
                                    ? 'border-primary border-2'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
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
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(data.status)}`}>
                                        {data.status === 'OK' ? '✓ OK' : '⚠ Attention'}
                                    </span>
                                </div>

                                {/* Alerts */}
                                {data.alerts.length > 0 && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        {data.alerts.map((alert, idx) => (
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
                                        {data.latestBP ? (
                                            <>
                                                <p className={`text-xl font-bold ${getReadingStatusColor(data.latestBP.status)}`}>
                                                    {data.latestBP.systolic}/{data.latestBP.diastolic}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatTime(data.latestBP.timestamp)}
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
                                        {data.latestGlucose ? (
                                            <>
                                                <p className={`text-xl font-bold ${getReadingStatusColor(data.latestGlucose.status)}`}>
                                                    {data.latestGlucose.value}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {data.latestGlucose.context}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400">No reading</p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Symptoms */}
                                {data.recentSymptoms.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Recent Symptoms:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {data.recentSymptoms.map((symptom, idx) => (
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
                        );
                    })}

                    {state.profiles.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">group</span>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                No family members yet.
                            </p>
                            <button
                                onClick={() => navigate('/family-management')}
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium"
                            >
                                Add Family Member
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
