import { z } from 'zod';

export const createReminderSchema = z.object({
    body: z.object({
        judul: z.string().min(1).max(200),
        tipe: z.enum(['latihan', 'minum', 'makan', 'tidur', 'custom']).default('latihan'),
        waktu: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu HH:MM'),
        hari: z.string().max(50).optional(),
        is_active: z.boolean().default(true),
    }),
});

export const updateReminderSchema = z.object({
    body: z.object({
        judul: z.string().min(1).max(200).optional(),
        tipe: z.enum(['latihan', 'minum', 'makan', 'tidur', 'custom']).optional(),
        waktu: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        hari: z.string().max(50).optional(),
        is_active: z.boolean().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
});
