import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { createFaqSchema, updateFaqSchema, idParamSchema } from './faq.schema';
import { listFaqsController, listActiveFaqsController, getFaqByIdController, createFaqController, updateFaqController, deleteFaqController } from './faq.controller';

const router = Router();

router.get('/', listFaqsController);
router.get('/active', listActiveFaqsController);
router.get('/:id', validate(idParamSchema), getFaqByIdController);
router.post('/', authMiddleware, requireRole('admin'), validate(createFaqSchema), createFaqController);
router.put('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), validate(updateFaqSchema), updateFaqController);
router.delete('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), deleteFaqController);

export default router;
