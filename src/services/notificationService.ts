/**
 * Service to handle browser push notifications
 */
export const notificationService = {
    /**
     * Request permission for browser notifications
     */
    requestPermission: async (): Promise<NotificationPermission> => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        return await Notification.requestPermission();
    },

    /**
     * Send a system-level push notification
     */
    sendPush: async (title: string, options?: NotificationOptions) => {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/pwa-192x192.png', // Fallback icon
                badge: '/pwa-192x192.png',
                ...options,
            });
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification(title, options);
            }
        }
    }
};
