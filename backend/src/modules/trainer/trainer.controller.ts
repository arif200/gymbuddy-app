import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    listTrainers,
    getTrainerById,
    getTrainerByName,
    updateTrainerProfile,
    getTrainerSessionsByTrainerId,
    TrainerError,
} from './trainer.service';

export function listTrainersController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listTrainers(req.validated!.query as any), res);
}

export function getTrainerByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getTrainerById((req.validated!.params as any).id), res);
}

export function getTrainerSessionsController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getTrainerSessionsByTrainerId((req.validated!.params as any).id), res);
}

export function updateTrainerController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateTrainerProfile((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}

async function handle(fn: () => Promise<any>, res: Response) {
    try {
        const result = await fn();
        if (result?.meta) {
            return paginated(res, result.data, result.meta, 'Berhasil');
        }
        return success(res, result, 'Berhasil');
    } catch (err) {
        if (err instanceof TrainerError) {
            return error(res, err.message, err.statusCode, err.code);
        }
        logger.error({ err }, '[TRAINER] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
