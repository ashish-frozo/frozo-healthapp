import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar, NumericKeypad, BottomNav, ImageCaptureModal } from '../components/ui';
import { getBPStatus } from '../data/mockData';
import { BPExtractionResult } from '../hooks';
import { healthService } from '../services/healthService';
export function BPEntryPage() {
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [pulse, setPulse] = useState('72');
    const [activeField, setActiveField] = useState<'systolic' | 'diastolic'>('systolic');
    const [showPulse, setShowPulse] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addBPReading, state } = useApp();

    const handleValuesExtracted = (result: BPExtractionResult) => {
        if (result.systolic !== null) setSystolic(String(result.systolic));
        if (result.diastolic !== null) setDiastolic(String(result.diastolic));
        if (result.pulse !== null) {
            setPulse(String(result.pulse));
            setShowPulse(true);
        }
    };

    const handleKeyPress = (key: string) => {
        const currentValue = activeField === 'systolic' ? systolic : diastolic;
        if (currentValue.length < 3) {
            if (activeField === 'systolic') {
                setSystolic(prev => prev + key);
            } else {
                setDiastolic(prev => prev + key);
            }
        }
    };

    const handleDelete = () => {
        if (activeField === 'systolic') {
            setSystolic(prev => prev.slice(0, -1));
        } else {
            setDiastolic(prev => prev.slice(0, -1));
        }
    };

    const handleIncrement = (field: 'systolic' | 'diastolic' | 'pulse') => {
        if (field === 'systolic') {
            setSystolic(prev => String(Math.min(250, (parseInt(prev) || 0) + 1)));
        } else if (field === 'diastolic') {
            setDiastolic(prev => String(Math.min(200, (parseInt(prev) || 0) + 1)));
        } else {
            setPulse(prev => String(Math.min(200, (parseInt(prev) || 0) + 1)));
        }
    };

    const handleDecrement = (field: 'systolic' | 'diastolic' | 'pulse') => {
        if (field === 'systolic') {
            setSystolic(prev => String(Math.max(0, (parseInt(prev) || 0) - 1)));
        } else if (field === 'diastolic') {
            setDiastolic(prev => String(Math.max(0, (parseInt(prev) || 0) - 1)));
        } else {
            setPulse(prev => String(Math.max(0, (parseInt(prev) || 0) - 1)));
        }
    };

    const handleSave = async () => {
        const sys = parseInt(systolic);
        const dia = parseInt(diastolic);
        if (sys && dia && state.currentProfileId) {
            setLoading(true);
            try {
                await healthService.addBPReading({
                    profileId: state.currentProfileId,
                    systolic: sys,
                    diastolic: dia,
                    pulse: showPulse ? parseInt(pulse) : undefined,
                    timestamp: new Date().toISOString(),
                    status: getBPStatus(sys, dia),
                });
                addBPReading(sys, dia, showPulse ? parseInt(pulse) : undefined);
                navigate('/');
            } catch (error) {
                console.error('Save BP error:', error);
                alert('Failed to save reading. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const status = systolic && diastolic
        ? getBPStatus(parseInt(systolic), parseInt(diastolic))
        : null;

    const isValid = systolic && diastolic && parseInt(systolic) > 0 && parseInt(diastolic) > 0;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <TopBar title="Log Blood Pressure" showBack />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-32">
                <div className="w-full max-w-md mx-auto flex flex-col items-center pt-6 px-4">
                    {/* Scan with Camera Button */}
                    <button
                        onClick={() => setShowCameraModal(true)}
                        className="w-full mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl h-14 font-bold text-base shadow-lg transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        <span>Scan BP Monitor with AI</span>
                    </button>

                    <div className="flex items-center gap-3 w-full mb-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase">or enter manually</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Date Indicator */}
                    <div className="mb-6 flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined text-[16px] text-text-secondary-light dark:text-text-secondary-dark">calendar_today</span>
                        <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">
                            Today, {timeStr}
                        </span>
                    </div>

                    {/* Primary Inputs */}
                    <div className="w-full grid grid-cols-2 gap-4 mb-6">
                        {/* Systolic */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark text-center">
                                Systolic (Upper)
                            </label>
                            <div
                                onClick={() => setActiveField('systolic')}
                                className={`relative group flex items-center justify-between bg-surface-light dark:bg-surface-dark rounded-xl border-2 shadow-sm h-32 overflow-hidden transition-all cursor-pointer ${activeField === 'systolic' ? 'border-primary' : 'border-gray-200 dark:border-gray-700 opacity-80'
                                    }`}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDecrement('systolic'); }}
                                    className="h-full px-2 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-r border-gray-100 dark:border-gray-700"
                                >
                                    <span className="material-symbols-outlined text-gray-400">remove</span>
                                </button>
                                <div className="flex flex-col items-center justify-center flex-1">
                                    <span className="text-5xl font-bold text-text-primary-light dark:text-text-primary-dark leading-none">
                                        {systolic || '--'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1 font-medium">mmHg</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleIncrement('systolic'); }}
                                    className="h-full px-2 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-100 dark:border-gray-700"
                                >
                                    <span className="material-symbols-outlined text-gray-400">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Diastolic */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark text-center">
                                Diastolic (Lower)
                            </label>
                            <div
                                onClick={() => setActiveField('diastolic')}
                                className={`relative group flex items-center justify-between bg-surface-light dark:bg-surface-dark rounded-xl border-2 shadow-sm h-32 overflow-hidden transition-all cursor-pointer ${activeField === 'diastolic' ? 'border-primary' : 'border-gray-200 dark:border-gray-700 opacity-80'
                                    }`}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDecrement('diastolic'); }}
                                    className="h-full px-2 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-r border-gray-100 dark:border-gray-700"
                                >
                                    <span className="material-symbols-outlined text-gray-400">remove</span>
                                </button>
                                <div className="flex flex-col items-center justify-center flex-1">
                                    <span className="text-5xl font-bold text-text-primary-light dark:text-text-primary-dark leading-none">
                                        {diastolic || '--'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1 font-medium">mmHg</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleIncrement('diastolic'); }}
                                    className="h-full px-2 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-100 dark:border-gray-700"
                                >
                                    <span className="material-symbols-outlined text-gray-400">add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Validation Message */}
                    {status && (
                        <div className={`w-full flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-lg border ${status === 'normal'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50'
                            : status === 'elevated'
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/50'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50'
                            }`}>
                            <span className={`material-symbols-outlined text-[20px] ${status === 'normal' ? 'text-green-600 dark:text-green-400'
                                : status === 'elevated' ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                {status === 'normal' ? 'check_circle' : 'warning'}
                            </span>
                            <p className={`text-sm font-medium ${status === 'normal' ? 'text-green-800 dark:text-green-300'
                                : status === 'elevated' ? 'text-orange-800 dark:text-orange-300'
                                    : 'text-red-800 dark:text-red-300'
                                }`}>
                                Current Status: {status.charAt(0).toUpperCase() + status.slice(1)} Range
                            </p>
                        </div>
                    )}

                    {/* Pulse Accordion */}
                    <div className="w-full mb-8">
                        <details
                            className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                            open={showPulse}
                            onToggle={(e) => setShowPulse((e.target as HTMLDetailsElement).open)}
                        >
                            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-500">
                                        <span className="material-symbols-outlined text-[20px]">ecg_heart</span>
                                    </div>
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">Add Pulse (BPM)</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-14 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-lg flex items-center px-4">
                                        <span className="text-text-primary-light dark:text-text-primary-dark text-xl font-semibold">{pulse}</span>
                                        <span className="ml-auto text-xs text-gray-400 font-medium uppercase">BPM</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleDecrement('pulse')}
                                            className="size-14 rounded-lg border border-gray-200 dark:border-gray-600 bg-surface-light dark:bg-surface-dark flex items-center justify-center active:bg-gray-50 dark:active:bg-gray-700"
                                        >
                                            <span className="material-symbols-outlined">remove</span>
                                        </button>
                                        <button
                                            onClick={() => handleIncrement('pulse')}
                                            className="size-14 rounded-lg border border-gray-200 dark:border-gray-600 bg-surface-light dark:bg-surface-dark flex items-center justify-center active:bg-gray-50 dark:active:bg-gray-700"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Numeric Keypad */}
                    <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
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
                            <span>Save Reading</span>
                        </>
                    )}
                </button>
            </div>

            <BottomNav />

            {/* Image Capture Modal */}
            <ImageCaptureModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                type="bp"
                onValuesExtracted={(result) => handleValuesExtracted(result as BPExtractionResult)}
            />
        </div>
    );
}
