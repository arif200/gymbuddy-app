import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { createReviewSchema, updateReviewSchema, listReviewsQuerySchema, idParamSchema } from './review.schema';
import { listReviewsController, createReviewController, updateReviewController, deleteReviewController } from './review.controller';

const router = Router();

router.get('/', validate(listReviewsQuerySchema), listReviewsController);
router.post('/', authMiddleware, requireRole('customer', 'admin'), validate(createReviewSchema), createReviewController);
router.put('/:id', authMiddleware, validate(idParamSchema), validate(updateReviewSchema), updateReviewController);
router.delete('/:id', authMiddleware, validate(idParamSchema), deleteReviewController);

export default router;
