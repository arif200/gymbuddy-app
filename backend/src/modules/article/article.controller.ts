import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import { listArticles, getArticleById, getArticleBySlug, createArticle, updateArticle, deleteArticle, ArticleError } from './article.service';

export function listArticlesController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listArticles(req.validated!.query as any), res);
}

export function getArticleByIdController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getArticleById((req.validated!.params as any).id), res);
}

export function getArticleBySlugController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => getArticleBySlug((req.validated!.params as any).slug), res);
}

export function createArticleController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createArticle({ ...req.validated!.body as any, author_id: req.user!.id }), res, 201);
}

export function updateArticleController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateArticle((req.validated!.params as any).id, req.validated!.body as any), res);
}

export function deleteArticleController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => deleteArticle((req.validated!.params as any).id), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        if (result?.meta) return paginated(res, result.data, result.meta, 'Berhasil');
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof ArticleError) return error(res, err.message, err.statusCode, err.code);
        logger.error({ err }, '[ARTICLE] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
