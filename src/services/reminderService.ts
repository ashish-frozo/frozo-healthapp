import { apiClient } from './api';
import { Reminder } from '../types';

export const reminderService = {
    getReminders: async (profileId: string) => {
        return apiClient.get(`/reminders?profileId=${profileId}`);
    },
    addReminder: async (reminder: Partial<Reminder>) => {
        return apiClient.post('/reminders', reminder);
    },
    toggleReminder: async (id: string) => {
        return apiClient.patch(`/reminders/${id}/toggle`);
    }
};
