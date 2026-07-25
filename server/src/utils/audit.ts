import { db } from '../config/database.js';
import { auditLogs } from '../db/schema.js';

export async function logAudit(input: {
  actorCustomerId?: number;
  action: string;
  module?: string;
  entityType: string;
  entityId?: string | number;
  previousData?: Record<string, unknown> | null;
  updatedData?: Record<string, unknown> | null;
  ipAddress?: string;
  browser?: string;
  operatingSystem?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      actorCustomerId: input.actorCustomerId ?? null,
      action: input.action,
      module: input.module ?? null,
      entityType: input.entityType,
      entityId: input.entityId != null ? String(input.entityId) : null,
      previousData: input.previousData ?? null,
      updatedData: input.updatedData ?? null,
      ipAddress: input.ipAddress ?? null,
      browser: input.browser ?? null,
      operatingSystem: input.operatingSystem ?? null,
      requestId: input.requestId ?? null,
      details: input.details ?? null,
      createdAt: new Date()
    });
  } catch (err) {
    // Never let audit logging break the main request
    console.error('Audit log write failed:', err);
  }
}
