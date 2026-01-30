import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar, NumericKeypad, BottomNav, ImageCaptureModal } from '../components/ui';
import { GlucoseReading } from '../types';
import { getGlucoseStatus } from '../data/mockData';
import { GlucoseExtractionResult } from '../hooks';
import { healthService } from '../services/healthService';

type GlucoseContext = GlucoseReading['context'];

export function GlucoseEntryPage() {
    const [value, setValue] = useState('');
    const [context, setContext] = useState<GlucoseContext>('fasting');
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addGlucoseReading, state } = useApp();

    const handleValuesExtracted = (result: GlucoseExtractionResult) => {
        if (result.value !== null) setValue(String(result.value));
    };

    const handleKeyPress = (key: string) => {
        if (value.length < 3) {
            setValue(prev => prev + key);
        }
    };

    const handleDelete = () => {
        setValue(prev => prev.slice(0, -1));
    };

    const handleSave = async () => {
        const val = parseInt(value);
        if (val && state.currentProfileId) {
            setLoading(true);
            try {
                await healthService.addGlucoseReading({
                    profileId: state.currentProfileId,
                    value: val,
                    context,
                    timestamp: new Date().toISOString(),
                    status: getGlucoseStatus(val, context),
                });
                addGlucoseReading(val, context);

                // Umami Event
                if ((window as any).umami) {
                    (window as any).umami.track('save-glucose-reading', {
                        status: getGlucoseStatus(val, context),
                        context: context
                    });
                }

                navigate('/');
            } catch (error) {
                console.error('Save Glucose error:', error);
                alert('Failed to save reading. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const status = value ? getGlucoseStatus(parseInt(value), context) : null;
    const isValid = value && parseInt(value) > 0;

    const contexts: { value: GlucoseContext; label: string; icon: string }[] = [
        { value: 'fasting', label: 'Fasting', icon: 'wb_twilight' },
        { value: 'before_meal', label: 'Before Meal', icon: 'restaurant' },
        { value: 'after_meal', label: 'After Meal', icon: 'restaurant_menu' },
        { value: 'bedtime', label: 'Bedtime', icon: 'bedtime' },
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
                <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Log Glucose</h1>
                <button className="text-primary font-semibold text-base px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors">
                    Help
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24 no-scrollbar flex flex-col">
                {/* Scan with Camera Button */}
                <div className="px-4 pt-4">
                    <button
                        onClick={() => setShowCameraModal(true)}
                        className="w-full mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl h-14 font-bold text-base shadow-lg transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        <span>Scan Glucose Meter with AI</span>
                    </button>

                    <div className="flex items-center gap-3 w-full mb-2">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase">or enter manually</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>

                {/* Date/Time Picker */}
                <div className="px-4 py-4">
                    <button className="w-full flex items-center justify-between bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">calendar_today</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">Date & Time</p>
                                <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                                    Today, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">edit</span>
                    </button>
                </div>

                {/* Context Selector */}
                <div className="px-4 pb-4">
                    <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 pl-1">Measurement Context</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {contexts.map((ctx) => (
                            <button
                                key={ctx.value}
                                onClick={() => setContext(ctx.value)}
                                className={`flex flex-col items-center justify-center p-3 h-20 rounded-xl transition-all active:scale-[0.98] ${context === ctx.value
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-surface-light dark:bg-surface-dark border-2 border-transparent hover:border-primary/20 text-text-secondary-light dark:text-text-secondary-dark shadow-sm'
                                    }`}
                            >
                                <span className="material-symbols-outlined mb-1 text-[28px]">{ctx.icon}</span>
                                <span className={`text-sm ${context === ctx.value ? 'font-semibold' : 'font-medium'}`}>{ctx.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Digital Readout */}
                <div className="px-4 py-2">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        {/* Background texture */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Glucose Level</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                                {value || '--'}
                            </span>
                            <span className="text-xl font-medium text-text-secondary-light dark:text-text-secondary-dark">mg/dL</span>
                        </div>

                        {/* Status indicator */}
                        {status && (
                            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${status === 'normal'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : status === 'high'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                }`}>
                                <span className="material-symbols-outlined text-sm">
                                    {status === 'normal' ? 'check_circle' : 'warning'}
                                </span>
                                {status.charAt(0).toUpperCase() + status.slice(1)} Range
                            </div>
                        )}
                    </div>
                </div>

                {/* Numeric Keypad */}
                <div className="px-4 pt-4 flex-1 flex flex-col justify-end">
                    <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} showDecimal />

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!isValid || loading}
                        className="w-full h-14 mt-4 bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 disabled:shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check</span>
                                <span>Save Entry</span>
                            </>
                        )}
                    </button>
                </div>
            </main>

            <BottomNav />

            {/* Image Capture Modal */}
            <ImageCaptureModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                type="glucose"
                onValuesExtracted={(result) => handleValuesExtracted(result as GlucoseExtractionResult)}
            />
        </div>
    );
}
