import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Profile, BPReading, GlucoseReading, Document, Reminder, ClinicLink, Symptom, AppNotification } from '../types';
import {
    sampleProfiles,
    sampleBPReadings,
    sampleGlucoseReadings,
    sampleDocuments,
    sampleReminders,
    sampleSymptoms,
    sampleNotifications,
    generateId,
    getBPStatus,
    getGlucoseStatus,
    defaultProfile,
} from '../data/mockData';
import { notificationService } from '../services/notificationService';
import { healthService } from '../services/healthService';
import { profileService } from '../services/profileService';
import { reminderService } from '../services/reminderService';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';

// Initial state
const initialState: AppState = {
    profiles: sampleProfiles,
    currentProfileId: 'profile-2', // Sarah (Caregiver) as default
    bpReadings: sampleBPReadings,
    glucoseReadings: sampleGlucoseReadings,
    documents: sampleDocuments,
    reminders: sampleReminders,
    clinicLinks: [],
    symptoms: sampleSymptoms,
    notifications: sampleNotifications,
    familyOverview: [],
    darkMode: false,
    isAuthenticated: false,
    phoneNumber: null,
    user: null,
};

// Action types
type Action =
    | { type: 'LOAD_STATE'; payload: Partial<AppState> }
    | { type: 'SET_AUTHENTICATED'; payload: { authenticated: boolean; phoneNumber?: string; user?: any } }
    | { type: 'ADD_PROFILE'; payload: Profile }
    | { type: 'SET_CURRENT_PROFILE'; payload: string }
    | { type: 'UPDATE_PROFILE'; payload: Profile }
    | { type: 'REMOVE_PROFILE'; payload: string }
    | { type: 'ADD_BP_READING'; payload: BPReading }
    | { type: 'ADD_GLUCOSE_READING'; payload: GlucoseReading }
    | { type: 'ADD_DOCUMENT'; payload: Document }
    | { type: 'UPDATE_DOCUMENT'; payload: Document }
    | { type: 'DELETE_DOCUMENT'; payload: string }
    | { type: 'ADD_REMINDER'; payload: Reminder }
    | { type: 'TOGGLE_REMINDER'; payload: string }
    | { type: 'ADD_CLINIC_LINK'; payload: ClinicLink }
    | { type: 'REVOKE_CLINIC_LINK'; payload: string }
    | { type: 'ADD_SYMPTOM'; payload: Symptom }
    | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
    | { type: 'MARK_NOTIFICATION_READ'; payload: string }
    | { type: 'CLEAR_NOTIFICATIONS' }
    | { type: 'TOGGLE_DARK_MODE' }
    | { type: 'LOAD_DEMO_DATA' }
    | { type: 'SYNC_DATA'; payload: AppState }
    | { type: 'LOGOUT' };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'LOAD_STATE':
            return { ...state, ...action.payload };

        case 'SET_AUTHENTICATED':
            return {
                ...state,
                isAuthenticated: action.payload.authenticated,
                phoneNumber: action.payload.phoneNumber || null,
                user: action.payload.user || null
            };

        case 'ADD_PROFILE':
            return {
                ...state,
                profiles: [...state.profiles, action.payload],
                currentProfileId: action.payload.id,
            };

        case 'SET_CURRENT_PROFILE':
            return { ...state, currentProfileId: action.payload };

        case 'UPDATE_PROFILE':
            return {
                ...state,
                profiles: state.profiles.map(p =>
                    p.id === action.payload.id ? action.payload : p
                ),
            };

        case 'REMOVE_PROFILE':
            return {
                ...state,
                profiles: state.profiles.filter(p => p.id !== action.payload),
            };

        case 'ADD_BP_READING':
            return {
                ...state,
                bpReadings: [action.payload, ...state.bpReadings],
            };

        case 'ADD_GLUCOSE_READING':
            return {
                ...state,
                glucoseReadings: [action.payload, ...state.glucoseReadings],
            };

        case 'ADD_DOCUMENT':
            return {
                ...state,
                documents: [action.payload, ...state.documents],
            };

        case 'UPDATE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map(d =>
                    d.id === action.payload.id ? action.payload : d
                ),
            };

        case 'DELETE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.filter(d => d.id !== action.payload),
            };

        case 'ADD_REMINDER':
            return {
                ...state,
                reminders: [...state.reminders, action.payload],
            };

        case 'TOGGLE_REMINDER':
            return {
                ...state,
                reminders: state.reminders.map(r =>
                    r.id === action.payload
                        ? { ...r, completed: !r.completed, completedAt: !r.completed ? new Date().toISOString() : undefined }
                        : r
                ),
            };

        case 'ADD_CLINIC_LINK':
            return {
                ...state,
                clinicLinks: [...state.clinicLinks, action.payload],
            };

        case 'REVOKE_CLINIC_LINK':
            return {
                ...state,
                clinicLinks: state.clinicLinks.map(l =>
                    l.id === action.payload ? { ...l, active: false } : l
                ),
            };

        case 'ADD_SYMPTOM':
            return {
                ...state,
                symptoms: [action.payload, ...state.symptoms],
            };



        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
            };

        case 'MARK_NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, isRead: true } : n
                ),
            };

        case 'CLEAR_NOTIFICATIONS':
            return {
                ...state,
                notifications: [],
            };

        case 'TOGGLE_DARK_MODE':
            return { ...state, darkMode: !state.darkMode };

        case 'LOAD_DEMO_DATA':
            return {
                ...state,
                profiles: [defaultProfile],
                currentProfileId: defaultProfile.id,
                bpReadings: sampleBPReadings,
                glucoseReadings: sampleGlucoseReadings,
                documents: sampleDocuments,
                reminders: sampleReminders,
                symptoms: sampleSymptoms,
                notifications: sampleNotifications,
            };

        case 'SYNC_DATA':
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
            };

        case 'LOGOUT':
            return { ...initialState };

        default:
            return state;
    }
}

// Context
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    // Helper functions
    currentProfile: Profile | null;
    addBPReading: (systolic: number, diastolic: number, pulse?: number) => void;
    addGlucoseReading: (value: number, context: GlucoseReading['context']) => void;
    addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
    toggleDocumentVisitPack: (id: string) => void;
    createClinicLink: () => ClinicLink;
    addSymptom: (name: string, severity: Symptom['severity'], notes?: string) => void;
    sendNudge: (targetProfileId: string, message: string) => void;
    updateMedicalID: (profileId: string, data: Partial<Profile>) => void;
    addNotification: (title: string, message: string, type: AppNotification['type'], priority: AppNotification['priority'], actionUrl?: string) => void;
    markNotificationRead: (id: string) => void;
    syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// Local storage key
const STORAGE_KEY = 'family-health-app-state';

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);

                // Migrate profiles to include new fields if missing
                const migratedProfiles = (parsed.profiles || initial.profiles).map((p: Profile) => {
                    const initialP = initial.profiles.find(ip => ip.id === p.id);
                    return {
                        ...initialP, // Use initial values for new fields
                        ...p,        // Override with saved values for existing fields
                        role: p.role || (p.relationship === 'myself' ? 'caregiver' : 'dependent'),
                    };
                });

                // If we have new profiles in initial that aren't in parsed, add them
                const allProfiles = [...migratedProfiles];
                initial.profiles.forEach(ip => {
                    if (!allProfiles.find(p => p.id === ip.id)) {
                        allProfiles.push(ip);
                    }
                });

                return {
                    ...initial,
                    ...parsed,
                    profiles: allProfiles,
                };
            } catch (e) {
                console.error('Failed to load saved state:', e); // Added console.error for clarity
                return initial;
            }
        }
        return initial;
    });

    // The original useEffect for loading state is now redundant and removed.
    // The new lazy initializer handles loading and migration.

    // Save state to localStorage on change
    useEffect(() => {
        if (state.isAuthenticated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            notificationService.requestPermission();
        }
    }, [state]);

    // Apply dark mode class to document
    useEffect(() => {
        if (state.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [state.darkMode]);

    // Socket Connection & Real-time Updates
    useEffect(() => {
        if (state.isAuthenticated && state.user?.id) {
            socketService.connect(state.user.id);

            // Listen for new nudges
            socketService.on('new_nudge', (data: any) => {
                dispatch({ type: 'ADD_NOTIFICATION', payload: data.notification });

                // Show a system notification if possible
                notificationService.sendPush('New Nudge', {
                    body: data.notification.message,
                    tag: 'nudge'
                });
            });

            // Listen for new BP readings (from WhatsApp or other sources)
            socketService.on('bp:new', (data: any) => {
                console.log('🔄 Real-time BP reading received:', data);
                dispatch({ type: 'ADD_BP_READING', payload: data });

                // Show notification
                notificationService.sendPush('New BP Reading', {
                    body: `${data.systolic}/${data.diastolic} mmHg - ${data.status}`,
                    tag: 'bp-reading'
                });
            });

            // Listen for new Glucose readings
            socketService.on('glucose:new', (data: any) => {
                console.log('🔄 Real-time Glucose reading received:', data);
                dispatch({ type: 'ADD_GLUCOSE_READING', payload: data });

                // Show notification
                notificationService.sendPush('New Glucose Reading', {
                    body: `${data.value} mg/dL - ${data.status}`,
                    tag: 'glucose-reading'
                });
            });

            // Listen for new Symptoms
            socketService.on('symptom:new', (data: any) => {
                console.log('🔄 Real-time Symptom received:', data);
                dispatch({ type: 'ADD_SYMPTOM', payload: data });
            });

            return () => {
                socketService.off('new_nudge');
                socketService.off('bp:new');
                socketService.off('glucose:new');
                socketService.off('symptom:new');
                socketService.disconnect();
            };
        }
    }, [state.isAuthenticated, state.user?.id]);

    // Data Gap Nudge (Admin Assistant)
    useEffect(() => {
        if (!state.isAuthenticated || state.notifications.some(n => n.title === 'Check-in Reminder')) return;

        const lastBP = state.bpReadings[0];
        const lastGlucose = state.glucoseReadings[0];
        const lastReadingDate = lastBP && lastGlucose
            ? new Date(Math.max(new Date(lastBP.timestamp).getTime(), new Date(lastGlucose.timestamp).getTime()))
            : lastBP ? new Date(lastBP.timestamp) : lastGlucose ? new Date(lastGlucose.timestamp) : null;

        if (lastReadingDate) {
            const daysSinceLast = (Date.now() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLast > 3) {
                addNotification(
                    'Check-in Reminder',
                    "It's been a few days since your last reading. Consistency helps us track your health better!",
                    'system',
                    'medium',
                    '/quick-add'
                );
            }
        }
    }, [state.isAuthenticated]);

    // Get current profile
    const currentProfile = state.profiles.find(p => p.id === state.currentProfileId) || null;

    // Helper functions
    const addNotification = (title: string, message: string, type: AppNotification['type'], priority: AppNotification['priority'], actionUrl?: string) => {
        const notification: AppNotification = {
            id: generateId(),
            profileId: state.currentProfileId!,
            title,
            message,
            type,
            priority,
            isRead: false,
            timestamp: new Date().toISOString(),
            actionUrl,
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    };

    const addBPReading = (systolic: number, diastolic: number, pulse?: number) => {
        const reading: BPReading = {
            id: generateId(),
            profileId: state.currentProfileId!,
            systolic,
            diastolic,
            pulse,
            timestamp: new Date().toISOString(),
            status: getBPStatus(systolic, diastolic),
        };
        dispatch({ type: 'ADD_BP_READING', payload: reading });

        // Safety Net Alert
        if (reading.status === 'high' || reading.status === 'elevated') {
            addNotification(
                'High BP Alert',
                `Your reading of ${systolic}/${diastolic} is ${reading.status}. Consider resting and checking again in an hour.`,
                'reminder',
                'high',
                '/bp-entry'
            );
            notificationService.sendPush('High BP Alert', { body: `Your reading of ${systolic}/${diastolic} is ${reading.status}.` });
        }

        // Health Coach: Streak Alert
        const recentReadings = state.bpReadings.filter(r => r.profileId === state.currentProfileId).slice(0, 2);
        if (recentReadings.length === 2) {
            addNotification(
                '3-Day Streak!',
                'Great job logging your blood pressure for 3 days straight. Keep it up!',
                'insight',
                'low'
            );
        }
    };

    const addGlucoseReading = (value: number, context: GlucoseReading['context']) => {
        const reading: GlucoseReading = {
            id: generateId(),
            profileId: state.currentProfileId!,
            value,
            context,
            timestamp: new Date().toISOString(),
            status: getGlucoseStatus(value, context),
        };
        dispatch({ type: 'ADD_GLUCOSE_READING', payload: reading });

        // Safety Net Alert
        if (reading.status === 'high' || reading.status === 'low') {
            addNotification(
                'Glucose Alert',
                `Your glucose level is ${reading.status} (${value} mg/dL). Please follow your doctor's advice for ${reading.status} glucose.`,
                'reminder',
                'high',
                '/glucose-entry'
            );
            notificationService.sendPush('Glucose Alert', { body: `Your glucose level is ${reading.status} (${value} mg/dL).` });
        }
    };

    const addDocument = (doc: Omit<Document, 'id' | 'createdAt'>) => {
        const document: Document = {
            ...doc,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_DOCUMENT', payload: document });

        // Admin Assistant: Document Follow-up
        if (doc.category === 'lab_result') {
            addNotification(
                'New Lab Result',
                'We detected a new lab report. Would you like AI to translate it for you?',
                'system',
                'medium',
                '/documents'
            );
        }
    };

    const toggleDocumentVisitPack = async (id: string) => {
        const doc = state.documents.find(d => d.id === id);
        if (doc) {
            try {
                // Use the specific visit-pack update endpoint
                const updatedDoc = await healthService.updateDocumentVisitPack(id, !doc.inVisitPack);
                dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDoc });
            } catch (error) {
                console.error('Failed to toggle visit pack:', error);
            }
        }
    };

    const createClinicLink = (): ClinicLink => {
        const link: ClinicLink = {
            id: generateId(),
            profileId: state.currentProfileId!,
            url: `health.log/${generateId().slice(0, 8)}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
            active: true,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_CLINIC_LINK', payload: link });

        // Add notification (Security)
        addNotification(
            'Clinic Link Created',
            'A secure link to your health data has been created. You can revoke this at any time.',
            'security',
            'high',
            '/clinic-link'
        );
        notificationService.sendPush('Security Alert', { body: 'A new clinic sharing link has been created.' });

        return link;
    };

    const addSymptom = (name: string, severity: Symptom['severity'], notes?: string) => {
        const symptom: Symptom = {
            id: generateId(),
            profileId: state.currentProfileId!,
            name,
            severity,
            notes,
            timestamp: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_SYMPTOM', payload: symptom });
    };

    const syncData = async () => {
        try {
            // 1. Fetch profiles from backend
            const profiles = await profileService.getProfiles();

            // 2. Fetch all data for the current profile (or first profile)
            const currentProfileId = profiles.length > 0 ? profiles[0].id : null;

            let bpReadings = [];
            let glucoseReadings = [];
            let symptoms = [];
            let documents = [];
            let reminders = [];

            if (currentProfileId) {
                const [bp, glucose, symp, docs, rems] = await Promise.all([
                    healthService.getBPReadings(currentProfileId),
                    healthService.getGlucoseReadings(currentProfileId),
                    healthService.getSymptoms(currentProfileId),
                    healthService.getDocuments(currentProfileId),
                    reminderService.getReminders(currentProfileId),
                ]);
                bpReadings = bp;
                glucoseReadings = glucose;
                symptoms = symp;
                documents = docs;
                reminders = rems;
            }

            const familyOverview = await profileService.getFamilyOverview();

            dispatch({
                type: 'SYNC_DATA',
                payload: {
                    ...state,
                    profiles,
                    currentProfileId,
                    bpReadings,
                    glucoseReadings,
                    symptoms,
                    documents,
                    reminders,
                    familyOverview,
                }
            });
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    };

    return (
        <AppContext.Provider value={{
            state,
            dispatch,
            currentProfile,
            addBPReading,
            addGlucoseReading,
            addDocument,
            toggleDocumentVisitPack,
            createClinicLink,
            addSymptom,
            sendNudge: async (targetProfileId: string, message: string) => {
                const targetProfile = state.profiles.find(p => p.id === targetProfileId);

                try {
                    await profileService.sendNudge(targetProfileId, message);

                    // Also notify the sender that the nudge was sent
                    addNotification(
                        'Nudge Sent',
                        `Your message has been sent to ${targetProfile?.name.split(' ')[0]}.`,
                        'system',
                        'low'
                    );
                } catch (error) {
                    console.error('Send nudge error:', error);
                    alert('Failed to send nudge. Please try again.');
                }
            },
            updateMedicalID: async (profileId: string, data: Partial<Profile>) => {
                const profile = state.profiles.find(p => p.id === profileId);
                if (profile) {
                    try {
                        const updatedProfile = await profileService.updateProfile(profileId, data);
                        dispatch({ type: 'UPDATE_PROFILE', payload: updatedProfile });
                    } catch (error) {
                        console.error('Update medical ID error:', error);
                        alert('Failed to update medical ID. Please try again.');
                    }
                }
            },
            addNotification,
            markNotificationRead: (id: string) => {
                dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
            },
            syncData,
        }}>
            {children}
        </AppContext.Provider>
    );
}

// Hook
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
