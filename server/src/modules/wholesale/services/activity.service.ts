import { insertActivity, findActivitiesByEntity, findRecentActivities } from '../repositories/activity.repository.js';
import type { ActivityLogInput, ActivityEntityType } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Activity Service
//
// Wraps the repository for safe logging — never throws, never breaks callers.
// ---------------------------------------------------------------------------

/** Record an activity. Silently swallows errors so it never breaks the main flow. */
export async function recordActivity(input: ActivityLogInput): Promise<void> {
  try {
    await insertActivity(input);
  } catch (err) {
    console.error('[wholesale-activity] Failed to log activity:', err);
  }
}

/** Get full activity history for a specific entity. */
export async function getEntityHistory(entityType: ActivityEntityType, entityId: number) {
  return findActivitiesByEntity(entityType, entityId);
}

/** Get most recent activities across all wholesale entities. */
export async function getRecentActivity(limit = 20) {
  return findRecentActivities(limit);
}
