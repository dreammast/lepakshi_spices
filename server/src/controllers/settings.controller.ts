import type { Request, Response, NextFunction } from 'express';
import { getSetting, setSetting } from '../services/settings.service.js';
import { sendSuccess } from '../utils/response.util.js';

export async function getSettingController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSetting(req.params.key);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function upsertSettingController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await setSetting(req.params.key, req.body.value);
    sendSuccess(res, result, 'Setting saved');
  } catch (e) { next(e); }
}
