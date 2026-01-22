import React, { useState } from 'react';
import { X, Coins, Check, Sparkles, Zap, Crown } from 'lucide-react';
import { CreditPackage } from '../../types';

interface PurchaseCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    packages: CreditPackage[];
    currentBalance?: number;
    onPurchase: (packageId: string) => Promise<{ checkoutUrl: string; sessionId: string } | null>;
    isLoading?: boolean;
}

const packageIcons: Record<string, React.ReactNode> = {
    try_it_out: <Coins className="w-6 h-6" />,
    monthly_care: <Sparkles className="w-6 h-6" />,
    yearly_care: <Crown className="w-6 h-6" />,
};

const packageColors: Record<string, string> = {
    try_it_out: 'from-teal-500 to-emerald-500',
    monthly_care: 'from-blue-500 to-indigo-500',
    yearly_care: 'from-amber-500 to-orange-500',
};

export function PurchaseCreditsModal({
    isOpen,
    onClose,
    packages,
    currentBalance,
    onPurchase,
    isLoading = false,
}: PurchaseCreditsModalProps) {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [purchasing, setPurchasing] = useState(false);

    if (!isOpen) return null;

    const handlePurchase = async () => {
        if (!selectedPackage) return;

        setPurchasing(true);
        try {
            const result = await onPurchase(selectedPackage);
            if (result?.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            }
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <Coins className="w-8 h-8" />
                        <h2 className="text-2xl font-bold">Get Credits</h2>
                    </div>

                    <p className="text-white/80">
                        Current balance: <span className="font-semibold">{currentBalance} credits</span>
                    </p>
                </div>

                {/* Packages */}
                <div className="p-6 space-y-3">
                    {packages.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            disabled={isLoading || purchasing}
                            className={`
                                w-full p-4 rounded-xl border-2 transition-all duration-200
                                flex items-center justify-between
                                ${selectedPackage === pkg.id
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${packageColors[pkg.id] || 'from-gray-400 to-gray-500'} text-white`}>
                                    {packageIcons[pkg.id] || <Coins className="w-6 h-6" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {pkg.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pkg.credits} credits
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {pkg.priceDisplay}
                                </span>
                                {selectedPackage === pkg.id && (
                                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}

                    {packages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No packages available
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handlePurchase}
                        disabled={!selectedPackage || isLoading || purchasing}
                        className={`
                            w-full py-3 px-6 rounded-xl font-semibold text-white
                            flex items-center justify-center gap-2
                            transition-all duration-200
                            ${selectedPackage
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/25'
                                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {purchasing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                Purchase Credits
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Secure payment powered by Dodo Payments
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PurchaseCreditsModal;
