import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar, InviteModal } from '../components/ui';
import { householdService, Household } from '../services/householdService';

export function FamilyManagementPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [household, setHousehold] = useState<Household | null>(null);
    const [isCreatingHousehold, setIsCreatingHousehold] = useState(false);

    const familyMembers = state.profiles.filter(p => p.id !== state.currentProfileId);

    // Fetch or create household on mount
    useEffect(() => {
        const initHousehold = async () => {
            try {
                const households = await householdService.getHouseholds();
                if (households.length > 0) {
                    setHousehold(households[0]);
                }
            } catch (error) {
                console.error('Error fetching households:', error);
            }
        };
        initHousehold();
    }, []);

    const handleRemoveMember = (id: string) => {
        if (window.confirm('Are you sure you want to remove this family member?')) {
            dispatch({ type: 'REMOVE_PROFILE', payload: id });
        }
    };

    const handleInviteClick = async () => {
        if (!household) {
            // Create household first
            setIsCreatingHousehold(true);
            try {
                const currentProfile = state.profiles.find(p => p.id === state.currentProfileId);
                const firstName = currentProfile?.name?.split(' ')[0];
                const householdName = firstName && firstName !== 'undefined' ? `${firstName}'s Family` : 'My Family';
                console.log('Creating household with name:', householdName);
                const newHousehold = await householdService.createHousehold(householdName);
                console.log('Household created:', newHousehold);
                setHousehold(newHousehold);
            } catch (error: any) {
                console.error('Error creating household:', error);
                alert(error?.message || 'Failed to create household');
                setIsCreatingHousehold(false);
                return;
            } finally {
                setIsCreatingHousehold(false);
            }
        }
        setShowInviteModal(true);
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

                {/* Remote Family Alert */}
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-900/30 flex gap-4">
                    <span className="material-symbols-outlined text-green-600 shrink-0">family_link</span>
                    <div>
                        <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Family in different cities?</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            Invite them to log their own readings from their phone. They can even use WhatsApp!
                        </p>
                    </div>
                </div>

                {/* Family Members List */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Family Members ({familyMembers.length})
                    </h2>

                    {familyMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {familyMembers.map(member => (
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
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">family_restroom</span>
                            <p className="text-gray-400 text-sm">No family members added yet.</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/create-profile')}
                        className="flex items-center gap-4 p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                        <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">person_add</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Add New Profile</p>
                            <p className="text-xs text-white/80">Create a profile you manage</p>
                        </div>
                    </button>

                    <button
                        onClick={handleInviteClick}
                        disabled={isCreatingHousehold}
                        className="flex items-center gap-4 p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                            {isCreatingHousehold ? (
                                <div className="animate-spin size-6 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <span className="material-symbols-outlined text-2xl">share</span>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Invite Family Member</p>
                            <p className="text-xs text-white/80">They log their own readings</p>
                        </div>
                    </button>
                </div>

                {/* WhatsApp Info */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-100 dark:border-green-900/20">
                    <div className="flex items-start gap-3">
                        <svg className="w-8 h-8 text-green-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <div>
                            <p className="font-bold text-green-800 dark:text-green-300 text-sm">WhatsApp-friendly for elderly</p>
                            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                Invited members can simply text their readings via WhatsApp. No app needed!<br />
                                <span className="font-medium">Example: "BP 130/85" or "Sugar 110"</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        Family members you invite will have their own login and can log readings independently. You'll receive alerts if their vitals need attention.
                    </p>
                </div>
            </main>

            {/* Invite Modal */}
            {showInviteModal && household && (
                <InviteModal
                    householdId={household.id}
                    householdName={household.name}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </div>
    );
}

