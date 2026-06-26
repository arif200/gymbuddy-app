import { findAll, findById, findBySessionMember, create, update, remove } from './review.repo';

export class ReviewError extends Error {
    constructor(public statusCode: number, public code: string, message: string) {
        super(message);
    }
}

export async function listReviews(opts: { page: number; limit: number; session_id?: number }) {
    const { rows, total } = await findAll(opts);
    const totalPages = Math.ceil(total / opts.limit);
    return { data: rows, meta: { page: opts.page, limit: opts.limit, total, totalPages } };
}

export async function createReview(data: { session_id: number; member_id: number; rating_score: number; comment?: string }) {
    const existing = await findBySessionMember(data.session_id, data.member_id);
    if (existing) {
        throw new ReviewError(409, 'CONFLICT', 'Anda sudah memberikan review untuk sesi ini');
    }
    return await create(data);
}

export async function updateReview(id: number, data: { rating_score?: number; comment?: string }, userId: number, userRole: string) {
    const review = await findById(id);
    if (!review) throw new ReviewError(404, 'NOT_FOUND', 'Review tidak ditemukan');
    if (userRole !== 'admin' && review.member_id !== userId) {
        throw new ReviewError(403, 'FORBIDDEN', 'Anda tidak memiliki izin untuk mengubah review ini');
    }
    return await update(id, data);
}

export async function deleteReview(id: number, userId: number, userRole: string) {
    const review = await findById(id);
    if (!review) throw new ReviewError(404, 'NOT_FOUND', 'Review tidak ditemukan');
    if (userRole !== 'admin' && review.member_id !== userId) {
        throw new ReviewError(403, 'FORBIDDEN', 'Anda tidak memiliki izin untuk menghapus review ini');
    }
    await remove(id);
    return true;
}
