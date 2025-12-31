import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/ui';
import { Symptom } from '../types';
import { healthService } from '../services/healthService';

export function SymptomEntryPage() {
    const [name, setName] = useState('');
    const [severity, setSeverity] = useState<Symptom['severity']>('mild');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addSymptom, state } = useApp();

    const handleSave = async () => {
        if (name.trim() && state.currentProfileId) {
            setLoading(true);
            try {
                await healthService.addSymptom({
                    profileId: state.currentProfileId,
                    name: name.trim(),
                    severity,
                    notes,
                    timestamp: new Date().toISOString(),
                });
                addSymptom(name, severity, notes);
                navigate('/');
            } catch (error) {
                console.error('Save Symptom error:', error);
                alert('Failed to save symptom. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const isValid = name.trim().length > 0;

    const severities: { value: Symptom['severity']; label: string; color: string; icon: string }[] = [
        { value: 'mild', label: 'Mild', color: 'green', icon: 'sentiment_satisfied' },
        { value: 'moderate', label: 'Moderate', color: 'orange', icon: 'sentiment_neutral' },
        { value: 'severe', label: 'Severe', color: 'red', icon: 'sentiment_very_dissatisfied' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Top Bar */}
            <header className="shrink-0 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark"
                >
                    <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Log Symptom</h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24 no-scrollbar flex flex-col px-4 py-6">
                {/* Symptom Name */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 pl-1">
                        What symptom are you feeling?
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Headache, Fatigue, Nausea"
                        className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-medium text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Severity Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-3 pl-1">
                        How severe is it?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {severities.map((sev) => (
                            <button
                                key={sev.value}
                                onClick={() => setSeverity(sev.value)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all active:scale-[0.98] border-2 ${severity === sev.value
                                    ? sev.value === 'mild'
                                        ? 'bg-green-500 border-green-500 text-white shadow-md'
                                        : sev.value === 'moderate'
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                            : 'bg-red-500 border-red-500 text-white shadow-md'
                                    : 'bg-surface-light dark:bg-surface-dark border-transparent text-text-secondary-light dark:text-text-secondary-dark shadow-sm'
                                    }`}
                            >
                                <span className="material-symbols-outlined mb-1 text-[28px]">{sev.icon}</span>
                                <span className={`text-sm font-bold`}>{sev.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 pl-1">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any details about when it started or what triggered it..."
                        rows={4}
                        className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-medium text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    />
                </div>

                {/* Date/Time Info */}
                <div className="mt-auto bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        This symptom will be logged for today, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}.
                    </p>
                </div>
            </main>

            {/* Floating Save Button */}
            <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pointer-events-none flex justify-center z-20">
                <button
                    onClick={handleSave}
                    disabled={!isValid || loading}
                    className="pointer-events-auto w-full max-w-md bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 disabled:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            <span>Save Symptom</span>
                        </>
                    )}
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
