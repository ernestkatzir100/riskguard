'use server';
import { db } from '@/db';
import { risks, controls, riskControls } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createRiskSchema, updateRiskSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getRisks(filters?: { category?: string; status?: string }) {
  const user = await getCurrentUserOrDemo();
  const query = db.select().from(risks).where(eq(risks.tenantId, user.tenant_id)).orderBy(desc(risks.createdAt));
  const results = await query;
  let filtered = results;
  if (filters?.category) filtered = filtered.filter(r => r.category === filters.category);
  if (filters?.status) filtered = filtered.filter(r => r.status === filters.status);
  return filtered;
}

export async function getRiskById(id: string) {
  const user = await getCurrentUserOrDemo();
  const [risk] = await db.select().from(risks).where(and(eq(risks.id, id), eq(risks.tenantId, user.tenant_id))).limit(1);
  if (!risk) throw new Error('Risk not found');
  // Get linked controls
  const linkedControls = await db.select({ control: controls }).from(riskControls).innerJoin(controls, eq(riskControls.controlId, controls.id)).where(eq(riskControls.riskId, id));
  return { ...risk, controls: linkedControls.map(lc => lc.control) };
}

export async function createRisk(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createRiskSchema.parse(data);
  const [created] = await db.insert(risks).values({
    tenantId: user.tenant_id,
    ...parsed,
    riskScore: parsed.probability * parsed.impact,
  }).returning();
  await logAction({ action: 'risk.created', entity_type: 'risk', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { title: parsed.title } });
  return created;
}

export async function updateRisk(id: string, data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateRiskSchema.parse(data);
  const values: Record<string, unknown> = { ...parsed, updatedAt: new Date() };
  if (parsed.probability !== undefined && parsed.impact !== undefined) {
    values.riskScore = parsed.probability * parsed.impact;
  }
  const [updated] = await db.update(risks).set(values).where(and(eq(risks.id, id), eq(risks.tenantId, user.tenant_id))).returning();
  if (!updated) throw new Error('Risk not found');
  await logAction({ action: 'risk.updated', entity_type: 'risk', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: parsed as Record<string, unknown> });
  return updated;
}

export async function deleteRisk(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(riskControls).where(eq(riskControls.riskId, id));
  await db.delete(risks).where(and(eq(risks.id, id), eq(risks.tenantId, user.tenant_id)));
  await logAction({ action: 'risk.deleted', entity_type: 'risk', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}

export async function getRiskHeatMap() {
  const user = await getCurrentUserOrDemo();
  const allRisks = await db.select({ probability: risks.probability, impact: risks.impact }).from(risks).where(and(eq(risks.tenantId, user.tenant_id), eq(risks.status, 'open')));
  const map: Record<string, number> = {};
  for (const r of allRisks) {
    const key = `${r.probability}-${r.impact}`;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map).map(([key, count]) => {
    const [probability, impact] = key.split('-').map(Number);
    return { probability, impact, count };
  });
}
