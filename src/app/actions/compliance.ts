'use server';
import { db } from '@/db';
import { complianceStatus, regulations, regRequirements, regSections } from '@/db/schema';
import { getCurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { updateComplianceStatusSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getComplianceStatus() {
  const user = await getCurrentUser();
  const results = await db.select({
    compliance: complianceStatus,
    requirement: regRequirements,
  })
    .from(complianceStatus)
    .innerJoin(regRequirements, eq(complianceStatus.requirementId, regRequirements.id))
    .where(eq(complianceStatus.tenantId, user.tenant_id))
    .orderBy(desc(complianceStatus.updatedAt));
  return results;
}

export async function updateComplianceStatus(data: unknown) {
  const user = await getCurrentUser();
  const parsed = updateComplianceStatusSchema.parse(data);

  // Upsert: insert if not exists, update if exists
  const [existing] = await db.select().from(complianceStatus)
    .where(and(
      eq(complianceStatus.tenantId, user.tenant_id),
      eq(complianceStatus.requirementId, parsed.requirementId),
    ))
    .limit(1);

  let result;
  if (existing) {
    const [updated] = await db.update(complianceStatus)
      .set({
        status: parsed.status,
        notes: parsed.notes,
        evidenceIds: parsed.evidenceIds,
        lastReviewed: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(complianceStatus.id, existing.id),
        eq(complianceStatus.tenantId, user.tenant_id),
      ))
      .returning();
    result = updated;
  } else {
    const [created] = await db.insert(complianceStatus).values({
      tenantId: user.tenant_id,
      requirementId: parsed.requirementId,
      status: parsed.status,
      notes: parsed.notes,
      evidenceIds: parsed.evidenceIds,
      lastReviewed: new Date(),
    }).returning();
    result = created;
  }

  await logAction({
    action: existing ? 'compliance.updated' : 'compliance.created',
    entity_type: 'compliance_status',
    entity_id: result.id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { requirementId: parsed.requirementId, status: parsed.status },
  });
  return result;
}

export async function getComplianceScore() {
  const user = await getCurrentUser();

  // Get all compliance status records with their requirement context
  const records = await db.select({
    compliance: complianceStatus,
    requirement: regRequirements,
    section: regSections,
  })
    .from(complianceStatus)
    .innerJoin(regRequirements, eq(complianceStatus.requirementId, regRequirements.id))
    .innerJoin(regSections, eq(regRequirements.sectionId, regSections.id))
    .where(eq(complianceStatus.tenantId, user.tenant_id));

  // Compute overall score: compliant / (total - not_applicable)
  const applicable = records.filter(r => r.compliance.status !== 'not_applicable');
  const compliant = applicable.filter(r => r.compliance.status === 'compliant');
  const overall = applicable.length > 0 ? Math.round((compliant.length / applicable.length) * 100) : 0;

  // Compute by module
  const moduleMap = new Map<string, { total: number; met: number }>();
  for (const r of records) {
    const mod = r.requirement.module;
    if (!moduleMap.has(mod)) moduleMap.set(mod, { total: 0, met: 0 });
    const entry = moduleMap.get(mod)!;
    if (r.compliance.status !== 'not_applicable') {
      entry.total++;
      if (r.compliance.status === 'compliant') entry.met++;
    }
  }
  const byModule = Array.from(moduleMap.entries()).map(([id, data]) => ({
    id,
    name: id,
    score: data.total > 0 ? Math.round((data.met / data.total) * 100) : 0,
  }));

  // Compute by regulation
  const regMap = new Map<string, { score: number; reqs: number; met: number }>();
  for (const r of records) {
    const regId = r.section.regulationId;
    if (!regMap.has(regId)) regMap.set(regId, { score: 0, reqs: 0, met: 0 });
    const entry = regMap.get(regId)!;
    if (r.compliance.status !== 'not_applicable') {
      entry.reqs++;
      if (r.compliance.status === 'compliant') entry.met++;
    }
  }
  const byRegulation: Record<string, { score: number; reqs: number; met: number }> = {};
  for (const [regId, data] of regMap.entries()) {
    byRegulation[regId] = {
      score: data.reqs > 0 ? Math.round((data.met / data.reqs) * 100) : 0,
      reqs: data.reqs,
      met: data.met,
    };
  }

  return { overall, byModule, byRegulation };
}

export async function getRegulations() {
  // Shared data — no tenant filter
  return db.select().from(regulations);
}

export async function getRequirementsByModule(module: string) {
  const results = await db.select({
    requirement: regRequirements,
    section: regSections,
  })
    .from(regRequirements)
    .innerJoin(regSections, eq(regRequirements.sectionId, regSections.id))
    .where(eq(regRequirements.module, module as 'governance' | 'operational' | 'outsourcing' | 'bcp' | 'cyber_governance' | 'cyber_protection' | 'cyber_incidents' | 'credit' | 'board'));
  return results;
}
