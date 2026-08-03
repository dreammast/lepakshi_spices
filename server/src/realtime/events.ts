import { broadcast, emailMatches, isAdminClient, isUserClient, userIdMatches } from './hub.js';

/**
 * Small typed helpers for pushing real-time events + notifications.
 * Data events carry a stable unique `id` so clients can dedupe refreshes/toasts.
 */

let notifSeq = 0;
function nextNotificationId(type: string): string {
  notifSeq += 1;
  return `notif-${Date.now().toString(36)}-${notifSeq}-${type}`;
}

export function emitPublic(type: string, data: unknown) {
  return broadcast(type, data);
}

export function emitAdmin(type: string, data: unknown) {
  return broadcast(type, data, isAdminClient);
}

export function emitUser(type: string, data: unknown, opts?: { userId?: number | null; email?: string | null }) {
  return broadcast(type, data, (c) => {
    if (c.scope !== 'user') return false;
    if (opts?.userId != null && opts.userId !== c.userId) return false;
    if (opts?.userId == null && opts?.email != null && !emailMatches(opts.email)(c)) return false;
    return true;
  });
}

export function emitAdminAndUser(type: string, data: unknown, opts?: { userId?: number | null; email?: string | null }) {
  return broadcast(type, data, (c) => {
    if (isAdminClient(c)) return true;
    if (c.scope !== 'user') return false;
    if (opts?.userId != null && opts.userId === c.userId) return true;
    if (opts?.email != null && emailMatches(opts.email)(c)) return true;
    return false;
  });
}

/**
 * Public catalog events (products, categories, recipes, settings, coupons,
 * campaigns) are pushed to EVERY scope — admins, logged-in customers and
 * anonymous visitors — so the storefront always shows fresh data.
 */
export function emitAdminAndPublic(type: string, data: unknown) {
  return broadcast(type, data);
}

export type RealtimeNotification = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: number;
  meta?: Record<string, unknown>;
};

export function notifyAdmin(type: string, title: string, description?: string, meta?: Record<string, unknown>) {
  const envelope = broadcast('notification', { id: nextNotificationId(type), type, title, description, createdAt: Date.now(), meta } satisfies RealtimeNotification, isAdminClient);
  return envelope;
}

export function notifyUser(type: string, title: string, description?: string, opts?: { userId?: number | null; email?: string | null; meta?: Record<string, unknown> }) {
  const envelope = broadcast(
    'notification',
    { id: nextNotificationId(type), type, title, description, createdAt: Date.now(), meta: opts?.meta } satisfies RealtimeNotification,
    (c) => isUserClient(c) && (userIdMatches(opts?.userId)(c) || (opts?.email != null && emailMatches(opts.email)(c)))
  );
  return envelope;
}

/** Convenience: emit a typed data event to admins AND a bell/toast notification. */
export function adminEvent(type: string, data: unknown, title: string, description?: string, meta?: Record<string, unknown>) {
  emitAdmin(type, data);
  return notifyAdmin(type, title, description, meta);
}

/** Convenience: emit a typed data event to the relevant customer AND a bell/toast notification. */
export function userEvent(type: string, data: unknown, title: string, description?: string, opts?: { userId?: number | null; email?: string | null; meta?: Record<string, unknown> }) {
  emitAdminAndUser(type, data, opts);
  return notifyUser(type, title, description, opts);
}
