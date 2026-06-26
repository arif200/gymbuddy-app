import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { dietPrograms } from '../../db/schema';

export async function findByUser(userId: number) {
    return await db.select().from(dietPrograms).where(eq(dietPrograms.user_id, userId)).orderBy(desc(dietPrograms.createdAt));
}

export async function findById(id: number) {
    const rows = await db.select().from(dietPrograms).where(eq(dietPrograms.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function create(data: {
    user_id: number; tipe: string; target_kalori?: number; target_protein?: number;
    target_karbo?: number; target_lemak?: number; tanggal_mulai?: Date; tanggal_selesai?: Date; catatan?: string;
}) {
    const rows = await db.insert(dietPrograms).values(data as any).returning();
    return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.tanggal_mulai) updateData.tanggal_mulai = new Date(data.tanggal_mulai as string);
    if (data.tanggal_selesai) updateData.tanggal_selesai = new Date(data.tanggal_selesai as string);
    const rows = await db.update(dietPrograms).set(updateData as any).where(eq(dietPrograms.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(dietPrograms).where(eq(dietPrograms.id, id));
    return true;
}
