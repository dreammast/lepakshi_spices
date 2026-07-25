import { eq, desc, and, gte, lte, like } from 'drizzle-orm';
import { db } from '../config/database.js';
import { auditLogs } from '../db/schema.js';

export async function findAuditLogs(filters?: {
  entityType?: string;
  actorId?: number;
  from?: string;
  to?: string;
  action?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const conditions = [];

  if (filters?.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters?.actorId) {
    conditions.push(eq(auditLogs.actorCustomerId, filters.actorId));
  }
  if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
  if (filters?.from) conditions.push(gte(auditLogs.createdAt, new Date(filters.from)));
  if (filters?.to) conditions.push(lte(auditLogs.createdAt, new Date(filters.to)));
  if (filters?.search) conditions.push(like(auditLogs.action, `%${filters.search}%`));
  const page = Math.max(1, filters?.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters?.pageSize || 25));
  let query = db.select().from(auditLogs).$dynamic();
  if (conditions.length) query = query.where(and(...conditions));

  return query.orderBy(desc(auditLogs.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
}
