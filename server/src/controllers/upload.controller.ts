import type { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) return null;

  try {
    const parsed = new URL(cloudinaryUrl.replace('cloudinary://', 'http://'));
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: parsed.password,
      secure: true,
    });
    return cloudinary;
  } catch (err) {
    console.warn('[cloudinary] Failed to parse CLOUDINARY_URL:', err);
    return null;
  }
}

function uploadBufferToCloudinary(buffer: Buffer, folder = 'lepakshi_spices'): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    configureCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Failed to upload image buffer to Cloudinary'));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadImageController(req: Request, res: Response, next: NextFunction) {
  try {
    const activeCloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!activeCloudinaryUrl) {
      return res.status(503).json({ success: false, message: 'Cloudinary is not configured on server' });
    }

    const client = configureCloudinary();
    if (!client) {
      return res.status(503).json({ success: false, message: 'Cloudinary configuration is invalid' });
    }

    let uploadResult: UploadApiResponse | null = null;

    if (req.file && req.file.buffer) {
      // Multipart/form-data upload via Multer (binary stream)
      uploadResult = await uploadBufferToCloudinary(req.file.buffer);
    } else if (req.body && req.body.image) {
      // Direct base64 / URL string upload (fallback / backward compatibility)
      const imageStr = req.body.image;
      if (typeof imageStr !== 'string' || !imageStr.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid image data provided' });
      }
      uploadResult = await cloudinary.uploader.upload(imageStr, {
        folder: 'lepakshi_spices',
        resource_type: 'image',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image file or image data provided in request',
      });
    }

    if (uploadResult && uploadResult.secure_url) {
      return res.status(201).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
        },
      });
    }

    return res.status(502).json({ success: false, message: 'Cloudinary upload did not return a valid URL' });
  } catch (error: any) {
    console.error('[upload] Cloudinary upload error:', error);
    return res.status(502).json({
      success: false,
      message: error?.message || 'Failed to upload image to Cloudinary',
    });
  }
}
