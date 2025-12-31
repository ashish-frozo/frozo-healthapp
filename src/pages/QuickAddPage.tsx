import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/ui';

export function QuickAddPage() {
    const navigate = useNavigate();

    const options = [
        {
            id: 'bp',
            title: 'Blood Pressure',
            description: 'Log systolic, diastolic & pulse',
            icon: 'monitor_heart',
            color: 'red',
            path: '/bp-entry',
        },
        {
            id: 'glucose',
            title: 'Blood Glucose',
            description: 'Log pre-meal, post-meal & fasting',
            icon: 'water_drop',
            color: 'blue',
            path: '/glucose-entry',
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Top App Bar */}
            <div className="flex items-center px-4 py-5 justify-between sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center size-12 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark"
                >
                    <span className="material-symbols-outlined text-[28px]">close</span>
                </button>
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
                    Quick Add
                </h2>
            </div>

            {/* Headline */}
            <div className="px-6 pt-4 pb-6">
                <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight text-center">
                    What would you like to add?
                </h1>
            </div>

            {/* Selection Cards */}
            <div className="flex-1 flex flex-col gap-5 px-5 max-w-lg mx-auto w-full">
                {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => navigate(option.path)}
                        className="group w-full relative overflow-hidden bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-transparent hover:border-primary transition-all duration-200"
                    >
                        <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/5 transition-colors" />
                        <div className="flex items-center p-6 gap-5">
                            {/* Icon */}
                            <div className={`flex-shrink-0 size-20 rounded-full flex items-center justify-center ${option.color === 'red'
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                : 'bg-blue-50 dark:bg-blue-500/10 text-primary dark:text-blue-400'
                                }`}>
                                <span className="material-symbols-outlined text-[40px]">{option.icon}</span>
                            </div>
                            {/* Text */}
                            <div className="flex flex-col items-start gap-1 flex-1 text-left">
                                <span className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-tight">
                                    {option.title}
                                </span>
                                <span className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium leading-normal">
                                    {option.description}
                                </span>
                            </div>
                            {/* Chevron */}
                            <div className="text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[28px]">chevron_right</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Bottom Action */}
            <div className="flex px-4 py-8 justify-center mt-auto">
                <button
                    onClick={() => navigate('/symptom-entry')}
                    className="flex items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-transparent hover:bg-primary/5 active:bg-primary/10 transition-colors text-primary text-base font-bold leading-normal"
                >
                    <span>Add other symptom?</span>
                </button>
            </div>
        </div>
    );
}
