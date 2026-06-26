import { z } from 'zod';

export const createDietSchema = z.object({
    body: z.object({
        tipe: z.enum(['bulking', 'cutting', 'maintenance']),
        target_kalori: z.coerce.number().int().positive().optional(),
        target_protein: z.coerce.number().int().positive().optional(),
        target_karbo: z.coerce.number().int().positive().optional(),
        target_lemak: z.coerce.number().int().positive().optional(),
        tanggal_mulai: z.string().date().optional(),
        tanggal_selesai: z.string().date().optional(),
        catatan: z.string().optional(),
    }),
});

export const updateDietSchema = z.object({
    body: z.object({
        tipe: z.enum(['bulking', 'cutting', 'maintenance']).optional(),
        target_kalori: z.coerce.number().int().positive().optional(),
        target_protein: z.coerce.number().int().positive().optional(),
        target_karbo: z.coerce.number().int().positive().optional(),
        target_lemak: z.coerce.number().int().positive().optional(),
        tanggal_mulai: z.string().date().optional(),
        tanggal_selesai: z.string().date().optional(),
        is_active: z.boolean().optional(),
        catatan: z.string().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
});
