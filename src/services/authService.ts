import { apiClient } from './api';

export const authService = {
    sendOTP: async (phoneNumber: string) => {
        return apiClient.post('/auth/send-otp', { phoneNumber });
    },

    verifyOTP: async (phoneNumber: string, otp: string) => {
        const response = await apiClient.post('/auth/verify-otp', { phoneNumber, otp });
        if (response.token && response.user) {
            apiClient.setAuth(response.token, response.user.id);
        }
        return response;
    },

    logout: () => {
        apiClient.clearAuth();
    }
};
