import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = {
  sub: number;
  email: string;
  role: 'customer' | 'staff' | 'manager' | 'admin';
};

export function signToken(payload: JwtPayload, expiresIn = '7d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
