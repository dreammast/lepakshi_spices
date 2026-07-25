import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';

export async function uploadImageController(req: Request, res: Response, next: NextFunction) {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) return res.status(503).json({ success: false, message: 'Cloudinary is not configured' });

    if (cloudinaryUrl) {
      try {
        const cloudName = cloudinaryUrl.split('@')[1];
        if (!cloudName) return res.status(503).json({ success: false, message: 'Cloudinary configuration is invalid' });
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: image,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset'
          })
        });

        if (uploadRes.ok) {
          const cloudJson = await uploadRes.json();
          if (cloudJson.secure_url) {
            return res.status(201).json({ success: true, data: { url: cloudJson.secure_url } });
          }
        }
      } catch (err) {
        console.warn('Cloudinary API upload fallback to data URL:', err);
      }
    }

    return res.status(502).json({ success: false, message: 'Cloudinary upload failed' });
  } catch (error) {
    next(error);
  }
}
