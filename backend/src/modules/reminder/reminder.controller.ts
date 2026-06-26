import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import { getMyReminders, createReminder, updateReminder, deleteReminder, ReminderError } from './reminder.service';

export function getMyRemindersController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getMyReminders(req.user!.id), res);
}
export function createReminderController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createReminder({ ...req.validated!.body as any, user_id: req.user!.id }), res, 201);
}
export function updateReminderController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateReminder((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}
export function deleteReminderController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteReminder((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof ReminderError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[REMINDER] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
