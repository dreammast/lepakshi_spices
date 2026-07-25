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
      ,action: req.query.action as string | undefined
      ,search: req.query.search as string | undefined
      ,page: req.query.page ? Number(req.query.page) : 1
      ,pageSize: req.query.pageSize ? Number(req.query.pageSize) : 25
    };
    sendSuccess(res, await listAuditLogs(filters));
  } catch (e) { next(e); }
}
