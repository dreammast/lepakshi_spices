import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG, AVIF) are allowed'));
    }
  },
});

// Middleware that accepts either 'image' or 'file' field
const uploadAnySingleImage = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

export function imageUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  uploadAnySingleImage(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size exceeds the 10 MB limit',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid upload request',
      });
    }

    // Normalize req.file from multer.fields if present
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.image && files.image.length > 0) {
        req.file = files.image[0];
      } else if (files.file && files.file.length > 0) {
        req.file = files.file[0];
      }
    }

    next();
  });
}
