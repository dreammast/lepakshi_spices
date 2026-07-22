import { type NextFunction, type Request, type Response } from 'express';
import { logger } from '../utils/logger.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const errWithStatus = err as { statusCode?: unknown };
  const status =
    typeof err === 'object' && err !== null && 'statusCode' in err && typeof errWithStatus.statusCode === 'number'
      ? errWithStatus.statusCode
      : 500;

  logger.error({ err }, 'Unhandled error');
  res.status(status).json({ success: false, message });
}
