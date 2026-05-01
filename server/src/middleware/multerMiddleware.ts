import multer from 'multer';
import { ValidationError } from '../errors/AppError';
import { Request } from 'express';

const AVATAR_MAX_BYTES = 1 * 1024 * 1024; // 1MB

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_BYTES },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new ValidationError('Avatar must be JPEG, PNG, or WebP.', 'AVATAR_INVALID_TYPE'));
      return;
    }
    cb(null, true);
  },
});
