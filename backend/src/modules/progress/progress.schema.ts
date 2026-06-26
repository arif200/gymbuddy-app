import { z } from 'zod';

export const createProgressSchema = z.object({
    body: z.object({
        booking_id: z.coerce.number().int().positive().optional(),
        activity: z.string().min(1, 'Activity wajib diisi').max(100),
        duration: z.coerce.number().int().positive('Duration harus positif (menit)'),
        note: z.string().optional(),
    }),
});

export const updateProgressSchema = z.object({
    body: z.object({
        activity: z.string().min(1).max(100).optional(),
        duration: z.coerce.number().int().positive().optional(),
        note: z.string().optional(),
    }),
});

export const createBodyProgressSchema = z.object({
    body: z.object({
        berat_badan: z.coerce.number().positive().optional(),
        tinggi_badan: z.coerce.number().positive().optional(),
        body_fat: z.coerce.number().positive().optional(),
        target_berat: z.coerce.number().positive().optional(),
        foto_before: z.string().max(255).optional(),
        foto_after: z.string().max(255).optional(),
        catatan: z.string().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});
