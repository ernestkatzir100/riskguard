import { db } from '@/db';
import { auditLog } from '@/db/schema';

type LogActionInput = {
  action: string;       // e.g. 'risk.created', 'document.approved'
  entity_type: string;  // e.g. 'risk', 'document', 'task'
  entity_id?: string;
  user_id: string;
  tenant_id: string;
  details?: Record<string, unknown>;
};

export async function logAction(input: LogActionInput) {
  await db.insert(auditLog).values({
    tenantId: input.tenant_id,
    userId: input.user_id,
    action: input.action,
    entityType: input.entity_type,
    entityId: input.entity_id,
    details: input.details,
    // ipAddress extracted from headers in middleware if needed
  });
}
