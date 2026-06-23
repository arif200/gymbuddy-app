import {
    findAll, findById, findByMember, findBySessionTrainer,
    checkExistingBooking, create, updateStatus,
    getSessionForBooking, countConfirmedBookings,
    deleteByMember, deleteAll,
} from './booking.repo';

export class BookingError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
    ) {
        super(message);
    }
}

export async function listBookings(opts: {
    page: number;
    limit: number;
    status?: string;
    payment_status?: string;
}) {
    const { rows, total } = await findAll(opts);
    const totalPages = Math.ceil(total / opts.limit);
    return { data: rows, meta: { page: opts.page, limit: opts.limit, total, totalPages } };
}

export async function getBookingById(id: number, userId: number, userRole: string) {
    const booking = await findById(id);
    if (!booking) {
        throw new BookingError(404, 'NOT_FOUND', 'Booking tidak ditemukan');
    }
    if (userRole !== 'admin' && booking.member_id !== userId && booking.session_trainer_id !== userId) {
        throw new BookingError(403, 'FORBIDDEN', 'Anda tidak memiliki izin untuk melihat booking ini');
    }
    return booking;
}

export async function getMyBookings(userId: number, userRole: string) {
    if (userRole === 'trainer') {
        return await findBySessionTrainer(userId);
    }
    return await findByMember(userId);
}

export async function createBooking(data: {
    session_id: number;
    member_id: number;
    catatan?: string;
}) {
    const session = await getSessionForBooking(data.session_id);
    if (!session) {
        throw new BookingError(404, 'NOT_FOUND', 'Sesi tidak ditemukan');
    }
    if (session.status === 'cancelled' || session.status === 'completed') {
        throw new BookingError(400, 'VALIDATION_ERROR', 'Sesi ini tidak dapat dibooking');
    }

    const existing = await checkExistingBooking(data.session_id, data.member_id);
    if (existing) {
        throw new BookingError(409, 'CONFLICT', 'Anda sudah booking sesi ini');
    }

    const confirmedCount = await countConfirmedBookings(data.session_id);
    if (confirmedCount >= session.max_participants) {
        throw new BookingError(400, 'VALIDATION_ERROR', 'Sesi sudah penuh');
    }

    const booking = await create({
        session_id: data.session_id,
        member_id: data.member_id,
        catatan: data.catatan,
        payment_amount: session.price,
    });
    return booking;
}

export async function updateBookingStatus(
    id: number,
    status: string,
    userId: number,
    userRole: string,
) {
    const booking = await findById(id);
    if (!booking) {
        throw new BookingError(404, 'NOT_FOUND', 'Booking tidak ditemukan');
    }

    if (userRole !== 'admin' && booking.session_trainer_id !== userId) {
        throw new BookingError(403, 'FORBIDDEN', 'Anda tidak memiliki izin untuk mengubah status booking ini');
    }

    const updated = await updateStatus(id, status);
    return updated;
}

export async function resetMyBookings(userId: number) {
    const deletedCount = await deleteByMember(userId);
    return { deletedCount };
}

export async function resetAllBookings() {
    const deletedCount = await deleteAll();
    return { deletedCount };
}
