import { eq, asc } from 'drizzle-orm';
import { db } from '../../db/client';
import { faq } from '../../db/schema';

export async function findAll() {
    return await db.select().from(faq).orderBy(asc(faq.urutan));
}

export async function findActive() {
    return await db.select().from(faq).where(eq(faq.is_active, true)).orderBy(asc(faq.urutan));
}

export async function findById(id: number) {
    const rows = await db.select().from(faq).where(eq(faq.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function create(data: { pertanyaan: string; jawaban: string; kategori: string; urutan: number; is_active: boolean }) {
    const rows = await db.insert(faq).values(data as any).returning();
    return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
    const rows = await db.update(faq).set(data as any).where(eq(faq.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(faq).where(eq(faq.id, id));
    return true;
}
