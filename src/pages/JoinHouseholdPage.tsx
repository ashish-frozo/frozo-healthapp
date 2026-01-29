import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { householdService } from '../services/householdService';
import { useApp } from '../context/AppContext';

export function JoinHouseholdPage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { syncData } = useApp();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const join = async () => {
            if (!code) {
                setStatus('error');
                setError('Invalid invite code');
                return;
            }

            try {
                await householdService.joinHousehold(code);
                await syncData();
                setStatus('success');
                setTimeout(() => {
                    navigate('/family-dashboard');
                }, 2000);
            } catch (err: any) {
                console.error('Failed to join household:', err);
                setStatus('error');
                setError(err.message || 'Failed to join household. The code might be invalid or expired.');
            }
        };

        join();
    }, [code, navigate, syncData]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-6">
            <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            Joining Household...
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            Please wait while we process your invitation.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            Successfully Joined!
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            Welcome to the household. Redirecting you to the dashboard...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">error</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            {error}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-primary text-white rounded-xl h-12 font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                        >
                            Go to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
