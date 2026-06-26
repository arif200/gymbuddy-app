import { z } from 'zod';

export const createPromoSchema = z.object({
    body: z.object({
        kode: z.string().min(1).max(50),
        judul: z.string().min(1).max(200),
        deskripsi: z.string().optional(),
        tipe: z.enum(['nominal', 'persen']),
        nilai: z.coerce.number().positive(),
        min_booking: z.coerce.number().int().positive().default(1),
        maks_diskon: z.coerce.number().positive().optional(),
        kuota: z.coerce.number().int().positive().optional(),
        tanggal_mulai: z.string().date(),
        tanggal_selesai: z.string().date(),
    }),
});

export const updatePromoSchema = z.object({
    body: z.object({
        judul: z.string().min(1).max(200).optional(),
        deskripsi: z.string().optional(),
        nilai: z.coerce.number().positive().optional(),
        min_booking: z.coerce.number().int().positive().optional(),
        maks_diskon: z.coerce.number().positive().optional(),
        kuota: z.coerce.number().int().positive().optional(),
        tanggal_mulai: z.string().date().optional(),
        tanggal_selesai: z.string().date().optional(),
        is_active: z.boolean().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
});
