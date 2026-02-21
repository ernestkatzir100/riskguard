'use server';
import { db } from '@/db';
import { cyberIncidents, penTests, vulnScans } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createIncidentSchema, updateIncidentSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getCyberIncidents() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(cyberIncidents).where(eq(cyberIncidents.tenantId, user.tenant_id)).orderBy(desc(cyberIncidents.detectedAt));
}

export async function createCyberIncident(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createIncidentSchema.parse(data);
  const [created] = await db.insert(cyberIncidents).values({ tenantId: user.tenant_id, ...parsed, detectedAt: new Date(parsed.detectedAt) }).returning();
  await logAction({ action: 'cyber_incident.created', entity_type: 'cyber_incident', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { title: parsed.title, severity: parsed.severity } });
  return created;
}

export async function updateCyberIncident(id: string, data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateIncidentSchema.parse(data);
  const values: Record<string, unknown> = { ...parsed };
  if (parsed.status === 'resolved' || parsed.status === 'closed') values.resolvedAt = new Date();
  const [updated] = await db.update(cyberIncidents).set(values).where(and(eq(cyberIncidents.id, id), eq(cyberIncidents.tenantId, user.tenant_id))).returning();
  if (!updated) throw new Error('Incident not found');
  await logAction({ action: 'cyber_incident.updated', entity_type: 'cyber_incident', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: parsed as Record<string, unknown> });
  return updated;
}

export async function getPenTests() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(penTests).where(eq(penTests.tenantId, user.tenant_id)).orderBy(desc(penTests.testDate));
}

export async function getVulnScans() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(vulnScans).where(eq(vulnScans.tenantId, user.tenant_id)).orderBy(desc(vulnScans.scanDate));
}
