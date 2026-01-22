import { useState, useEffect, useCallback } from 'react';
import { CreditState, CreditTransaction, CreditPackage, AIFeature, CreditCosts } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface UseCreditsReturn {
    balance: number;
    isLoading: boolean;
    transactions: CreditTransaction[];
    packages: CreditPackage[];
    costs: CreditCosts | null;
    error: string | null;
    fetchBalance: () => Promise<void>;
    fetchHistory: (limit?: number) => Promise<void>;
    fetchPackages: () => Promise<void>;
    useCredits: (feature: AIFeature) => Promise<{ success: boolean; newBalance?: number; error?: string }>;
    checkCredits: (feature: AIFeature) => Promise<{ hasEnough: boolean; required: number; balance: number }>;
    initiatePurchase: (packageId: string) => Promise<{ checkoutUrl: string; sessionId: string } | null>;
    getCostForFeature: (feature: AIFeature) => number;
}

const getAuthHeaders = (): Record<string, string> => {
    const userId = localStorage.getItem('userId') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userName = localStorage.getItem('userName') || '';

    return {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-user-email': userEmail,
        'x-user-name': userName,
    };
};

export function useCredits(): UseCreditsReturn {
    const [state, setState] = useState<CreditState>({
        balance: 0,
        isLoading: true,
        transactions: [],
        packages: [],
    });
    const [costs, setCosts] = useState<CreditCosts | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            setError(null);

            const response = await fetch(`${API_BASE_URL}/credits/balance`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            setState(prev => ({ ...prev, balance: data.balance, isLoading: false }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const fetchHistory = useCallback(async (limit = 20) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const response = await fetch(`${API_BASE_URL}/credits/history?limit=${limit}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();
            setState(prev => ({
                ...prev,
                balance: data.balance,
                transactions: data.transactions,
                isLoading: false,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const fetchPackages = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/credits/packages`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch packages');
            }

            const data = await response.json();
            setState(prev => ({ ...prev, packages: data }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, []);

    const fetchCosts = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/credits/costs`);

            if (!response.ok) {
                throw new Error('Failed to fetch costs');
            }

            const data = await response.json();
            setCosts(data);
        } catch (err) {
            console.error('Failed to fetch costs:', err);
        }
    }, []);

    const useCreditsForFeature = useCallback(async (feature: AIFeature): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/credits/use`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ feature }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 402) {
                    return {
                        success: false,
                        error: 'Insufficient credits',
                    };
                }
                throw new Error(data.error || 'Failed to use credits');
            }

            setState(prev => ({ ...prev, balance: data.newBalance }));
            return { success: true, newBalance: data.newBalance };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const checkCredits = useCallback(async (feature: AIFeature): Promise<{ hasEnough: boolean; required: number; balance: number }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/credits/check`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ feature }),
            });

            if (!response.ok) {
                throw new Error('Failed to check credits');
            }

            return await response.json();
        } catch (err) {
            console.error('Check credits error:', err);
            return { hasEnough: false, required: 0, balance: 0 };
        }
    }, []);

    const initiatePurchase = useCallback(async (packageId: string): Promise<{ checkoutUrl: string; sessionId: string } | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/credits/purchase`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ packageId }),
            });

            if (!response.ok) {
                throw new Error('Failed to initiate purchase');
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        }
    }, []);

    const getCostForFeature = useCallback((feature: AIFeature): number => {
        if (!costs) return 0;
        return costs[feature] || 0;
    }, [costs]);

    // Fetch balance and costs on mount
    useEffect(() => {
        fetchBalance();
        fetchCosts();
        fetchPackages();
    }, [fetchBalance, fetchCosts, fetchPackages]);

    return {
        balance: state.balance,
        isLoading: state.isLoading,
        transactions: state.transactions,
        packages: state.packages,
        costs,
        error,
        fetchBalance,
        fetchHistory,
        fetchPackages,
        useCredits: useCreditsForFeature,
        checkCredits,
        initiatePurchase,
        getCostForFeature,
    };
}

export default useCredits;
