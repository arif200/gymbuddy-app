import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { ValidatedRequest } from '../../middleware/validate';
import { listFaqs, listActiveFaqs, getFaqById, createFaq, updateFaq, deleteFaq, FaqError } from './faq.service';

export function listFaqsController(_req: ValidatedRequest, res: Response, _next: NextFunction) { handle(async () => listFaqs(), res); }
export function listActiveFaqsController(_req: ValidatedRequest, res: Response, _next: NextFunction) { handle(async () => listActiveFaqs(), res); }
export function getFaqByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) { handle(async () => getFaqById((req.validated!.params as any).id), res); }
export function createFaqController(req: ValidatedRequest, res: Response, _next: NextFunction) { handle(async () => createFaq(req.validated!.body as any), res, 201); }
export function updateFaqController(req: ValidatedRequest, res: Response, _next: NextFunction) { handle(async () => updateFaq((req.validated!.params as any).id, req.validated!.body as any), res); }
export function deleteFaqController(req: ValidatedRequest, res: Response, _next: NextFunction) { handle(async () => deleteFaq((req.validated!.params as any).id), res); }

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof FaqError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[FAQ] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
