import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { createArticleSchema, updateArticleSchema, listArticlesQuerySchema, idParamSchema, slugParamSchema } from './article.schema';
import { listArticlesController, getArticleByIdController, getArticleBySlugController, createArticleController, updateArticleController, deleteArticleController } from './article.controller';

const router = Router();

router.get('/', validate(listArticlesQuerySchema), listArticlesController);
router.get('/slug/:slug', validate(slugParamSchema), getArticleBySlugController);
router.get('/:id', validate(idParamSchema), getArticleByIdController);
router.post('/', authMiddleware, requireRole('admin', 'trainer'), validate(createArticleSchema), createArticleController);
router.put('/:id', authMiddleware, requireRole('admin', 'trainer'), validate(idParamSchema), validate(updateArticleSchema), updateArticleController);
router.delete('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), deleteArticleController);

export default router;
