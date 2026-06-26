import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        nama: z.string().min(1).max(100).optional(),
        jenis_kelamin: z.enum(['L', 'P']).optional(),
        no_telp: z.string().max(20).optional(),
        tanggal_lahir: z.string().date().optional(),
        bio: z.string().optional(),
        propinsi: z.string().max(45).optional(),
        kota: z.string().max(45).optional(),
        spesialisasi: z.string().max(100).optional(),
        foto: z.string().max(255).optional(),
    }),
});

export const listUsersQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        search: z.string().optional(),
        role: z.enum(['customer', 'trainer', 'admin']).optional(),
        kota: z.string().optional(),
        sort: z.enum(['nama', 'created_at']).default('created_at'),
        order: z.enum(['asc', 'desc']).default('desc'),
    }),
});

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});

export const emailParamSchema = z.object({
    params: z.object({
        email: z.string().email(),
    }),
});
