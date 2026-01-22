import { z } from 'zod';

/**
 * Common CUID validation for profile IDs
 */
const profileId = z.string().min(1, 'Profile ID is required');

// -------- Blood Pressure Schemas --------

export const addBPSchema = z.object({
    profileId,
    systolic: z.number()
        .int('Systolic must be an integer')
        .min(60, 'Systolic too low')
        .max(250, 'Systolic too high'),
    diastolic: z.number()
        .int('Diastolic must be an integer')
        .min(40, 'Diastolic too low')
        .max(150, 'Diastolic too high'),
    pulse: z.number()
        .int('Pulse must be an integer')
        .min(30, 'Pulse too low')
        .max(200, 'Pulse too high')
        .optional(),
    notes: z.string().max(500, 'Notes too long').optional(),
});

export const getBPQuerySchema = z.object({
    profileId: z.string().min(1, 'Profile ID is required'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// -------- Glucose Schemas --------

export const addGlucoseSchema = z.object({
    profileId,
    value: z.number()
        .min(20, 'Glucose value too low')
        .max(600, 'Glucose value too high'),
    context: z.enum(['fasting', 'random', 'post_meal', 'before_meal']),
    notes: z.string().max(500, 'Notes too long').optional(),
});

// -------- Symptoms Schemas --------

export const addSymptomSchema = z.object({
    profileId,
    name: z.string()
        .min(1, 'Symptom name is required')
        .max(100, 'Symptom name too long'),
    severity: z.enum(['mild', 'moderate', 'severe']),
    notes: z.string().max(500, 'Notes too long').optional(),
});

// -------- Types --------

export type AddBPInput = z.infer<typeof addBPSchema>;
export type AddGlucoseInput = z.infer<typeof addGlucoseSchema>;
export type AddSymptomInput = z.infer<typeof addSymptomSchema>;
