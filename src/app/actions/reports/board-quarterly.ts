'use server';

import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { generateReportHTML, generateTableHTML } from '@/shared/lib/report-generator';
import { db } from '@/db';
import { tenants, risks, kris, tasks, cyberIncidents, vendors, complianceStatus } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function generateBoardQuarterlyReport() {
  const user = await getCurrentUserOrDemo();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);

  // Gather data
  const allRisks = await db.select().from(risks).where(eq(risks.tenantId, user.tenant_id)).orderBy(desc(risks.riskScore)).limit(10);
  const allKRIs = await db.select().from(kris).where(eq(kris.tenantId, user.tenant_id));
  const overdueTasks = await db.select().from(tasks).where(and(eq(tasks.tenantId, user.tenant_id), sql`${tasks.status} != 'completed'`, sql`${tasks.dueDate} < CURRENT_DATE`));
  const incidents = await db.select().from(cyberIncidents).where(eq(cyberIncidents.tenantId, user.tenant_id)).orderBy(desc(cyberIncidents.detectedAt)).limit(5);
  const allVendors = await db.select().from(vendors).where(eq(vendors.tenantId, user.tenant_id));

  // Compliance score
  const csData = await db.select().from(complianceStatus).where(eq(complianceStatus.tenantId, user.tenant_id));
  const totalReqs = csData.length;
  const metReqs = csData.filter(c => c.status === 'compliant').length;
  const complianceScore = totalReqs > 0 ? Math.round((metReqs / totalReqs) * 100) : 0;

  const date = new Date().toLocaleDateString('he-IL');

  const sections = [
    {
      title: '1. \u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD',
      content: `<p>\u05E6\u05D9\u05D5\u05DF \u05E6\u05D9\u05D5\u05EA \u05DB\u05D5\u05DC\u05DC: <strong>${complianceScore}%</strong> (${metReqs} \u05DE\u05EA\u05D5\u05DA ${totalReqs} \u05D3\u05E8\u05D9\u05E9\u05D5\u05EA)</p>
        <p>\u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05E4\u05EA\u05D5\u05D7\u05D9\u05DD: <strong>${allRisks.filter(r => r.status === 'open').length}</strong></p>
        <p>\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8: <strong>${overdueTasks.length}</strong></p>
        <p>\u05D0\u05D9\u05E8\u05D5\u05E2\u05D9 \u05E1\u05D9\u05D9\u05D1\u05E8 \u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD: <strong>${incidents.length}</strong></p>`,
    },
    {
      title: '2. \u05DE\u05E4\u05EA \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u2014 10 \u05D4\u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05D4\u05DE\u05D5\u05D1\u05D9\u05DC\u05D9\u05DD',
      content: allRisks.length > 0
        ? generateTableHTML(
            ['#', '\u05E1\u05D9\u05DB\u05D5\u05DF', '\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4', '\u05E6\u05D9\u05D5\u05DF', '\u05E1\u05D8\u05D8\u05D5\u05E1'],
            allRisks.map((r, i) => [String(i + 1), r.title, r.category, String(r.riskScore), r.status])
          )
        : '<p>\u05D0\u05D9\u05DF \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05E8\u05E9\u05D5\u05DE\u05D9\u05DD</p>',
    },
    {
      title: '3. \u05DE\u05D3\u05D3\u05D9 \u05E1\u05D9\u05DB\u05D5\u05DF \u05DE\u05E8\u05DB\u05D6\u05D9\u05D9\u05DD (KRI)',
      content: allKRIs.length > 0
        ? generateTableHTML(
            ['\u05DE\u05D3\u05D3', '\u05E2\u05E8\u05DA \u05E0\u05D5\u05DB\u05D7\u05D9', '\u05DE\u05D2\u05DE\u05D4', '\u05D7\u05E8\u05D9\u05D2\u05D4'],
            allKRIs.map(k => [k.name, k.currentValue ?? '-', k.trend ?? '-', k.breached ? '\u05DB\u05DF' : '\u05DC\u05D0'])
          )
        : '<p>\u05D0\u05D9\u05DF \u05DE\u05D3\u05D3\u05D9\u05DD \u05DE\u05D5\u05D2\u05D3\u05E8\u05D9\u05DD</p>',
    },
    {
      title: '4. \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8',
      content: overdueTasks.length > 0
        ? generateTableHTML(
            ['\u05DE\u05E9\u05D9\u05DE\u05D4', '\u05DE\u05D5\u05D3\u05D5\u05DC', '\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA', '\u05EA\u05D0\u05E8\u05D9\u05DA \u05D9\u05E2\u05D3'],
            overdueTasks.map(t => [t.title, t.module ?? '-', t.priority, t.dueDate ?? '-'])
          )
        : '<p>\u05D0\u05D9\u05DF \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8</p>',
    },
    {
      title: '5. \u05E1\u05D9\u05D9\u05D1\u05E8 \u2014 \u05D0\u05D9\u05E8\u05D5\u05E2\u05D9\u05DD \u05D0\u05D7\u05E8\u05D5\u05E0\u05D9\u05DD',
      content: incidents.length > 0
        ? generateTableHTML(
            ['\u05D0\u05D9\u05E8\u05D5\u05E2', '\u05D7\u05D5\u05DE\u05E8\u05D4', '\u05E1\u05D8\u05D8\u05D5\u05E1', '\u05EA\u05D0\u05E8\u05D9\u05DA'],
            incidents.map(i => [i.title, i.severity, i.status, i.detectedAt.toLocaleDateString('he-IL')])
          )
        : '<p>\u05D0\u05D9\u05DF \u05D0\u05D9\u05E8\u05D5\u05E2\u05D9 \u05E1\u05D9\u05D9\u05D1\u05E8</p>',
    },
    {
      title: '6. \u05DE\u05D9\u05E7\u05D5\u05E8 \u05D7\u05D5\u05E5',
      content: allVendors.length > 0
        ? generateTableHTML(
            ['\u05E1\u05E4\u05E7', '\u05E7\u05E8\u05D9\u05D8\u05D9\u05D5\u05EA', '\u05E1\u05D8\u05D8\u05D5\u05E1', '\u05D3\u05D9\u05E8\u05D5\u05D2 \u05E1\u05D9\u05DB\u05D5\u05DF'],
            allVendors.map(v => [v.name, v.criticality, v.status, String(v.riskRating ?? '-')])
          )
        : '<p>\u05D0\u05D9\u05DF \u05E1\u05E4\u05E7\u05D9\u05DD \u05E8\u05E9\u05D5\u05DE\u05D9\u05DD</p>',
    },
  ];

  const html = generateReportHTML({
    title: '\u05D3\u05D5\u05D7 \u05E8\u05D1\u05E2\u05D5\u05E0\u05D9 \u05DC\u05D3\u05D9\u05E8\u05E7\u05D8\u05D5\u05E8\u05D9\u05D5\u05DF',
    subtitle: `\u05E8\u05D1\u05E2\u05D5\u05DF ${Math.ceil((new Date().getMonth() + 1) / 3)} / ${new Date().getFullYear()}`,
    tenant: { name: tenant?.name ?? 'RiskGuard', logoUrl: tenant?.logoUrl ?? undefined },
    date,
    sections,
    confidential: true,
  });

  await logAction({
    action: 'report.generated',
    entity_type: 'report',
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { type: 'board_quarterly' },
  });

  return html;
}
