'use server';
import { db } from '@/db';
import { kris } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createKRISchema, updateKRISchema } from '@/shared/lib/validators';
import { eq, and } from 'drizzle-orm';

export async function getKRIs() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(kris).where(eq(kris.tenantId, user.tenant_id));
}

export async function createKRI(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createKRISchema.parse(data);
  const [created] = await db.insert(kris).values({ tenantId: user.tenant_id, ...parsed }).returning();
  await logAction({
    action: 'kri.created',
    entity_type: 'kri',
    entity_id: created.id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { name: parsed.name },
  });
  return created;
}

export async function deleteKRI(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(kris).where(and(eq(kris.id, id), eq(kris.tenantId, user.tenant_id)));
  await logAction({
    action: 'kri.deleted',
    entity_type: 'kri',
    entity_id: id,
    user_id: user.id,
    tenant_id: user.tenant_id,
  });
}

export async function updateKRI(id: string, data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateKRISchema.parse(data);

  // Auto-detect breach: compare currentValue vs threshold
  const updates = { ...parsed, updatedAt: new Date() };
  const cv = parseFloat(String(parsed.currentValue ?? ''));
  const th = parseFloat(String(parsed.threshold ?? ''));
  if (!isNaN(cv) && !isNaN(th)) {
    (updates as Record<string, unknown>).breached = cv > th;
  }

  const [updated] = await db.update(kris)
    .set(updates)
    .where(and(eq(kris.id, id), eq(kris.tenantId, user.tenant_id)))
    .returning();
  if (!updated) throw new Error('KRI not found');
  await logAction({
    action: 'kri.updated',
    entity_type: 'kri',
    entity_id: id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: parsed as Record<string, unknown>,
  });
  return updated;
}

export async function getKRIHistory(id: string) {
  void id;
  // Placeholder: KRI history tracking would need a separate kri_history table
  // For now, return empty array
  return [] as Array<{ id: string; kriId: string; value: string; recordedAt: string }>;
}

export async function getBreachedKRIs() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(kris)
    .where(and(eq(kris.tenantId, user.tenant_id), eq(kris.breached, true)));
}
