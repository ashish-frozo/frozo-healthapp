import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { authService } from '../services/authService';

export function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

    const { dispatch } = useApp();

    const handleKeyPress = (key: string) => {
        if (loading) return;
        if (step === 'phone') {
            if (key === 'del') {
                setPhone(p => p.slice(0, -1));
            } else if (phone.length < 10) {
                setPhone(p => p + key);
            }
        } else {
            if (key === 'del') {
                setOtp(o => o.slice(0, -1));
            } else if (otp.length < 6) {
                setOtp(o => o + key);
            }
        }
    };

    const handleSendOtp = async () => {
        if (phone.length !== 10) return;

        setLoading(true);
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const fullPhone = `+91${phone}`;
            const vId = await phoneProvider.verifyPhoneNumber(
                fullPhone,
                recaptchaVerifier.current!
            );
            setVerificationId(vId);
            setStep('otp');
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', error.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6 || !verificationId) return;

        setLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            const userCredential = await signInWithCredential(auth, credential);
            const idToken = await userCredential.user.getIdToken();

            // Verify with our backend
            const response = await authService.verifyOTP(idToken);

            dispatch({
                type: 'SET_AUTHENTICATED',
                payload: {
                    authenticated: true,
                    phoneNumber: phone,
                    user: response.user
                }
            });
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            Alert.alert('Error', error.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const formatPhone = (p: string) => {
        if (p.length <= 5) return p;
        return `${p.slice(0, 5)} ${p.slice(5)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
                attemptInvisibleVerification={true}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>❤️</Text>
                <Text style={styles.title}>
                    {step === 'phone' ? 'Welcome to Family Health' : 'Enter Verification Code'}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 'phone'
                        ? 'Track health vitals for your loved ones.'
                        : `We sent a code to +91 ${formatPhone(phone)}`}
                </Text>
            </View>

            {/* Input Display */}
            <View style={styles.inputContainer}>
                {step === 'phone' ? (
                    <View style={styles.phoneDisplay}>
                        <Text style={styles.countryCode}>+91</Text>
                        <Text style={styles.phoneNumber}>
                            {formatPhone(phone) || 'Enter phone number'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.otpContainer}>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={[styles.otpBox, otp[i] && styles.otpBoxFilled]}>
                                <Text style={styles.otpText}>{otp[i] || ''}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Action Button */}
            <TouchableOpacity
                style={[styles.button, (step === 'phone' ? phone.length !== 10 : otp.length !== 6) && styles.buttonDisabled]}
                onPress={step === 'phone' ? handleSendOtp : handleVerify}
                disabled={loading || (step === 'phone' ? phone.length !== 10 : otp.length !== 6)}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {step === 'phone' ? 'Send Verification Code' : 'Verify Code'}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Keypad */}
            <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.key, !key && styles.keyEmpty]}
                        onPress={() => key && handleKeyPress(key)}
                        disabled={!key || loading}
                    >
                        <Text style={styles.keyText}>
                            {key === 'del' ? '⌫' : key}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7f8',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0d131b',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#4c6c9a',
        textAlign: 'center',
    },
    inputContainer: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    phoneDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#2b7cee',
    },
    countryCode: {
        fontSize: 24,
        fontWeight: '600',
        color: '#0d131b',
        marginRight: 12,
    },
    phoneNumber: {
        fontSize: 24,
        fontWeight: '600',
        color: '#0d131b',
        letterSpacing: 2,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    otpBox: {
        width: 48,
        height: 56,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpBoxFilled: {
        borderColor: '#2b7cee',
        backgroundColor: '#f0f7ff',
    },
    otpText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0d131b',
    },
    button: {
        backgroundColor: '#2b7cee',
        marginHorizontal: 24,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        height: 60,
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        paddingTop: 32,
        justifyContent: 'center',
    },
    key: {
        width: '30%',
        aspectRatio: 1.6,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
    },
    keyEmpty: {
        opacity: 0,
    },
    keyText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#0d131b',
    },
});
