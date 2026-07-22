import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { uploadImageController } from '../controllers/upload.controller.js';

const router = Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Upload an image file or base64 to Cloudinary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 */
router.post('/', asyncHandler(uploadImageController));

export default router;
