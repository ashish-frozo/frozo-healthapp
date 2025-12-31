import { LabTranslation } from '../../hooks';

interface LabTranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    error: string | null;
    translation: LabTranslation | null;
}

export function LabTranslationModal({ isOpen, onClose, isLoading, error, translation }: LabTranslationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-900 animate-slide-up">
            {/* Header */}
            <header className="shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <button
                    onClick={onClose}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="text-lg font-bold">AI Lab Translator</h2>
                <div className="w-10" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-2xl mx-auto w-full pb-20 no-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="relative">
                            <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">science</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Analyzing your report...</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-xs mx-auto">
                                Our AI is simplifying the medical jargon for you. This usually takes a few seconds.
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="size-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-red-600">Translation Failed</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-xs mx-auto">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold"
                        >
                            Close
                        </button>
                    </div>
                ) : translation ? (
                    <div className="space-y-8">
                        {/* Summary Card */}
                        <section className="bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3 text-primary">
                                <span className="material-symbols-outlined filled">auto_awesome</span>
                                <h3 className="text-lg font-bold uppercase tracking-tight">AI Summary</h3>
                            </div>
                            <p className="text-lg font-medium leading-relaxed text-text-primary-light dark:text-gray-100">
                                {translation.summary}
                            </p>
                        </section>

                        {/* Biomarkers */}
                        {translation.isLabReport && translation.biomarkers.length > 0 ? (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="material-symbols-outlined">biotech</span>
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Key Results Explained</h3>
                                </div>
                                <div className="space-y-4">
                                    {translation.biomarkers.map((item, i) => (
                                        <div key={i} className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'normal' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'attention' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.status === 'normal' ? 'Normal' : item.status === 'attention' ? 'Attention' : 'Consult Doctor'}
                                                </div>
                                            </div>
                                            <p className="text-2xl font-black text-primary mb-2 tabular-nums">{item.value}</p>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                                {item.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : !translation.isLabReport ? (
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-100 dark:border-orange-900/30 flex gap-4">
                                <span className="material-symbols-outlined text-orange-500">warning</span>
                                <p className="text-sm text-orange-800 dark:text-orange-300">
                                    This document doesn't appear to be a standard lab report. Our AI has summarized the content above, but biomarker extraction was skipped.
                                </p>
                            </div>
                        ) : null}

                        {/* Next Steps */}
                        {translation.nextSteps.length > 0 && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="material-symbols-outlined">checklist</span>
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Recommended Next Steps</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {translation.nextSteps.map((step, i) => (
                                        <div key={i} className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="size-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm font-medium text-text-primary-light dark:text-gray-200">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Disclaimer */}
                        <footer className="pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Medical Disclaimer</p>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm mx-auto">
                                This AI translation is for informational purposes only. It is not a medical diagnosis or a substitute for professional advice. Always discuss your results with your healthcare provider.
                            </p>
                        </footer>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
