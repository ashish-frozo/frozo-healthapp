import { Profile, BPReading, GlucoseReading, Document, Reminder } from '../types';

// Generate unique IDs
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Default profile
export const defaultProfile: Profile = {
    id: 'profile-1',
    name: 'Robert',
    relationship: 'myself',
    dateOfBirth: '1985-03-15',
    createdAt: new Date().toISOString(),
};

// Sample BP readings
export const sampleBPReadings: BPReading[] = [
    { id: 'bp-1', profileId: 'profile-1', systolic: 118, diastolic: 78, pulse: 72, timestamp: new Date().toISOString(), status: 'normal' },
    { id: 'bp-2', profileId: 'profile-1', systolic: 132, diastolic: 85, pulse: 76, timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'elevated' },
    { id: 'bp-3', profileId: 'profile-1', systolic: 125, diastolic: 82, pulse: 70, timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'elevated' },
];

// Sample glucose readings
export const sampleGlucoseReadings: GlucoseReading[] = [
    { id: 'gl-1', profileId: 'profile-1', value: 105, context: 'fasting', timestamp: new Date().toISOString(), status: 'normal' },
    { id: 'gl-2', profileId: 'profile-1', value: 142, context: 'after_meal', timestamp: new Date(Date.now() - 43200000).toISOString(), status: 'elevated' },
    { id: 'gl-3', profileId: 'profile-1', value: 98, context: 'fasting', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'normal' },
];

// Sample documents
export const sampleDocuments: Document[] = [
    { id: 'doc-1', profileId: 'profile-1', title: 'Blood Test Results', category: 'lab_result', date: '2024-12-15', tags: ['blood', 'routine'], inVisitPack: true, createdAt: new Date().toISOString() },
    { id: 'doc-2', profileId: 'profile-1', title: 'Dr. Sharma Prescription', category: 'prescription', date: '2024-12-10', tags: ['hypertension'], inVisitPack: true, createdAt: new Date().toISOString() },
    { id: 'doc-3', profileId: 'profile-1', title: 'Hospital Bill', category: 'bill', date: '2024-11-28', tags: ['checkup'], inVisitPack: false, createdAt: new Date().toISOString() },
];

// Sample reminders
export const sampleReminders: Reminder[] = [
    { id: 'rem-1', profileId: 'profile-1', title: 'Take Amlodipine', type: 'medication', time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], completed: false },
    { id: 'rem-2', profileId: 'profile-1', title: 'Check Blood Pressure', type: 'reading', time: '09:00', daysOfWeek: [0, 3, 6], completed: true, completedAt: new Date().toISOString() },
    { id: 'rem-3', profileId: 'profile-1', title: 'Dr. Sharma Appointment', type: 'appointment', time: '14:30', completed: false },
];

// Helper functions
export function getBPStatus(systolic: number, diastolic: number): BPReading['status'] {
    if (systolic >= 180 || diastolic >= 120) return 'crisis';
    if (systolic >= 140 || diastolic >= 90) return 'high';
    if (systolic >= 130 || diastolic >= 80) return 'elevated';
    return 'normal';
}

export function getGlucoseStatus(value: number, context: GlucoseReading['context']): GlucoseReading['status'] {
    if (value < 70) return 'low';
    if (context === 'fasting') {
        if (value <= 100) return 'normal';
        if (value <= 125) return 'elevated';
        return 'high';
    } else {
        if (value <= 140) return 'normal';
        if (value <= 199) return 'elevated';
        return 'high';
    }
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
