import { eq, ilike, and, asc, desc, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { users, sessions } from '../../db/schema';

export async function findAllTrainers(opts: {
    page: number;
    limit: number;
    search?: string;
    kota?: string;
    spesialisasi?: string;
    sort: string;
    order: string;
}) {
    const conditions = [eq(users.role, 'trainer')];
    if (opts.search) {
        conditions.push(ilike(users.nama, `%${opts.search}%`));
    }
    if (opts.kota) {
        conditions.push(ilike(users.kota, `%${opts.kota}%`));
    }
    if (opts.spesialisasi) {
        conditions.push(ilike(users.spesialisasi, `%${opts.spesialisasi}%`));
    }

    const where = and(...conditions);
    const sortCol = opts.sort === 'nama' ? users.nama : users.createdAt;
    const orderFn = opts.order === 'asc' ? asc : desc;

    const rows = await db.select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        foto: users.foto,
        bio: users.bio,
        propinsi: users.propinsi,
        kota: users.kota,
        spesialisasi: users.spesialisasi,
        no_telp: users.no_telp,
        createdAt: users.createdAt,
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

export async function findTrainerById(id: number) {
    const rows = await db.select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        foto: users.foto,
        bio: users.bio,
        propinsi: users.propinsi,
        kota: users.kota,
        spesialisasi: users.spesialisasi,
        no_telp: users.no_telp,
        jenis_kelamin: users.jenis_kelamin,
        createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, 'trainer')))
    .limit(1);
    return rows[0] ?? null;
}

export async function findTrainerByName(nama: string) {
    const rows = await db.select({
        id: users.id,
        nama: users.nama,
        spesialisasi: users.spesialisasi,
    })
    .from(users)
    .where(and(eq(users.role, 'trainer'), ilike(users.nama, `%${nama}%`)))
    .limit(10);
    return rows;
}

export async function updateTrainer(id: number, data: Record<string, unknown>) {
    const rows = await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
    return rows[0] ?? null;
}

export async function getTrainerSessions(trainerId: number) {
    const rows = await db.select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        start_time: sessions.start_time,
        end_time: sessions.end_time,
        price: sessions.price,
        status: sessions.status,
        max_participants: sessions.max_participants,
    })
    .from(sessions)
    .where(eq(sessions.trainer_id, trainerId));
    return rows;
}
