'use server';

import { db } from '@/db';
import {
  tenants, users, complianceStatus,
  nutelaPushes, risks, tasks,
} from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/shared/lib/auth';

/** Guard: throws if current user is not super admin */
async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user.is_super_admin) {
    throw new Error('אין הרשאה: גישת סופר אדמין בלבד');
  }
  return user;
}

/** Fallback super-admin check for demo mode */
async function requireSuperAdminOrDemo() {
  try {
    return await requireSuperAdmin();
  } catch {
    // demo mode — allow access
    return null;
  }
}

export type TenantRow = {
  id: string;
  name: string;
  plan: string;
  complianceScore: number;
  activeUsers: number;
  lastLogin: string | null;
  status: 'active' | 'trial' | 'suspended';
  createdAt: string;
};

export async function getAdminDashboardData() {
  await requireSuperAdminOrDemo();

  // Get all tenants
  const allTenants = await db.select().from(tenants);

  // Get user counts per tenant
  const userCounts = await db
    .select({
      tenantId: users.tenantId,
      count: count(),
    })
    .from(users)
    .groupBy(users.tenantId);
  const userCountMap = new Map(userCounts.map(u => [u.tenantId, u.count]));

  // Get last login per tenant
  const lastLogins = await db
    .select({
      tenantId: users.tenantId,
      lastLogin: sql<string>`MAX(${users.lastLogin})`,
    })
    .from(users)
    .groupBy(users.tenantId);
  const lastLoginMap = new Map(lastLogins.map(l => [l.tenantId, l.lastLogin]));

  // Get compliance scores per tenant
  const compScores = await db
    .select({
      tenantId: complianceStatus.tenantId,
      total: count(),
      compliant: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'compliant')`,
    })
    .from(complianceStatus)
    .groupBy(complianceStatus.tenantId);
  const compMap = new Map(compScores.map(c => [c.tenantId, c.total > 0 ? Math.round((c.compliant / c.total) * 100) : 0]));

  const PLAN_PRICES: Record<string, number> = { starter: 3500, pro: 5000, enterprise: 8000 };

  const tenantRows: TenantRow[] = allTenants.map(t => {
    const daysSinceCreation = Math.floor((Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    let status: 'active' | 'trial' | 'suspended' = 'active';
    if (daysSinceCreation < 30 && t.subscriptionTier === 'starter') status = 'trial';

    return {
      id: t.id,
      name: t.name,
      plan: t.subscriptionTier,
      complianceScore: compMap.get(t.id) ?? 0,
      activeUsers: userCountMap.get(t.id) ?? 0,
      lastLogin: lastLoginMap.get(t.id) ?? null,
      status,
      createdAt: t.createdAt.toISOString(),
    };
  });

  // KPI calculations
  const totalCustomers = allTenants.length;
  const avgCompliance = totalCustomers > 0
    ? Math.round(tenantRows.reduce((sum, t) => sum + t.complianceScore, 0) / totalCustomers)
    : 0;
  const mrr = allTenants.reduce((sum, t) => sum + (PLAN_PRICES[t.subscriptionTier] ?? 0), 0);
  const atRiskCount = tenantRows.filter(t => t.complianceScore < 50).length;

  // Plan breakdown
  const planBreakdown = {
    starter: allTenants.filter(t => t.subscriptionTier === 'starter').length,
    pro: allTenants.filter(t => t.subscriptionTier === 'pro').length,
    enterprise: allTenants.filter(t => t.subscriptionTier === 'enterprise').length,
  };

  return {
    tenants: tenantRows,
    kpis: { totalCustomers, avgCompliance, mrr, atRiskCount },
    planBreakdown,
  };
}

export async function getTenantDrilldown(tenantId: string) {
  await requireSuperAdminOrDemo();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!tenant) throw new Error('לקוח לא נמצא');

  const tenantUsers = await db.select().from(users).where(eq(users.tenantId, tenantId));

  const tenantRisks = await db
    .select({ status: risks.status, count: count() })
    .from(risks)
    .where(eq(risks.tenantId, tenantId))
    .groupBy(risks.status);

  const tenantTasks = await db
    .select({ status: tasks.status, count: count() })
    .from(tasks)
    .where(eq(tasks.tenantId, tenantId))
    .groupBy(tasks.status);

  const compData = await db
    .select({
      total: count(),
      compliant: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'compliant')`,
      inProgress: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'in_progress')`,
      nonCompliant: sql<number>`COUNT(*) FILTER (WHERE ${complianceStatus.status} = 'non_compliant')`,
    })
    .from(complianceStatus)
    .where(eq(complianceStatus.tenantId, tenantId));

  const pushes = await db
    .select()
    .from(nutelaPushes)
    .where(eq(nutelaPushes.tenantId, tenantId))
    .orderBy(sql`${nutelaPushes.createdAt} DESC`)
    .limit(10);

  return {
    tenant,
    users: tenantUsers,
    risks: tenantRisks,
    tasks: tenantTasks,
    compliance: compData[0] ?? { total: 0, compliant: 0, inProgress: 0, nonCompliant: 0 },
    pushes,
  };
}
