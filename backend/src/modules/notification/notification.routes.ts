import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { listNotificationsQuerySchema, idParamSchema } from './notification.schema';
import { getMyNotificationsController, getUnreadCountController, markAsReadController, markAllAsReadController, deleteNotificationController } from './notification.controller';

const router = Router();

router.get('/', authMiddleware, validate(listNotificationsQuerySchema), getMyNotificationsController);
router.get('/unread-count', authMiddleware, getUnreadCountController);
router.patch('/read-all', authMiddleware, markAllAsReadController);
router.patch('/:id/read', authMiddleware, validate(idParamSchema), markAsReadController);
router.delete('/:id', authMiddleware, validate(idParamSchema), deleteNotificationController);

export default router;
