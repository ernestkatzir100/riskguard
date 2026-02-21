'use server';

import { getCurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { generateReportHTML, generateTableHTML } from '@/shared/lib/report-generator';
import { db } from '@/db';
import { tenants, cyberIncidents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function generateISACyberReport(incidentId: string) {
  const user = await getCurrentUser();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);
  const [incident] = await db.select().from(cyberIncidents).where(
    and(eq(cyberIncidents.id, incidentId), eq(cyberIncidents.tenantId, user.tenant_id))
  ).limit(1);

  if (!incident) {
    throw new Error('Incident not found');
  }

  const date = new Date().toLocaleDateString('he-IL');

  const sections = [
    {
      title: '1. \u05E4\u05E8\u05D8\u05D9 \u05D4\u05D2\u05D5\u05E3 \u05D4\u05DE\u05E4\u05D5\u05E7\u05D7',
      content: generateTableHTML(
        ['\u05E9\u05D3\u05D4', '\u05E2\u05E8\u05DA'],
        [
          ['\u05E9\u05DD \u05D4\u05D2\u05D5\u05E3', tenant?.name ?? '-'],
          ['\u05D7.\u05E4. / \u05D7.\u05E6.', tenant?.companyId ?? '-'],
          ['\u05DB\u05EA\u05D5\u05D1\u05EA', tenant?.address ?? '-'],
          ['\u05E2\u05D9\u05E8', tenant?.city ?? '-'],
        ]
      ),
    },
    {
      title: '2. \u05EA\u05D9\u05D0\u05D5\u05E8 \u05D4\u05D0\u05D9\u05E8\u05D5\u05E2',
      content: generateTableHTML(
        ['\u05E9\u05D3\u05D4', '\u05E2\u05E8\u05DA'],
        [
          ['\u05DB\u05D5\u05EA\u05E8\u05EA', incident.title],
          ['\u05EA\u05D9\u05D0\u05D5\u05E8', incident.description ?? '-'],
          ['\u05E1\u05D5\u05D2 \u05D0\u05D9\u05E8\u05D5\u05E2', incident.incidentType ?? '-'],
          ['\u05D7\u05D5\u05DE\u05E8\u05D4', incident.severity],
          ['\u05E1\u05D8\u05D8\u05D5\u05E1', incident.status],
        ]
      ),
    },
    {
      title: '3. \u05E6\u05D9\u05E8 \u05D6\u05DE\u05DF',
      content: generateTableHTML(
        ['\u05E9\u05D3\u05D4', '\u05EA\u05D0\u05E8\u05D9\u05DA'],
        [
          ['\u05D6\u05D5\u05D4\u05D4', incident.detectedAt.toLocaleDateString('he-IL')],
          ['\u05D8\u05D9\u05E4\u05D5\u05DC / \u05E1\u05D2\u05D9\u05E8\u05D4', incident.resolvedAt ? incident.resolvedAt.toLocaleDateString('he-IL') : '\u05D8\u05E8\u05DD \u05D8\u05D5\u05E4\u05DC'],
        ]
      ),
    },
    {
      title: '4. \u05D4\u05E9\u05E4\u05E2\u05D4',
      content: `<p>\u05D7\u05E9\u05D9\u05E4\u05EA \u05DE\u05D9\u05D3\u05E2: <strong>${incident.dataExposed ? '\u05DB\u05DF' : '\u05DC\u05D0'}</strong></p>
        <p>\u05D3\u05D9\u05D5\u05D5\u05D7 \u05DC\u05E8\u05D2\u05D5\u05DC\u05D8\u05D5\u05E8: <strong>${incident.regulatorReported ? '\u05DB\u05DF' : '\u05DC\u05D0'}</strong></p>
        ${incident.regulatorReportDate ? `<p>\u05EA\u05D0\u05E8\u05D9\u05DA \u05D3\u05D9\u05D5\u05D5\u05D7: ${incident.regulatorReportDate.toLocaleDateString('he-IL')}</p>` : ''}`,
    },
    {
      title: '5. \u05E4\u05E2\u05D5\u05DC\u05D5\u05EA \u05DE\u05EA\u05E7\u05E0\u05D5\u05EA',
      content: incident.remediation
        ? `<p>${incident.remediation}</p>`
        : '<p>\u05D8\u05E8\u05DD \u05E4\u05D5\u05E8\u05D8\u05D5</p>',
    },
    {
      title: '6. \u05DC\u05E7\u05D7\u05D9\u05DD',
      content: incident.lessonsLearned
        ? `<p>${incident.lessonsLearned}</p>`
        : '<p>\u05D8\u05E8\u05DD \u05E4\u05D5\u05E8\u05D8\u05D5</p>',
    },
  ];

  const html = generateReportHTML({
    title: '\u05D3\u05D5\u05D7 \u05D0\u05D9\u05E8\u05D5\u05E2 \u05E1\u05D9\u05D9\u05D1\u05E8 \u2014 \u05DE\u05E2\u05E8\u05DA \u05D4\u05E1\u05D9\u05D9\u05D1\u05E8 \u05D4\u05DC\u05D0\u05D5\u05DE\u05D9 (ISA)',
    subtitle: incident.title,
    tenant: { name: tenant?.name ?? 'RiskGuard', logoUrl: tenant?.logoUrl ?? undefined },
    date,
    sections,
    confidential: true,
  });

  await logAction({
    action: 'report.generated',
    entity_type: 'report',
    entity_id: incidentId,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { type: 'isa_cyber' },
  });

  return html;
}
