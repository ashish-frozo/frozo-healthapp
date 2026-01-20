import { apiClient } from './api';

export interface EmergencyContact {
    name: string;
    phone: string;
    relationship?: string;
}

export interface AlertSettings {
    id: string;
    profileId: string;
    notifyOnHighBP: boolean;
    notifyOnLowBP: boolean;
    notifyOnHighGlucose: boolean;
    notifyOnLowGlucose: boolean;
    bpHighSystolic: number;
    bpHighDiastolic: number;
    bpLowSystolic: number;
    bpLowDiastolic: number;
    glucoseHighThreshold: number;
    glucoseLowThreshold: number;
    emergencyContacts: EmergencyContact[];
}

export interface EmergencyAlert {
    id: string;
    profileId: string;
    type: 'sos' | 'high_bp' | 'low_bp' | 'high_glucose' | 'low_glucose';
    message: string;
    latitude?: number;
    longitude?: number;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
    createdAt: string;
    profile?: {
        name: string;
        avatarUrl?: string;
    };
}

export const emergencyService = {
    // Trigger SOS alert
    async triggerSOS(profileId: string, location?: GeolocationPosition, message?: string): Promise<{ alert: EmergencyAlert; notifiedCount: number }> {
        const payload: any = { profileId };
        if (location) {
            payload.latitude = location.coords.latitude;
            payload.longitude = location.coords.longitude;
        }
        if (message) {
            payload.message = message;
        }
        return apiClient.post('/emergency/sos', payload);
    },

    // Get alert settings for a profile
    async getAlertSettings(profileId: string): Promise<AlertSettings> {
        return apiClient.get(`/emergency/settings/${profileId}`);
    },

    // Update alert settings
    async updateAlertSettings(profileId: string, settings: Partial<AlertSettings>): Promise<AlertSettings> {
        return apiClient.put(`/emergency/settings/${profileId}`, settings);
    },

    // Get emergency alerts for a household
    async getEmergencyAlerts(householdId: string): Promise<EmergencyAlert[]> {
        return apiClient.get(`/emergency/alerts/${householdId}`);
    },

    // Resolve an alert
    async resolveAlert(alertId: string): Promise<EmergencyAlert> {
        return apiClient.post(`/emergency/alerts/${alertId}/resolve`, {});
    },
};
