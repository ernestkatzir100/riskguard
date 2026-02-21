'use server';
import { db } from '@/db';
import { kris } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { updateKRISchema } from '@/shared/lib/validators';
import { eq, and } from 'drizzle-orm';

export async function getKRIs() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(kris).where(eq(kris.tenantId, user.tenant_id));
}

export async function updateKRI(id: string, data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateKRISchema.parse(data);
  const [updated] = await db.update(kris)
    .set({ ...parsed, updatedAt: new Date() })
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
