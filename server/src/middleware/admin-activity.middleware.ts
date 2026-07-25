import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { logAudit } from '../utils/audit.js';
import type { AuthenticatedRequest } from './auth.middleware.js';

export function adminActivity(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    const authReq = req as AuthenticatedRequest;
    if (!req.path.startsWith('/api/admin') || req.path.includes('/audit-logs') || res.statusCode >= 400) return;
    const method = req.method.toUpperCase();
    if (method === 'GET' || !authReq.user) return;
    const segments = req.path.split('/').filter(Boolean);
    const module = segments[2] || 'admin';
    const entityId = segments.find((part, index) => index > 2 && /^\d+$/.test(part));
    void logAudit({
      actorCustomerId: authReq.user.sub,
      action: `${method} ${module}`,
      module,
      entityType: module,
      entityId,
      updatedData: req.body && Object.keys(req.body).length ? req.body : null,
      ipAddress: req.ip,
      browser: req.get('user-agent'),
      requestId
    });
  });
  next();
}
