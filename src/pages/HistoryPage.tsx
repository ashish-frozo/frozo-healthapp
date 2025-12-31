import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav, TopBar } from '../components/ui';
import { ReadingType, DateRange } from '../types';
import { formatTime, getDateLabel } from '../data/mockData';

export function HistoryPage() {
    const [typeFilter, setTypeFilter] = useState<ReadingType>('all');
    const [dateRange, setDateRange] = useState<DateRange>('7d');
    const [showChart, setShowChart] = useState(false);
    const navigate = useNavigate();
    const { state } = useApp();

    // Get date range filter
    const getDateThreshold = () => {
        const now = new Date();
        switch (dateRange) {
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
    };

    const threshold = getDateThreshold();

    // Filter and combine readings
    const bpReadings = typeFilter !== 'glucose'
        ? state.bpReadings.filter(r =>
            r.profileId === state.currentProfileId &&
            new Date(r.timestamp) >= threshold
        ).map(r => ({ ...r, type: 'bp' as const }))
        : [];

    const glucoseReadings = typeFilter !== 'bp'
        ? state.glucoseReadings.filter(r =>
            r.profileId === state.currentProfileId &&
            new Date(r.timestamp) >= threshold
        ).map(r => ({ ...r, type: 'glucose' as const }))
        : [];

    // Combine and sort
    const allReadings = [...bpReadings, ...glucoseReadings]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Group by date
    const groupedReadings = allReadings.reduce((acc, reading) => {
        const dateKey = getDateLabel(reading.timestamp);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(reading);
        return acc;
    }, {} as Record<string, typeof allReadings>);

    const dateRanges: { value: DateRange; label: string }[] = [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' },
        { value: 'custom', label: 'Custom' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 sticky top-0 z-20">
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-3xl font-bold leading-tight tracking-tight flex-1">
                    History
                </h2>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined">search</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto flex flex-col w-full px-4">
                {/* Type Filter */}
                <div className="flex py-2 w-full">
                    <div className="flex h-12 w-full items-center justify-center rounded-xl bg-surface-light dark:bg-surface-dark p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                        {(['all', 'bp', 'glucose'] as ReadingType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all duration-200 font-medium ${typeFilter === type
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary-light dark:text-text-secondary-dark'
                                    }`}
                            >
                                <span className="truncate text-base">
                                    {type === 'all' ? 'All' : type === 'bp' ? 'BP' : 'Glucose'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Range Chips */}
                <div className="flex gap-3 py-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                    {dateRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setDateRange(range.value)}
                            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 shadow-sm transition-transform active:scale-95 ${dateRange === range.value
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark'
                                }`}
                        >
                            <span className={`text-sm leading-normal ${dateRange === range.value ? 'font-bold' : 'font-medium'}`}>
                                {range.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Chart Toggle */}
                <div className="flex py-1 justify-end">
                    <button
                        onClick={() => setShowChart(!showChart)}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 text-primary gap-2 pl-4 pr-4 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {showChart ? 'list' : 'bar_chart'}
                        </span>
                        <span className="text-sm font-bold leading-normal tracking-wide">
                            {showChart ? 'Show List View' : 'Show Chart View'}
                        </span>
                    </button>
                </div>

                {/* Chart View (Placeholder) */}
                {showChart && (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 mt-4 border border-gray-100 dark:border-gray-700">
                        <div className="h-48 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">bar_chart</span>
                                <p className="mt-2 text-sm">Chart visualization</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                {!showChart && (
                    <div className="flex flex-col gap-2 mt-2">
                        {Object.entries(groupedReadings).map(([dateLabel, readings]) => (
                            <div key={dateLabel}>
                                <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-tight pt-4 pb-2">
                                    {dateLabel}
                                </h3>
                                {readings.map((reading) => (
                                    <button
                                        key={reading.id}
                                        onClick={() => navigate(reading.type === 'bp' ? '/bp-entry' : '/glucose-entry')}
                                        className="group relative flex w-full flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all active:scale-[0.99] active:shadow-sm mb-2"
                                    >
                                        <div className="flex items-center p-4 gap-4">
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${reading.type === 'bp'
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-primary'
                                                }`}>
                                                <span className="material-symbols-outlined filled">
                                                    {reading.type === 'bp' ? 'favorite' : 'water_drop'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col flex-1 text-left">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                                                        {reading.type === 'bp'
                                                            ? `${(reading as any).systolic}/${(reading as any).diastolic}`
                                                            : (reading as any).value
                                                        }
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-400">
                                                        {reading.type === 'bp' ? 'mmHg' : 'mg/dL'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${reading.status === 'normal'
                                                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20'
                                                            : reading.status === 'elevated'
                                                                ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-orange-600/20'
                                                                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-600/20'
                                                        }`}>
                                                        {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
                                                    </span>
                                                    {reading.type === 'glucose' && (
                                                        <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                                            {(reading as any).context.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                                                    {formatTime(reading.timestamp)}
                                                </span>
                                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[20px]">chevron_right</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ))}

                        {allReadings.length === 0 && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">history</span>
                                <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">No readings found</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FAB */}
            <button
                onClick={() => navigate('/quick-add')}
                className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-90 hover:scale-105"
                style={{ right: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))' }}
            >
                <span className="material-symbols-outlined text-[28px]">add</span>
            </button>

            <BottomNav />
        </div>
    );
}
