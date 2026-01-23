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

export const verifyOtpSchema = z.object({
    idToken: z.string().min(1, 'ID Token is required'),
});

export const updateSettingsSchema = z.object({
    preferredLanguage: z.enum(['english', 'hindi', 'hinglish']).optional(),
});

// -------- Types --------

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
