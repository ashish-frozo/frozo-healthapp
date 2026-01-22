import { z } from 'zod';

// -------- Profile Schemas --------

export const createProfileSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long'),
    relation: z.string()
        .min(1, 'Relation is required')
        .max(50, 'Relation too long'),
    dateOfBirth: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
        .optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    avatar: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    relation: z.string().min(1).max(50).optional(),
    dateOfBirth: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
        .optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    avatar: z.string().max(500).optional(),
});

export const profileIdParamSchema = z.object({
    id: z.string().min(1, 'Profile ID is required'),
});

// -------- Types --------

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
