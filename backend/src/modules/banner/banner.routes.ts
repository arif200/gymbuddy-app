import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { createBannerSchema, updateBannerSchema, idParamSchema } from './banner.schema';
import { listBannersController, listActiveBannersController, getBannerByIdController, createBannerController, updateBannerController, deleteBannerController } from './banner.controller';

const router = Router();

router.get('/', listBannersController);
router.get('/active', listActiveBannersController);
router.get('/:id', validate(idParamSchema), getBannerByIdController);
router.post('/', authMiddleware, requireRole('admin'), validate(createBannerSchema), createBannerController);
router.put('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), validate(updateBannerSchema), updateBannerController);
router.delete('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), deleteBannerController);

export default router;
