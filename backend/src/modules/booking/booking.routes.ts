import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
    createBookingSchema,
    updateBookingStatusSchema,
    listBookingsQuerySchema,
    idParamSchema,
} from './booking.schema';
import {
    listBookingsController,
    getMyBookingsController,
    getBookingByIdController,
    createBookingController,
    updateBookingStatusController,
    resetMyBookingsController,
    resetAllBookingsController,
} from './booking.controller';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), validate(listBookingsQuerySchema), listBookingsController);
router.get('/my', authMiddleware, getMyBookingsController);
router.delete('/my', authMiddleware, requireRole('customer', 'admin'), resetMyBookingsController);
router.delete('/all', authMiddleware, requireRole('admin'), resetAllBookingsController);
router.get('/:id', authMiddleware, validate(idParamSchema), getBookingByIdController);
router.post('/', authMiddleware, requireRole('customer', 'admin'), validate(createBookingSchema), createBookingController);
router.patch('/:id/status', authMiddleware, requireRole('trainer', 'admin'), validate(idParamSchema), validate(updateBookingStatusSchema), updateBookingStatusController);

export default router;
