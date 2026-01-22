import React from 'react';
import { X, AlertTriangle, Coins, ShoppingCart } from 'lucide-react';
import { AIFeature, CreditCosts } from '../../types';

interface InsufficientCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: AIFeature;
    required: number;
    currentBalance: number;
    costs: CreditCosts | null;
    onPurchase: () => void;
}

const featureNames: Record<AIFeature, string> = {
    lab_translation: 'Lab Translation',
    health_insight: 'Health Insight',
    doctor_brief: 'Doctor Brief',
};

export function InsufficientCreditsModal({
    isOpen,
    onClose,
    feature,
    required,
    currentBalance,
    onPurchase,
}: InsufficientCreditsModalProps) {
    if (!isOpen) return null;

    const creditsNeeded = required - currentBalance;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8" />
                        <h2 className="text-xl font-bold">Not Enough Credits</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">{featureNames[feature]}</span> requires{' '}
                        <span className="font-bold text-amber-600">{required} credits</span>, but you only have{' '}
                        <span className="font-bold text-red-500">{currentBalance} credits</span>.
                    </p>

                    <div className="flex items-center justify-center gap-2 py-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {creditsNeeded}
                            </div>
                            <div className="text-sm text-gray-500">more credits needed</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onPurchase}
                            className="w-full py-3 px-6 rounded-xl font-semibold text-white
                                bg-gradient-to-r from-amber-500 to-yellow-500 
                                hover:from-amber-600 hover:to-yellow-600 
                                shadow-lg shadow-amber-500/25
                                flex items-center justify-center gap-2
                                transition-all duration-200"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Get More Credits
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3 px-6 rounded-xl font-medium
                                text-gray-600 dark:text-gray-300
                                border border-gray-200 dark:border-gray-700
                                hover:bg-gray-50 dark:hover:bg-gray-800
                                transition-all duration-200"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InsufficientCreditsModal;
