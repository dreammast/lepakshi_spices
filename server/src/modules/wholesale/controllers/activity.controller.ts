import type { Request, Response, NextFunction } from 'express';
import {
  getEntityHistory,
  getRecentActivity,
} from '../services/activity.service.js';
import { sendSuccess } from '../../../utils/response.util.js';
import type { ActivityEntityType } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Activity Controllers
// ---------------------------------------------------------------------------

export async function getEntityActivityController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const { entityType, id } = req.params;
    const history = await getEntityHistory(entityType as ActivityEntityType, Number(id));
    sendSuccess(res, history);
  } catch (e) {
    next(e);
  }
}

export async function getRecentActivityController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    sendSuccess(res, await getRecentActivity(limit));
  } catch (e) {
    next(e);
  }
}
