import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';
import { sendSuccess } from '../utils/response.util.js';

export async function reverseLocationController(req: Request, res: Response, next: NextFunction) {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new AppError(400, 'Valid latitude and longitude are required');
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, { headers: { Accept: 'application/json', 'User-Agent': 'LepakshiSpices/1.0' } });
    if (!response.ok) throw new AppError(502, 'Location address lookup failed');
    const result: any = await response.json();
    const address = result.address || {};
    const street = [address.house_number, address.road || address.pedestrian || address.residential].filter(Boolean).join(' ') || result.display_name;
    if (!street) throw new AppError(404, 'No readable address found for this location');
    sendSuccess(res, { street });
  } catch (error) { next(error); }
}
