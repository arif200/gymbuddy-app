import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    listUsers,
    getUserById,
    getUserByEmail,
    updateUserProfile,
    deleteUserById,
    UserError,
} from './user.service';

export function listUsersController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listUsers(req.validated!.query as any), res);
}

export function getUserByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getUserById((req.validated!.params as any).id), res);
}

export function getUserByEmailController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getUserByEmail((req.validated!.params as any).email), res);
}

export function getMyProfileController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getUserById(req.user!.id), res);
}

export function updateMyProfileController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateUserProfile(req.user!.id, req.validated!.body as any), res);
}

export function updateUserByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateUserProfile((req.validated!.params as any).id, req.validated!.body as any), res);
}

export function deleteUserController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteUserById((req.validated!.params as any).id), res);
}

async function handle(fn: () => Promise<any>, res: Response) {
    try {
        const result = await fn();
        if (result?.meta) {
            return paginated(res, result.data, result.meta, 'Berhasil');
        }
        return success(res, result, 'Berhasil');
    } catch (err) {
        if (err instanceof UserError) {
            return error(res, err.message, err.statusCode, err.code);
        }
        logger.error({ err }, '[USER] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
