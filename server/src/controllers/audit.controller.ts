import type { Request, Response, NextFunction } from 'express';
import { listAuditLogs } from '../services/audit.service.js';
import { sendSuccess } from '../utils/response.util.js';

export async function listAuditLogsController(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      entityType: req.query.entityType as string | undefined,
      actorId: req.query.actorId ? Number(req.query.actorId) : undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined
    };
    sendSuccess(res, await listAuditLogs(filters));
  } catch (e) { next(e); }
}
