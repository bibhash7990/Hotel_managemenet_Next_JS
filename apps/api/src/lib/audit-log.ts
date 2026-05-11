import { AuditLogModel } from '../models/mongo/AuditLog.js';
import { logger } from './logger.js';

export function writeAuditLog(entry: {
  actorId?: string | null;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}): void {
  void AuditLogModel.create({
    actorId: entry.actorId ?? undefined,
    action: entry.action,
    resource: entry.resource,
    metadata: entry.metadata,
    ip: entry.ip ?? undefined,
  }).catch((err) => logger.warn({ err, action: entry.action }, 'audit log write failed'));
}
