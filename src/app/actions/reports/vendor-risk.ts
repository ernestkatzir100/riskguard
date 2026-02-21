'use server';

import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { generateReportHTML, generateTableHTML } from '@/shared/lib/report-generator';
import { db } from '@/db';
import { tenants, vendors, vendorAssessments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function generateVendorRiskReport() {
  const user = await getCurrentUserOrDemo();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);

  // Fetch all vendors
  const allVendors = await db.select().from(vendors).where(eq(vendors.tenantId, user.tenant_id));

  // Fetch assessments (available for future detailed analysis)
  const _assessments = await db.select().from(vendorAssessments).where(eq(vendorAssessments.tenantId, user.tenant_id)).orderBy(desc(vendorAssessments.assessmentDate));
  void _assessments;

  // Group by criticality
  const byCriticality = allVendors.reduce<Record<string, number>>((acc, v) => {
    acc[v.criticality] = (acc[v.criticality] ?? 0) + 1;
    return acc;
  }, {});

  const date = new Date().toLocaleDateString('he-IL');

  const sections = [
    {
      title: '1. \u05E1\u05E7\u05D9\u05E8\u05EA \u05E1\u05E4\u05E7\u05D9\u05DD',
      content: `<p>\u05E1\u05D4"\u05DB \u05E1\u05E4\u05E7\u05D9\u05DD: <strong>${allVendors.length}</strong></p>` +
        generateTableHTML(
          ['\u05E7\u05E8\u05D9\u05D8\u05D9\u05D5\u05EA', '\u05DB\u05DE\u05D5\u05EA'],
          Object.entries(byCriticality).map(([crit, count]) => [crit, String(count)])
        ),
    },
    {
      title: '2. \u05E4\u05D9\u05E8\u05D5\u05D8 \u05E1\u05E4\u05E7\u05D9\u05DD',
      content: allVendors.length > 0
        ? generateTableHTML(
            ['\u05E1\u05E4\u05E7', '\u05E9\u05D9\u05E8\u05D5\u05EA', '\u05E7\u05E8\u05D9\u05D8\u05D9\u05D5\u05EA', '\u05E1\u05D8\u05D8\u05D5\u05E1', '\u05D3\u05D9\u05E8\u05D5\u05D2 \u05E1\u05D9\u05DB\u05D5\u05DF', '\u05EA\u05D5\u05E7\u05E3 \u05D7\u05D5\u05D6\u05D4'],
            allVendors.map(v => [
              v.name,
              v.serviceDescription ?? '-',
              v.criticality,
              v.status,
              String(v.riskRating ?? '-'),
              v.contractEnd ?? '-',
            ])
          )
        : '<p>\u05D0\u05D9\u05DF \u05E1\u05E4\u05E7\u05D9\u05DD \u05E8\u05E9\u05D5\u05DE\u05D9\u05DD</p>',
    },
    {
      title: '3. \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E8\u05D9\u05DB\u05D5\u05D6\u05D9\u05D5\u05EA',
      content: (() => {
        const total = allVendors.length;
        if (total === 0) return '<p>\u05D0\u05D9\u05DF \u05E1\u05E4\u05E7\u05D9\u05DD \u05DC\u05E0\u05D9\u05EA\u05D5\u05D7</p>';

        const criticalCount = byCriticality['critical'] ?? 0;
        const importantCount = byCriticality['important'] ?? 0;
        const standardCount = byCriticality['standard'] ?? 0;

        return generateTableHTML(
          ['\u05E8\u05DE\u05EA \u05E7\u05E8\u05D9\u05D8\u05D9\u05D5\u05EA', '\u05DB\u05DE\u05D5\u05EA', '\u05D0\u05D7\u05D5\u05D6'],
          [
            ['\u05E7\u05E8\u05D9\u05D8\u05D9 (critical)', String(criticalCount), total > 0 ? `${Math.round((criticalCount / total) * 100)}%` : '0%'],
            ['\u05D7\u05E9\u05D5\u05D1 (important)', String(importantCount), total > 0 ? `${Math.round((importantCount / total) * 100)}%` : '0%'],
            ['\u05E8\u05D2\u05D9\u05DC (standard)', String(standardCount), total > 0 ? `${Math.round((standardCount / total) * 100)}%` : '0%'],
          ]
        );
      })(),
    },
  ];

  const html = generateReportHTML({
    title: '\u05D3\u05D5\u05D7 \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9 \u05DE\u05D9\u05E7\u05D5\u05E8 \u05D7\u05D5\u05E5',
    subtitle: `\u05E0\u05DB\u05D5\u05DF \u05DC\u05EA\u05D0\u05E8\u05D9\u05DA ${date}`,
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
    details: { type: 'vendor_risk' },
  });

  return html;
}
