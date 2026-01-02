import { apiClient } from './api';
import { BPReading, GlucoseReading, Symptom } from '../types';

export const healthService = {
    // BP Readings
    getBPReadings: async (profileId: string) => {
        return apiClient.get(`/health/bp?profileId=${profileId}`);
    },
    addBPReading: async (reading: Partial<BPReading>) => {
        return apiClient.post('/health/bp', reading);
    },

    // Glucose Readings
    getGlucoseReadings: async (profileId: string) => {
        return apiClient.get(`/health/glucose?profileId=${profileId}`);
    },
    addGlucoseReading: async (reading: Partial<GlucoseReading>) => {
        return apiClient.post('/health/glucose', reading);
    },

    // Symptoms
    getSymptoms: async (profileId: string) => {
        return apiClient.get(`/health/symptoms?profileId=${profileId}`);
    },
    addSymptom: async (symptom: Partial<Symptom>) => {
        return apiClient.post('/health/symptoms', symptom);
    },

    // Documents
    getDocuments: async (profileId: string) => {
        return apiClient.get(`/documents?profileId=${profileId}`);
    },
    addDocument: async (document: FormData) => {
        return apiClient.post('/documents', document);
    },
    updateDocumentVisitPack: async (id: string, inVisitPack: boolean) => {
        return apiClient.patch(`/documents/${id}/visit-pack`, { inVisitPack });
    },

    // Bulk Sync (for migration)
    syncData: async (data: {
        bpReadings: any[];
        glucoseReadings: any[];
        symptoms: any[];
        profiles: any[];
    }) => {
        return apiClient.post('/health/sync', data);
    }
};
