'use server';

import { getCurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { generateReportHTML, generateTableHTML } from '@/shared/lib/report-generator';
import { db } from '@/db';
import { tenants, risks, controls, kris, tasks } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function generateAnnualRiskAssessment() {
  const user = await getCurrentUser();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);

  // Fetch all risks
  const allRisks = await db.select().from(risks).where(eq(risks.tenantId, user.tenant_id)).orderBy(desc(risks.riskScore));

  // Top 10 risks by score
  const topRisks = allRisks.slice(0, 10);

  // Group risks by category
  const risksByCategory = allRisks.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});

  // Fetch controls
  const allControls = await db.select().from(controls).where(eq(controls.tenantId, user.tenant_id));

  // Fetch KRIs
  const allKRIs = await db.select().from(kris).where(eq(kris.tenantId, user.tenant_id));

  // Overdue tasks
  const overdueTasks = await db.select().from(tasks).where(
    and(eq(tasks.tenantId, user.tenant_id), sql`${tasks.status} != 'completed'`, sql`${tasks.dueDate} < CURRENT_DATE`)
  );

  const date = new Date().toLocaleDateString('he-IL');
  const year = new Date().getFullYear();

  const sections = [
    {
      title: '1. \u05E1\u05D1\u05D9\u05D1\u05D4 \u05E2\u05E1\u05E7\u05D9\u05EA \u05D5\u05E8\u05D2\u05D5\u05DC\u05D8\u05D5\u05E8\u05D9\u05EA',
      content: `<p>\u05E9\u05DD \u05D4\u05D2\u05D5\u05E3: <strong>${tenant?.name ?? '-'}</strong></p>
        <p>\u05D7.\u05E4. / \u05D7.\u05E6.: <strong>${tenant?.companyId ?? '-'}</strong></p>
        <p>\u05E1\u05D5\u05D2 \u05E8\u05D9\u05E9\u05D9\u05D5\u05DF: <strong>${tenant?.licenseType ?? '-'}</strong></p>
        <p>\u05D4\u05E2\u05E8\u05DB\u05EA \u05D4\u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05D4\u05E9\u05E0\u05EA\u05D9\u05EA \u05DE\u05D1\u05D5\u05E6\u05E2\u05EA \u05D1\u05D4\u05EA\u05D0\u05DD \u05DC\u05D3\u05E8\u05D9\u05E9\u05D5\u05EA \u05D4\u05DE\u05E4\u05E7\u05D7 \u05D5\u05D4\u05E0\u05D7\u05D9\u05D5\u05EA \u05D4\u05E8\u05D2\u05D5\u05DC\u05D8\u05D5\u05E8\u05D9\u05D5\u05EA, \u05DB\u05E4\u05D9 \u05E9\u05E4\u05D5\u05E8\u05E1\u05DE\u05D5 \u05E2\u05DC \u05D9\u05D3\u05D9 \u05D4\u05DE\u05E4\u05E7\u05D7 \u05E2\u05DC \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05D9\u05DD.</p>`,
    },
    {
      title: '2. \u05DE\u05EA\u05D5\u05D3\u05D5\u05DC\u05D5\u05D2\u05D9\u05D9\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4',
      content: `<p>\u05D4\u05E2\u05E8\u05DB\u05EA \u05D4\u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05D1\u05D5\u05E6\u05E2\u05D4 \u05D1\u05D4\u05EA\u05D0\u05DD \u05DC\u05DE\u05EA\u05D5\u05D3\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DE\u05E7\u05D5\u05D1\u05DC\u05EA, \u05D4\u05DB\u05D5\u05DC\u05DC\u05EA:</p>
        <ul>
          <li>\u05D6\u05D9\u05D4\u05D5\u05D9 \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA (operational, cyber, credit, outsourcing, BCP, governance)</li>
          <li>\u05D4\u05E2\u05E8\u05DB\u05EA \u05D4\u05E1\u05EA\u05D1\u05E8\u05D5\u05EA \u05D5\u05D4\u05E9\u05E4\u05E2\u05D4 \u05D1\u05E1\u05D5\u05DC\u05DD 1\u20135</li>
          <li>\u05D7\u05D9\u05E9\u05D5\u05D1 \u05E6\u05D9\u05D5\u05DF \u05E1\u05D9\u05DB\u05D5\u05DF = \u05D4\u05E1\u05EA\u05D1\u05E8\u05D5\u05EA \u00D7 \u05D4\u05E9\u05E4\u05E2\u05D4</li>
          <li>\u05DE\u05D9\u05E4\u05D5\u05D9 \u05D1\u05E7\u05E8\u05D5\u05EA \u05D5\u05D4\u05E2\u05E8\u05DB\u05EA \u05D0\u05E4\u05E7\u05D8\u05D9\u05D1\u05D9\u05D5\u05EA</li>
          <li>\u05E0\u05D9\u05D8\u05D5\u05E8 \u05DE\u05D3\u05D3\u05D9 \u05E1\u05D9\u05DB\u05D5\u05DF \u05DE\u05E8\u05DB\u05D6\u05D9\u05D9\u05DD (KRI)</li>
        </ul>`,
    },
    {
      title: '3. \u05DE\u05E4\u05EA \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD',
      content: Object.keys(risksByCategory).length > 0
        ? `<p>\u05E1\u05D4"\u05DB \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05E8\u05E9\u05D5\u05DE\u05D9\u05DD: <strong>${allRisks.length}</strong></p>` +
          generateTableHTML(
            ['\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4', '\u05DB\u05DE\u05D5\u05EA'],
            Object.entries(risksByCategory).map(([cat, count]) => [cat, String(count)])
          )
        : '<p>\u05D0\u05D9\u05DF \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05E8\u05E9\u05D5\u05DE\u05D9\u05DD</p>',
    },
    {
      title: '4. \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05E2\u05D9\u05E7\u05E8\u05D9\u05D9\u05DD \u2014 10 \u05D4\u05DE\u05D5\u05D1\u05D9\u05DC\u05D9\u05DD',
      content: topRisks.length > 0
        ? generateTableHTML(
            ['#', '\u05E1\u05D9\u05DB\u05D5\u05DF', '\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4', '\u05D4\u05E1\u05EA\u05D1\u05E8\u05D5\u05EA', '\u05D4\u05E9\u05E4\u05E2\u05D4', '\u05E6\u05D9\u05D5\u05DF', '\u05E1\u05D8\u05D8\u05D5\u05E1'],
            topRisks.map((r, i) => [String(i + 1), r.title, r.category, String(r.probability), String(r.impact), String(r.riskScore), r.status])
          )
        : '<p>\u05D0\u05D9\u05DF \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD</p>',
    },
    {
      title: '5. \u05D1\u05E7\u05E8\u05D5\u05EA',
      content: allControls.length > 0
        ? generateTableHTML(
            ['\u05D1\u05E7\u05E8\u05D4', '\u05E1\u05D5\u05D2', '\u05EA\u05D3\u05D9\u05E8\u05D5\u05EA', '\u05D0\u05E4\u05E7\u05D8\u05D9\u05D1\u05D9\u05D5\u05EA'],
            allControls.map(c => [c.title, c.type, c.frequency, c.effectiveness])
          )
        : '<p>\u05D0\u05D9\u05DF \u05D1\u05E7\u05E8\u05D5\u05EA \u05E8\u05E9\u05D5\u05DE\u05D5\u05EA</p>',
    },
    {
      title: '6. \u05DE\u05D3\u05D3\u05D9 \u05E1\u05D9\u05DB\u05D5\u05DF \u05DE\u05E8\u05DB\u05D6\u05D9\u05D9\u05DD (KRI)',
      content: allKRIs.length > 0
        ? generateTableHTML(
            ['\u05DE\u05D3\u05D3', '\u05DE\u05D5\u05D3\u05D5\u05DC', '\u05E1\u05E3', '\u05E2\u05E8\u05DA \u05E0\u05D5\u05DB\u05D7\u05D9', '\u05DE\u05D2\u05DE\u05D4', '\u05D7\u05E8\u05D9\u05D2\u05D4'],
            allKRIs.map(k => [k.name, k.module ?? '-', k.threshold ?? '-', k.currentValue ?? '-', k.trend ?? '-', k.breached ? '\u05DB\u05DF' : '\u05DC\u05D0'])
          )
        : '<p>\u05D0\u05D9\u05DF \u05DE\u05D3\u05D3\u05D9\u05DD \u05DE\u05D5\u05D2\u05D3\u05E8\u05D9\u05DD</p>',
    },
    {
      title: '7. \u05EA\u05D5\u05DB\u05E0\u05D9\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4 \u05DC\u05E9\u05E0\u05D4 \u05D4\u05D1\u05D0\u05D4',
      content: overdueTasks.length > 0
        ? `<p>\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8 \u05D4\u05DE\u05D7\u05D9\u05D9\u05D1\u05D5\u05EA \u05D8\u05D9\u05E4\u05D5\u05DC:</p>` +
          generateTableHTML(
            ['\u05DE\u05E9\u05D9\u05DE\u05D4', '\u05DE\u05D5\u05D3\u05D5\u05DC', '\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA', '\u05EA\u05D0\u05E8\u05D9\u05DA \u05D9\u05E2\u05D3'],
            overdueTasks.map(t => [t.title, t.module ?? '-', t.priority, t.dueDate ?? '-'])
          )
        : '<p>\u05D0\u05D9\u05DF \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8</p>',
    },
  ];

  const html = generateReportHTML({
    title: '\u05D4\u05E2\u05E8\u05DB\u05EA \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05E9\u05E0\u05EA\u05D9\u05EA',
    subtitle: `\u05E9\u05E0\u05EA ${year}`,
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
    details: { type: 'annual_risk_assessment' },
  });

  return html;
}
