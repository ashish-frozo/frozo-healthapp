import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/ui';

export function FamilyManagementPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();

    const familyMembers = state.profiles.filter(p => p.id !== state.currentProfileId);

    const handleRemoveMember = (id: string) => {
        if (window.confirm('Are you sure you want to remove this family member?')) {
            dispatch({ type: 'REMOVE_PROFILE', payload: id });
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <TopBar title="Family Management" showBack />

            <main className="flex-1 px-4 py-6 pb-32 md:pb-8 max-w-5xl mx-auto w-full">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                        Manage Family
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        Add or manage health profiles for your loved ones.
                    </p>
                </div>

                {/* Family Members List */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Family Members ({familyMembers.length})
                    </h2>

                    {familyMembers.length > 0 ? (
                        familyMembers.map(member => (
                            <div
                                key={member.id}
                                className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm"
                            >
                                <div
                                    className="size-14 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center border-2 border-white dark:border-gray-900 shadow-sm"
                                    style={member.avatarUrl ? { backgroundImage: `url(${member.avatarUrl})` } : {}}
                                >
                                    {!member.avatarUrl && (
                                        <span className="material-symbols-outlined text-gray-400 text-3xl flex items-center justify-center h-full">person</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                                        {member.relationship}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/create-profile?edit=${member.id}`)}
                                        className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="size-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">family_restroom</span>
                            <p className="text-gray-400 text-sm">No family members added yet.</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => navigate('/create-profile')}
                        className="flex items-center gap-4 p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                        <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">person_add</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Add New Profile</p>
                            <p className="text-xs text-white/80">Create a profile for a family member</p>
                        </div>
                    </button>

                    <button
                        className="flex items-center gap-4 p-4 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl active:scale-[0.98] transition-all"
                    >
                        <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">mail</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Invite Caregiver</p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Share access with a doctor or nurse</p>
                        </div>
                    </button>
                </div>

                {/* Info Card */}
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        Adding family members allows you to track their health readings and receive alerts if their vitals cross safe thresholds.
                    </p>
                </div>
            </main>
        </div>
    );
}
