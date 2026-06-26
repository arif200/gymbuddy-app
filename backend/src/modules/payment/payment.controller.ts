import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    createPayment,
    handleNotification,
    checkPaymentStatus,
    getPaymentConfig,
    PaymentError,
} from './payment.service';

export function createPaymentController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createPayment((req.validated!.body as any).booking_id, req.user!.id), res, 201);
}

export function notificationController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => handleNotification(req.body), res);
}

export function checkStatusController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => checkPaymentStatus((req.validated!.params as any).booking_id, req.user!.id), res);
}

export function getConfigController(_req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getPaymentConfig(), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof PaymentError) {
            logger.warn({ err, statusCode: err.statusCode, code: err.code }, '[PAYMENT] PaymentError');
            return error(res, err.message, err.statusCode, err.code);
        }
        logger.error({ err, stack: (err as Error)?.stack }, '[PAYMENT] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
