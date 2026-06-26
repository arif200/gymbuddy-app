import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        session_id: z.coerce.number().int().positive(),
        rating_score: z.coerce.number().int().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
        comment: z.string().optional(),
    }),
});

export const updateReviewSchema = z.object({
    body: z.object({
        rating_score: z.coerce.number().int().min(1).max(5).optional(),
        comment: z.string().optional(),
    }),
});

export const listReviewsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        session_id: z.coerce.number().int().positive().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});
