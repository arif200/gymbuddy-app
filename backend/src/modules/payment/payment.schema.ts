import { z } from 'zod';

export const createPaymentSchema = z.object({
    body: z.object({
        booking_id: z.coerce.number().int().positive('Booking ID wajib diisi'),
    }),
});

export const bookingIdParamSchema = z.object({
    params: z.object({
        booking_id: z.coerce.number().int().positive(),
    }),
});
