import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { uploadImageController } from '../controllers/upload.controller.js';
import { imageUploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Upload an image file (multipart/form-data) or base64/URL to Cloudinary
 *     consumes:
 *       - multipart/form-data
 *       - application/json
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid upload payload
 *       413:
 *         description: Payload or file exceeds 10 MB limit
 *       502:
 *         description: Cloudinary upload failed
 *       503:
 *         description: Cloudinary not configured
 */
router.post('/', imageUploadMiddleware, asyncHandler(uploadImageController));

export default router;
