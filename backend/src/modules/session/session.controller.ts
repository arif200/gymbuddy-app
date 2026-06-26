import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    listSessions,
    getSessionById,
    getUpcomingSessions,
    createSession,
    updateSession,
    deleteSession,
    SessionError,
} from './session.service';

export function listSessionsController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listSessions(req.validated!.query as any), res);
}

export function getSessionByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getSessionById((req.validated!.params as any).id), res);
}

export function getUpcomingSessionsController(_req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getUpcomingSessions(10), res);
}

export function createSessionController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createSession({ ...req.validated!.body as any, trainer_id: req.user!.id }), res, 201);
}

export function updateSessionController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateSession((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}

export function deleteSessionController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteSession((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        if (result?.meta) {
            return paginated(res, result.data, result.meta, 'Berhasil');
        }
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof SessionError) {
            return error(res, err.message, err.statusCode, err.code);
        }
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
