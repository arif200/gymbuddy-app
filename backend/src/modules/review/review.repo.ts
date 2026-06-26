import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { reviews, sessions, users } from '../../db/schema';

export async function findAll(opts: { page: number; limit: number; session_id?: number }) {
    const conditions = [];
    if (opts.session_id) conditions.push(eq(reviews.session_id, opts.session_id));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.select({
        id: reviews.id,
        session_id: reviews.session_id,
        member_id: reviews.member_id,
        rating_score: reviews.rating_score,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        session_title: sessions.title,
        member_nama: users.nama,
    })
    .from(reviews)
    .leftJoin(sessions, eq(reviews.session_id, sessions.id))
    .leftJoin(users, eq(reviews.member_id, users.id))
    .where(where)
    .orderBy(desc(reviews.createdAt))
    .limit(opts.limit)
    .offset((opts.page - 1) * opts.limit);

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(reviews).where(where);
    return { rows, total: Number(countResult[0].count) };
}

export async function findById(id: number) {
    const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function findBySessionMember(sessionId: number, memberId: number) {
    const rows = await db.select().from(reviews)
    .where(and(eq(reviews.session_id, sessionId), eq(reviews.member_id, memberId)))
    .limit(1);
    return rows[0] ?? null;
}

export async function create(data: { session_id: number; member_id: number; rating_score: number; comment?: string }) {
    const rows = await db.insert(reviews).values(data).returning();
    return rows[0];
}

export async function update(id: number, data: { rating_score?: number; comment?: string }) {
    const rows = await db.update(reviews).set({ ...data, updatedAt: new Date() }).where(eq(reviews.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
}
