import { findAuditLogs } from '../repositories/audit.repository.js';

export async function listAuditLogs(filters?: Parameters<typeof findAuditLogs>[0]) {
  return findAuditLogs(filters);
}
