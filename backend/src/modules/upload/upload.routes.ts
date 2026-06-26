import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import type { AuthedRequest } from '../../middleware/auth';
import { uploadMiddleware } from '../../middleware/upload';
import { success, error } from '../../utils/response';
import { updateUser } from '../user/user.repo';
import path from 'path';

const router = Router();

router.post('/profile', authMiddleware, uploadMiddleware.single('foto'), async (req, res) => {
    try {
        const file = (req as any).file;
        if (!file) {
            return error(res, 'File tidak ditemukan', 400, 'VALIDATION_ERROR');
        }

        const userId = (req as AuthedRequest).user!.id;
        const fotoPath = `uploads/profiles/${file.filename}`;

        await updateUser(userId, { foto: fotoPath });

        return success(res, { foto: fotoPath }, 'Foto profil berhasil diperbarui', 200);
    } catch (err) {
        return error(res, 'Gagal upload foto', 500, 'INTERNAL_ERROR');
    }
});

export default router;
