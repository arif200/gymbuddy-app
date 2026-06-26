import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { progress, bodyProgress, users } from '../../db/schema';

// Activity progress
export async function findProgressByMember(memberId: number) {
    return await db.select({
        id: progress.id,
        member_id: progress.member_id,
        booking_id: progress.booking_id,
        activity: progress.activity,
        duration: progress.duration,
        note: progress.note,
        recorded_at: progress.recorded_at,
    })
    .from(progress)
    .where(eq(progress.member_id, memberId))
    .orderBy(desc(progress.recorded_at));
}

export async function findProgressById(id: number) {
    const rows = await db.select().from(progress).where(eq(progress.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function createProgress(data: { member_id: number; booking_id?: number; activity: string; duration: number; note?: string }) {
    const rows = await db.insert(progress).values(data).returning();
    return rows[0];
}

export async function updateProgress(id: number, data: Record<string, unknown>) {
    const rows = await db.update(progress).set(data).where(eq(progress.id, id)).returning();
    return rows[0] ?? null;
}

export async function deleteProgress(id: number) {
    await db.delete(progress).where(eq(progress.id, id));
    return true;
}

// Body progress
export async function findBodyProgressByMember(memberId: number) {
    return await db.select({
        id: bodyProgress.id,
        member_id: bodyProgress.member_id,
        berat_badan: bodyProgress.berat_badan,
        tinggi_badan: bodyProgress.tinggi_badan,
        bmi: bodyProgress.bmi,
        body_fat: bodyProgress.body_fat,
        target_berat: bodyProgress.target_berat,
        foto_before: bodyProgress.foto_before,
        foto_after: bodyProgress.foto_after,
        catatan: bodyProgress.catatan,
        recorded_at: bodyProgress.recorded_at,
    })
    .from(bodyProgress)
    .where(eq(bodyProgress.member_id, memberId))
    .orderBy(desc(bodyProgress.recorded_at));
}

export async function findBodyProgressById(id: number) {
    const rows = await db.select().from(bodyProgress).where(eq(bodyProgress.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function createBodyProgress(data: {
    member_id: number;
    berat_badan?: string;
    tinggi_badan?: string;
    bmi?: string;
    body_fat?: string;
    target_berat?: string;
    foto_before?: string;
    foto_after?: string;
    catatan?: string;
}) {
    const rows = await db.insert(bodyProgress).values(data).returning();
    return rows[0];
}

export async function updateBodyProgress(id: number, data: Record<string, unknown>) {
    const rows = await db.update(bodyProgress).set(data).where(eq(bodyProgress.id, id)).returning();
    return rows[0] ?? null;
}

export async function deleteBodyProgress(id: number) {
    await db.delete(bodyProgress).where(eq(bodyProgress.id, id));
    return true;
}
