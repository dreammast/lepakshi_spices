import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { auditLogs } from '../db/schema.js';

export async function findAuditLogs(filters?: {
  entityType?: string;
  actorId?: number;
  from?: string;
  to?: string;
}) {
  let query = db.select().from(auditLogs).$dynamic();

  if (filters?.entityType) {
    query = query.where(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters?.actorId) {
    query = query.where(eq(auditLogs.actorCustomerId, filters.actorId));
  }

  return query.orderBy(desc(auditLogs.createdAt)).limit(500);
}
