import express from 'express';
import { getDBPool } from '../config/db.js';
import { authMiddleware } from '../middleware/Auth.Middleware.js';
import upload from '../middleware/Upload.Middleware.js';
import { success, error } from '../utils/response.js';
import cache from '../utils/cache.js';

const router = express.Router();

// Upload foto profile
// POST /api/upload/profile
router.post('/profile', authMiddleware, (req, res) => {
  upload.single('foto')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return error(res, 'File terlalu besar. Maksimal 2MB.', 400);
      }
      return error(res, err.message || 'Gagal upload file', 400);
    }

    if (!req.file) {
      return error(res, 'File foto wajib diupload', 400);
    }

    try {
      const db = await getDBPool();
      const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path

      // Update foto di database
      await db.query('UPDATE user SET foto = ? WHERE id = ?', [filePath, req.user.id]);

      // Hapus cache terkait
      cache.del(`user_${req.user.id}`);
      cache.del('all_users');

      return success(res, {
        foto: filePath,
        url: `/uploads/profiles/${req.file.filename}`
      }, 'Foto profil berhasil diupload');
    } catch (dbErr) {
      console.error('Upload DB error:', dbErr);
      return error(res, 'Gagal menyimpan data foto', 500);
    }
  });
});

export default router;
