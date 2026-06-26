import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { ValidatedRequest } from '../../middleware/validate';
import { listPromos, listActivePromos, getPromoById, getPromoByCode, createPromo, updatePromo, deletePromo, PromoError } from './promo.service';

export function listPromosController(_req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listPromos(), res);
}

export function listActivePromosController(_req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listActivePromos(), res);
}

export function getPromoByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getPromoById((req.validated!.params as any).id), res);
}

export function getPromoByCodeController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    const kode = Array.isArray(req.params.kode) ? req.params.kode[0] : req.params.kode;
    handle(async () => getPromoByCode(kode), res);
}

export function createPromoController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => createPromo(req.validated!.body as any), res, 201);
}

export function updatePromoController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => updatePromo((req.validated!.params as any).id, req.validated!.body as any), res);
}

export function deletePromoController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => deletePromo((req.validated!.params as any).id), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof PromoError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[PROMO] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
