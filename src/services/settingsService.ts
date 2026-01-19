import { apiClient } from './api';

export interface UserSettings {
    id: string;
    phoneNumber: string;
    preferredLanguage: 'english' | 'hindi' | 'hinglish';
}

export const settingsService = {
    // Get user settings
    getSettings: async (): Promise<UserSettings> => {
        return apiClient.get('/auth/settings');
    },

    // Update user settings
    updateSettings: async (settings: Partial<Pick<UserSettings, 'preferredLanguage'>>): Promise<{ message: string; user: UserSettings }> => {
        return apiClient.patch('/auth/settings', settings);
    },
};
