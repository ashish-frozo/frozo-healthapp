import React from 'react';
import { Profile } from '../../types';

interface MedicalIDModalProps {
    profile: Profile;
    onClose: () => void;
}

export function MedicalIDModal({ profile, onClose }: MedicalIDModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-600/10 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-300">
                {/* Emergency Header */}
                <div className="bg-red-500 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="material-symbols-outlined text-red-500 text-4xl font-bold">emergency</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Medical ID</h2>
                    <p className="text-red-50 font-bold opacity-90">{profile.name}</p>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Critical Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Blood Type</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{profile.bloodType || 'Unknown'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()}
                            </p>
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">Allergies</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.allergies && profile.allergies.length > 0 ? (
                                profile.allergies.map((allergy, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold rounded-full">
                                        {allergy}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm italic">None reported</span>
                            )}
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">medical_services</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">Medical Conditions</h3>
                        </div>
                        <div className="space-y-1">
                            {profile.conditions && profile.conditions.length > 0 ? (
                                profile.conditions.map((condition, i) => (
                                    <p key={i} className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                        {condition}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm italic">None reported</p>
                            )}
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">pill</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">Current Medications</h3>
                        </div>
                        <div className="space-y-1">
                            {profile.medications && profile.medications.length > 0 ? (
                                profile.medications.map((med, i) => (
                                    <p key={i} className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                        {med}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm italic">None reported</p>
                            )}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    {profile.emergencyContact && (
                        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Emergency Contact</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{profile.emergencyContact.name}</p>
                                    <p className="text-sm text-gray-500">{profile.emergencyContact.phone}</p>
                                </div>
                                <a
                                    href={`tel:${profile.emergencyContact.phone}`}
                                    className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined">call</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl active:scale-95 transition-transform"
                    >
                        CLOSE MEDICAL ID
                    </button>
                </div>
            </div>
        </div>
    );
}
