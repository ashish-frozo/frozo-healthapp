import { useState, useEffect } from 'react';
import { biometricService, BiometricAvailability } from '../services/biometricService';
import { secureStorageService } from '../services/secureStorageService';
import { hapticService } from '../services/hapticService';

export function useBiometric() {
    const [availability, setAvailability] = useState<BiometricAvailability | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

    useEffect(() => {
        checkBiometric();
    }, []);

    const checkBiometric = async () => {
        setIsChecking(true);
        try {
            const [avail, hasCreds] = await Promise.all([
                biometricService.checkAvailability(),
                secureStorageService.hasSavedCredentials(),
            ]);

            setAvailability(avail);
            setHasSavedCredentials(hasCreds);
        } catch (error) {
            console.error('Failed to check biometric:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const authenticate = async (reason?: string) => {
        await hapticService.medium();
        const result = await biometricService.authenticate(reason);

        if (result.success) {
            await hapticService.success();
        } else {
            await hapticService.error();
        }

        return result;
    };

    const enableBiometric = async (phoneNumber: string, deviceToken: string, userId: string) => {
        try {
            await Promise.all([
                secureStorageService.savePhoneNumber(phoneNumber),
                secureStorageService.saveDeviceToken(deviceToken),
                secureStorageService.saveUserId(userId),
                secureStorageService.setBiometricEnabled(true),
            ]);

            setHasSavedCredentials(true);
            await hapticService.success();
            return true;
        } catch (error) {
            console.error('Failed to enable biometric:', error);
            await hapticService.error();
            return false;
        }
    };

    const disableBiometric = async () => {
        try {
            await secureStorageService.clearAll();
            setHasSavedCredentials(false);
            await hapticService.medium();
            return true;
        } catch (error) {
            console.error('Failed to disable biometric:', error);
            await hapticService.error();
            return false;
        }
    };

    const getSavedPhoneNumber = async () => {
        return await secureStorageService.getPhoneNumber();
    };

    const getSavedPhoneLast4 = async () => {
        return await secureStorageService.getPhoneNumberLast4();
    };

    const getDeviceToken = async () => {
        return await secureStorageService.getDeviceToken();
    };

    return {
        availability,
        isChecking,
        hasSavedCredentials,
        isAvailable: availability?.isAvailable || false,
        biometryType: availability?.biometryType,
        biometryTypeName: availability?.biometryType
            ? biometricService.getBiometryTypeName(availability.biometryType)
            : null,
        authenticate,
        enableBiometric,
        disableBiometric,
        getSavedPhoneNumber,
        getSavedPhoneLast4,
        getDeviceToken,
        refresh: checkBiometric,
    };
}
