import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan folder uploads ada
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Buat nama file unik: userId-timestamp.ext
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `profile-${req.user?.id || 'anon'}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

// Filter file: hanya gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  }
});

export default upload;
