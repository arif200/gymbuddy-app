import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import { listReviews, createReview, updateReview, deleteReview, ReviewError } from './review.service';

export function listReviewsController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listReviews(req.validated!.query as any), res);
}

export function createReviewController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createReview({ ...req.validated!.body as any, member_id: req.user!.id }), res, 201);
}

export function updateReviewController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateReview((req.validated!.params as any).id, req.validated!.body as any, req.user!.id, req.user!.role), res);
}

export function deleteReviewController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteReview((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        if (result?.meta) return paginated(res, result.data, result.meta, 'Berhasil');
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof ReviewError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[REVIEW] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
