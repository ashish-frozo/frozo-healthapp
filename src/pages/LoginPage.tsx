import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { dispatch, syncData } = useApp();

    const handleKeyPress = (key: string) => {
        setError(null);
        if (showOtp) {
            if (otp.length < 6) {
                setOtp(prev => prev + key);
            }
        } else {
            if (phoneNumber.length < 10) {
                setPhoneNumber(prev => prev + key);
            }
        }
    };

    const handleDelete = () => {
        setError(null);
        if (showOtp) {
            setOtp(prev => prev.slice(0, -1));
        } else {
            setPhoneNumber(prev => prev.slice(0, -1));
        }
    };

    const formatPhoneNumber = (num: string) => {
        if (num.length === 0) return '';
        if (num.length <= 3) return `(${num}`;
        if (num.length <= 6) return `(${num.slice(0, 3)}) ${num.slice(3)}`;
        return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
    };

    const handleSendCode = async () => {
        if (phoneNumber.length === 10) {
            setLoading(true);
            setError(null);
            try {
                await authService.sendOTP(`+1${phoneNumber}`);
                setShowOtp(true);
            } catch (err: any) {
                setError(err.message || 'Failed to send OTP');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 6) {
            setLoading(true);
            setError(null);
            try {
                const response = await authService.verifyOTP(`+1${phoneNumber}`, otp);

                // Sync data from backend
                await syncData();

                dispatch({
                    type: 'SET_AUTHENTICATED',
                    payload: {
                        authenticated: true,
                        phoneNumber: `+1${phoneNumber}`,
                        user: response.user
                    }
                });

                // If user has profiles, go to home, else create profile
                if (response.user.profiles && response.user.profiles.length > 0) {
                    navigate('/');
                } else {
                    navigate('/create-profile');
                }
            } catch (err: any) {
                setError(err.message || 'Invalid OTP');
                setOtp('');
            } finally {
                setLoading(false);
            }
        }
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    return (
        <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark max-w-md mx-auto">
            {/* Status Bar */}
            <div className="h-12 w-full flex items-center justify-between px-6 pt-2">
                <span className="text-sm font-semibold dark:text-white">9:41</span>
                <div className="flex gap-1.5">
                    <span className="material-symbols-outlined text-sm dark:text-white">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-sm dark:text-white">wifi</span>
                    <span className="material-symbols-outlined text-sm dark:text-white">battery_full</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 pt-4 pb-6 overflow-y-auto">
                {/* Header Icon */}
                <div className="w-full flex justify-center mb-6">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-primary">
                            {showOtp ? 'lock' : 'health_and_safety'}
                        </span>
                    </div>
                </div>

                {/* Headline */}
                <div className="flex flex-col items-center text-center space-y-3 mb-8">
                    <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight">
                        {showOtp ? 'Enter Code' : 'Welcome to Family Health'}
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg font-normal leading-snug max-w-[280px]">
                        {showOtp
                            ? `We sent a code to +1 ${formatPhoneNumber(phoneNumber)}`
                            : "Let's log in. Enter your mobile number below."
                        }
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                        <span className="material-symbols-outlined text-xl">error</span>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Input Field */}
                <div className="w-full space-y-6">
                    {showOtp ? (
                        <div className="flex justify-center gap-3">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${otp[i]
                                        ? 'border-primary bg-primary/5 text-text-primary-light dark:text-text-primary-dark'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-400'
                                        }`}
                                >
                                    {otp[i] || ''}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            <label className="text-text-primary-light dark:text-text-primary-dark text-base font-semibold ml-1">
                                Mobile Number
                            </label>
                            <div className="relative flex items-center">
                                {/* Country Code */}
                                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 border-r border-gray-200 dark:border-gray-600">
                                    <span className="text-2xl mr-2">🇺🇸</span>
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark font-semibold text-lg">+1</span>
                                </div>
                                {/* Input Display */}
                                <div className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-background-light dark:bg-background-dark pl-[110px] pr-4 h-16 flex items-center text-2xl font-medium tracking-wide text-text-primary-light dark:text-text-primary-dark">
                                    {formatPhoneNumber(phoneNumber) || <span className="text-gray-400">(555) 000-0000</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Primary Button */}
                    <button
                        onClick={showOtp ? handleVerifyOtp : handleSendCode}
                        disabled={loading || (showOtp ? otp.length !== 6 : phoneNumber.length !== 10)}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-primary/30 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{showOtp ? 'Verify Code' : 'Send Verification Code'}</span>
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Trust Indicator */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="material-symbols-outlined text-lg">lock</span>
                        <span className="text-sm font-medium">Your health data is encrypted</span>
                    </div>
                    {showOtp && (
                        <button
                            onClick={() => setShowOtp(false)}
                            className="text-primary text-sm font-semibold"
                        >
                            Change number
                        </button>
                    )}
                </div>
            </div>

            {/* Numeric Keypad */}
            <div className="bg-gray-100 dark:bg-background-dark pb-8 pt-4 px-6 rounded-t-2xl border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-3 gap-y-4 gap-x-6 max-w-[320px] mx-auto">
                    {keys.map((key, i) => (
                        <button
                            key={i}
                            onClick={() => key === 'del' ? handleDelete() : key && handleKeyPress(key)}
                            className={`h-12 rounded-lg flex items-center justify-center text-2xl font-medium transition-colors ${key === ''
                                ? 'cursor-default'
                                : 'text-text-primary-light dark:text-text-primary-dark active:bg-gray-200 dark:active:bg-gray-700'
                                }`}
                        >
                            {key === 'del' ? (
                                <span className="material-symbols-outlined">backspace</span>
                            ) : key}
                        </button>
                    ))}
                </div>
                {/* Home Indicator */}
                <div className="w-full flex justify-center mt-6">
                    <div className="w-32 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
            </div>
        </div>
    );
}
