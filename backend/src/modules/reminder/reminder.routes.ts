import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { createReminderSchema, updateReminderSchema, idParamSchema } from './reminder.schema';
import { getMyRemindersController, createReminderController, updateReminderController, deleteReminderController } from './reminder.controller';

const router = Router();

router.get('/', authMiddleware, getMyRemindersController);
router.post('/', authMiddleware, validate(createReminderSchema), createReminderController);
router.put('/:id', authMiddleware, validate(idParamSchema), validate(updateReminderSchema), updateReminderController);
router.delete('/:id', authMiddleware, validate(idParamSchema), deleteReminderController);

export default router;
