import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { createProgressSchema, updateProgressSchema, createBodyProgressSchema, idParamSchema } from './progress.schema';
import {
    getMyProgressController, createProgressController, updateProgressController, deleteProgressController,
    getMyBodyProgressController, createBodyProgressController, updateBodyProgressController, deleteBodyProgressController,
} from './progress.controller';

const router = Router();

// Activity progress
router.get('/', authMiddleware, getMyProgressController);
router.post('/', authMiddleware, validate(createProgressSchema), createProgressController);
router.put('/:id', authMiddleware, validate(idParamSchema), validate(updateProgressSchema), updateProgressController);
router.delete('/:id', authMiddleware, validate(idParamSchema), deleteProgressController);

// Body progress
router.get('/body', authMiddleware, getMyBodyProgressController);
router.post('/body', authMiddleware, validate(createBodyProgressSchema), createBodyProgressController);
router.put('/body/:id', authMiddleware, validate(idParamSchema), validate(createBodyProgressSchema), updateBodyProgressController);
router.delete('/body/:id', authMiddleware, validate(idParamSchema), deleteBodyProgressController);

export default router;
