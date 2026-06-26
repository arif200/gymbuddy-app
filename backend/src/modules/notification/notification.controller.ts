import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import { getMyNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, NotificationError } from './notification.service';

export function getMyNotificationsController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    const q = req.validated!.query as any;
    handle(async () => getMyNotifications(req.user!.id, { ...q, is_read: q.is_read === 'true' ? true : q.is_read === 'false' ? false : undefined }), res);
}

export function getUnreadCountController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getUnreadCount(req.user!.id), res);
}

export function markAsReadController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => markNotificationAsRead((req.validated!.params as any).id, req.user!.id), res);
}

export function markAllAsReadController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => markAllNotificationsAsRead(req.user!.id), res);
}

export function deleteNotificationController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteNotification((req.validated!.params as any).id, req.user!.id), res);
}

async function handle(fn: () => Promise<any>, res: Response) {
    try {
        const result = await fn();
        if (result?.meta) return paginated(res, result.data, result.meta, 'Berhasil');
        return success(res, result, 'Berhasil');
    } catch (err) {
        if (err instanceof NotificationError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[NOTIFICATION] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
