import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { db } from '../../db/client';
import { notifications } from '../../db/schema';

export async function findByUser(userId: number, opts: { page: number; limit: number; is_read?: boolean }) {
    const conditions = [eq(notifications.user_id, userId)];
    if (opts.is_read !== undefined) conditions.push(eq(notifications.is_read, opts.is_read));
    const where = and(...conditions);

    const rows = await db.select().from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(opts.limit)
    .offset((opts.page - 1) * opts.limit);

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(where);
    return { rows, total: Number(countResult[0].count) };
}

export async function findUnreadCount(userId: number) {
    const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
    return Number(result[0].count);
}

export async function findById(id: number) {
    const rows = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function markAsRead(id: number) {
    const rows = await db.update(notifications).set({ is_read: true }).where(eq(notifications.id, id)).returning();
    return rows[0] ?? null;
}

export async function markAllAsRead(userId: number) {
    await db.update(notifications).set({ is_read: true }).where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
    return true;
}

export async function remove(id: number) {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
}
