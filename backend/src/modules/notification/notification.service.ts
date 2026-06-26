import { findByUser, findUnreadCount, findById, markAsRead, markAllAsRead, remove } from './notification.repo';

export class NotificationError extends Error {
    constructor(public statusCode: number, public code: string, message: string) {
        super(message);
    }
}

export async function getMyNotifications(userId: number, opts: { page: number; limit: number; is_read?: boolean }) {
    const { rows, total } = await findByUser(userId, opts);
    const totalPages = Math.ceil(total / opts.limit);
    return { data: rows, meta: { page: opts.page, limit: opts.limit, total, totalPages } };
}

export async function getUnreadCount(userId: number) {
    return { unread_count: await findUnreadCount(userId) };
}

export async function markNotificationAsRead(id: number, userId: number) {
    const notif = await findById(id);
    if (!notif) throw new NotificationError(404, 'NOT_FOUND', 'Notifikasi tidak ditemukan');
    if (notif.user_id !== userId) throw new NotificationError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    return await markAsRead(id);
}

export async function markAllNotificationsAsRead(userId: number) {
    return await markAllAsRead(userId);
}

export async function deleteNotification(id: number, userId: number) {
    const notif = await findById(id);
    if (!notif) throw new NotificationError(404, 'NOT_FOUND', 'Notifikasi tidak ditemukan');
    if (notif.user_id !== userId) throw new NotificationError(403, 'FORBIDDEN', 'Anda tidak memiliki izin');
    await remove(id);
    return true;
}
