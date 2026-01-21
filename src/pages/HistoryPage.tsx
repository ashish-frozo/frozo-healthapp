import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ReadingType, DateRange } from '../types';
import { formatTime, getDateLabel } from '../data/mockData';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

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
    ];

    // Chart data for BP
    const bpChartData = useMemo(() => {
        const sortedBP = [...bpReadings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
            labels: sortedBP.map(r => format(parseISO(r.timestamp), 'MMM d')),
            datasets: [
                {
                    label: 'Systolic',
                    data: sortedBP.map(r => r.systolic),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#ef4444',
                },
                {
                    label: 'Diastolic',
                    data: sortedBP.map(r => r.diastolic),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
                },
            ],
        };
    }, [bpReadings]);

    // Chart data for Glucose
    const glucoseChartData = useMemo(() => {
        const sortedGlucose = [...glucoseReadings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
            labels: sortedGlucose.map(r => format(parseISO(r.timestamp), 'MMM d')),
            datasets: [
                {
                    label: 'Glucose',
                    data: sortedGlucose.map(r => r.value),
                    borderColor: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#14b8a6',
                },
            ],
        };
    }, [glucoseReadings]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { usePointStyle: true },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(0,0,0,0.05)' },
            },
            x: {
                grid: { display: false },
            },
        },
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8 md:pl-64 transition-all duration-300">
            {/* Header (Mobile) */}
            <header className="md:hidden flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 sticky top-0 z-20">
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-3xl font-bold leading-tight tracking-tight flex-1">
                    History
                </h2>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined">search</span>
                </button>
            </header>

            {/* Header (Desktop) */}
            <header className="hidden md:flex items-center justify-between px-8 py-6 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">History</h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">View your health reading history</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/quick-add')}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span className="font-bold text-sm">Add Reading</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto flex flex-col w-full px-4 md:px-8 py-4 md:py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Type Filter */}
                    <div className="flex py-2 w-full md:w-auto md:flex-1">
                        <div className="flex h-12 w-full items-center justify-center rounded-xl bg-surface-light dark:bg-surface-dark p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                            {(['all', 'bp', 'glucose'] as ReadingType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all duration-200 font-medium ${typeFilter === type
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    <div className="flex gap-3 py-3 overflow-x-auto no-scrollbar md:overflow-visible items-center">
                        {dateRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setDateRange(range.value)}
                                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 shadow-sm transition-transform active:scale-95 ${dateRange === range.value
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className={`text-sm leading-normal ${dateRange === range.value ? 'font-bold' : 'font-medium'}`}>
                                    {range.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Chart Toggle */}
                    <div className="flex py-1 justify-end md:w-auto">
                        <button
                            onClick={() => setShowChart(!showChart)}
                            className="flex w-full md:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 text-primary gap-2 pl-4 pr-4 transition-colors whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showChart ? 'list' : 'bar_chart'}
                            </span>
                            <span className="text-sm font-bold leading-normal tracking-wide">
                                {showChart ? 'Show List' : 'Show Chart'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Chart View */}
                {showChart && (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 md:p-6 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        {(typeFilter === 'all' || typeFilter === 'bp') && bpReadings.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Blood Pressure Trends</h4>
                                <div className="h-64 md:h-80">
                                    <Line data={bpChartData} options={chartOptions} />
                                </div>
                            </div>
                        )}
                        {(typeFilter === 'all' || typeFilter === 'glucose') && glucoseReadings.length > 0 && (
                            <div>
                                <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Glucose Trends</h4>
                                <div className="h-64 md:h-80">
                                    <Line data={glucoseChartData} options={chartOptions} />
                                </div>
                            </div>
                        )}
                        {allReadings.length === 0 && (
                            <div className="h-48 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">bar_chart</span>
                                    <p className="mt-2 text-sm">No data for this period</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* List View */}
                {!showChart && (
                    <div className="flex flex-col gap-4">
                        {Object.entries(groupedReadings).map(([dateLabel, readings]) => (
                            <div key={dateLabel}>
                                <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-tight pb-3 sticky top-0 bg-background-light dark:bg-background-dark z-10">
                                    {dateLabel}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {readings.map((reading) => (
                                        <button
                                            key={reading.id}
                                            onClick={() => navigate(reading.type === 'bp' ? '/bp-entry' : '/glucose-entry')}
                                            className="group relative flex w-full flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md active:scale-[0.99] text-left"
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
                                                <div className="flex flex-col flex-1 min-w-0">
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
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${reading.status === 'normal'
                                                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20'
                                                            : reading.status === 'elevated'
                                                                ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-orange-600/20'
                                                                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-600/20'
                                                            }`}>
                                                            {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
                                                        </span>
                                                        {reading.type === 'glucose' && (
                                                            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark truncate">
                                                                {(reading as any).context.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                                                        {formatTime(reading.timestamp)}
                                                    </span>
                                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
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

            {/* FAB (Mobile Only) */}
            <button
                onClick={() => navigate('/quick-add')}
                className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-90 hover:scale-105 md:hidden"
                style={{ right: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))' }}
            >
                <span className="material-symbols-outlined text-[28px]">add</span>
            </button>
        </div>
    );
}
