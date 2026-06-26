import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import { getMyDietPrograms, createDietProgram, updateDietProgram, deleteDietProgram, DietError } from './diet.service';

export function getMyDietProgramsController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getMyDietPrograms(req.user!.id), res);
}
export function createDietProgramController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createDietProgram({ ...req.validated!.body as any, user_id: req.user!.id }), res, 201);
}
export function updateDietProgramController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateDietProgram((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}
export function deleteDietProgramController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteDietProgram((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof DietError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[DIET] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
