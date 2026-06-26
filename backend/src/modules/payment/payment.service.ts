import Midtrans from 'midtrans-client';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import {
    findBookingForPayment,
    findBookingByOrderId,
    updatePayment,
    createNotification,
    findBookingById,
} from './payment.repo';

export class PaymentError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
    ) {
        super(message);
    }
}

const isProduction = env.MIDTRANS_IS_PRODUCTION === 'true';

const snap = new Midtrans.Snap({
    isProduction,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
});

const core = new Midtrans.CoreApi({
    isProduction,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
});

export async function createPayment(bookingId: number, memberId: number) {
    const booking = await findBookingForPayment(bookingId, memberId);
    if (!booking) {
        throw new PaymentError(404, 'NOT_FOUND', 'Booking tidak ditemukan');
    }

    if (booking.status !== 'pending') {
        throw new PaymentError(400, 'VALIDATION_ERROR', 'Booking sudah diproses atau dibatalkan');
    }

    if (booking.payment_status === 'settlement') {
        throw new PaymentError(400, 'VALIDATION_ERROR', 'Booking ini sudah dibayar');
    }

    const grossAmount = Number(booking.session_price) || 0;
    if (grossAmount <= 0) {
        throw new PaymentError(400, 'VALIDATION_ERROR', 'Harga sesi tidak valid');
    }

    if (!env.MIDTRANS_SERVER_KEY || !env.MIDTRANS_CLIENT_KEY) {
        throw new PaymentError(400, 'CONFIG_ERROR', 'Midtrans server key atau client key belum dikonfigurasi di environment');
    }

    const orderId = `GB-${bookingId}-${Date.now()}`;

    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
        },
        customer_details: {
            first_name: booking.member_nama || 'Member',
            email: booking.member_email || 'member@gmail.com',
        },
        item_details: [{
            id: `SESSION-${booking.session_id}`,
            price: grossAmount,
            quantity: 1,
            name: booking.session_title || 'Sesi Latihan',
        }],
        callbacks: {
            finish: `${env.FRONTEND_URL}/dashboard/my-bookings`,
            error: `${env.FRONTEND_URL}/dashboard/my-bookings`,
        },
    };

    let transaction;
    try {
        transaction = await snap.createTransaction(parameter);
    } catch (midtransErr: any) {
        const midtransMessage = midtransErr?.ApiResponse?.error_messages?.join(', ') || midtransErr?.message || JSON.stringify(midtransErr);
        logger.error({ err: midtransErr, bookingId }, '[PAYMENT] Midtrans createTransaction failed');
        throw new PaymentError(400, 'MIDTRANS_ERROR', `Gagal membuat transaksi Midtrans: ${midtransMessage}`);
    }

    await updatePayment({
        bookingId,
        status: 'pending',
        paymentStatus: 'pending',
        midtransOrderId: orderId,
        midtransToken: transaction.token,
        paymentAmount: grossAmount.toString(),
    });

    return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId,
    };
}

export async function handleNotification(notificationBody: unknown) {
    const statusResponse = await core.transaction.notification(notificationBody);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    const booking = await findBookingByOrderId(orderId);
    if (!booking) {
        throw new PaymentError(404, 'NOT_FOUND', 'Booking tidak ditemukan untuk order ini');
    }

    let bookingStatus = booking.status;
    let paymentStatus = 'pending';

    if (transactionStatus === 'capture') {
        if (fraudStatus === 'accept') {
            bookingStatus = 'confirmed';
            paymentStatus = 'settlement';
        }
    } else if (transactionStatus === 'settlement') {
        bookingStatus = 'confirmed';
        paymentStatus = 'settlement';
    } else if (transactionStatus === 'pending') {
        bookingStatus = 'pending';
        paymentStatus = 'pending';
    } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
        bookingStatus = 'cancelled';
        paymentStatus = transactionStatus;
    }

    await updatePayment({
        bookingId: booking.id,
        status: bookingStatus,
        paymentStatus,
        paymentMethod: paymentType,
    });

    if (booking.member_id) {
        const isSuccess = paymentStatus === 'settlement';
        await createNotification({
            userId: booking.member_id,
            title: isSuccess ? 'Pembayaran Berhasil' : 'Pembayaran Gagal',
            message: isSuccess
                ? `Pembayaran untuk booking #${booking.id} telah berhasil dikonfirmasi. Sesi Anda siap!`
                : `Pembayaran untuk booking #${booking.id} ${transactionStatus}. Silakan coba lagi.`,
            type: 'payment',
        });
    }

    return {
        order_id: orderId,
        transaction_status: transactionStatus,
        booking_status: bookingStatus,
        payment_status: paymentStatus,
    };
}

export async function checkPaymentStatus(bookingId: number, memberId: number) {
    const booking = await findBookingForPayment(bookingId, memberId);
    if (!booking) {
        throw new PaymentError(404, 'NOT_FOUND', 'Booking tidak ditemukan');
    }

    if (booking.midtrans_order_id) {
        try {
            const statusResponse = await core.transaction.status(booking.midtrans_order_id);

            if (statusResponse.transaction_status !== booking.payment_status) {
                let newPaymentStatus = statusResponse.transaction_status;
                let newBookingStatus = booking.status;

                if (['settlement', 'capture'].includes(statusResponse.transaction_status)) {
                    newBookingStatus = 'confirmed';
                    newPaymentStatus = 'settlement';
                } else if (['deny', 'cancel', 'expire'].includes(statusResponse.transaction_status)) {
                    newBookingStatus = 'cancelled';
                }

                await updatePayment({
                    bookingId: booking.id,
                    status: newBookingStatus,
                    paymentStatus: newPaymentStatus,
                });

                return {
                    ...booking,
                    status: newBookingStatus,
                    payment_status: newPaymentStatus,
                    midtrans_status: statusResponse.transaction_status,
                    midtrans_fraud_status: statusResponse.fraud_status,
                };
            }

            return {
                ...booking,
                midtrans_status: statusResponse.transaction_status,
                midtrans_fraud_status: statusResponse.fraud_status,
            };
        } catch {
            // If Midtrans error, return local data
        }
    }

    return booking;
}

export function getPaymentConfig() {
    return {
        clientKey: env.MIDTRANS_CLIENT_KEY,
        isProduction,
    };
}
