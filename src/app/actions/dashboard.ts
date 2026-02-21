'use server';
import { db } from '@/db';
import { tasks, auditLog, kris, complianceStatus, regRequirements } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { eq, and, ne, desc, sql } from 'drizzle-orm';

export async function getDashboardData() {
  const user = await getCurrentUserOrDemo();

  // Compliance score computation
  const csRecords = await db.select({
    compliance: complianceStatus,
    requirement: regRequirements,
  })
    .from(complianceStatus)
    .innerJoin(regRequirements, eq(complianceStatus.requirementId, regRequirements.id))
    .where(eq(complianceStatus.tenantId, user.tenant_id));

  const applicable = csRecords.filter(r => r.compliance.status !== 'not_applicable');
  const compliant = applicable.filter(r => r.compliance.status === 'compliant');
  const complianceScore = applicable.length > 0 ? Math.round((compliant.length / applicable.length) * 100) : 0;

  // Module scores
  const moduleMap = new Map<string, { total: number; met: number }>();
  for (const r of csRecords) {
    const mod = r.requirement.module;
    if (!moduleMap.has(mod)) moduleMap.set(mod, { total: 0, met: 0 });
    const entry = moduleMap.get(mod)!;
    if (r.compliance.status !== 'not_applicable') {
      entry.total++;
      if (r.compliance.status === 'compliant') entry.met++;
    }
  }
  const moduleScores = Array.from(moduleMap.entries()).map(([id, data]) => ({
    id,
    name: id,
    score: data.total > 0 ? Math.round((data.met / data.total) * 100) : 0,
    total: data.total,
    met: data.met,
  }));

  // Recent activity: last 20 audit log entries
  const recentActivity = await db.select().from(auditLog)
    .where(eq(auditLog.tenantId, user.tenant_id))
    .orderBy(desc(auditLog.timestamp))
    .limit(20);

  // Overdue tasks: status != completed and dueDate < today
  const overdueTasks = await db.select().from(tasks)
    .where(and(
      eq(tasks.tenantId, user.tenant_id),
      ne(tasks.status, 'completed'),
      sql`${tasks.dueDate} < CURRENT_DATE`,
    ))
    .orderBy(tasks.dueDate);

  // KRI alerts: breached KRIs
  const kriAlerts = await db.select().from(kris)
    .where(and(eq(kris.tenantId, user.tenant_id), eq(kris.breached, true)));

  // Upcoming deadlines: tasks due within 7 days
  const upcomingDeadlines = await db.select().from(tasks)
    .where(and(
      eq(tasks.tenantId, user.tenant_id),
      ne(tasks.status, 'completed'),
      sql`${tasks.dueDate} >= CURRENT_DATE`,
      sql`${tasks.dueDate} <= CURRENT_DATE + INTERVAL '7 days'`,
    ))
    .orderBy(tasks.dueDate);

  return {
    complianceScore,
    moduleScores,
    recentActivity,
    overdueTasks,
    kriAlerts,
    upcomingDeadlines,
  };
}

export async function getRecentActivity(limit = 100) {
  const user = await getCurrentUserOrDemo();
  return db.select().from(auditLog)
    .where(eq(auditLog.tenantId, user.tenant_id))
    .orderBy(desc(auditLog.timestamp))
    .limit(limit);
}
