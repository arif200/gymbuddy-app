import { eq, asc } from 'drizzle-orm';
import { db } from '../../db/client';
import { banners } from '../../db/schema';

export async function findAll() {
    return await db.select().from(banners).orderBy(asc(banners.urutan));
}

export async function findActive() {
    return await db.select().from(banners).where(eq(banners.is_active, true)).orderBy(asc(banners.urutan));
}

export async function findById(id: number) {
    const rows = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function create(data: { judul: string; deskripsi?: string; gambar: string; link?: string; urutan: number; is_active: boolean }) {
    const rows = await db.insert(banners).values(data as any).returning();
    return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
    const rows = await db.update(banners).set(data as any).where(eq(banners.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(banners).where(eq(banners.id, id));
    return true;
}
