import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
    createSessionSchema,
    updateSessionSchema,
    listSessionsQuerySchema,
    idParamSchema,
} from './session.schema';
import {
    listSessionsController,
    getSessionByIdController,
    getUpcomingSessionsController,
    createSessionController,
    updateSessionController,
    deleteSessionController,
} from './session.controller';

const router = Router();

router.get('/', validate(listSessionsQuerySchema), listSessionsController);
router.get('/upcoming', getUpcomingSessionsController);
router.get('/:id', validate(idParamSchema), getSessionByIdController);
router.post('/', authMiddleware, requireRole('trainer', 'admin'), validate(createSessionSchema), createSessionController);
router.put('/:id', authMiddleware, requireRole('trainer', 'admin'), validate(idParamSchema), validate(updateSessionSchema), updateSessionController);
router.delete('/:id', authMiddleware, requireRole('trainer', 'admin'), validate(idParamSchema), deleteSessionController);

export default router;
