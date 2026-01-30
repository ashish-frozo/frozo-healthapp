import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class HapticService {
    private isAvailable: boolean;

    constructor() {
        this.isAvailable = Capacitor.isNativePlatform();
    }

    /**
     * Light tap - for keypress
     */
    async light(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Medium tap - for button press
     */
    async medium(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Heavy tap - for important actions
     */
    async heavy(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Success pattern
     */
    async success(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.notification({ type: NotificationType.Success });
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Warning pattern
     */
    async warning(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.notification({ type: NotificationType.Warning });
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Error pattern
     */
    async error(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.notification({ type: NotificationType.Error });
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Selection changed - for picker/selector
     */
    async selectionChanged(): Promise<void> {
        if (!this.isAvailable) return;

        try {
            await Haptics.selectionChanged();
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }
}

export const hapticService = new HapticService();
