import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    registerCustomer,
    registerTrainer,
    registerAdmin,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    AuthError,
} from './auth.service';

export function registerCustomerController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => registerCustomer(req.validated!.body as any), res);
}

export function registerTrainerController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => registerTrainer(req.validated!.body as any), res);
}

export function registerAdminController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => registerAdmin(req.validated!.body as any), res);
}

export function loginController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => login((req.validated!.body as any).email, (req.validated!.body as any).password), res);
}

export function getMeController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => getMe(req.user!.id), res);
}

export function forgotPasswordController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => forgotPassword((req.validated!.body as any).email), res);
}

export function resetPasswordController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handleAuth(async () => resetPassword((req.validated!.body as any).token, (req.validated!.body as any).password), res);
}

async function handleAuth(fn: () => Promise<any>, res: Response) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil');
    } catch (err) {
        if (err instanceof AuthError) {
            return error(res, err.message, err.statusCode, err.code);
        }
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
