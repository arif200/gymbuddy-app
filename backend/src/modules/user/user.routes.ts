import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requireRole, requireOwnershipOrRole } from '../../middleware/role';
import {
    updateUserSchema,
    listUsersQuerySchema,
    idParamSchema,
    emailParamSchema,
} from './user.schema';
import {
    listUsersController,
    getUserByIdController,
    getUserByEmailController,
    getMyProfileController,
    updateMyProfileController,
    updateUserByIdController,
    deleteUserController,
} from './user.controller';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), validate(listUsersQuerySchema), listUsersController);
router.get('/profile', authMiddleware, getMyProfileController);
router.put('/profile', authMiddleware, validate(updateUserSchema), updateMyProfileController);
router.get('/email/:email', authMiddleware, requireRole('admin'), validate(emailParamSchema), getUserByEmailController);
router.get('/:id', authMiddleware, validate(idParamSchema), getUserByIdController);
router.put('/:id', authMiddleware, requireOwnershipOrRole('admin'), validate(idParamSchema), validate(updateUserSchema), updateUserByIdController);
router.delete('/:id', authMiddleware, requireRole('admin'), validate(idParamSchema), deleteUserController);

export default router;
