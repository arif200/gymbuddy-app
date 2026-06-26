import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { createPromoSchema, updatePromoSchema, idParamSchema } from './promo.schema';
import { listPromosController, listActivePromosController, getPromoByIdController, getPromoByCodeController, createPromoController, updatePromoController, deletePromoController } from './promo.controller';

const router = Router();

router.get('/', listPromosController);
router.get('/active', listActivePromosController);
router.get('/code/:kode', getPromoByCodeController);
router.get('/:id', validate(idParamSchema), getPromoByIdController);
router.post('/', authMiddleware, requireRole('admin'), validate(createPromoSchema), createPromoController);
router.put('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), validate(updatePromoSchema), updatePromoController);
router.delete('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), deletePromoController);

export default router;
