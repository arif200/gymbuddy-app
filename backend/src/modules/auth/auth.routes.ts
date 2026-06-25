import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
    registerCustomerSchema,
    registerTrainerSchema,
    registerAdminSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from './auth.schema';
import {
    registerCustomerController,
    registerTrainerController,
    registerAdminController,
    loginController,
    getMeController,
    forgotPasswordController,
    resetPasswordController,
} from './auth.controller';

const router = Router();

router.post('/register', validate(registerCustomerSchema), registerCustomerController);
router.post('/register/trainer', validate(registerTrainerSchema), registerTrainerController);
router.post('/register/admin', authMiddleware, requireRole('admin'), validate(registerAdminSchema), registerAdminController);
router.post('/login', validate(loginSchema), loginController);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);
router.get('/me', authMiddleware, getMeController);

export default router;
