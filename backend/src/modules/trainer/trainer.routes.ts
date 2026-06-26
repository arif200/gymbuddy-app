import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireOwnershipOrRole } from '../../middleware/role';
import {
    listTrainersQuerySchema,
    updateTrainerSchema,
    idParamSchema,
} from './trainer.schema';
import {
    listTrainersController,
    getTrainerByIdController,
    getTrainerSessionsController,
    updateTrainerController,
} from './trainer.controller';

const router = Router();

router.get('/', validate(listTrainersQuerySchema), listTrainersController);
router.get('/:id', validate(idParamSchema), getTrainerByIdController);
router.get('/:id/sessions', validate(idParamSchema), getTrainerSessionsController);
router.put('/:id', authMiddleware, requireOwnershipOrRole('admin'), validate(idParamSchema), validate(updateTrainerSchema), updateTrainerController);

export default router;
