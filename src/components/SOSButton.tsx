import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { emergencyService } from '../services/emergencyService';

interface SOSButtonProps {
    className?: string;
    size?: 'normal' | 'large'; // large for elder mode
}

const HOLD_DURATION = 3000; // 3 seconds to activate
const COUNTDOWN_SECONDS = 5; // 5 second countdown after confirmation

export function SOSButton({ className = '', size = 'normal' }: SOSButtonProps) {
    const { state, currentProfile, addNotification } = useApp();
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isSending, setIsSending] = useState(false);
    const [location, setLocation] = useState<GeolocationPosition | null>(null);

    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Get location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation(pos),
                (err) => console.log('Location not available:', err.message),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }, []);

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);

    const handleHoldStart = useCallback(() => {
        setIsHolding(true);
        setHoldProgress(0);

        // Progress animation
        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setHoldProgress(progress);
        }, 50);

        // Complete hold
        holdTimerRef.current = setTimeout(() => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setHoldProgress(100);
            setIsHolding(false);
            setShowConfirmation(true);
            startCountdown();
        }, HOLD_DURATION);
    }, []);

    const handleHoldEnd = useCallback(() => {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
    }, []);

    const startCountdown = useCallback(() => {
        setCountdown(COUNTDOWN_SECONDS);
        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    triggerSOS();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const cancelSOS = useCallback(() => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setShowConfirmation(false);
        setCountdown(COUNTDOWN_SECONDS);
    }, []);

    const triggerSOS = async () => {
        if (!state.currentProfileId) return;

        setIsSending(true);
        try {
            const result = await emergencyService.triggerSOS(
                state.currentProfileId,
                location || undefined
            );

            addNotification(
                'SOS Alert Sent',
                `Emergency alert sent to ${result.notifiedCount} caregivers`,
                'security',
                'high'
            );

            // Umami Event
            if ((window as any).umami) {
                (window as any).umami.track('sos-triggered', {
                    profileId: state.currentProfileId,
                    notifiedCount: result.notifiedCount
                });
            }

            setShowConfirmation(false);
        } catch (error) {
            console.error('Failed to send SOS:', error);
            addNotification(
                'SOS Failed',
                'Could not send emergency alert. Please call for help.',
                'security',
                'high'
            );
        } finally {
            setIsSending(false);
        }
    };

    const buttonSize = size === 'large' ? 'w-20 h-20' : 'w-16 h-16';
    const iconSize = size === 'large' ? 'text-4xl' : 'text-2xl';

    return (
        <>
            {/* SOS Button */}
            <button
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className={`relative flex items-center justify-center ${buttonSize} rounded-full bg-red-600 text-white shadow-lg shadow-red-500/40 transition-all active:scale-95 ${isHolding ? 'scale-110' : ''} ${className}`}
                aria-label="Emergency SOS"
            >
                {/* Progress ring */}
                {isHolding && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeDasharray={`${holdProgress * 2.83} 283`}
                            className="transition-all duration-100"
                        />
                    </svg>
                )}

                {/* Pulsing animation when not holding */}
                {!isHolding && (
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                )}

                <span className={`material-symbols-outlined ${iconSize} font-bold`}>
                    sos
                </span>
            </button>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">
                                warning
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Sending SOS Alert
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Emergency alert will be sent to your caregivers in
                        </p>

                        <div className="text-6xl font-bold text-red-600 mb-6">
                            {countdown}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelSOS}
                                disabled={isSending}
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold transition-colors hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={triggerSOS}
                                disabled={isSending}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-semibold transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {isSending ? 'Sending...' : 'Send Now'}
                            </button>
                        </div>

                        {location && (
                            <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                Location will be shared
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
