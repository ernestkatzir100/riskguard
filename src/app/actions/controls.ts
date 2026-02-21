'use server';
import { db } from '@/db';
import { controls, riskControls } from '@/db/schema';
import { getCurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createControlSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getControls(filters?: { type?: string; effectiveness?: string }) {
  const user = await getCurrentUser();
  const results = await db.select().from(controls).where(eq(controls.tenantId, user.tenant_id)).orderBy(desc(controls.createdAt));
  let filtered = results;
  if (filters?.type) filtered = filtered.filter(c => c.type === filters.type);
  if (filters?.effectiveness) filtered = filtered.filter(c => c.effectiveness === filters.effectiveness);
  return filtered;
}

export async function createControl(data: unknown) {
  const user = await getCurrentUser();
  const parsed = createControlSchema.parse(data);
  const [created] = await db.insert(controls).values({ tenantId: user.tenant_id, ...parsed }).returning();
  await logAction({ action: 'control.created', entity_type: 'control', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { title: parsed.title } });
  return created;
}

export async function updateControl(id: string, data: unknown) {
  const user = await getCurrentUser();
  const parsed = createControlSchema.partial().parse(data);
  const [updated] = await db.update(controls).set({ ...parsed, updatedAt: new Date() }).where(and(eq(controls.id, id), eq(controls.tenantId, user.tenant_id))).returning();
  if (!updated) throw new Error('Control not found');
  await logAction({ action: 'control.updated', entity_type: 'control', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: parsed as Record<string, unknown> });
  return updated;
}

export async function linkControlToRisk(controlId: string, riskId: string) {
  const user = await getCurrentUser();
  // Verify both belong to tenant
  const [ctrl] = await db.select().from(controls).where(and(eq(controls.id, controlId), eq(controls.tenantId, user.tenant_id))).limit(1);
  if (!ctrl) throw new Error('Control not found');
  await db.insert(riskControls).values({ controlId, riskId }).onConflictDoNothing();
  await logAction({ action: 'control.linked', entity_type: 'risk_control', user_id: user.id, tenant_id: user.tenant_id, details: { controlId, riskId } });
}

export async function unlinkControlFromRisk(controlId: string, riskId: string) {
  const user = await getCurrentUser();
  await db.delete(riskControls).where(and(eq(riskControls.controlId, controlId), eq(riskControls.riskId, riskId)));
  await logAction({ action: 'control.unlinked', entity_type: 'risk_control', user_id: user.id, tenant_id: user.tenant_id, details: { controlId, riskId } });
}
