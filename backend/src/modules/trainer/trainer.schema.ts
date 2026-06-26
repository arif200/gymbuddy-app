import { z } from 'zod';

export const listTrainersQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        search: z.string().optional(),
        kota: z.string().optional(),
        spesialisasi: z.string().optional(),
        sort: z.enum(['nama', 'created_at']).default('nama'),
        order: z.enum(['asc', 'desc']).default('asc'),
    }),
});

export const updateTrainerSchema = z.object({
    body: z.object({
        nama: z.string().min(1).max(100).optional(),
        bio: z.string().optional(),
        spesialisasi: z.string().max(100).optional(),
        no_telp: z.string().max(20).optional(),
        propinsi: z.string().max(45).optional(),
        kota: z.string().max(45).optional(),
        foto: z.string().max(255).optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});
