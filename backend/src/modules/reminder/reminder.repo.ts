import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { reminders } from '../../db/schema';

export async function findByUser(userId: number) {
    return await db.select().from(reminders).where(eq(reminders.user_id, userId)).orderBy(desc(reminders.createdAt));
}

export async function findById(id: number) {
    const rows = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function create(data: { user_id: number; judul: string; tipe: string; waktu: string; hari?: string; is_active: boolean }) {
    const rows = await db.insert(reminders).values(data as any).returning();
    return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
    const rows = await db.update(reminders).set(data as any).where(eq(reminders.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(reminders).where(eq(reminders.id, id));
    return true;
}
