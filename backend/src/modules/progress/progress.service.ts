import {
    findProgressByMember, findProgressById, createProgress, updateProgress, deleteProgress,
    findBodyProgressByMember, findBodyProgressById, createBodyProgress, updateBodyProgress, deleteBodyProgress,
} from './progress.repo';

export class ProgressError extends Error {
    constructor(public statusCode: number, public code: string, message: string) {
        super(message);
    }
}

// Activity progress
export async function getMyProgress(userId: number) {
    return await findProgressByMember(userId);
}

export async function createMyProgress(data: { member_id: number; booking_id?: number; activity: string; duration: number; note?: string }) {
    return await createProgress(data);
}

export async function updateMyProgress(id: number, data: Record<string, unknown>, userId: number, userRole: string) {
    const item = await findProgressById(id);
    if (!item) throw new ProgressError(404, 'NOT_FOUND', 'Progress tidak ditemukan');
    if (userRole !== 'admin' && item.member_id !== userId) {
        throw new ProgressError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    }
    return await updateProgress(id, data);
}

export async function deleteMyProgress(id: number, userId: number, userRole: string) {
    const item = await findProgressById(id);
    if (!item) throw new ProgressError(404, 'NOT_FOUND', 'Progress tidak ditemukan');
    if (userRole !== 'admin' && item.member_id !== userId) {
        throw new ProgressError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    }
    await deleteProgress(id);
    return true;
}

// Body progress
export async function getMyBodyProgress(userId: number) {
    return await findBodyProgressByMember(userId);
}

export async function createMyBodyProgress(data: {
    member_id: number; berat_badan?: number; tinggi_badan?: number; body_fat?: number;
    target_berat?: number; foto_before?: string; foto_after?: string; catatan?: string;
}) {
    let bmi: number | undefined;
    if (data.berat_badan && data.tinggi_badan) {
        const heightM = data.tinggi_badan / 100;
        bmi = Math.round((data.berat_badan / (heightM * heightM)) * 100) / 100;
    }
    return await createBodyProgress({
        member_id: data.member_id,
        berat_badan: data.berat_badan?.toString(),
        tinggi_badan: data.tinggi_badan?.toString(),
        bmi: bmi?.toString(),
        body_fat: data.body_fat?.toString(),
        target_berat: data.target_berat?.toString(),
        foto_before: data.foto_before,
        foto_after: data.foto_after,
        catatan: data.catatan,
    });
}

export async function updateMyBodyProgress(id: number, data: Record<string, unknown>, userId: number, userRole: string) {
    const item = await findBodyProgressById(id);
    if (!item) throw new ProgressError(404, 'NOT_FOUND', 'Body progress tidak ditemukan');
    if (userRole !== 'admin' && item.member_id !== userId) {
        throw new ProgressError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    }
    return await updateBodyProgress(id, data);
}

export async function deleteMyBodyProgress(id: number, userId: number, userRole: string) {
    const item = await findBodyProgressById(id);
    if (!item) throw new ProgressError(404, 'NOT_FOUND', 'Body progress tidak ditemukan');
    if (userRole !== 'admin' && item.member_id !== userId) {
        throw new ProgressError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    }
    await deleteBodyProgress(id);
    return true;
}
