import { Preferences } from '@capacitor/preferences';

const KEYS = {
    PHONE_NUMBER: 'saved_phone_number',
    DEVICE_TOKEN: 'device_token',
    BIOMETRIC_ENABLED: 'biometric_enabled',
    USER_ID: 'user_id',
};

class SecureStorageService {
    /**
     * Save phone number securely
     */
    async savePhoneNumber(phoneNumber: string): Promise<void> {
        await Preferences.set({
            key: KEYS.PHONE_NUMBER,
            value: phoneNumber,
        });
    }

    /**
     * Get saved phone number
     */
    async getPhoneNumber(): Promise<string | null> {
        const { value } = await Preferences.get({ key: KEYS.PHONE_NUMBER });
        return value;
    }

    /**
     * Save device token
     */
    async saveDeviceToken(token: string): Promise<void> {
        await Preferences.set({
            key: KEYS.DEVICE_TOKEN,
            value: token,
        });
    }

    /**
     * Get device token
     */
    async getDeviceToken(): Promise<string | null> {
        const { value } = await Preferences.get({ key: KEYS.DEVICE_TOKEN });
        return value;
    }

    /**
     * Save user ID
     */
    async saveUserId(userId: string): Promise<void> {
        await Preferences.set({
            key: KEYS.USER_ID,
            value: userId,
        });
    }

    /**
     * Get user ID
     */
    async getUserId(): Promise<string | null> {
        const { value } = await Preferences.get({ key: KEYS.USER_ID });
        return value;
    }

    /**
     * Enable/disable biometric authentication
     */
    async setBiometricEnabled(enabled: boolean): Promise<void> {
        await Preferences.set({
            key: KEYS.BIOMETRIC_ENABLED,
            value: enabled.toString(),
        });
    }

    /**
     * Check if biometric is enabled
     */
    async isBiometricEnabled(): Promise<boolean> {
        const { value } = await Preferences.get({ key: KEYS.BIOMETRIC_ENABLED });
        return value === 'true';
    }

    /**
     * Check if user has saved credentials
     */
    async hasSavedCredentials(): Promise<boolean> {
        const phoneNumber = await this.getPhoneNumber();
        const deviceToken = await this.getDeviceToken();
        const biometricEnabled = await this.isBiometricEnabled();

        return !!(phoneNumber && deviceToken && biometricEnabled);
    }

    /**
     * Clear all stored data (on logout)
     */
    async clearAll(): Promise<void> {
        await Promise.all([
            Preferences.remove({ key: KEYS.PHONE_NUMBER }),
            Preferences.remove({ key: KEYS.DEVICE_TOKEN }),
            Preferences.remove({ key: KEYS.BIOMETRIC_ENABLED }),
            Preferences.remove({ key: KEYS.USER_ID }),
        ]);
    }

    /**
     * Get last 4 digits of saved phone number
     */
    async getPhoneNumberLast4(): Promise<string | null> {
        const phoneNumber = await this.getPhoneNumber();
        if (!phoneNumber || phoneNumber.length < 4) return null;
        return phoneNumber.slice(-4);
    }
}

export const secureStorageService = new SecureStorageService();
