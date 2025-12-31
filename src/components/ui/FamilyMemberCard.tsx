import React, { useState } from 'react';
import { Profile } from '../../types';
import { NudgeModal } from './NudgeModal';
import { MedicalIDModal } from './MedicalIDModal';
import { useApp } from '../../context/AppContext';

interface FamilyMemberCardProps {
    profile: Profile;
}

export function FamilyMemberCard({ profile }: FamilyMemberCardProps) {
    const { state, dispatch } = useApp();
    const [showNudge, setShowNudge] = useState(false);
    const [showMedicalID, setShowMedicalID] = useState(false);

    // Get latest status from familyOverview
    const memberOverview = state.familyOverview?.find(o => o.profileId === profile.id);
    const isDependent = profile.role === 'dependent';

    const status = memberOverview?.status || (isDependent ? 'Attention Needed' : 'All Clear');
    const statusColor = status === 'Attention Needed' || status === 'Critical'
        ? 'text-amber-500 bg-amber-500/10'
        : 'text-emerald-500 bg-emerald-500/10';

    const lastReading = memberOverview?.lastReading || 'No data';
    const healthScore = memberOverview?.healthScore || (isDependent ? 70 : 100);

    const handleSwitchProfile = () => {
        dispatch({ type: 'SET_CURRENT_PROFILE', payload: profile.id });
    };

    return (
        <>
            <div className="min-w-[280px] p-5 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={profile.avatarUrl}
                                alt={profile.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${isDependent ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white leading-tight">{profile.name.split(' ')[0]}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{profile.relationship}</p>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                        {status}
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Last Reading</span>
                        <span className="font-bold text-gray-900 dark:text-white">{lastReading}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${status === 'Critical' ? 'bg-red-500' : isDependent ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${healthScore}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setShowNudge(true)}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">notifications_active</span>
                        <span className="text-[9px] font-black uppercase mt-1">Nudge</span>
                    </button>
                    <button
                        onClick={() => setShowMedicalID(true)}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">emergency</span>
                        <span className="text-[9px] font-black uppercase mt-1">ID</span>
                    </button>
                    <button
                        onClick={handleSwitchProfile}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">swap_horiz</span>
                        <span className="text-[9px] font-black uppercase mt-1">View</span>
                    </button>
                </div>
            </div>

            {showNudge && (
                <NudgeModal
                    profile={profile}
                    onClose={() => setShowNudge(false)}
                />
            )}

            {showMedicalID && (
                <MedicalIDModal
                    profile={profile}
                    onClose={() => setShowMedicalID(false)}
                />
            )}
        </>
    );
}
