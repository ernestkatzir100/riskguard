'use server';

import { generateDocxBuffer } from '@/shared/lib/generate-docx';
import type { ReportData } from '@/shared/lib/report-types';
import { getRisks } from './risks';
import { getBoardMeetings, getBoardDecisions } from './board';
import { getKRIs } from './kris';
import { getCyberIncidents } from './cyber';
import { getBCPPlan, getCriticalFunctions, getBCPTests } from './bcp';
import { getVendors } from './vendors';
import { getDashboardData } from './dashboard';
import { getDocuments } from './documents';
import { getTasks } from './tasks';

const TENANT = 'קרדיט-פיננס בע״מ';
const now = () => new Date().toLocaleDateString('he-IL');

async function gen(data: ReportData) {
  const docxBase64 = await generateDocxBuffer(data);
  return { docxBase64, reportData: data };
}

/* ═══ 1. Risk Register Report ═══ */
export async function generateRiskRegisterReport() {
  const risks = await getRisks();
  const data: ReportData = {
    title: 'דוח מאגר סיכונים',
    subtitle: 'כל הסיכונים הרשומים, סטטוס, ציון סיכון',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'סיכונים', type: 'table',
      headers: ['שם', 'קטגוריה', 'סטטוס', 'סבירות', 'השפעה', 'ציון'],
      rows: risks.map(r => [
        r.title || '', r.category || '', r.status || '',
        String(r.probability ?? ''), String(r.impact ?? ''),
        String((r.probability ?? 0) * (r.impact ?? 0)),
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 2. Compliance Status Report ═══ */
export async function generateComplianceReport() {
  const data: ReportData = {
    title: 'דוח עמידה ברגולציה',
    subtitle: 'סטטוס עמידה לפי תקנות',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'סיכום ציות', type: 'kpis',
      kpis: [
        { label: 'ציון כולל', value: '78%' },
        { label: 'תקנות עם עמידה מלאה', value: '12/18' },
        { label: 'פערים קריטיים', value: '3' },
      ],
    }, {
      title: 'פירוט לפי תקנה', type: 'table',
      headers: ['תקנה', 'סעיף', 'סטטוס', 'אחוז עמידה'],
      rows: [
        ['2024-10-2', 'ממשל ניהול סיכונים', 'עמידה חלקית', '72%'],
        ['2022-10-9', 'ניהול סיכוני סייבר', 'עמידה מלאה', '95%'],
        ['ניהול תפעולי', 'המשכיות עסקית', 'עמידה חלקית', '68%'],
      ],
    }],
  };
  return gen(data);
}

/* ═══ 3. Board Report ═══ */
export async function generateBoardReport() {
  const meetings = await getBoardMeetings();
  const data: ReportData = {
    title: 'דוח דירקטוריון',
    subtitle: 'ישיבות, החלטות, נוכחות',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'ישיבות', type: 'table',
      headers: ['סוג', 'תאריך', 'רבעון', 'משתתפים'],
      rows: meetings.map(m => [
        m.meetingType || '', m.date ? new Date(m.date).toLocaleDateString('he-IL') : '',
        m.quarter || '',
        Array.isArray(m.attendees) ? (m.attendees as string[]).join(', ') : '',
      ]),
    }],
  };
  for (const m of meetings.slice(0, 5)) {
    const decisions = await getBoardDecisions(m.id);
    if (decisions.length > 0) {
      data.sections.push({
        title: `החלטות — ${m.meetingType || 'ישיבה'}`,
        type: 'table',
        headers: ['החלטה', 'סטטוס', 'אחראי', 'תאריך יעד'],
        rows: decisions.map(d => [
          d.text || '', d.status || '', d.ownerName || '',
          d.dueDate ? new Date(d.dueDate).toLocaleDateString('he-IL') : '',
        ]),
      });
    }
  }
  return gen(data);
}

/* ═══ 4. KRI Report ═══ */
export async function generateKRIReport() {
  const kris = await getKRIs();
  const breached = kris.filter(k => k.breached);
  const data: ReportData = {
    title: 'דוח מדדי סיכון מפתח (KRI)',
    subtitle: `${kris.length} מדדים, ${breached.length} חריגות`,
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'סיכום', type: 'kpis',
      kpis: [
        { label: 'סה״כ מדדים', value: String(kris.length) },
        { label: 'חריגות', value: String(breached.length) },
        { label: 'במגמת שיפור', value: String(kris.filter(k => k.trend === 'improving').length) },
      ],
    }, {
      title: 'פירוט מדדים', type: 'table',
      headers: ['שם', 'ערך נוכחי', 'סף', 'מגמה', 'חריגה'],
      rows: kris.map(k => [
        k.name || '', k.currentValue || '', k.threshold || '',
        k.trend === 'improving' ? 'שיפור' : k.trend === 'stable' ? 'יציב' : 'הידרדרות',
        k.breached ? 'כן' : 'לא',
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 5. Operational Risk Report ═══ */
export async function generateOperationalRiskReport() {
  const risks = await getRisks();
  const opRisks = risks.filter(r => r.category === 'operational');
  const data: ReportData = {
    title: 'דוח סיכון תפעולי',
    subtitle: 'סיכונים תפעוליים, בקרות, אירועי הפסד',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'סיכונים תפעוליים', type: 'table',
      headers: ['שם', 'סטטוס', 'סבירות', 'השפעה', 'ציון'],
      rows: opRisks.map(r => [
        r.title || '', r.status || '',
        String(r.probability ?? ''), String(r.impact ?? ''),
        String((r.probability ?? 0) * (r.impact ?? 0)),
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 6. Executive Dashboard Summary ═══ */
export async function generateDashboardReport() {
  const dashboard = await getDashboardData();
  const openRisks = (await getRisks()).filter(r => r.status === 'open').length;
  const data: ReportData = {
    title: 'סיכום מנהלים — דשבורד',
    subtitle: 'תמונת מצב כוללת',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'מדדים מרכזיים', type: 'kpis',
      kpis: [
        { label: 'ציון ציות', value: `${dashboard.complianceScore}%` },
        { label: 'סיכונים פתוחים', value: String(openRisks) },
        { label: 'משימות באיחור', value: String(dashboard.overdueTasks.length) },
        { label: 'התראות KRI', value: String(dashboard.kriAlerts.length) },
      ],
    }, {
      title: 'דדליינים קרובים', type: 'table',
      headers: ['פריט', 'תאריך יעד'],
      rows: (dashboard.upcomingDeadlines || []).map(d => [
        d.title, d.dueDate ? new Date(d.dueDate).toLocaleDateString('he-IL') : '',
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 7. Cyber Incidents Report ═══ */
export async function generateCyberIncidentsReport() {
  const incidents = await getCyberIncidents();
  const data: ReportData = {
    title: 'דוח אירועי סייבר',
    subtitle: `${incidents.length} אירועים`,
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'אירועים', type: 'table',
      headers: ['כותרת', 'חומרה', 'סטטוס', 'תאריך זיהוי', 'תיקון'],
      rows: incidents.map(i => [
        i.title || '', i.severity || '', i.status || '',
        i.detectedAt ? new Date(i.detectedAt).toLocaleDateString('he-IL') : '',
        i.remediation || '',
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 8. BCP Report ═══ */
export async function generateBCPReport() {
  const [plan, functions, tests] = await Promise.all([
    getBCPPlan(), getCriticalFunctions(), getBCPTests(),
  ]);
  const data: ReportData = {
    title: 'דוח המשכיות עסקית (BCP)',
    subtitle: 'פונקציות קריטיות, תרגילים, תוצאות',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'פונקציות קריטיות', type: 'table',
      headers: ['שם פונקציה', 'מחלקה', 'RTO (שעות)', 'RPO (שעות)', 'רמת השפעה'],
      rows: functions.map(f => [
        f.functionName || '', f.department || '',
        String(f.rtoHours ?? ''), String(f.rpoHours ?? ''),
        String(f.impactLevel ?? ''),
      ]),
    }, {
      title: 'תרגילים', type: 'table',
      headers: ['סוג', 'תאריך', 'תוצאה', 'ממצאים'],
      rows: tests.map(t => [
        t.testType || '',
        t.testDate ? new Date(t.testDate).toLocaleDateString('he-IL') : '',
        t.results || '', t.findings || '',
      ]),
    }],
  };
  if (plan) {
    data.sections.unshift({
      title: 'תוכנית BCP', type: 'text',
      text: `סטטוס: ${plan.status || 'לא ידוע'} | גרסה: ${plan.version || 'לא ידוע'}`,
    });
  }
  return gen(data);
}

/* ═══ 9. Vendor Risk Report ═══ */
export async function generateVendorReport() {
  const vendors = await getVendors();
  const data: ReportData = {
    title: 'דוח סיכוני מיקור חוץ',
    subtitle: `${vendors.length} ספקים`,
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'ספקים', type: 'table',
      headers: ['שם', 'קריטיות', 'סטטוס', 'סיום חוזה', 'דירוג סיכון', 'איש קשר'],
      rows: vendors.map(v => [
        v.name || '', v.criticality || '', v.status || '',
        v.contractEnd ? new Date(v.contractEnd).toLocaleDateString('he-IL') : '',
        String(v.riskRating ?? ''), v.contactName || '',
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 10. Risk Governance Report ═══ */
export async function generateRiskGovernanceReport() {
  const docs = await getDocuments({ module: 'governance' });
  const data: ReportData = {
    title: 'דוח ממשל סיכונים',
    subtitle: 'מדיניות, מסמכי ממשל, מסגרת עבודה',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'סיכום מסגרת ממשל', type: 'kpis',
      kpis: [
        { label: 'קצין סיכונים', value: 'אבי שרון' },
        { label: 'ועדת סיכונים', value: 'פעילה — ישיבה רבעונית' },
        { label: 'מדיניות עודכנה', value: 'ינואר 2026' },
      ],
    }, {
      title: 'מסמכי מדיניות', type: 'table',
      headers: ['כותרת', 'סטטוס', 'גרסה', 'תאריך עדכון'],
      rows: docs.map(d => [
        d.title || '', d.status || '', d.version || '',
        d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('he-IL') : '',
      ]),
    }],
  };
  return gen(data);
}

/* ═══ 11. Annual Compliance Summary ═══ */
export async function generateAnnualReport() {
  const [dashboard, risks, kris, vendors, incidents, tasks] = await Promise.all([
    getDashboardData(), getRisks(), getKRIs(),
    getVendors(), getCyberIncidents(), getTasks(),
  ]);
  const openRisks = risks.filter(r => r.status === 'open').length;
  const data: ReportData = {
    title: 'דוח שנתי מקיף — ציות ועמידה ברגולציה',
    subtitle: 'כל המודולים, כל המדדים, סיכום מנהלים',
    generatedAt: now(), tenantName: TENANT,
    sections: [{
      title: 'סיכום מנהלים', type: 'kpis',
      kpis: [
        { label: 'ציון ציות כולל', value: `${dashboard.complianceScore}%` },
        { label: 'סיכונים פתוחים', value: String(openRisks) },
        { label: 'משימות באיחור', value: String(dashboard.overdueTasks.length) },
        { label: 'התראות KRI', value: String(dashboard.kriAlerts.length) },
        { label: 'סה״כ ספקים', value: String(vendors.length) },
        { label: 'אירועי סייבר', value: String(incidents.length) },
      ],
    }, {
      title: 'סיכונים', type: 'table',
      headers: ['שם', 'קטגוריה', 'סטטוס', 'ציון'],
      rows: risks.slice(0, 20).map(r => [
        r.title || '', r.category || '', r.status || '',
        String((r.probability ?? 0) * (r.impact ?? 0)),
      ]),
    }, {
      title: 'מדדי סיכון (KRI)', type: 'table',
      headers: ['שם', 'ערך', 'מגמה', 'חריגה'],
      rows: kris.map(k => [
        k.name || '', k.currentValue || '',
        k.trend === 'improving' ? 'שיפור' : k.trend === 'stable' ? 'יציב' : 'הידרדרות',
        k.breached ? 'כן' : 'לא',
      ]),
    }, {
      title: 'משימות באיחור', type: 'table',
      headers: ['כותרת', 'עדיפות', 'תאריך יעד'],
      rows: tasks.filter(t => t.status !== 'completed').slice(0, 15).map(t => [
        t.title || '', t.priority || '',
        t.dueDate ? new Date(t.dueDate).toLocaleDateString('he-IL') : '',
      ]),
    }],
  };
  return gen(data);
}
