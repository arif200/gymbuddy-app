import { z } from 'zod';

export const createFaqSchema = z.object({
    body: z.object({
        pertanyaan: z.string().min(1, 'Pertanyaan wajib diisi'),
        jawaban: z.string().min(1, 'Jawaban wajib diisi'),
        kategori: z.string().max(100).default('umum'),
        urutan: z.coerce.number().int().default(0),
        is_active: z.boolean().default(true),
    }),
});

export const updateFaqSchema = z.object({
    body: z.object({
        pertanyaan: z.string().min(1).optional(),
        jawaban: z.string().min(1).optional(),
        kategori: z.string().max(100).optional(),
        urutan: z.coerce.number().int().optional(),
        is_active: z.boolean().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
});
