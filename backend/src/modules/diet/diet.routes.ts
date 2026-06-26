import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { createDietSchema, updateDietSchema, idParamSchema } from './diet.schema';
import { getMyDietProgramsController, createDietProgramController, updateDietProgramController, deleteDietProgramController } from './diet.controller';

const router = Router();

router.get('/', authMiddleware, getMyDietProgramsController);
router.post('/', authMiddleware, validate(createDietSchema), createDietProgramController);
router.put('/:id', authMiddleware, validate(idParamSchema), validate(updateDietSchema), updateDietProgramController);
router.delete('/:id', authMiddleware, validate(idParamSchema), deleteDietProgramController);

export default router;
