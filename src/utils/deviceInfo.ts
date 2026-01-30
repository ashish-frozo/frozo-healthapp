import { Device } from '@capacitor/device';

/**
 * Get device information for biometric authentication
 */
export async function getDeviceInfo() {
    try {
        const info = await Device.getInfo();
        const id = await Device.getId();

        return {
            deviceId: id.identifier,
            platform: info.platform as 'android' | 'ios',
            model: info.model,
            osVersion: info.osVersion,
        };
    } catch (error) {
        console.error('Failed to get device info:', error);
        // Fallback to basic info
        return {
            deviceId: 'unknown-' + Date.now(),
            platform: 'android' as const,
            model: undefined,
            osVersion: undefined,
        };
    }
}
