import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { CountrySelector, DEFAULT_COUNTRY, Country } from '../components/ui/CountrySelector';
import { useBiometric } from '../hooks/useBiometric';
import { hapticService } from '../services/hapticService';

export function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [showBiometric, setShowBiometric] = useState(false);
    const navigate = useNavigate();
    const { dispatch, syncData } = useApp();
    const biometric = useBiometric();
    const location = useLocation();

    // Determine mode from query params: /login?mode=login or /login?mode=signup
    const queryParams = new URLSearchParams(location.search);
    const mode = (queryParams.get('mode') as 'login' | 'signup') || 'signup';

    const isLogin = mode === 'login';

    useEffect(() => {
        // Check for saved biometric credentials
        checkBiometricAvailability();

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

    const checkBiometricAvailability = async () => {
        if (biometric.hasSavedCredentials && biometric.isAvailable) {
            setShowBiometric(true);
        }
    };

    const handleBiometricLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // Authenticate with biometric
            const authResult = await biometric.authenticate('Log in to KinCare');

            if (!authResult.success) {
                setError(authResult.error || 'Biometric authentication failed');
                setShowBiometric(false);
                return;
            }

            // Get saved credentials
            const deviceToken = await biometric.getDeviceToken();
            const savedPhone = await biometric.getSavedPhoneNumber();

            if (!deviceToken || !savedPhone) {
                setError('Saved credentials not found. Please log in again.');
                setShowBiometric(false);
                await biometric.disableBiometric();
                return;
            }

            // Call backend biometric login endpoint
            const response = await authService.biometricLogin(deviceToken);

            if (response.user) {
                await hapticService.success();
                console.log('Biometric login successful!', response.user);
                navigate('/');
            } else {
                throw new Error('Login failed - no user data returned');
            }

        } catch (err: any) {
            console.error('Biometric login error:', err);

            // Handle expired token
            if (err.message?.includes('expired')) {
                setError('Your biometric login has expired. Please log in again.');
                await biometric.disableBiometric();
                setShowBiometric(false);
            } else {
                setError(err.message || 'Biometric login failed');
            }

            await hapticService.error();
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (key: string) => {
        hapticService.light(); // Add haptic feedback
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
                const fullPhone = `${selectedCountry.dialCode}${phoneNumber}`;

                // Check if user exists on backend first
                console.log('Checking user existence...');
                const checkRes = await authService.checkUser(fullPhone);

                if (isLogin && !checkRes.exists) {
                    setError("Account not found. Please click 'Get Started' to create an account.");
                    setLoading(false);
                    return;
                }

                if (!isLogin && checkRes.exists) {
                    setError("This number is already registered. Please click 'Log In' to continue.");
                    setLoading(false);
                    return;
                }

                const appVerifier = (window as any).recaptchaVerifier;
                console.log('Sending OTP via Firebase...');
                const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
                setConfirmationResult(result);
                setShowOtp(true);
            } catch (err: any) {
                console.error('Login Send Code Error:', err);
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

                const isFullyRegistered = response.user.profiles &&
                    response.user.profiles.length > 0 &&
                    !(response.user.profiles.length === 1 && response.user.profiles[0].name === 'New User');

                if (isFullyRegistered) {
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
                {/* Main Content */}
                <div className="flex-1 flex flex-col px-6 pt-8 pb-6 overflow-y-auto">
                    {/* Header Icon */}
                    <div className="w-full flex justify-center mb-10">
                        <img src="/logo.png" alt="KinCare" className="w-28 h-28 rounded-3xl shadow-2xl shadow-primary/30 ring-4 ring-white/50 dark:ring-gray-800/50" />
                    </div>

                    {/* Headline */}
                    <div className="flex flex-col items-center text-center space-y-3 mb-10">
                        <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight">
                            {showBiometric
                                ? 'Welcome Back!'
                                : showOtp ? 'Enter Code' : (isLogin ? 'Welcome Back' : 'Join KinCare')
                            }
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg font-normal leading-snug max-w-[280px]">
                            {showBiometric
                                ? 'Use your biometric to log in quickly'
                                : showOtp
                                    ? `We sent a code to ${selectedCountry.dialCode} ${phoneNumber}`
                                    : (isLogin ? 'Log in to your health dashboard' : 'Start your family health journey today')
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
                        {showBiometric ? (
                            /* Biometric Login UI */
                            <>
                                {/* Biometric Button */}
                                <button
                                    onClick={handleBiometricLogin}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl h-32 text-lg font-bold shadow-2xl shadow-primary/40 disabled:shadow-none transition-all flex flex-col items-center justify-center gap-4"
                                >
                                    {loading ? (
                                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-6xl">fingerprint</span>
                                            <span>Tap to Login</span>
                                        </>
                                    )}
                                </button>

                                {/* Use Different Number */}
                                <button
                                    onClick={() => {
                                        setShowBiometric(false);
                                        hapticService.medium();
                                    }}
                                    className="w-full text-primary hover:text-primary-dark font-semibold text-base py-3 transition-colors"
                                >
                                    Use a different number
                                </button>
                            </>
                        ) : showOtp ? (
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

                        {/* Primary Button - Hide for biometric */}
                        {!showBiometric && (
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
                        )}
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

                {/* Numeric Keypad - Hide for biometric */}
                {!showBiometric && (
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
                    </div>
                )}
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
                                {showOtp ? 'Verify Code' : (isLogin ? 'Welcome Back' : 'Create Account')}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                {showOtp
                                    ? `Enter the code sent to ${selectedCountry.dialCode} ${phoneNumber}`
                                    : (isLogin ? 'Enter your mobile number to log in' : 'Enter your mobile number to get started')
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
