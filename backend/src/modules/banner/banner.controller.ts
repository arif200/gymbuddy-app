import type { Response, NextFunction } from 'express';
import { success, error } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { ValidatedRequest } from '../../middleware/validate';
import { listBanners, listActiveBanners, getBannerById, createBanner, updateBanner, deleteBanner, BannerError } from './banner.service';

export function listBannersController(_req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listBanners(), res);
}
export function listActiveBannersController(_req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listActiveBanners(), res);
}
export function getBannerByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getBannerById((req.validated!.params as any).id), res);
}
export function createBannerController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => createBanner(req.validated!.body as any), res, 201);
}
export function updateBannerController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateBanner((req.validated!.params as any).id, req.validated!.body as any), res);
}
export function deleteBannerController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteBanner((req.validated!.params as any).id), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof BannerError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[BANNER] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
