import { AIFeatureWrapper } from '.';
import { useApp } from '../../context/AppContext';
import { useHealthInsights } from '../../hooks';
import { BPReading, GlucoseReading, Symptom, Document, Profile } from '../../types';
import { format } from 'date-fns';

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: {
        reportType: 'doctor_brief' | 'visit_pack';
        timePeriod: '30d' | '90d' | 'custom';
        includeBP: boolean;
        includeGlucose: boolean;
        includeSymptoms: boolean;
        includeMeds: boolean;
        includeNotes: boolean;
        includeDocs: boolean;
    };
}

export function ReportPreviewModal({ isOpen, onClose, options }: ReportPreviewModalProps) {
    const { state, currentProfile } = useApp();
    const { generateInsights, insight, isLoading } = useHealthInsights();

    // Filter data based on options
    const filteredBP = options.includeBP ? state.bpReadings.filter(r => r.profileId === state.currentProfileId).slice(0, 5) : [];
    const filteredGlucose = options.includeGlucose ? state.glucoseReadings.filter(r => r.profileId === state.currentProfileId).slice(0, 5) : [];
    const filteredSymptoms = options.includeSymptoms ? state.symptoms.filter(r => r.profileId === state.currentProfileId).slice(0, 5) : [];
    const filteredDocs = options.includeDocs ? state.documents.filter(r => r.profileId === state.currentProfileId).slice(0, 3) : [];

    // Auto-generation removed to prevent credit drain

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 animate-slide-up">
            {/* Modal Header */}
            <header className="shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <button
                    onClick={onClose}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="text-lg font-bold">Report Preview</h2>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">print</span>
                    Print
                </button>
            </header>

            {/* Report Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-2xl mx-auto w-full pb-20 no-scrollbar">
                {/* Medical Header */}
                <div className="flex justify-between items-start border-b-2 border-primary pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight">KINCARE</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Medical Summary Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">Generated On</p>
                        <p className="text-sm font-bold">{format(new Date(), 'MMM d, yyyy')}</p>
                    </div>
                </div>

                {/* Patient Info */}
                <section className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Name</p>
                        <p className="text-lg font-bold">{currentProfile?.name}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Relationship</p>
                        <p className="text-lg font-bold capitalize">{currentProfile?.relationship}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                        <p className="text-lg font-bold">{currentProfile?.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Report Period</p>
                        <p className="text-lg font-bold">{options.timePeriod === '30d' ? 'Last 30 Days' : options.timePeriod === '90d' ? 'Last 90 Days' : 'Custom Range'}</p>
                    </div>
                </section>

                {/* AI Summary Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined filled">auto_awesome</span>
                        <h3 className="text-lg font-bold uppercase tracking-tight">AI Clinical Summary</h3>
                    </div>
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        {isLoading ? (
                            <div className="flex flex-col gap-3 animate-pulse">
                                <div className="h-4 bg-blue-100 dark:bg-blue-900/20 rounded w-3/4"></div>
                                <div className="h-4 bg-blue-100 dark:bg-blue-900/20 rounded w-full"></div>
                            </div>
                        ) : insight ? (
                            <div className="space-y-4">
                                <p className="text-base leading-relaxed font-medium italic">"{insight.summary}"</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Key Observations</p>
                                        <ul className="space-y-1.5">
                                            {insight.keyInsights.slice(0, 2).map((item, i) => (
                                                <li key={i} className="text-sm flex gap-2">
                                                    <span className="text-blue-500">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Recommended Actions</p>
                                        <ul className="space-y-1.5">
                                            {insight.tips.slice(0, 2).map((item, i) => (
                                                <li key={i} className="text-sm flex gap-2">
                                                    <span className="text-blue-500">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-2">
                                <p className="text-sm text-gray-500 italic">Generate an AI summary for this report.</p>
                                <AIFeatureWrapper
                                    feature="health_insight"
                                    onSuccess={() => generateInsights(filteredBP, filteredGlucose)}
                                >
                                    {(onUse) => (
                                        <button
                                            onClick={onUse}
                                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                                            Generate Summary
                                        </button>
                                    )}
                                </AIFeatureWrapper>
                            </div>
                        )}
                    </div>
                </section>

                {/* Vitals Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* BP Table */}
                    {options.includeBP && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <span className="material-symbols-outlined">favorite</span>
                                <h3 className="text-base font-bold uppercase tracking-tight">Blood Pressure</h3>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold uppercase text-gray-400">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2 text-right">Reading</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {filteredBP.map((r, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium">{format(new Date(r.timestamp), 'MMM d')}</td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums">{r.systolic}/{r.diastolic}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Glucose Table */}
                    {options.includeGlucose && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-teal-600">
                                <span className="material-symbols-outlined">water_drop</span>
                                <h3 className="text-base font-bold uppercase tracking-tight">Blood Glucose</h3>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold uppercase text-gray-400">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2 text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {filteredGlucose.map((r, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium">{format(new Date(r.timestamp), 'MMM d')}</td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums">{r.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>

                {/* Symptoms Section */}
                {options.includeSymptoms && filteredSymptoms.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-purple-600">
                            <span className="material-symbols-outlined">thermostat</span>
                            <h3 className="text-base font-bold uppercase tracking-tight">Logged Symptoms</h3>
                        </div>
                        <div className="space-y-3">
                            {filteredSymptoms.map((s, i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-base">{s.name}</p>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${s.severity === 'severe' ? 'bg-red-100 text-red-600' :
                                            s.severity === 'moderate' ? 'bg-orange-100 text-orange-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {s.severity}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{format(new Date(s.timestamp), 'MMM d, h:mm a')}</p>
                                    {s.notes && <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{s.notes}"</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Documents Section */}
                {options.includeDocs && filteredDocs.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="material-symbols-outlined">attach_file</span>
                            <h3 className="text-base font-bold uppercase tracking-tight">Attached Documents</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {filteredDocs.map((doc, i) => (
                                <div key={i} className="aspect-square rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-2 text-center">
                                    <span className="material-symbols-outlined text-gray-400 text-3xl mb-1">description</span>
                                    <p className="text-[10px] font-bold truncate w-full">{doc.title}</p>
                                    <p className="text-[8px] text-gray-400 uppercase">{doc.category}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer Disclaimer */}
                <footer className="pt-10 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm mx-auto">
                        This report is generated by KinCare for informational purposes.
                        Please consult with your healthcare provider for medical advice.
                        <br />
                        <span className="font-bold">Secure ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </p>
                </footer>
            </div>
        </div>
    );
}
