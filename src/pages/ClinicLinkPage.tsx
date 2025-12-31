import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TopBar, BottomNav } from '../components/ui';

export function ClinicLinkPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 32 });
    const [copied, setCopied] = useState(false);

    // Get the most recent active link
    const activeLink = state.clinicLinks.find(l => l.active);
    const linkUrl = activeLink?.url || 'health.log/v8s9...';

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { minutes: prev.minutes - 1, seconds: 59 };
                } else {
                    clearInterval(interval);
                    return { minutes: 0, seconds: 0 };
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://${linkUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=Here's my health summary: https://${linkUrl}`, '_blank');
    };

    const handleRevoke = () => {
        if (activeLink) {
            dispatch({ type: 'REVOKE_CLINIC_LINK', payload: activeLink.id });
        }
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <TopBar title="Clinic Access" showBack />

            {/* Main Content */}
            <main className="flex flex-col flex-1 px-4 py-2 gap-6 pb-32 max-w-md mx-auto w-full">
                {/* Trust Header */}
                <div className="flex flex-col items-center gap-2 pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <span className="material-symbols-outlined text-lg filled">lock</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">Secure Mode</span>
                    </div>
                    <h1 className="text-2xl font-bold text-center leading-tight mt-1 text-text-primary-light dark:text-text-primary-dark">
                        Share Medical History
                    </h1>
                    <p className="text-center text-text-secondary-light dark:text-text-secondary-dark text-base max-w-[280px] leading-relaxed">
                        This secure link gives your doctor temporary access to your records.
                    </p>
                </div>

                {/* Active Link Card */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-6">
                    {/* Timer */}
                    <div className="flex flex-col items-center gap-2 w-full">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Expires In</span>
                        <div className="flex gap-3 items-start justify-center w-full">
                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-primary">
                                    <p className="text-4xl font-bold tracking-tight">{String(timeLeft.minutes).padStart(2, '0')}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-400">Minutes</p>
                            </div>
                            {/* Separator */}
                            <div className="h-20 flex items-center text-gray-300 text-2xl font-bold">:</div>
                            {/* Seconds */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-primary">
                                    <p className="text-4xl font-bold tracking-tight">{String(timeLeft.seconds).padStart(2, '0')}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-400">Seconds</p>
                            </div>
                        </div>
                    </div>

                    {/* Link Display */}
                    <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="material-symbols-outlined text-gray-400 shrink-0">link</span>
                            <span className="text-text-secondary-light dark:text-text-secondary-dark font-mono text-sm truncate">
                                {linkUrl}
                            </span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse shrink-0" />
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all group"
                        >
                            <div className="size-10 rounded-full bg-surface-light dark:bg-gray-700 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined filled">
                                    {copied ? 'check' : 'content_copy'}
                                </span>
                            </div>
                            <span className="text-primary font-bold text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                        </button>

                        {/* WhatsApp Button */}
                        <button
                            onClick={handleWhatsApp}
                            className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-95 transition-all group"
                        >
                            <div className="size-10 rounded-full bg-surface-light dark:bg-gray-700 flex items-center justify-center text-[#25D366] shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </div>
                            <span className="text-[#25D366] font-bold text-sm">WhatsApp</span>
                        </button>
                    </div>
                </div>

                {/* Revoke Action */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleRevoke}
                        className="w-full flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all font-bold text-lg"
                    >
                        <span className="material-symbols-outlined">block</span>
                        Stop Sharing
                    </button>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        Revoking access will immediately disable the link for everyone.
                    </p>
                </div>

                {/* Trust Footer */}
                <div className="mt-auto pt-4 flex justify-center pb-4">
                    <div className="flex items-center gap-2 opacity-60">
                        <span className="material-symbols-outlined text-gray-400 text-lg">verified_user</span>
                        <span className="text-xs font-medium text-gray-500">HIPAA Compliant & Encrypted</span>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
