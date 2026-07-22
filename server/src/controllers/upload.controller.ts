import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';

export async function uploadImageController(req: Request, res: Response, next: NextFunction) {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
      try {
        const cloudName = cloudinaryUrl.split('@')[1] || 'demo';
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: image,
            upload_preset: 'unsigned_preset'
          })
        });

        if (uploadRes.ok) {
          const cloudJson = await uploadRes.json();
          if (cloudJson.secure_url) {
            return sendSuccess(res, { url: cloudJson.secure_url }, 201);
          }
        }
      } catch (err) {
        console.warn('Cloudinary API upload fallback to data URL:', err);
      }
    }

    // If data URL or base64 string, return it directly
    return sendSuccess(res, { url: image, message: 'Image processed successfully' }, 201);
  } catch (error) {
    next(error);
  }
}
