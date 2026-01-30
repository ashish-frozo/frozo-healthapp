import { apiClient } from './api';

export const authService = {
    sendOTP: async (phoneNumber: string) => {
        return apiClient.post('/auth/send-otp', { phoneNumber });
    },

    verifyOTP: async (idToken: string) => {
        const response = await apiClient.post('/auth/verify-otp', { idToken });
        if (response.token && response.user) {
            apiClient.setAuth(response.token, response.user.id);
        }
        return response;
    },

    checkUser: async (phoneNumber: string) => {
        return apiClient.post('/auth/check', { phoneNumber });
    },

    logout: () => {
        apiClient.clearAuth();
        localStorage.removeItem('family-health-app-state');
    },

    /**
     * Generate a device token for biometric authentication
     * Call this after successful OTP login when user enables biometric
     */
    generateDeviceToken: async (idToken: string, deviceInfo: {
        deviceId: string;
        platform: 'android' | 'ios';
        model?: string;
        osVersion?: string;
    }) => {
        const response = await apiClient.post('/auth/device-token', {
            idToken,
            deviceInfo,
        });
        return response;
    },

    /**
     * Login using biometric authentication (device token)
     */
    biometricLogin: async (deviceToken: string) => {
        const response = await apiClient.post('/auth/biometric-login', {
            deviceToken,
        });
        if (response.token && response.user) {
            apiClient.setAuth(response.token, response.user.id);
        }
        return response;
    },

    /**
     * List all device tokens for the current user
     */
    listDevices: async (idToken: string) => {
        const response = await apiClient.post('/auth/devices', { idToken });
        return response;
    },

    /**
     * Revoke a specific device token
     */
    revokeDevice: async (idToken: string, deviceId: string) => {
        const response = await apiClient.post('/auth/revoke-device', {
            idToken,
            deviceId,
        });
        return response;
    },
};
