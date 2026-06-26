import { eq, and } from 'drizzle-orm';
import { db } from '../../db/client';
import { bookings, sessions, users, notifications } from '../../db/schema';

export async function findBookingForPayment(bookingId: number, memberId: number) {
    const rows = await db.select({
        id: bookings.id,
        session_id: bookings.session_id,
        member_id: bookings.member_id,
        status: bookings.status,
        payment_status: bookings.payment_status,
        payment_amount: bookings.payment_amount,
        midtrans_order_id: bookings.midtrans_order_id,
        midtrans_token: bookings.midtrans_token,
        session_title: sessions.title,
        session_price: sessions.price,
        member_nama: users.nama,
        member_email: users.email,
    })
    .from(bookings)
    .leftJoin(sessions, eq(bookings.session_id, sessions.id))
    .leftJoin(users, eq(bookings.member_id, users.id))
    .where(and(eq(bookings.id, bookingId), eq(bookings.member_id, memberId)))
    .limit(1);
    return rows[0] ?? null;
}

export async function findBookingByOrderId(orderId: string) {
    const rows = await db.select({
        id: bookings.id,
        member_id: bookings.member_id,
        status: bookings.status,
        payment_status: bookings.payment_status,
    })
    .from(bookings)
    .where(eq(bookings.midtrans_order_id, orderId))
    .limit(1);
    return rows[0] ?? null;
}

export async function updatePayment(data: {
    bookingId: number;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    midtransOrderId?: string;
    midtransToken?: string;
    paymentAmount?: string;
}) {
    const updateData: Record<string, unknown> = {
        status: data.status,
        payment_status: data.paymentStatus,
        updatedAt: new Date(),
    };
    if (data.paymentMethod) updateData.payment_method = data.paymentMethod;
    if (data.midtransOrderId) updateData.midtrans_order_id = data.midtransOrderId;
    if (data.midtransToken) updateData.midtrans_token = data.midtransToken;
    if (data.paymentAmount) updateData.payment_amount = data.paymentAmount;
    if (data.paymentStatus === 'settlement') updateData.payment_date = new Date();

    const rows = await db.update(bookings)
    .set(updateData)
    .where(eq(bookings.id, data.bookingId))
    .returning();
    return rows[0] ?? null;
}

export async function createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: 'booking' | 'payment' | 'progress' | 'promo' | 'system';
}) {
    await db.insert(notifications).values({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
    });
}

export async function findBookingById(bookingId: number) {
    const rows = await db.select({
        id: bookings.id,
        member_id: bookings.member_id,
        status: bookings.status,
        payment_status: bookings.payment_status,
        payment_method: bookings.payment_method,
        payment_amount: bookings.payment_amount,
        payment_date: bookings.payment_date,
        midtrans_order_id: bookings.midtrans_order_id,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);
    return rows[0] ?? null;
}
