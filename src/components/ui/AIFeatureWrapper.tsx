import React, { useState } from 'react';
import { useCredits } from '../../hooks/useCredits';
import { AIFeature } from '../../types';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { PurchaseCreditsModal } from './PurchaseCreditsModal';
import { Loader2 } from 'lucide-react';

interface AIFeatureWrapperProps {
    feature: AIFeature;
    children: (onUse: () => Promise<boolean>) => React.ReactNode;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function AIFeatureWrapper({
    feature,
    children,
    onSuccess,
    onError,
}: AIFeatureWrapperProps) {
    const {
        balance: credits,
        isLoading: loading,
        useCredits: deductCredits,
        costs,
        packages,
        initiatePurchase,
    } = useCredits();

    const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUseFeature = async () => {
        if (loading) return false;

        try {
            setIsProcessing(true);
            const result = await deductCredits(feature);
            if (result.success) {
                onSuccess?.();
                return true;
            } else {
                setShowInsufficientCredits(true);
                return false;
            }
        } catch (error) {
            console.error('Error using feature:', error);
            onError?.(error as Error);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePurchase = async (packageId: string) => {
        try {
            const result = await initiatePurchase(packageId);
            return result;
        } catch (error) {
            console.error('Purchase failed:', error);
            return null;
        }
    };

    const openPurchaseModal = () => {
        setShowInsufficientCredits(false);
        setShowPurchaseModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <>
            {children(handleUseFeature)}

            <InsufficientCreditsModal
                isOpen={showInsufficientCredits}
                onClose={() => setShowInsufficientCredits(false)}
                feature={feature}
                required={costs?.[feature] || 0}
                currentBalance={credits}
                costs={costs}
                onPurchase={openPurchaseModal}
            />

            <PurchaseCreditsModal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                packages={packages}
                currentBalance={credits}
                onPurchase={handlePurchase}
                isLoading={isProcessing}
            />
        </>
    );
}
