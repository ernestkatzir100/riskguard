'use server';

import { db } from '@/db';
import { tenants, complianceStatus, regRequirements } from '@/db/schema';
import { eq, sql, count } from 'drizzle-orm';

export type MonitorTenant = {
  id: string;
  name: string;
  plan: string;
  complianceScore: number;
  totalReqs: number;
  compliantReqs: number;
  nonCompliantReqs: number;
  inProgressReqs: number;
  notStartedReqs: number;
};

export type ModuleBreakdown = {
  module: string;
  total: number;
  compliant: number;
  score: number;
};

export async function getMonitorData(): Promise<MonitorTenant[]> {
  const allTenants = await db.select().from(tenants);

  const compData = await db
    .select({
      tenantId: complianceStatus.tenantId,
      total: count(),
      compliant: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'compliant')`,
      nonCompliant: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'non_compliant')`,
      inProgress: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'in_progress')`,
      notStarted: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'not_started')`,
    })
    .from(complianceStatus)
    .groupBy(complianceStatus.tenantId);

  const compMap = new Map(compData.map(c => [c.tenantId, c]));

  const results: MonitorTenant[] = allTenants.map(t => {
    const c = compMap.get(t.id);
    const total = c?.total ?? 0;
    const compliant = c?.compliant ?? 0;
    return {
      id: t.id,
      name: t.name,
      plan: t.subscriptionTier,
      complianceScore: total > 0 ? Math.round((compliant / total) * 100) : 0,
      totalReqs: total,
      compliantReqs: compliant,
      nonCompliantReqs: c?.nonCompliant ?? 0,
      inProgressReqs: c?.inProgress ?? 0,
      notStartedReqs: c?.notStarted ?? 0,
    };
  });

  // Sort by compliance score ascending (worst first)
  results.sort((a, b) => a.complianceScore - b.complianceScore);

  return results;
}

export async function getTenantModuleBreakdown(tenantId: string): Promise<ModuleBreakdown[]> {
  const data = await db
    .select({
      module: regRequirements.module,
      total: count(),
      compliant: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'compliant')`,
    })
    .from(complianceStatus)
    .innerJoin(regRequirements, eq(complianceStatus.requirementId, regRequirements.id))
    .where(eq(complianceStatus.tenantId, tenantId))
    .groupBy(regRequirements.module);

  return data.map(d => ({
    module: d.module,
    total: d.total,
    compliant: d.compliant,
    score: d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 0,
  }));
}
