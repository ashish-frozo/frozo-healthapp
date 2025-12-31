// User Profile
export interface Profile {
    id: string;
    name: string;
    relationship: 'myself' | 'spouse' | 'partner' | 'child' | 'parent' | 'other';
    dateOfBirth: string;
    avatarUrl?: string;
    role: 'caregiver' | 'dependent';
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
    };
    createdAt: string;
}

// Blood Pressure Reading
export interface BPReading {
    id: string;
    profileId: string;
    systolic: number;
    diastolic: number;
    pulse?: number;
    timestamp: string;
    status: 'normal' | 'elevated' | 'high' | 'low';
}

// Glucose Reading
export interface GlucoseReading {
    id: string;
    profileId: string;
    value: number;
    context: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime';
    timestamp: string;
    status: 'normal' | 'high' | 'low';
}

// Document
export interface Document {
    id: string;
    profileId: string;
    title: string;
    category: 'prescription' | 'lab_result' | 'bill' | 'insurance' | 'other';
    date: string;
    thumbnailUrl?: string;
    fileUrl?: string;
    tags: string[];
    inVisitPack: boolean;
    createdAt: string;
}

// Reminder
export interface Reminder {
    id: string;
    profileId: string;
    title: string;
    description?: string;
    time: string;
    completed: boolean;
    completedAt?: string;
}

// Clinic Share Link
export interface ClinicLink {
    id: string;
    profileId: string;
    url: string;
    expiresAt: string;
    active: boolean;
    createdAt: string;
}

// Symptom
export interface Symptom {
    id: string;
    profileId: string;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    notes?: string;
    timestamp: string;
}

// Notification
export interface AppNotification {
    id: string;
    profileId: string;
    title: string;
    message: string;
    type: 'insight' | 'reminder' | 'security' | 'system';
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
    timestamp: string;
    actionUrl?: string;
}

// User
export interface User {
    id: string;
    phoneNumber: string;
    profiles?: Profile[];
    createdAt: string;
}

// App State
export interface AppState {
    profiles: Profile[];
    currentProfileId: string | null;
    bpReadings: BPReading[];
    glucoseReadings: GlucoseReading[];
    documents: Document[];
    reminders: Reminder[];
    clinicLinks: ClinicLink[];
    symptoms: Symptom[];
    notifications: AppNotification[];
    familyOverview: any[];
    darkMode: boolean;
    isAuthenticated: boolean;
    phoneNumber: string | null;
    user: User | null;
}

// Helper types
export type HealthReading = BPReading | GlucoseReading;

export type ReadingType = 'bp' | 'glucose' | 'all';

export type DateRange = '7d' | '30d' | '90d' | 'custom';

export type ReportType = 'doctor_brief' | 'visit_pack';

export type TimePeriod = '30d' | '90d' | 'custom';
