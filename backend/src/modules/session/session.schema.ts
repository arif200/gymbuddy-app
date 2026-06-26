import { z } from 'zod';

export const createSessionSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title wajib diisi').max(100),
        description: z.string().optional(),
        start_time: z.string().datetime('Format start_time tidak valid (ISO 8601)'),
        end_time: z.string().datetime('Format end_time tidak valid (ISO 8601)').optional(),
        price: z.coerce.number().nonnegative().default(0),
        max_participants: z.coerce.number().int().positive().default(1),
    }),
});

export const updateSessionSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        start_time: z.string().datetime().optional(),
        end_time: z.string().datetime().optional(),
        price: z.coerce.number().nonnegative().optional(),
        status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
        max_participants: z.coerce.number().int().positive().optional(),
    }),
});

export const listSessionsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        search: z.string().optional(),
        trainer_id: z.coerce.number().int().positive().optional(),
        status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
        sort: z.enum(['created_at', 'start_time', 'price']).default('start_time'),
        order: z.enum(['asc', 'desc']).default('asc'),
    }),
});

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});
