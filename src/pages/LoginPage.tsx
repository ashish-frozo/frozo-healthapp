import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { CountrySelector, DEFAULT_COUNTRY, Country } from '../components/ui/CountrySelector';

export function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const navigate = useNavigate();
    const { dispatch, syncData } = useApp();

    useEffect(() => {
        // Clear any existing stale verifier
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch (e) {
                // Ignore errors from clearing
            }
            (window as any).recaptchaVerifier = null;
        }

        // Create fresh verifier
        const container = document.getElementById('recaptcha-container');
        if (container) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    console.log('Recaptcha resolved');
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if ((window as any).recaptchaVerifier) {
                try {
                    (window as any).recaptchaVerifier.clear();
                } catch (e) {
                    // Ignore errors from clearing
                }
                (window as any).recaptchaVerifier = null;
            }
        };
    }, []);

    const handleKeyPress = (key: string) => {
        setError(null);
        if (showOtp) {
            if (otp.length < 6) {
                setOtp(prev => prev + key);
            }
        } else {
            if (phoneNumber.length < selectedCountry.maxLength) {
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
        if (phoneNumber.length >= selectedCountry.minLength && phoneNumber.length <= selectedCountry.maxLength) {
            setLoading(true);
            setError(null);
            try {
                const appVerifier = (window as any).recaptchaVerifier;
                const fullPhone = `${selectedCountry.dialCode}${phoneNumber}`;
                const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
                setConfirmationResult(result);
                setShowOtp(true);
            } catch (err: any) {
                console.error('Firebase Auth Error:', err);
                setError(err.message || 'Failed to send OTP. Please try again.');
                // Reset recaptcha if it fails
                if ((window as any).recaptchaVerifier) {
                    (window as any).recaptchaVerifier.render().then((widgetId: any) => {
                        (window as any).grecaptcha.reset(widgetId);
                    });
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 6 && confirmationResult) {
            setLoading(true);
            setError(null);
            try {
                console.log('Verifying OTP with Firebase...');
                const userCredential = await confirmationResult.confirm(otp);
                const idToken = await userCredential.user.getIdToken();

                console.log('Firebase verified, syncing with backend...');
                const response = await authService.verifyOTP(idToken);
                console.log('Backend sync successful:', response);

                // For new users, set preferred language based on country
                const isNewUser = !response.user.profiles || response.user.profiles.length === 0;
                if (isNewUser || !response.user.preferredLanguage) {
                    try {
                        await settingsService.updateSettings({
                            preferredLanguage: selectedCountry.defaultLanguage
                        });
                        console.log('Set default language to:', selectedCountry.defaultLanguage);
                    } catch (langErr) {
                        console.warn('Failed to set default language:', langErr);
                    }
                }

                // Sync data from backend
                await syncData();

                dispatch({
                    type: 'SET_AUTHENTICATED',
                    payload: {
                        authenticated: true,
                        phoneNumber: `${selectedCountry.dialCode}${phoneNumber}`,
                        user: response.user
                    }
                });

                if (response.user.profiles && response.user.profiles.length > 0) {
                    navigate('/');
                } else {
                    navigate('/create-profile');
                }
            } catch (err: any) {
                console.error('Login error:', err);
                setError(err.message || 'Invalid verification code');
                setOtp('');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.maxLength);
        setPhoneNumber(value);
        setError(null);
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
        setError(null);
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    return (
        <>
            {/* Mobile Layout */}
            <div className="md:hidden min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
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
                        <img src="/logo.png" alt="KinCare" className="w-24 h-24 rounded-2xl shadow-xl shadow-primary/20" />
                    </div>

                    {/* Headline */}
                    <div className="flex flex-col items-center text-center space-y-3 mb-8">
                        <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight">
                            {showOtp ? 'Enter Code' : 'Welcome to KinCare'}
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg font-normal leading-snug max-w-[280px]">
                            {showOtp
                                ? `We sent a code to ${selectedCountry.dialCode} ${phoneNumber}`
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
                                    {/* Country Selector */}
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center z-10">
                                        <CountrySelector
                                            selectedCountry={selectedCountry}
                                            onSelect={(country) => {
                                                setSelectedCountry(country);
                                                setPhoneNumber('');
                                            }}
                                            disabled={loading}
                                        />
                                    </div>
                                    {/* Input Display */}
                                    <div className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-background-light dark:bg-background-dark pl-[130px] pr-4 h-16 flex items-center text-2xl font-medium tracking-wide text-text-primary-light dark:text-text-primary-dark">
                                        {phoneNumber || <span className="text-gray-400">Enter phone number</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Primary Button */}
                        <button
                            onClick={showOtp ? handleVerifyOtp : handleSendCode}
                            disabled={loading || (showOtp ? otp.length !== 6 : phoneNumber.length < selectedCountry.minLength)}
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

            {/* Desktop Layout */}
            <div className="hidden md:flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left Side - Branding */}
                <div className="w-1/2 bg-gradient-to-br from-primary to-blue-600 p-16 flex flex-col justify-between text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[100px] animate-pulse-slow" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-12">
                            <img src="/logo.png" alt="KinCare" className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg" />
                            <span className="text-2xl font-bold tracking-tight">KinCare</span>
                        </div>
                        <h1 className="text-6xl font-extrabold leading-[1.1] mb-8">
                            Family Health <br />
                            <span className="text-blue-200">Reimagined.</span>
                        </h1>
                        <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                            The modern way to track vitals, manage medications, and keep your family safe. Beautiful, secure, and simple.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-6 text-sm font-medium text-blue-100/80">
                        <span>© {new Date().getFullYear()} KinCare</span>
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-1/2 flex items-center justify-center p-12">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                {showOtp ? 'Verify Code' : 'Welcome Back'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                {showOtp
                                    ? `Enter the code sent to ${selectedCountry.dialCode} ${phoneNumber}`
                                    : 'Enter your mobile number to continue'
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined">error</span>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {showOtp ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={handleOtpChange}
                                        maxLength={6}
                                        placeholder="000000"
                                        className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-2xl font-bold tracking-widest focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mobile Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-0 top-0 bottom-0 flex items-center z-10">
                                            <CountrySelector
                                                selectedCountry={selectedCountry}
                                                onSelect={(country) => {
                                                    setSelectedCountry(country);
                                                    setPhoneNumber('');
                                                }}
                                                disabled={loading}
                                                compact
                                            />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            maxLength={selectedCountry.maxLength}
                                            placeholder="Enter phone number"
                                            className="w-full h-14 pl-[120px] pr-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={showOtp ? handleVerifyOtp : handleSendCode}
                                disabled={loading || (showOtp ? otp.length !== 6 : phoneNumber.length < selectedCountry.minLength)}
                                className="w-full h-14 bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-primary/30 disabled:shadow-none transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{showOtp ? 'Verify Code' : 'Send Verification Code'}</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            {showOtp && (
                                <button
                                    onClick={() => {
                                        setShowOtp(false);
                                        setOtp('');
                                        setError(null);
                                    }}
                                    className="w-full text-primary font-semibold hover:underline"
                                >
                                    Change mobile number
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                            <span className="material-symbols-outlined text-lg">lock</span>
                            <span>Your health data is end-to-end encrypted</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recaptcha Container */}
            <div id="recaptcha-container"></div>
        </>
    );
}
