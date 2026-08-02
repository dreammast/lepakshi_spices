// ---------------------------------------------------------------------------
// Signed tokens for public quotation actions (accept / reject / view).
// Uses an HMAC over {id}:{action}:{expiry} so links cannot be forged.
// ---------------------------------------------------------------------------
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

export type QuoteAction = 'accept' | 'reject' | 'view';

const QUOTE_TOKEN_TTL_MINUTES = 14 * 24 * 60; // 14 days (offer validity window)

export function signQuoteToken(id: number | string, action: QuoteAction, validMinutes = QUOTE_TOKEN_TTL_MINUTES) {
  const exp = Date.now() + validMinutes * 60 * 1000;
  const payload = `${id}:${action}:${exp}`;
  const sig = createHmac('sha256', env.JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyQuoteToken(token: string): { id: number; action: QuoteAction } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const payload = parts[0];
  const expected = createHmac('sha256', env.JWT_SECRET).update(payload).digest();
  try {
    const given = Buffer.from(parts[1], 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  } catch {
    return null;
  }
  const [idStr, action, expStr] = payload.split(':');
  const exp = Number(expStr);
  if (!idStr || !action || !exp || exp < Date.now()) return null;
  const id = Number(idStr);
  if (isNaN(id)) return null;
  if (action !== 'accept' && action !== 'reject' && action !== 'view') return null;
  return { id, action: action as QuoteAction };
}
