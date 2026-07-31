import { findAuditLogs } from '../repositories/audit.repository.js';
import { logAudit } from '../utils/audit.js';

export async function listAuditLogs(filters?: Parameters<typeof findAuditLogs>[0]) {
  return findAuditLogs(filters);
}

export async function createAuditLog(data: {
  action: string;
  details?: any;
  user?: string;
  module?: string;
  entityType?: string;
  entityId?: string | number;
}) {
  await logAudit({
    action: data.action,
    module: data.module || 'WHOLESALE',
    entityType: data.entityType || 'SYSTEM',
    entityId: data.entityId,
    details: typeof data.details === 'object' && data.details !== null ? data.details : { message: data.details, user: data.user }
  });
  return { success: true };
}
