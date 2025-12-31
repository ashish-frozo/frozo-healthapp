import { apiClient } from './api';
import { Profile } from '../types';

export const profileService = {
    getProfiles: async () => {
        return apiClient.get('/profiles');
    },
    createProfile: async (profile: Partial<Profile>) => {
        return apiClient.post('/profiles', profile);
    },
    updateProfile: async (id: string, profile: Partial<Profile>) => {
        return apiClient.put(`/profiles/${id}`, profile);
    },
    getFamilyOverview: async () => {
        return apiClient.get('/family/overview');
    },
    sendNudge: async (targetProfileId: string, message: string) => {
        return apiClient.post('/family/nudge', { targetProfileId, message });
    }
};
