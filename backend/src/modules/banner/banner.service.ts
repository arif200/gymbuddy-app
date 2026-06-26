import { findAll, findActive, findById, create, update, remove } from './banner.repo';

export class BannerError extends Error {
    constructor(public statusCode: number, public code: string, message: string) { super(message); }
}

export async function listBanners() { return await findAll(); }
export async function listActiveBanners() { return await findActive(); }

export async function getBannerById(id: number) {
    const item = await findById(id);
    if (!item) throw new BannerError(404, 'NOT_FOUND', 'Banner tidak ditemukan');
    return item;
}

export async function createBanner(data: { judul: string; deskripsi?: string; gambar: string; link?: string; urutan: number; is_active: boolean }) {
    return await create(data);
}

export async function updateBanner(id: number, data: Record<string, unknown>) {
    const item = await findById(id);
    if (!item) throw new BannerError(404, 'NOT_FOUND', 'Banner tidak ditemukan');
    return await update(id, data);
}

export async function deleteBanner(id: number) {
    const item = await findById(id);
    if (!item) throw new BannerError(404, 'NOT_FOUND', 'Banner tidak ditemukan');
    await remove(id);
    return true;
}
