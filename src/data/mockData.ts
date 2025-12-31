import { Profile, BPReading, GlucoseReading, Document, Reminder, Symptom, AppNotification } from '../types';

// Generate unique ID
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Default profile for demo
export const defaultProfile: Profile = {
    id: 'profile-1',
    name: 'Robert Wilson',
    relationship: 'parent',
    dateOfBirth: '1955-03-15',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs8qZy38TTLIOQdoLQuKtfN44OXkTTTeMkw7rnkWUVZTqKO6U5kQGyiTft5izWS0VT4Ta6TACp_oXGi1KC1q7ATSWiU0zcmgrTa6f6kfDYMHucLx1qT9iMn0zF3loNZnxlVOTehN-VbcOwgKP23sHU6Zn5y49VVEHu5B30VpDsH5PWw8veYC6ppsqoJMKOK0210etp8w8kIkhKB_2t99pflfEOKYHt5TqjNdYtzDc__0IIXpCU2UoFRxGQu9rWcn5sKplfkEpeBvg',
    role: 'dependent',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    emergencyContact: {
        name: 'Sarah Wilson',
        phone: '+1 (555) 123-4567',
    },
    createdAt: new Date().toISOString(),
};

export const sampleProfiles: Profile[] = [
    defaultProfile,
    {
        id: 'profile-2',
        name: 'Sarah Wilson',
        relationship: 'myself',
        dateOfBirth: '1985-06-20',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        role: 'caregiver',
        bloodType: 'A+',
        emergencyContact: {
            name: 'Robert Wilson',
            phone: '+1 (555) 987-6543',
        },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'profile-3',
        name: 'Emma Wilson',
        relationship: 'child',
        dateOfBirth: '2015-08-10',
        avatarUrl: 'https://images.unsplash.com/photo-1514173040522-3f9f3ef3e073?w=400&h=400&fit=crop',
        role: 'dependent',
        bloodType: 'O+',
        allergies: ['Peanuts'],
        emergencyContact: {
            name: 'Sarah Wilson',
            phone: '+1 (555) 123-4567',
        },
        createdAt: new Date().toISOString(),
    },
];

// Sample BP readings
export const sampleBPReadings: BPReading[] = [
    {
        id: 'bp-1',
        profileId: 'profile-1',
        systolic: 118,
        diastolic: 78,
        pulse: 72,
        timestamp: new Date().toISOString(),
        status: 'normal',
    },
    {
        id: 'bp-2',
        profileId: 'profile-1',
        systolic: 128,
        diastolic: 82,
        pulse: 75,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'normal',
    },
    {
        id: 'bp-3',
        profileId: 'profile-1',
        systolic: 142,
        diastolic: 90,
        pulse: 78,
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'elevated',
    },
];

// Sample Glucose readings
export const sampleGlucoseReadings: GlucoseReading[] = [
    {
        id: 'glucose-1',
        profileId: 'profile-1',
        value: 95,
        context: 'fasting',
        timestamp: new Date().toISOString(),
        status: 'normal',
    },
    {
        id: 'glucose-2',
        profileId: 'profile-1',
        value: 98,
        context: 'after_meal',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'normal',
    },
    {
        id: 'glucose-3',
        profileId: 'profile-1',
        value: 105,
        context: 'before_meal',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        status: 'normal',
    },
];

// Sample Documents
export const sampleDocuments: Document[] = [
    {
        id: 'doc-1',
        profileId: 'profile-1',
        title: 'Blood Test Results',
        category: 'lab_result',
        date: '2023-10-24',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkSrjiNwJ9P0SL0XxQMrmoa-pFarJjg3rrkZe4ug-nSZzzJc8X8RiE3WMSNXUTLFJidNlKsvcM0MK-kDcEnmnsqRj62waJCE9cHZ0jiZqKLskCC9dhm4DbH9PjyAnNbXB9axqNDOcnk7si3g3bDu5e-ThLWDn6bEU-Ddd5qqOfbGzMzdZdsIx-9VD-MXTeN-pgAhoc-PzMx0arpk4gzjdiXX1FkiT5oRrfXGtTWWdp3PeswXKI0B-2h0R2FrCzZcRK0Y2ZIaIlyqU',
        tags: ['Endocrinology', 'Routine'],
        inVisitPack: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'doc-2',
        profileId: 'profile-1',
        title: 'Cardiology Referral',
        category: 'insurance',
        date: '2023-09-12',
        thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkSrjiNwJ9P0SL0XxQMrmoa-pFarJjg3rrkZe4ug-nSZzzJc8X8RiE3WMSNXUTLFJidNlKsvcM0MK-kDcEnmnsqRj62waJCE9cHZ0jiZqKLskCC9dhm4DbH9PjyAnNbXB9axqNDOcnk7si3g3bDu5e-ThLWDn6bEU-Ddd5qqOfbGzMzdZdsIx-9VD-MXTeN-pgAhoc-PzMx0arpk4gzjdiXX1FkiT5oRrfXGtTWWdp3PeswXKI0B-2h0R2FrCzZcRK0Y2ZIaIlyqU',
        tags: ['Cardiology'],
        inVisitPack: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'doc-3',
        profileId: 'profile-1',
        title: 'Amoxicillin Rx',
        category: 'prescription',
        date: '2023-08-05',
        tags: ['Antibiotic'],
        inVisitPack: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'doc-4',
        profileId: 'profile-1',
        title: 'Visit Summary',
        category: 'other',
        date: '2023-07-10',
        tags: ['General'],
        inVisitPack: false,
        createdAt: new Date().toISOString(),
    },
];

// Sample Reminders
export const sampleReminders: Reminder[] = [
    {
        id: 'reminder-1',
        profileId: 'profile-1',
        title: 'Metformin - 500mg',
        time: '08:00',
        completed: true,
        completedAt: new Date().toISOString(),
    },
    {
        id: 'reminder-2',
        profileId: 'profile-1',
        title: 'Check Blood Pressure',
        time: '18:00',
        completed: false,
    },
    {
        id: 'reminder-3',
        profileId: 'profile-1',
        title: 'Evening Walk',
        description: '15 mins',
        time: '19:00',
        completed: false,
    },
];

// Sample Symptoms
export const sampleSymptoms: Symptom[] = [
    {
        id: 'symptom-1',
        profileId: 'profile-1',
        name: 'Headache',
        severity: 'mild',
        notes: 'Occurred in the afternoon after work',
        timestamp: new Date().toISOString(),
    },
    {
        id: 'symptom-2',
        profileId: 'profile-1',
        name: 'Dizziness',
        severity: 'moderate',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Sample Notifications
export const sampleNotifications: AppNotification[] = [
    {
        id: 'notif-1',
        profileId: 'profile-1',
        title: 'Weekly Insight Ready',
        message: 'Your AI health summary for the last 7 days is ready for review.',
        type: 'insight',
        priority: 'medium',
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: '/trends',
    },
    {
        id: 'notif-2',
        profileId: 'profile-1',
        title: 'Clinic Link Accessed',
        message: 'Your secure health link was just accessed by a healthcare provider.',
        type: 'security',
        priority: 'high',
        isRead: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-3',
        profileId: 'profile-1',
        title: 'Lab Result Translated',
        message: 'Your "Blood Test Results" have been simplified by AI.',
        type: 'insight',
        priority: 'low',
        isRead: false,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/documents',
    },
];

// Helper functions
export const getBPStatus = (systolic: number, diastolic: number): BPReading['status'] => {
    if (systolic < 90 || diastolic < 60) return 'low';
    if (systolic >= 140 || diastolic >= 90) return 'high';
    if (systolic >= 120 || diastolic >= 80) return 'elevated';
    return 'normal';
};

export const getGlucoseStatus = (value: number, context: GlucoseReading['context']): GlucoseReading['status'] => {
    if (context === 'fasting') {
        if (value < 70) return 'low';
        if (value > 100) return 'high';
        return 'normal';
    } else {
        if (value < 70) return 'low';
        if (value > 140) return 'high';
        return 'normal';
    }
};

export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isToday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
};

export const getDateLabel = (date: Date | string): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return formatDate(date);
};
