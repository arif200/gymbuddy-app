import { z } from 'zod';

export const registerCustomerSchema = z.object({
    body: z.object({
        nama: z.string().min(1, 'Nama wajib diisi').max(100),
        email: z.string().email('Email tidak valid'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
        jenis_kelamin: z.enum(['L', 'P']).optional(),
        no_telp: z.string().max(20).optional(),
        tanggal_lahir: z.string().date().optional(),
        propinsi: z.string().max(45).optional(),
        kota: z.string().max(45).optional(),
    }),
});

export const registerTrainerSchema = z.object({
    body: z.object({
        nama: z.string().min(1, 'Nama wajib diisi').max(100),
        email: z.string().email('Email tidak valid'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
        spesialisasi: z.string().min(1, 'Spesialisasi wajib diisi').max(100),
        bio: z.string().optional(),
        no_telp: z.string().max(20).optional(),
        propinsi: z.string().max(45).optional(),
        kota: z.string().max(45).optional(),
    }),
});

export const registerAdminSchema = z.object({
    body: z.object({
        nama: z.string().min(1, 'Nama wajib diisi').max(100),
        email: z.string().email('Email tidak valid'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Email tidak valid'),
        password: z.string().min(1, 'Password wajib diisi'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Email tidak valid'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token wajib diisi'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
    }),
});
