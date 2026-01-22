import { z } from 'zod';

// -------- Credit Package Schemas --------

export const purchaseSchema = z.object({
    packageId: z.enum(['try_it_out', 'monthly_care', 'yearly_care']),
});

export const subscribeSchema = z.object({
    planId: z.enum(['care_plus']),
});

// -------- Credit Usage Schemas --------

export const useCreditsSchema = z.object({
    feature: z.enum(['lab_translation', 'health_insight', 'doctor_brief']),
    amount: z.number().int().min(1).optional(),
});

export const checkCreditsSchema = z.object({
    feature: z.enum(['lab_translation', 'health_insight', 'doctor_brief']),
});

// -------- Types --------

export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UseCreditsInput = z.infer<typeof useCreditsSchema>;
export type CheckCreditsInput = z.infer<typeof checkCreditsSchema>;
