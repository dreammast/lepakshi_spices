import { db } from '../config/database.js';
import { auditLogs } from '../db/schema.js';

export async function logAudit(input: {
  actorCustomerId?: number;
  action: string;
  entityType: string;
  entityId?: string | number;
  details?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      actorCustomerId: input.actorCustomerId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId != null ? String(input.entityId) : null,
      details: input.details ?? null,
      createdAt: new Date()
    });
  } catch (err) {
    // Never let audit logging break the main request
    console.error('Audit log write failed:', err);
  }
}
