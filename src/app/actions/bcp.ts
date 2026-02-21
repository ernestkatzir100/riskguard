'use server';
import { db } from '@/db';
import { bcpPlans, bcpCriticalFunctions, bcpTests } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { updateBCPPlanSchema, createBCPTestSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getBCPPlan() {
  const user = await getCurrentUserOrDemo();
  const [plan] = await db.select().from(bcpPlans).where(eq(bcpPlans.tenantId, user.tenant_id)).orderBy(desc(bcpPlans.createdAt)).limit(1);
  return plan ?? null;
}

export async function getCriticalFunctions() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(bcpCriticalFunctions).where(eq(bcpCriticalFunctions.tenantId, user.tenant_id)).orderBy(bcpCriticalFunctions.priorityOrder);
}

export async function getBCPTests() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(bcpTests).where(eq(bcpTests.tenantId, user.tenant_id)).orderBy(desc(bcpTests.testDate));
}

export async function updateBCPPlan(id: string, data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateBCPPlanSchema.parse(data);
  const [updated] = await db.update(bcpPlans).set(parsed).where(eq(bcpPlans.id, id)).returning();
  if (!updated) throw new Error('BCP Plan not found');
  await logAction({ action: 'bcp_plan.updated', entity_type: 'bcp_plan', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: parsed as Record<string, unknown> });
  return updated;
}

export async function createBCPTest(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createBCPTestSchema.parse(data);
  const [created] = await db.insert(bcpTests).values({ tenantId: user.tenant_id, ...parsed }).returning();
  await logAction({ action: 'bcp_test.created', entity_type: 'bcp_test', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { testType: parsed.testType } });
  return created;
}

export async function deleteBCPTest(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(bcpTests).where(and(eq(bcpTests.id, id), eq(bcpTests.tenantId, user.tenant_id)));
  await logAction({ action: 'bcp_test.deleted', entity_type: 'bcp_test', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}

export async function createCriticalFunction(data: { functionName: string; department?: string; rtoHours?: number; rpoHours?: number; impactLevel?: number; dependencies?: string; recoveryProcedure?: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(bcpCriticalFunctions).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'bcp_critical_function.created', entity_type: 'bcp_critical_function', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { functionName: data.functionName } });
  return created;
}

export async function deleteCriticalFunction(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(bcpCriticalFunctions).where(and(eq(bcpCriticalFunctions.id, id), eq(bcpCriticalFunctions.tenantId, user.tenant_id)));
  await logAction({ action: 'bcp_critical_function.deleted', entity_type: 'bcp_critical_function', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}
