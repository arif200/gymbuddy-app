import { z } from 'zod';

export const createBannerSchema = z.object({
    body: z.object({
        judul: z.string().min(1).max(200),
        deskripsi: z.string().optional(),
        gambar: z.string().min(1, 'Gambar wajib diisi').max(255),
        link: z.string().max(255).optional(),
        urutan: z.coerce.number().int().default(0),
        is_active: z.boolean().default(true),
    }),
});

export const updateBannerSchema = z.object({
    body: z.object({
        judul: z.string().min(1).max(200).optional(),
        deskripsi: z.string().optional(),
        gambar: z.string().max(255).optional(),
        link: z.string().max(255).optional(),
        urutan: z.coerce.number().int().optional(),
        is_active: z.boolean().optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
});
