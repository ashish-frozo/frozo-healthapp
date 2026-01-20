import React, { useState } from 'react';
import { householdService, InviteResponse } from '../../services/householdService';

interface InviteModalProps {
    householdId: string;
    householdName: string;
    onClose: () => void;
    onInviteSent?: (invite: InviteResponse) => void;
}

export function InviteModal({ householdId, householdName, onClose, onInviteSent }: InviteModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inviteResult, setInviteResult] = useState<InviteResponse | null>(null);

    const handleSendInvite = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
            console.log('Sending invite to:', fullPhone);
            const result = await householdService.createInvite(householdId, fullPhone);
            console.log('Invite result:', result);
            setInviteResult(result);
            onInviteSent?.(result);
        } catch (err: any) {
            console.error('Invite error:', err);
            setError(err?.message || 'Failed to send invite');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareViaWhatsApp = () => {
        if (inviteResult?.whatsappLink) {
            window.open(inviteResult.whatsappLink, '_blank');
        }
    };

    const handleCopyLink = async () => {
        if (inviteResult?.inviteLink) {
            await navigator.clipboard.writeText(inviteResult.inviteLink);
            // Could show a toast here
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl w-full max-w-md p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                        {inviteResult ? 'Invite Sent!' : 'Invite Family Member'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {!inviteResult ? (
                    <>
                        {/* Description */}
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                            Enter their phone number. They'll receive a link to join <strong>{householdName}</strong> and can log their health readings from their own phone.
                        </p>

                        {/* Phone Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-24 px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-text-primary-light dark:text-text-primary-dark font-medium"
                                >
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+971">🇦🇪 +971</option>
                                </select>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="9876543210"
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-text-primary-light dark:text-text-primary-dark placeholder-gray-400 text-lg font-medium"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Info about WhatsApp */}
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl flex gap-3">
                            <span className="material-symbols-outlined text-green-600">chat</span>
                            <p className="text-sm text-green-800 dark:text-green-300">
                                <strong>Elderly-friendly!</strong> After joining, they can log readings simply by sending WhatsApp messages like "BP 130/85"
                            </p>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendInvite}
                            disabled={isLoading}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">send</span>
                                    Send Invite
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="text-center mb-6">
                            <div className="size-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                            </div>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Invite created for <strong>{inviteResult.invite.phoneNumber}</strong>
                            </p>
                        </div>

                        {/* Share Options */}
                        <div className="space-y-3">
                            <button
                                onClick={handleShareViaWhatsApp}
                                className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Share via WhatsApp
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">content_copy</span>
                                Copy Invite Link
                            </button>
                        </div>

                        {/* Invite Link Preview */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <p className="text-xs text-gray-400 font-medium mb-1">Invite Link</p>
                            <p className="text-sm text-text-primary-light dark:text-text-primary-dark break-all">
                                {inviteResult.inviteLink}
                            </p>
                        </div>

                        {/* Done Button */}
                        <button
                            onClick={onClose}
                            className="w-full mt-4 py-3 text-primary font-bold"
                        >
                            Done
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
