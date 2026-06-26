import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { users } from '../../db/schema';

export async function findUserByEmail(email: string) {
    // Normalisasi email ke lowercase agar lookup case-insensitive
    const normalized = email.trim().toLowerCase();
    const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    return rows[0] ?? null;
}

export async function findUserById(id: number) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function createUser(data: {
    nama: string;
    email: string;
    password: string;
    role: 'customer' | 'trainer' | 'admin';
    jenis_kelamin?: string;
    no_telp?: string;
    tanggal_lahir?: string;
    propinsi?: string;
    kota?: string;
    spesialisasi?: string;
    bio?: string;
}) {
    const rows = await db.insert(users).values({
        nama: data.nama,
        email: data.email,
        password: data.password,
        role: data.role,
        jenis_kelamin: data.jenis_kelamin as 'L' | 'P' | null,
        no_telp: data.no_telp,
        tanggal_lahir: data.tanggal_lahir,
        propinsi: data.propinsi ?? '',
        kota: data.kota ?? '',
        spesialisasi: data.spesialisasi,
        bio: data.bio,
    }).returning();
    return rows[0];
}

export async function updatePassword(userId: number, hashedPassword: string) {
    const rows = await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ id: users.id });
    return rows.length > 0;
}

export async function updateUserVerified(userId: number) {
    const rows = await db.update(users)
        .set({ is_verified: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ id: users.id });
    return rows.length > 0;
}
