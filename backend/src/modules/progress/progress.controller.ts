import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    getMyProgress, createMyProgress, updateMyProgress, deleteMyProgress,
    getMyBodyProgress, createMyBodyProgress, updateMyBodyProgress, deleteMyBodyProgress,
    ProgressError,
} from './progress.service';

// Activity progress
export function getMyProgressController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getMyProgress(req.user!.id), res);
}

export function createProgressController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createMyProgress({ ...req.validated!.body as any, member_id: req.user!.id }), res, 201);
}

export function updateProgressController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateMyProgress((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}

export function deleteProgressController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteMyProgress((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

// Body progress
export function getMyBodyProgressController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getMyBodyProgress(req.user!.id), res);
}

export function createBodyProgressController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createMyBodyProgress({ ...req.validated!.body as any, member_id: req.user!.id }), res, 201);
}

export function updateBodyProgressController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateMyBodyProgress((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}

export function deleteBodyProgressController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteMyBodyProgress((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof ProgressError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[PROGRESS] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
