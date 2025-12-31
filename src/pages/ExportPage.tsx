import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar, BottomNav, ToggleSwitch, ReportPreviewModal } from '../components/ui';

type ReportType = 'doctor_brief' | 'visit_pack';
type TimePeriod = '30d' | '90d' | 'custom';

export function ExportPage() {
    const [reportType, setReportType] = useState<ReportType>('doctor_brief');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
    const [includeBP, setIncludeBP] = useState(true);
    const [includeGlucose, setIncludeGlucose] = useState(true);
    const [includeMeds, setIncludeMeds] = useState(true);
    const [includeSymptoms, setIncludeSymptoms] = useState(true);
    const [includeNotes, setIncludeNotes] = useState(true);
    const [includeDocs, setIncludeDocs] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const navigate = useNavigate();
    const { createClinicLink } = useApp();

    const handleGenerateReport = () => {
        const link = createClinicLink();
        navigate('/clinic-link');
    };

    const reportTypes = [
        {
            id: 'doctor_brief' as const,
            title: 'Doctor Brief',
            subtitle: '1 Page Summary',
            icon: 'medical_information',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            iconColor: 'text-primary',
        },
        {
            id: 'visit_pack' as const,
            title: 'Visit Pack',
            subtitle: 'Full History & Docs',
            icon: 'folder_zip',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            iconColor: 'text-gray-500 dark:text-gray-400',
        },
    ];

    const timePeriods: { id: TimePeriod; label: string }[] = [
        { id: '30d', label: 'Last 30 Days' },
        { id: '90d', label: 'Last 90 Days' },
        { id: 'custom', label: 'Custom' },
    ];

    const dataOptions = [
        { id: 'bp', label: 'Blood Pressure', icon: 'favorite', bgColor: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500', value: includeBP, setValue: setIncludeBP, disabled: false },
        { id: 'glucose', label: 'Glucose', icon: 'water_drop', bgColor: 'bg-teal-50 dark:bg-teal-900/20', iconColor: 'text-teal-600', value: includeGlucose, setValue: setIncludeGlucose, disabled: false },
        { id: 'symptoms', label: 'Symptoms', icon: 'thermostat', bgColor: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600', value: includeSymptoms, setValue: setIncludeSymptoms, disabled: false },
        { id: 'meds', label: 'Medications', icon: 'pill', bgColor: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-500', value: includeMeds, setValue: setIncludeMeds, disabled: false },
        { id: 'notes', label: 'Personal Notes', icon: 'edit_note', bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600 dark:text-gray-400', value: includeNotes, setValue: setIncludeNotes, disabled: false },
        { id: 'docs', label: 'Documents', icon: 'attach_file', bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600 dark:text-gray-400', value: includeDocs, setValue: setIncludeDocs, disabled: false },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <TopBar title="Share Health Data" showBack />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-40">
                <div className="px-4 max-w-md mx-auto w-full">
                    {/* Intro Text */}
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-relaxed text-center mb-6 mt-1">
                        Create a trusted summary for your doctor or caregiver.
                    </p>

                    {/* Report Type Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 px-1 text-text-primary-light dark:text-text-primary-dark">Choose Report Type</h3>
                        <div className="flex flex-col gap-4">
                            {reportTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className="relative group cursor-pointer text-left"
                                >
                                    {reportType === type.id && (
                                        <div className="absolute inset-0 bg-primary/10 rounded-xl transform scale-[1.02] transition-transform" />
                                    )}
                                    <div className={`relative flex items-center p-4 bg-surface-light dark:bg-surface-dark rounded-xl border-2 shadow-soft transition-colors ${reportType === type.id ? 'border-primary' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                        }`}>
                                        <div className={`h-14 w-14 rounded-lg ${reportType === type.id ? 'bg-blue-50 dark:bg-blue-900/30' : type.bgColor} flex items-center justify-center mr-4 flex-shrink-0 ${reportType === type.id ? 'text-primary' : type.iconColor}`}>
                                            <span className="material-symbols-outlined text-3xl">{type.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">{type.title}</h4>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">{type.subtitle}</p>
                                        </div>
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${reportType === type.id
                                            ? 'bg-primary text-white'
                                            : 'border-2 border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {reportType === type.id && (
                                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Time Period Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 px-1 text-text-primary-light dark:text-text-primary-dark">Time Period</h3>
                        <div className="flex bg-surface-light dark:bg-surface-dark p-1 rounded-xl shadow-sm">
                            {timePeriods.map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setTimePeriod(period.id)}
                                    className={`flex-1 py-3 px-2 rounded-lg font-medium text-sm transition-all ${timePeriod === period.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Include in Report Section */}
                    <section className="mb-4">
                        <h3 className="text-xl font-bold mb-4 px-1 text-text-primary-light dark:text-text-primary-dark">Include in Report</h3>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-soft overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                            {dataOptions.map((option, i) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center justify-between p-4 ${option.disabled ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                                        }`}
                                >
                                    <div className={`flex items-center gap-3 ${option.disabled ? 'opacity-75' : ''}`}>
                                        <div className={`p-2 rounded-lg ${option.bgColor} ${option.iconColor}`}>
                                            <span className="material-symbols-outlined">{option.icon}</span>
                                        </div>
                                        <span className={`font-medium text-lg ${option.disabled
                                            ? 'text-text-secondary-light dark:text-text-secondary-dark'
                                            : 'text-text-primary-light dark:text-text-primary-dark'
                                            }`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    <ToggleSwitch
                                        checked={option.value}
                                        onChange={(v) => option.setValue(v)}
                                        disabled={option.disabled}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 px-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Notes and Documents are hidden by default for privacy.
                        </p>
                    </section>
                </div>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-10">
                <div className="px-4 py-3 max-w-md mx-auto">
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="w-full bg-surface-light dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-primary-light dark:text-text-primary-dark font-bold text-lg py-4 px-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 mb-3"
                    >
                        <span className="material-symbols-outlined">visibility</span>
                        <span>Preview Report</span>
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span>Generate Report</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
                <BottomNav />
            </div>

            <ReportPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                options={{
                    reportType,
                    timePeriod,
                    includeBP,
                    includeGlucose,
                    includeSymptoms,
                    includeMeds,
                    includeNotes,
                    includeDocs
                }}
            />
        </div>
    );
}
