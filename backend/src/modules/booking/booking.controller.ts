import type { Response, NextFunction } from 'express';
import { success, error, paginated } from '../../utils/response';
import { logger } from '../../utils/logger';
import type { AuthedRequest } from '../../middleware/auth';
import type { ValidatedRequest } from '../../middleware/validate';
import {
    listBookings,
    getBookingById,
    getMyBookings,
    createBooking,
    updateBookingStatus,
    resetMyBookings,
    resetAllBookings,
    BookingError,
} from './booking.service';

export function listBookingsController(req: ValidatedRequest, res: Response, _next: NextFunction) {
    handle(async () => listBookings(req.validated!.query as any), res);
}

export function getMyBookingsController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getMyBookings(req.user!.id, req.user!.role), res);
}

export function getBookingByIdController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => getBookingById((req.validated!.params as any).id, req.user!.id, req.user!.role), res);
}

export function createBookingController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => createBooking({ ...req.validated!.body as any, member_id: req.user!.id }), res, 201);
}

export function updateBookingStatusController(req: ValidatedRequest & AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => updateBookingStatus((req.validated!.params as any).id, (req.validated!.body as any).status, req.user!.id, req.user!.role), res);
}

export function resetMyBookingsController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => resetMyBookings(req.user!.id), res);
}

export function resetAllBookingsController(req: AuthedRequest, res: Response, _next: NextFunction) {
    handle(async () => resetAllBookings(), res);
}

async function handle(fn: () => Promise<any>, res: Response, statusCode = 200) {
    try {
        const result = await fn();
        if (result?.meta) {
            return paginated(res, result.data, result.meta, 'Berhasil');
        }
        return success(res, result, 'Berhasil', statusCode);
    } catch (err) {
        if (err instanceof BookingError) {
            return error(res, err.message, err.statusCode, err.code);
        }
        logger.error({ err }, '[BOOKING] Unhandled error');
        return error(res, 'Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
}
