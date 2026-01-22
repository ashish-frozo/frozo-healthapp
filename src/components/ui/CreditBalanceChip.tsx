import React from 'react';
import { Coins } from 'lucide-react';

interface CreditBalanceChipProps {
    balance: number;
    isLoading?: boolean;
    onClick?: () => void;
    className?: string;
}

export function CreditBalanceChip({
    balance,
    isLoading = false,
    onClick,
    className = ''
}: CreditBalanceChipProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`
                flex items-center gap-1.5 px-3 py-1.5
                bg-gradient-to-r from-amber-500/20 to-yellow-500/20
                border border-amber-500/30 rounded-full
                text-amber-600 dark:text-amber-400
                text-sm font-medium
                hover:from-amber-500/30 hover:to-yellow-500/30
                hover:border-amber-500/50
                transition-all duration-200
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            aria-label={`${balance} credits available`}
        >
            <Coins className="w-4 h-4" />
            {isLoading ? (
                <span className="animate-pulse">...</span>
            ) : (
                <span>{balance}</span>
            )}
        </button>
    );
}

export default CreditBalanceChip;
