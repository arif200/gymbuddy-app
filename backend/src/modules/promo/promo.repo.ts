import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { promo } from '../../db/schema';

export async function findAll() {
    return await db.select().from(promo).orderBy(sql`${promo.tanggal_mulai} DESC`);
}

export async function findActive() {
    const now = new Date();
    return await db.select().from(promo).where(eq(promo.is_active, true));
}

export async function findById(id: number) {
    const rows = await db.select().from(promo).where(eq(promo.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function findByCode(kode: string) {
    const rows = await db.select().from(promo).where(eq(promo.kode, kode)).limit(1);
    return rows[0] ?? null;
}

export async function create(data: Record<string, unknown>) {
    const rows = await db.insert(promo).values({
        kode: data.kode as string,
        judul: data.judul as string,
        deskripsi: data.deskripsi as string | null,
        tipe: data.tipe as any,
        nilai: String(data.nilai),
        min_booking: data.min_booking as number,
        maks_diskon: data.maks_diskon ? String(data.maks_diskon) : null,
        kuota: data.kuota as number | null,
        tanggal_mulai: new Date(data.tanggal_mulai as string),
        tanggal_selesai: new Date(data.tanggal_selesai as string),
    } as any).returning();
    return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.nilai !== undefined) updateData.nilai = String(data.nilai);
    if (data.maks_diskon !== undefined) updateData.maks_diskon = data.maks_diskon ? String(data.maks_diskon) : null;
    if (data.tanggal_mulai) updateData.tanggal_mulai = new Date(data.tanggal_mulai as string);
    if (data.tanggal_selesai) updateData.tanggal_selesai = new Date(data.tanggal_selesai as string);
    const rows = await db.update(promo).set(updateData as any).where(eq(promo.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(promo).where(eq(promo.id, id));
    return true;
}
