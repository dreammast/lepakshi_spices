import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { wholesaleActivityLog } from '../../../db/schema.js';
import type { ActivityLogInput, ActivityEntityType } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Activity Log Repository
// ---------------------------------------------------------------------------

export async function insertActivity(input: ActivityLogInput) {
  await db.insert(wholesaleActivityLog).values({
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
    performedBy: input.performedBy ?? null,
    notes: input.notes ?? null,
    createdAt: new Date(),
  });
}

export async function findActivitiesByEntity(entityType: ActivityEntityType, entityId: number) {
  return db.select().from(wholesaleActivityLog)
    .where(and(
      eq(wholesaleActivityLog.entityType, entityType),
      eq(wholesaleActivityLog.entityId, entityId),
    ))
    .orderBy(desc(wholesaleActivityLog.createdAt));
}

export async function findRecentActivities(limit = 20) {
  return db.select().from(wholesaleActivityLog)
    .orderBy(desc(wholesaleActivityLog.createdAt))
    .limit(limit);
}
