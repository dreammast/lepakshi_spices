import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type JwtPayload } from '../utils/jwt.util.js';

export type AuthenticatedRequest = Request & { user?: JwtPayload };

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = '';
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const token = header.slice(7);
      req.user = verifyToken(token);
    } catch {
      // Ignore invalid token in optional authentication
    }
  }
  next();
}


export function requireRole(...roles: JwtPayload['role'][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}
