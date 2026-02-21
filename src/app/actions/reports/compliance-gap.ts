'use server';

import { getCurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { generateReportHTML, generateTableHTML } from '@/shared/lib/report-generator';
import { db } from '@/db';
import { tenants, complianceStatus, regRequirements, regSections } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function generateComplianceGapReport() {
  const user = await getCurrentUser();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);

  // Fetch compliance status joined with requirements and sections
  const csData = await db.select({
    compliance: complianceStatus,
    requirement: regRequirements,
    section: regSections,
  })
    .from(complianceStatus)
    .innerJoin(regRequirements, eq(complianceStatus.requirementId, regRequirements.id))
    .innerJoin(regSections, eq(regRequirements.sectionId, regSections.id))
    .where(eq(complianceStatus.tenantId, user.tenant_id))
    .orderBy(desc(complianceStatus.updatedAt));

  const totalReqs = csData.length;
  const metReqs = csData.filter(c => c.compliance.status === 'compliant').length;
  const complianceScore = totalReqs > 0 ? Math.round((metReqs / totalReqs) * 100) : 0;

  // Group by module
  const byModule = csData.reduce<Record<string, typeof csData>>((acc, item) => {
    const mod = item.requirement.module;
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(item);
    return acc;
  }, {});

  // Non-compliant items
  const nonCompliant = csData.filter(c => c.compliance.status === 'non_compliant' || c.compliance.status === 'not_started');

  const date = new Date().toLocaleDateString('he-IL');

  const moduleSections = Object.entries(byModule).map(([mod, items]) => {
    const modTotal = items.length;
    const modCompliant = items.filter(i => i.compliance.status === 'compliant').length;
    const modScore = modTotal > 0 ? Math.round((modCompliant / modTotal) * 100) : 0;

    return `<h3 style="margin-top: 16px;">${mod} (${modScore}%)</h3>` +
      generateTableHTML(
        ['\u05E7\u05D5\u05D3', '\u05D3\u05E8\u05D9\u05E9\u05D4', '\u05E1\u05D8\u05D8\u05D5\u05E1', '\u05E2\u05D3\u05DB\u05D5\u05DF \u05D0\u05D7\u05E8\u05D5\u05DF'],
        items.map(i => [
          i.requirement.reqCode ?? '-',
          i.requirement.requirementHe,
          i.compliance.status,
          i.compliance.lastReviewed ? i.compliance.lastReviewed.toLocaleDateString('he-IL') : '-',
        ])
      );
  }).join('');

  const sections = [
    {
      title: '1. \u05E1\u05E7\u05D9\u05E8\u05EA \u05E6\u05D9\u05D5\u05EA \u05DB\u05DC\u05DC\u05D9\u05EA',
      content: `<p>\u05E6\u05D9\u05D5\u05DF \u05E6\u05D9\u05D5\u05EA \u05DB\u05D5\u05DC\u05DC: <strong>${complianceScore}%</strong></p>
        <p>\u05E1\u05D4"\u05DB \u05D3\u05E8\u05D9\u05E9\u05D5\u05EA: <strong>${totalReqs}</strong></p>
        <p>\u05E2\u05D5\u05DE\u05D3\u05D5\u05EA \u05D1\u05E6\u05D9\u05D5\u05EA: <strong>${metReqs}</strong></p>
        <p>\u05E4\u05E2\u05E8\u05D9\u05DD (\u05DC\u05D0 \u05E2\u05D5\u05DE\u05D3\u05D5\u05EA): <strong>${nonCompliant.length}</strong></p>`,
    },
    {
      title: '2. \u05E4\u05E2\u05E8\u05D9\u05DD \u05DC\u05E4\u05D9 \u05DE\u05D5\u05D3\u05D5\u05DC',
      content: moduleSections || '<p>\u05D0\u05D9\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD</p>',
    },
    {
      title: '3. \u05E4\u05E8\u05D9\u05D8\u05D9 \u05E4\u05E2\u05D5\u05DC\u05D4 \u05DE\u05EA\u05D5\u05E2\u05D3\u05E4\u05D9\u05DD',
      content: nonCompliant.length > 0
        ? generateTableHTML(
            ['\u05E7\u05D5\u05D3', '\u05DE\u05D5\u05D3\u05D5\u05DC', '\u05D3\u05E8\u05D9\u05E9\u05D4', '\u05E1\u05D8\u05D8\u05D5\u05E1', '\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA'],
            nonCompliant.map(c => [
              c.requirement.reqCode ?? '-',
              c.requirement.module,
              c.requirement.requirementHe,
              c.compliance.status,
              c.requirement.priority,
            ])
          )
        : '<p>\u05D0\u05D9\u05DF \u05E4\u05E2\u05E8\u05D9\u05DD \u05E4\u05EA\u05D5\u05D7\u05D9\u05DD</p>',
    },
  ];

  const html = generateReportHTML({
    title: '\u05D3\u05D5\u05D7 \u05E4\u05E2\u05E8\u05D9 \u05E6\u05D9\u05D5\u05EA',
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
    details: { type: 'compliance_gap' },
  });

  return html;
}
