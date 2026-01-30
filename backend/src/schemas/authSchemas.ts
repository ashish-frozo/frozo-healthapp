import { z } from 'zod';

/**
 * Phone number validation - Indian format (10 digits)
 */
const phoneNumber = z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long')
    .regex(/^\+?\d+$/, 'Phone number must contain only digits');

/**
 * OTP validation - 6 digit code
 */
const otp = z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits');

// -------- Auth Schemas --------

export const sendOtpSchema = z.object({
    phoneNumber,
});

export const checkUserSchema = z.object({
    phoneNumber,
});

export const verifyOtpSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
});

export const updateSettingsSchema = z.object({
    preferredLanguage: z.enum(['english', 'hindi', 'hinglish']).optional(),
});

// -------- Biometric Auth Schemas --------

export const generateDeviceTokenSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
    deviceInfo: z.object({
        deviceId: z.string().min(1, 'Device ID is required'),
        platform: z.enum(['android', 'ios']),
        model: z.string().optional(),
        osVersion: z.string().optional(),
    }),
});

export const biometricLoginSchema = z.object({
    deviceToken: z.string().min(1, 'Device token is required'),
});

export const listDeviceTokensSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
});

export const revokeDeviceTokenSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
    deviceId: z.string().min(1, 'Device ID is required'),
});

// -------- Types --------

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type GenerateDeviceTokenInput = z.infer<typeof generateDeviceTokenSchema>;
export type BiometricLoginInput = z.infer<typeof biometricLoginSchema>;
export type ListDeviceTokensInput = z.infer<typeof listDeviceTokensSchema>;
export type RevokeDeviceTokenInput = z.infer<typeof revokeDeviceTokenSchema>;
