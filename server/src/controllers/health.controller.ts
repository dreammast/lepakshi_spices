import { type Request, type Response } from 'express';
import { getHealthStatus } from '../services/health.service.js';

export function healthController(_req: Request, res: Response) {
  const result = getHealthStatus();
  res.status(200).json({ success: true, data: result });
}
