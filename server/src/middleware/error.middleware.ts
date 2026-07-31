import { type NextFunction, type Request, type Response } from 'express';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isAppError = typeof err === 'object' && err !== null && 'statusCode' in err && typeof (err as any).statusCode === 'number';
  const status = isAppError ? (err as any).statusCode : 500;
  const message = err instanceof Error ? err.message : 'Internal server error';

  const response: Record<string, any> = { success: false, message };
  if (!isAppError && env.NODE_ENV === 'development') {
    response.stack = err instanceof Error ? err.stack?.split('\n').map(l => l.trim()).slice(0, 6) : undefined;
  }

  logger.error({ err, status, path: _req.path }, 'Unhandled error');
  res.status(status).json(response);
}
