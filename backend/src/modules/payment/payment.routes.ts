import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import {
    createPaymentSchema,
    bookingIdParamSchema,
} from './payment.schema';
import {
    createPaymentController,
    notificationController,
    checkStatusController,
    getConfigController,
} from './payment.controller';

const router = Router();

router.post('/create', authMiddleware, validate(createPaymentSchema), createPaymentController);
router.post('/notification', notificationController);
router.get('/config', authMiddleware, getConfigController);
router.get('/:booking_id/status', authMiddleware, validate(bookingIdParamSchema), checkStatusController);

export default router;
