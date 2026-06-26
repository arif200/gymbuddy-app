import { findByUser, findById, create, update, remove } from './reminder.repo';

export class ReminderError extends Error {
    constructor(public statusCode: number, public code: string, message: string) { super(message); }
}

export async function getMyReminders(userId: number) { return await findByUser(userId); }

export async function createReminder(data: { user_id: number; judul: string; tipe: string; waktu: string; hari?: string; is_active: boolean }) {
    return await create(data);
}

export async function updateReminder(id: number, data: Record<string, unknown>, userId: number, userRole: string) {
    const item = await findById(id);
    if (!item) throw new ReminderError(404, 'NOT_FOUND', 'Reminder tidak ditemukan');
    if (userRole !== 'admin' && item.user_id !== userId) throw new ReminderError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    return await update(id, data);
}

export async function deleteReminder(id: number, userId: number, userRole: string) {
    const item = await findById(id);
    if (!item) throw new ReminderError(404, 'NOT_FOUND', 'Reminder tidak ditemukan');
    if (userRole !== 'admin' && item.user_id !== userId) throw new ReminderError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    await remove(id);
    return true;
}
