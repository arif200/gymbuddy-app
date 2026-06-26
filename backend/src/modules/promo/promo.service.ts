import { findAll, findActive, findById, findByCode, create, update, remove } from './promo.repo';

export class PromoError extends Error {
    constructor(public statusCode: number, public code: string, message: string) {
        super(message);
    }
}

export async function listPromos() {
    return await findAll();
}

export async function listActivePromos() {
    return await findActive();
}

export async function getPromoById(id: number) {
    const item = await findById(id);
    if (!item) throw new PromoError(404, 'NOT_FOUND', 'Promo tidak ditemukan');
    return item;
}

export async function getPromoByCode(kode: string) {
    const item = await findByCode(kode);
    if (!item) throw new PromoError(404, 'NOT_FOUND', 'Promo tidak ditemukan');
    if (!item.is_active) throw new PromoError(400, 'VALIDATION_ERROR', 'Promo tidak aktif');
    const now = new Date();
    if (item.tanggal_mulai && now < item.tanggal_mulai) {
        throw new PromoError(400, 'VALIDATION_ERROR', 'Promo belum berlaku');
    }
    if (item.tanggal_selesai && now > item.tanggal_selesai) {
        throw new PromoError(400, 'VALIDATION_ERROR', 'Promo sudah kedaluwarsa');
    }
    return item;
}

export async function createPromo(data: Record<string, unknown>) {
    const existing = await findByCode(data.kode as string);
    if (existing) throw new PromoError(409, 'CONFLICT', 'Kode promo sudah digunakan');
    return await create(data);
}

export async function updatePromo(id: number, data: Record<string, unknown>) {
    const item = await findById(id);
    if (!item) throw new PromoError(404, 'NOT_FOUND', 'Promo tidak ditemukan');
    return await update(id, data);
}

export async function deletePromo(id: number) {
    const item = await findById(id);
    if (!item) throw new PromoError(404, 'NOT_FOUND', 'Promo tidak ditemukan');
    await remove(id);
    return true;
}
