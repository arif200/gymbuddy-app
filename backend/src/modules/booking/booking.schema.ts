import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        session_id: z.coerce.number().int().positive('Session ID wajib diisi'),
        catatan: z.string().optional(),
    }),
});

export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
    }),
});

export const listBookingsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
        payment_status: z.enum(['pending', 'settlement', 'cancel', 'expire']).optional(),
    }),
});

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});
