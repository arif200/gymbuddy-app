import { z } from 'zod';

export const createArticleSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title wajib diisi').max(200),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        kategori: z.enum(['Diet', 'Bulking', 'Cutting', 'Workout', 'Motivasi']),
        foto: z.string().max(255).optional(),
        is_published: z.boolean().default(false),
    }),
});

export const updateArticleSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(200).optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        kategori: z.enum(['Diet', 'Bulking', 'Cutting', 'Workout', 'Motivasi']).optional(),
        foto: z.string().max(255).optional(),
        is_published: z.boolean().optional(),
    }),
});

export const listArticlesQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        kategori: z.enum(['Diet', 'Bulking', 'Cutting', 'Workout', 'Motivasi']).optional(),
        search: z.string().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
});

export const slugParamSchema = z.object({
    params: z.object({ slug: z.string() }),
});
