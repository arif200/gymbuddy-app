import { eq, ilike, and, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../../db/client';
import { users } from '../../db/schema';
import { sessions } from '../../db/schema/sessions';
import { bookings } from '../../db/schema/bookings';
import { reviews } from '../../db/schema/reviews';
import { progress } from '../../db/schema/progress';
import { bodyProgress } from '../../db/schema/bodyProgress';
import { notifications } from '../../db/schema/notifications';
import { reminders } from '../../db/schema/reminders';
import { dietPrograms } from '../../db/schema/dietPrograms';
import { articles } from '../../db/schema/articles';

export async function findAll(opts: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    kota?: string;
    sort: string;
    order: string;
}) {
    const conditions = [];
    if (opts.search) {
        conditions.push(ilike(users.nama, `%${opts.search}%`));
    }
    if (opts.role) {
        conditions.push(eq(users.role, opts.role as any));
    }
    if (opts.kota) {
        conditions.push(ilike(users.kota, `%${opts.kota}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortCol = opts.sort === 'nama' ? users.nama : users.createdAt;
    const orderFn = opts.order === 'asc' ? asc : desc;

    const rows = await db.select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        role: users.role,
        jenis_kelamin: users.jenis_kelamin,
        no_telp: users.no_telp,
        tanggal_lahir: users.tanggal_lahir,
        foto: users.foto,
        bio: users.bio,
        propinsi: users.propinsi,
        kota: users.kota,
        spesialisasi: users.spesialisasi,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
    })
    .from(users)
    .where(where)
    .orderBy(orderFn(sortCol))
    .limit(opts.limit)
    .offset((opts.page - 1) * opts.limit);

    const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where);
    const total = Number(countResult[0].count);

    return { rows, total };
}

export async function findById(id: number) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function findByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ?? null;
}

export async function updateUser(id: number, data: Record<string, unknown>) {
    const rows = await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
    return rows[0] ?? null;
}

export async function deleteUser(id: number) {
    await db.transaction(async (tx) => {
        // 1. If user is a trainer, clean up data tied to their sessions first
        //    (sessions will be cascade-deleted by the FK on sessions.trainer_id,
        //    but bookings/reviews/progress referencing those sessions have no cascade)
        const trainerSessions = await tx.select({ id: sessions.id })
            .from(sessions)
            .where(eq(sessions.trainer_id, id));

        if (trainerSessions.length > 0) {
            const sessionIds = trainerSessions.map(s => s.id);

            // Find bookings for those sessions to clean up progress
            const sessionBookings = await tx.select({ id: bookings.id })
                .from(bookings)
                .where(inArray(bookings.session_id, sessionIds));
            const bookingIds = sessionBookings.map(b => b.id);

            if (bookingIds.length > 0) {
                await tx.delete(progress).where(inArray(progress.booking_id, bookingIds));
            }
            await tx.delete(reviews).where(inArray(reviews.session_id, sessionIds));
            await tx.delete(bookings).where(inArray(bookings.session_id, sessionIds));
            // sessions themselves will be cascade-deleted by PostgreSQL
        }

        // 2. Clean up data where the user is the member/owner
        await tx.delete(progress).where(eq(progress.member_id, id));
        await tx.delete(reviews).where(eq(reviews.member_id, id));
        await tx.delete(bookings).where(eq(bookings.member_id, id));
        await tx.delete(bodyProgress).where(eq(bodyProgress.member_id, id));
        await tx.delete(notifications).where(eq(notifications.user_id, id));
        await tx.delete(reminders).where(eq(reminders.user_id, id));
        await tx.delete(dietPrograms).where(eq(dietPrograms.user_id, id));

        // articles.author_id is nullable — set to null instead of deleting articles
        await tx.update(articles).set({ author_id: null }).where(eq(articles.author_id, id));

        // 3. Finally delete the user (sessions cascade if trainer)
        await tx.delete(users).where(eq(users.id, id));
    });
    return true;
}
