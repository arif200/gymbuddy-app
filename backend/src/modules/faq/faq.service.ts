import { findAll, findActive, findById, create, update, remove } from './faq.repo';

export class FaqError extends Error {
    constructor(public statusCode: number, public code: string, message: string) { super(message); }
}

export async function listFaqs() { return await findAll(); }
export async function listActiveFaqs() { return await findActive(); }

export async function getFaqById(id: number) {
    const item = await findById(id);
    if (!item) throw new FaqError(404, 'NOT_FOUND', 'FAQ tidak ditemukan');
    return item;
}

export async function createFaq(data: { pertanyaan: string; jawaban: string; kategori: string; urutan: number; is_active: boolean }) {
    return await create(data);
}

export async function updateFaq(id: number, data: Record<string, unknown>) {
    const item = await findById(id);
    if (!item) throw new FaqError(404, 'NOT_FOUND', 'FAQ tidak ditemukan');
    return await update(id, data);
}

export async function deleteFaq(id: number) {
    const item = await findById(id);
    if (!item) throw new FaqError(404, 'NOT_FOUND', 'FAQ tidak ditemukan');
    await remove(id);
    return true;
}
