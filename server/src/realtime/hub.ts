import type { ServerResponse } from 'http';

export type RealtimeScope = 'admin' | 'user' | 'anon';

export type RealtimeClient = {
  id: number;
  res: ServerResponse;
  scope: RealtimeScope;
  userId: number | null;
  email: string | null;
};

export type RealtimeEnvelope = {
  id: string;
  type: string;
  data: unknown;
  createdAt: number;
};

const clients = new Set<RealtimeClient>();
let nextClientId = 1;
let eventCounter = 0;

function makeEvent(type: string, data: unknown): RealtimeEnvelope {
  eventCounter = (eventCounter + 1) % 1_000_000;
  return { id: `${Date.now().toString(36)}-${eventCounter}`, type, data, createdAt: Date.now() };
}

function writeTo(res: ServerResponse, envelope: RealtimeEnvelope) {
  if (res.writableEnded || res.destroyed) return;
  try {
    res.write(`id: ${envelope.id}\n`);
    res.write(`data: ${JSON.stringify(envelope)}\n\n`);
  } catch {
    // Connection is gone — it will be removed on 'close'.
  }
}

export function subscribeClient(
  res: ServerResponse,
  meta: { scope: RealtimeScope; userId: number | null; email: string | null }
): RealtimeClient {
  const client: RealtimeClient = {
    id: nextClientId++,
    res,
    scope: meta.scope,
    userId: meta.userId,
    email: meta.email ? String(meta.email).toLowerCase() : null,
  };
  clients.add(client);
  res.on('close', () => {
    clients.delete(client);
  });
  return client;
}

export function clientCount() {
  return clients.size;
}

/**
 * Broadcast an event to every connected client matching `predicate`.
 * Returns the envelope so callers can reuse the event id for notifications.
 */
export function broadcast(
  type: string,
  data: unknown,
  predicate: (client: RealtimeClient) => boolean = () => true
): RealtimeEnvelope {
  const envelope = makeEvent(type, data);
  for (const client of clients) {
    if (predicate(client)) writeTo(client.res, envelope);
  }
  return envelope;
}

export const isAdminClient = (c: RealtimeClient) => c.scope === 'admin';
export const isUserClient = (c: RealtimeClient) => c.scope === 'user';
export const userIdMatches = (userId: number | null | undefined) => (c: RealtimeClient) =>
  userId != null && c.userId != null && c.userId === userId;
export const emailMatches = (email: string | null | undefined) => (c: RealtimeClient) =>
  email != null && c.email != null && c.email === String(email).toLowerCase();
