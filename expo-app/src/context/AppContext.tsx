import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Profile, BPReading, GlucoseReading, Document, Reminder, ClinicLink, Symptom, AppNotification, User } from '../types';
import { apiClient } from '../services/api';
import { authService } from '../services/authService';
import { healthService } from '../services/healthService';
import { profileService } from '../services/profileService';
import { reminderService } from '../services/reminderService';
import { userNotificationService } from '../services/userNotificationService';
import { notificationService } from '../services/notificationService';

const initialState: AppState = {
    profiles: [],
    currentProfileId: null,
    bpReadings: [],
    glucoseReadings: [],
    documents: [],
    reminders: [],
    clinicLinks: [],
    symptoms: [],
    notifications: [],
    darkMode: false,
    isAuthenticated: false,
    phoneNumber: null,
    user: null,
};

type Action =
    | { type: 'LOAD_STATE'; payload: Partial<AppState> }
    | { type: 'SET_AUTHENTICATED'; payload: { authenticated: boolean; phoneNumber?: string; user?: User } }
    | { type: 'SET_PROFILES'; payload: Profile[] }
    | { type: 'SET_CURRENT_PROFILE'; payload: string }
    | { type: 'SET_BP_READINGS'; payload: BPReading[] }
    | { type: 'SET_GLUCOSE_READINGS'; payload: GlucoseReading[] }
    | { type: 'SET_SYMPTOMS'; payload: Symptom[] }
    | { type: 'SET_REMINDERS'; payload: Reminder[] }
    | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
    | { type: 'SET_DOCUMENTS'; payload: Document[] }
    | { type: 'TOGGLE_DARK_MODE' }
    | { type: 'LOGOUT' };

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
        case 'SET_PROFILES':
            return { ...state, profiles: action.payload };
        case 'SET_CURRENT_PROFILE':
            return { ...state, currentProfileId: action.payload };
        case 'SET_BP_READINGS':
            return { ...state, bpReadings: action.payload };
        case 'SET_GLUCOSE_READINGS':
            return { ...state, glucoseReadings: action.payload };
        case 'SET_SYMPTOMS':
            return { ...state, symptoms: action.payload };
        case 'SET_REMINDERS':
            return { ...state, reminders: action.payload };
        case 'SET_NOTIFICATIONS':
            return { ...state, notifications: action.payload };
        case 'SET_DOCUMENTS':
            return { ...state, documents: action.payload };
        case 'TOGGLE_DARK_MODE':
            return { ...state, darkMode: !state.darkMode };
        case 'LOGOUT':
            return { ...initialState };
        default:
            return state;
    }
}

interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    currentProfile: Profile | null;
    refreshData: () => Promise<void>;
    addBPReading: (reading: Partial<BPReading>) => Promise<void>;
    addGlucoseReading: (reading: Partial<GlucoseReading>) => Promise<void>;
    addSymptom: (symptom: Partial<Symptom>) => Promise<void>;
    toggleReminder: (id: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);
const STORAGE_KEY = 'frozo-app-state';

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const refreshData = useCallback(async () => {
        if (!state.isAuthenticated) return;
        try {
            const profiles = await profileService.getProfiles();
            dispatch({ type: 'SET_PROFILES', payload: profiles });

            if (profiles.length > 0 && !state.currentProfileId) {
                dispatch({ type: 'SET_CURRENT_PROFILE', payload: profiles[0].id });
            }

            const profileId = state.currentProfileId || (profiles.length > 0 ? profiles[0].id : null);
            if (profileId) {
                const [bp, glucose, symptoms, reminders, notifications, documents] = await Promise.all([
                    healthService.getBPReadings(profileId),
                    healthService.getGlucoseReadings(profileId),
                    healthService.getSymptoms(profileId),
                    reminderService.getReminders(profileId),
                    userNotificationService.getNotifications(profileId),
                    healthService.getDocuments(profileId),
                ]);

                dispatch({ type: 'SET_BP_READINGS', payload: bp });
                dispatch({ type: 'SET_GLUCOSE_READINGS', payload: glucose });
                dispatch({ type: 'SET_SYMPTOMS', payload: symptoms });
                dispatch({ type: 'SET_REMINDERS', payload: reminders });
                dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
                dispatch({ type: 'SET_DOCUMENTS', payload: documents });
            }
        } catch (e) {
            console.error('Failed to refresh data:', e);
        }
    }, [state.isAuthenticated, state.currentProfileId]);

    // Load state and init API on mount
    useEffect(() => {
        const init = async () => {
            await apiClient.init();
            const token = await AsyncStorage.getItem('frozo_token');
            if (token) {
                // We have a token, try to load basic state
                const savedState = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedState) {
                    dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
                }
                dispatch({ type: 'SET_AUTHENTICATED', payload: { authenticated: true } });
            }
        };
        init();
    }, []);

    // Refresh data when authenticated or profile changes
    useEffect(() => {
        if (state.isAuthenticated) {
            refreshData();
        }
    }, [state.isAuthenticated, state.currentProfileId, refreshData]);

    // Save state to AsyncStorage on change
    useEffect(() => {
        const saveState = async () => {
            if (state.isAuthenticated) {
                try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                } catch (e) {
                    console.error('Failed to save state:', e);
                }
            }
        };
        saveState();
    }, [state]);

    const currentProfile = state.profiles.find(p => p.id === state.currentProfileId) || null;

    const addBPReading = async (reading: Partial<BPReading>) => {
        await healthService.addBPReading({ ...reading, profileId: state.currentProfileId! });
        await refreshData();
    };

    const addGlucoseReading = async (reading: Partial<GlucoseReading>) => {
        await healthService.addGlucoseReading({ ...reading, profileId: state.currentProfileId! });
        await refreshData();
    };

    const addSymptom = async (symptom: Partial<Symptom>) => {
        await healthService.addSymptom({ ...symptom, profileId: state.currentProfileId! });
        await refreshData();
    };

    const toggleReminder = async (id: string) => {
        await reminderService.toggleReminder(id);
        await refreshData();
    };

    const logout = async () => {
        await authService.logout();
        await AsyncStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AppContext.Provider value={{
            state,
            dispatch,
            currentProfile,
            refreshData,
            addBPReading,
            addGlucoseReading,
            addSymptom,
            toggleReminder,
            logout
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
