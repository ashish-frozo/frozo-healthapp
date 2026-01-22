import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useHealthInsights } from '../hooks';
import { AIFeatureWrapper } from '../components/ui';
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
import { format, subDays, isAfter, parseISO } from 'date-fns';

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

export function TrendsPage() {
    const navigate = useNavigate();
    const { state } = useApp();
    const { generateInsights, insight, isLoading, error } = useHealthInsights();
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    const filteredBP = useMemo(() => {
        const cutoff = subDays(new Date(), parseInt(timeRange));
        return [...state.bpReadings]
            .filter(r => isAfter(parseISO(r.timestamp), cutoff))
            .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
    }, [state.bpReadings, timeRange]);

    const filteredGlucose = useMemo(() => {
        const cutoff = subDays(new Date(), parseInt(timeRange));
        return [...state.glucoseReadings]
            .filter(r => isAfter(parseISO(r.timestamp), cutoff))
            .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
    }, [state.glucoseReadings, timeRange]);

    // Auto-generation removed to prevent credit drain
    // Insights are now generated manually via the button

    const bpChartData = {
        labels: filteredBP.map(r => format(parseISO(r.timestamp), 'MMM d')),
        datasets: [
            {
                label: 'Systolic',
                data: filteredBP.map(r => r.systolic),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ef4444',
            },
            {
                label: 'Diastolic',
                data: filteredBP.map(r => r.diastolic),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
            },
        ],
    };

    const glucoseChartData = {
        labels: filteredGlucose.map(r => format(parseISO(r.timestamp), 'MMM d')),
        datasets: [
            {
                label: 'Glucose (mg/dL)',
                data: filteredGlucose.map(r => r.value),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: filteredGlucose.map(r =>
                    r.status === 'high' ? '#ef4444' : r.status === 'low' ? '#f59e0b' : '#8b5cf6'
                ),
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    font: { size: 12, weight: 'bold' as any },
                },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
            },
            x: {
                grid: { display: false },
            },
        },
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col transition-all duration-300">
            {/* Header (Mobile) */}
            <header className="md:hidden shrink-0 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-text-primary-light dark:text-text-primary-dark"
                >
                    <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Health Trends</h1>
                <div className="w-10" />
            </header>

            {/* Header (Desktop) */}
            <header className="hidden md:flex items-center justify-between px-8 py-6 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Health Trends</h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Visualize your health data over time</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 md:pb-8 no-scrollbar px-4 md:px-8 py-6">
                <div className="max-w-6xl mx-auto">
                    {/* Time Range Selector */}
                    <div className="flex bg-surface-light dark:bg-surface-dark p-1 rounded-xl mb-6 shadow-sm border border-gray-200 dark:border-gray-800 max-w-md">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${timeRange === range
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* AI Insights Card */}
                        <section className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 rounded-3xl p-6 border border-primary/20 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-8xl">auto_awesome</span>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">AI Health Insights</h2>
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col gap-4 animate-pulse">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                    </div>
                                ) : error ? (
                                    <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                                        {error}
                                    </div>
                                ) : insight ? (
                                    <div className="space-y-6">
                                        <p className="text-text-primary-light dark:text-gray-200 font-medium leading-relaxed text-lg">
                                            {insight.summary}
                                        </p>

                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-gray-400">Key Insights</h3>
                                            <ul className="space-y-3">
                                                {insight.keyInsights.map((item, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-text-secondary-light dark:text-gray-300">
                                                        <span className="text-primary font-bold text-lg">•</span>
                                                        <span className="leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-gray-400">Actionable Tips</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {insight.tips.map((tip, i) => (
                                                    <span key={i} className="bg-white/50 dark:bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-primary border border-primary/10">
                                                        {tip}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-2">
                                        <p className="text-sm text-text-secondary-light dark:text-gray-400 italic text-center">
                                            Unlock personalized health insights powered by AI.
                                        </p>
                                        <AIFeatureWrapper
                                            feature="health_insight"
                                            onSuccess={() => generateInsights(filteredBP, filteredGlucose)}
                                        >
                                            {(onUse) => (
                                                <button
                                                    onClick={onUse}
                                                    disabled={filteredBP.length === 0 && filteredGlucose.length === 0}
                                                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                                    Generate Insights
                                                </button>
                                            )}
                                        </AIFeatureWrapper>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="lg:col-span-2 space-y-8">
                            {/* BP Chart */}
                            <section>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">Blood Pressure</h2>
                                    <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">mmHg</span>
                                </div>
                                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-[320px]">
                                    {filteredBP.length > 1 ? (
                                        <Line data={bpChartData} options={chartOptions} />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-5xl mb-4">monitoring</span>
                                            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">Not enough data for a trend. Log at least 2 readings.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Glucose Chart */}
                            <section>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">Blood Glucose</h2>
                                    <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">mg/dL</span>
                                </div>
                                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-[320px]">
                                    {filteredGlucose.length > 1 ? (
                                        <Line data={glucoseChartData} options={chartOptions} />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-5xl mb-4">water_drop</span>
                                            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">Not enough data for a trend. Log at least 2 readings.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
