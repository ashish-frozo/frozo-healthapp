import { BiometricAuth, BiometryType, BiometryError } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricAvailability {
    isAvailable: boolean;
    biometryType: BiometryType;
    reason?: string;
}

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
}

class BiometricService {
    /**
     * Check if biometric authentication is available on this device
     */
    async checkAvailability(): Promise<BiometricAvailability> {
        // Only works on native platforms
        if (!Capacitor.isNativePlatform()) {
            return {
                isAvailable: false,
                biometryType: BiometryType.none,
                reason: 'Biometric auth only available on native platforms'
            };
        }

        try {
            const result = await BiometricAuth.checkBiometry();
            return {
                isAvailable: result.isAvailable,
                biometryType: result.biometryType,
                reason: result.reason
            };
        } catch (error) {
            console.error('Biometric availability check failed:', error);
            return {
                isAvailable: false,
                biometryType: BiometryType.none,
                reason: 'Failed to check biometric availability'
            };
        }
    }

    /**
     * Authenticate user with biometrics
     */
    async authenticate(reason: string = 'Authenticate to login'): Promise<BiometricAuthResult> {
        try {
            // Check availability first
            const availability = await this.checkAvailability();
            if (!availability.isAvailable) {
                return {
                    success: false,
                    error: availability.reason || 'Biometric authentication not available'
                };
            }

            // Perform authentication
            await BiometricAuth.authenticate({
                reason,
                cancelTitle: 'Cancel',
                allowDeviceCredential: true, // Allow PIN/password fallback
                iosFallbackTitle: 'Use Passcode',
                androidTitle: 'Biometric Login',
                androidSubtitle: 'Log in using your biometric credential',
                androidConfirmationRequired: false
            });

            return { success: true };
        } catch (error: any) {
            console.error('Biometric authentication failed:', error);

            // Handle specific error codes
            const errorCode = error.code || error.message || '';

            if (errorCode.includes('lockout') || errorCode.includes('locked')) {
                return {
                    success: false,
                    error: 'Too many failed attempts. Please try again later.'
                };
            } else if (errorCode.includes('cancel') || errorCode.includes('user')) {
                return {
                    success: false,
                    error: 'Authentication cancelled'
                };
            } else if (errorCode.includes('not enrolled') || errorCode.includes('unavailable')) {
                return {
                    success: false,
                    error: 'No biometric credentials enrolled. Please set up biometrics in your device settings.'
                };
            }

            return {
                success: false,
                error: error.message || 'Authentication failed'
            };
        }
    }

    /**
     * Get user-friendly biometry type name
     */
    getBiometryTypeName(type: BiometryType): string {
        switch (type) {
            case BiometryType.fingerprintAuthentication:
                return 'Fingerprint';
            case BiometryType.faceAuthentication:
                return 'Face Recognition';
            case BiometryType.irisAuthentication:
                return 'Iris Scan';
            case BiometryType.touchId:
                return 'Touch ID';
            case BiometryType.faceId:
                return 'Face ID';
            default:
                return 'Biometric';
        }
    }
}

export const biometricService = new BiometricService();
