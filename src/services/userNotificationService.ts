import { apiClient } from './api';
import { AppNotification } from '../types';

export const userNotificationService = {
    getNotifications: async (profileId: string) => {
        return apiClient.get(`/notifications?profileId=${profileId}`);
    },
    addNotification: async (notification: Partial<AppNotification>) => {
        return apiClient.post('/notifications', notification);
    },
    markAsRead: async (id: string) => {
        return apiClient.patch(`/notifications/${id}/read`, {});
    }
};
