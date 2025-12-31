import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Profile } from '../../types';

interface NudgeModalProps {
    profile: Profile;
    onClose: () => void;
}

const PREDEFINED_NUDGES = [
    "Time to log your vitals! 🩺",
    "Don't forget your medication. 💊",
    "How are you feeling? Just checking in. ❤️",
    "Did you drink enough water today? 💧",
    "Time for a quick walk? 🚶‍♂️",
];

export function NudgeModal({ profile, onClose }: NudgeModalProps) {
    const { sendNudge } = useApp();
    const [customMessage, setCustomMessage] = useState('');

    const handleSend = (message: string) => {
        sendNudge(profile.id, message);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nudge {profile.name.split(' ')[0]}</h2>
                            <p className="text-sm text-gray-500">Send a quick reminder</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        {PREDEFINED_NUDGES.map((nudge, index) => (
                            <button
                                key={index}
                                onClick={() => handleSend(nudge)}
                                className="w-full text-left p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{nudge}</span>
                                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">send</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Custom Message</label>
                        <div className="relative">
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Type your own message..."
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24 text-gray-900 dark:text-white"
                            />
                            <button
                                onClick={() => handleSend(customMessage)}
                                disabled={!customMessage.trim()}
                                className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-50 disabled:bg-gray-400 transition-all shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
