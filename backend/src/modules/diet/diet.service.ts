import { findByUser, findById, create, update, remove } from './diet.repo';

export class DietError extends Error {
    constructor(public statusCode: number, public code: string, message: string) { super(message); }
}

export async function getMyDietPrograms(userId: number) { return await findByUser(userId); }

export async function createDietProgram(data: {
    user_id: number; tipe: string; target_kalori?: number; target_protein?: number;
    target_karbo?: number; target_lemak?: number; tanggal_mulai?: string; tanggal_selesai?: string; catatan?: string;
}) {
    return await create({
        ...data,
        tanggal_mulai: data.tanggal_mulai ? new Date(data.tanggal_mulai) : undefined,
        tanggal_selesai: data.tanggal_selesai ? new Date(data.tanggal_selesai) : undefined,
    });
}

export async function updateDietProgram(id: number, data: Record<string, unknown>, userId: number, userRole: string) {
    const item = await findById(id);
    if (!item) throw new DietError(404, 'NOT_FOUND', 'Program diet tidak ditemukan');
    if (userRole !== 'admin' && item.user_id !== userId) throw new DietError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    return await update(id, data);
}

export async function deleteDietProgram(id: number, userId: number, userRole: string) {
    const item = await findById(id);
    if (!item) throw new DietError(404, 'NOT_FOUND', 'Program diet tidak ditemukan');
    if (userRole !== 'admin' && item.user_id !== userId) throw new DietError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    await remove(id);
    return true;
}
