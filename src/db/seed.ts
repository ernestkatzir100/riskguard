import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding RiskGuard database...');

  // ═══ 1. TENANT ═══
  const [tenant] = await db.insert(schema.tenants).values({
    name: 'אשראי פלוס בע"מ',
    companyId: '515678901',
    licenseType: 'extended_credit',
    subscriptionTier: 'pro',
    address: 'רחוב הרצל 42',
    city: 'תל אביב',
    employeeCount: '45',
    portfolioSize: '₪850M',
    clientCount: '12,000',
    clientTypes: ['צרכני', 'עסקי קטן'],
    onboardingComplete: true,
  }).returning();
  const tid = tenant.id;
  console.log(`  ✓ Tenant: ${tenant.name} (${tid})`);

  // ═══ 2. DEMO USER ═══
  const demoUserId = '00000000-0000-0000-0000-000000000001';
  const demoPasswordHash = await bcrypt.hash('demo123', 12);
  await db.insert(schema.users).values({
    id: demoUserId,
    tenantId: tid,
    email: 'demo@riskguard.co.il',
    fullName: 'דוד כהן',
    passwordHash: demoPasswordHash,
    role: 'admin',
    jobTitle: 'מנהל סיכונים ראשי',
  }).onConflictDoNothing();
  console.log('  ✓ Demo user created (demo@riskguard.co.il / demo123)');

  // ═══ 3. RISK OFFICER ═══
  await db.insert(schema.riskOfficers).values({
    tenantId: tid,
    userId: demoUserId,
    fullName: 'דוד כהן',
    email: 'david@ashrai-plus.co.il',
    roles: ['מנהל סיכונים', 'קצין ציות', 'CISO'],
    reportingLine: 'מנכ"ל',
    appointmentDate: '2023-01-15',
  });
  console.log('  ✓ Risk officer');

  // ═══ 4. DIRECTORS ═══
  const directorData = [
    { fullName: 'יעל לוי', role: 'יו"ר דירקטוריון', email: 'yael@ashrai-plus.co.il' },
    { fullName: 'משה כהן', role: 'דירקטור חיצוני', email: 'moshe@ashrai-plus.co.il' },
    { fullName: 'רונית שפירא', role: 'דירקטורית חיצונית', email: 'ronit@ashrai-plus.co.il' },
    { fullName: 'אבי ברק', role: 'מנכ"ל', email: 'avi@ashrai-plus.co.il' },
    { fullName: 'נועה גולדשטיין', role: 'דירקטורית', email: 'noa@ashrai-plus.co.il' },
  ];
  await db.insert(schema.directors).values(
    directorData.map(d => ({ ...d, tenantId: tid, appointmentDate: '2023-03-01', active: true }))
  );
  console.log(`  ✓ ${directorData.length} directors`);

  // ═══ 5. REGULATIONS (shared) ═══
  const [reg1] = await db.insert(schema.regulations).values({
    code: '2024-10-2',
    nameHe: 'הוראת ניהול בנקאי תקין — ניהול סיכונים',
    nameEn: 'Proper Banking Management — Risk Management',
    effectiveDate: '2024-01-01',
  }).returning();
  const [reg2] = await db.insert(schema.regulations).values({
    code: '2024-10-3',
    nameHe: 'הוראת ניהול בנקאי תקין — סייבר',
    nameEn: 'Proper Banking Management — Cyber',
    effectiveDate: '2024-06-01',
  }).returning();
  console.log('  ✓ 2 regulations');

  // ═══ 6. REG SECTIONS + REQUIREMENTS ═══
  const modules: Array<{ code: string; module: typeof schema.moduleEnum.enumValues[number]; nameHe: string; regId: string }> = [
    { code: 'GOV', module: 'governance', nameHe: 'ממשל סיכונים', regId: reg1.id },
    { code: 'OPR', module: 'operational', nameHe: 'סיכון תפעולי', regId: reg1.id },
    { code: 'OUT', module: 'outsourcing', nameHe: 'מיקור חוץ', regId: reg1.id },
    { code: 'BCP', module: 'bcp', nameHe: 'המשכיות עסקית', regId: reg1.id },
    { code: 'CYB-GOV', module: 'cyber_governance', nameHe: 'ממשל סייבר', regId: reg2.id },
    { code: 'CYB-PRO', module: 'cyber_protection', nameHe: 'הגנת סייבר', regId: reg2.id },
    { code: 'CYB-INC', module: 'cyber_incidents', nameHe: 'אירועי סייבר', regId: reg2.id },
    { code: 'CRD', module: 'credit', nameHe: 'סיכון אשראי', regId: reg1.id },
    { code: 'BRD', module: 'board', nameHe: 'דירקטוריון', regId: reg1.id },
  ];

  for (const mod of modules) {
    const [section] = await db.insert(schema.regSections).values({
      regulationId: mod.regId,
      sectionRef: `${mod.code}-SEC`,
      titleHe: mod.nameHe,
      level: 1,
      sortOrder: modules.indexOf(mod),
    }).returning();

    // 3 requirements per module
    for (let i = 1; i <= 3; i++) {
      await db.insert(schema.regRequirements).values({
        sectionId: section.id,
        requirementHe: `דרישה ${mod.code}-${String(i).padStart(2, '0')}: ${mod.nameHe} — פריט ${i}`,
        frequency: i === 1 ? 'annual' : i === 2 ? 'quarterly' : 'one_time',
        priority: i === 1 ? 'P0' : 'P1',
        tier: 'starter',
        module: mod.module,
        reqCode: `${mod.code}-${String(i).padStart(2, '0')}`,
      });
    }
  }
  console.log('  ✓ 9 sections + 27 requirements');

  // ═══ 7. RISKS ═══
  const riskData: Array<{
    title: string; category: typeof schema.riskCategoryEnum.enumValues[number];
    probability: number; impact: number; status: typeof schema.riskStatusEnum.enumValues[number];
  }> = [
    { title: 'סיכון אשראי צרכני — אי-עמידה בהחזרים', category: 'credit', probability: 4, impact: 5, status: 'open' },
    { title: 'כשל מערכות ליבה — Core Banking', category: 'operational', probability: 2, impact: 5, status: 'open' },
    { title: 'מתקפת פישינג ממוקדת', category: 'cyber', probability: 4, impact: 4, status: 'mitigated' },
    { title: 'כשל ספק שירותי ענן', category: 'outsourcing', probability: 3, impact: 4, status: 'open' },
    { title: 'אי-ציות לדרישות רגולטוריות', category: 'governance', probability: 2, impact: 4, status: 'open' },
    { title: 'כשל תהליך אישור אשראי', category: 'credit', probability: 3, impact: 3, status: 'mitigated' },
    { title: 'מתקפת כופרה — Ransomware', category: 'cyber', probability: 3, impact: 5, status: 'open' },
    { title: 'אי-זמינות מרכז נתונים', category: 'bcp', probability: 2, impact: 5, status: 'accepted' },
    { title: 'דליפת מידע אישי', category: 'cyber', probability: 3, impact: 4, status: 'open' },
    { title: 'הונאה פנימית', category: 'fraud', probability: 2, impact: 3, status: 'mitigated' },
    { title: 'סיכון ריכוזיות ספקים', category: 'outsourcing', probability: 3, impact: 3, status: 'open' },
    { title: 'כשל בהמשכיות עסקית', category: 'bcp', probability: 2, impact: 4, status: 'open' },
    { title: 'סיכון ריבית — תיק אשראי', category: 'credit', probability: 3, impact: 4, status: 'open' },
    { title: 'חולשות Zero-Day', category: 'cyber', probability: 2, impact: 5, status: 'open' },
    { title: 'אי-עמידה בלוחות זמנים רגולטוריים', category: 'governance', probability: 3, impact: 3, status: 'mitigated' },
  ];
  const insertedRisks = await db.insert(schema.risks).values(
    riskData.map(r => ({
      tenantId: tid,
      title: r.title,
      category: r.category,
      probability: r.probability,
      impact: r.impact,
      riskScore: r.probability * r.impact,
      status: r.status,
      ownerId: demoUserId,
    }))
  ).returning();
  console.log(`  ✓ ${insertedRisks.length} risks`);

  // ═══ 8. CONTROLS ═══
  const controlData: Array<{
    title: string; type: typeof schema.controlTypeEnum.enumValues[number];
    frequency: typeof schema.controlFrequencyEnum.enumValues[number];
    effectiveness: typeof schema.effectivenessEnum.enumValues[number]; score: number;
  }> = [
    { title: 'אימות זהות לווה', type: 'preventive', frequency: 'continuous', effectiveness: 'effective', score: 5 },
    { title: 'ניטור רשת בזמן אמת', type: 'detective', frequency: 'continuous', effectiveness: 'effective', score: 4 },
    { title: 'סריקת חולשות רבעונית', type: 'detective', frequency: 'periodic', effectiveness: 'partially_effective', score: 3 },
    { title: 'הדרכת סייבר לעובדים', type: 'preventive', frequency: 'periodic', effectiveness: 'effective', score: 4 },
    { title: 'גיבוי יומי מוצפן', type: 'corrective', frequency: 'continuous', effectiveness: 'effective', score: 5 },
    { title: 'בקרת הרשאות גישה', type: 'preventive', frequency: 'continuous', effectiveness: 'effective', score: 4 },
    { title: 'ביקורת ספקים שנתית', type: 'detective', frequency: 'periodic', effectiveness: 'partially_effective', score: 3 },
    { title: 'תרגיל DR חצי-שנתי', type: 'corrective', frequency: 'periodic', effectiveness: 'partially_effective', score: 3 },
    { title: 'הפרדת תפקידים', type: 'preventive', frequency: 'continuous', effectiveness: 'effective', score: 4 },
    { title: 'MFA לגישה מרחוק', type: 'preventive', frequency: 'continuous', effectiveness: 'effective', score: 5 },
    { title: 'ניטור עסקאות חריגות', type: 'detective', frequency: 'continuous', effectiveness: 'effective', score: 4 },
    { title: 'בדיקת חדירה שנתית', type: 'detective', frequency: 'periodic', effectiveness: 'effective', score: 4 },
  ];
  const insertedControls = await db.insert(schema.controls).values(
    controlData.map(c => ({
      tenantId: tid,
      title: c.title,
      type: c.type,
      frequency: c.frequency,
      effectiveness: c.effectiveness,
      effectivenessScore: c.score,
      ownerId: demoUserId,
    }))
  ).returning();
  console.log(`  ✓ ${insertedControls.length} controls`);

  // Link some controls to risks
  const links = [
    { risk: 0, control: 0 }, { risk: 0, control: 10 },
    { risk: 1, control: 4 }, { risk: 1, control: 8 },
    { risk: 2, control: 1 }, { risk: 2, control: 3 }, { risk: 2, control: 9 },
    { risk: 3, control: 6 },
    { risk: 6, control: 1 }, { risk: 6, control: 4 }, { risk: 6, control: 9 },
    { risk: 7, control: 4 }, { risk: 7, control: 7 },
    { risk: 8, control: 5 }, { risk: 8, control: 9 },
    { risk: 9, control: 8 }, { risk: 9, control: 10 },
  ];
  await db.insert(schema.riskControls).values(
    links.map(l => ({
      riskId: insertedRisks[l.risk].id,
      controlId: insertedControls[l.control].id,
    }))
  ).onConflictDoNothing();
  console.log(`  ✓ ${links.length} risk-control links`);

  // ═══ 9. VENDORS ═══
  const vendorData = [
    { name: 'CloudSec Ltd', serviceDescription: 'אירוח ענן ושירותי אבטחה', criticality: 'critical' as const, status: 'active' as const, riskRating: 2, contractEnd: '2026-03-31', annualValueNis: '450000' },
    { name: 'DataPro Solutions', serviceDescription: 'גיבוי ושחזור נתונים', criticality: 'critical' as const, status: 'active' as const, riskRating: 3, contractEnd: '2025-12-31', annualValueNis: '280000' },
    { name: 'FinTech Support', serviceDescription: 'תמיכה טכנית Core Banking', criticality: 'important' as const, status: 'active' as const, riskRating: 2, contractEnd: '2026-06-30', annualValueNis: '350000' },
    { name: 'SecureNet', serviceDescription: 'ניטור SOC 24/7', criticality: 'critical' as const, status: 'active' as const, riskRating: 1, contractEnd: '2025-09-30', annualValueNis: '520000' },
    { name: 'PayGate', serviceDescription: 'שירותי סליקה', criticality: 'important' as const, status: 'under_review' as const, riskRating: 4, contractEnd: '2025-06-30', annualValueNis: '180000' },
    { name: 'DocuSign IL', serviceDescription: 'חתימה דיגיטלית', criticality: 'standard' as const, status: 'active' as const, riskRating: 2, contractEnd: '2026-12-31', annualValueNis: '45000' },
  ];
  await db.insert(schema.vendors).values(
    vendorData.map(v => ({ ...v, tenantId: tid, contractStart: '2024-01-01' }))
  );
  console.log(`  ✓ ${vendorData.length} vendors`);

  // ═══ 10. TASKS ═══
  const taskData = [
    { title: 'עדכון מדיניות ניהול סיכונים', module: 'governance' as const, priority: 'high' as const, status: 'in_progress' as const, dueDate: '2025-03-15' },
    { title: 'הגשת דוח רבעוני — Q1', module: 'board' as const, priority: 'high' as const, status: 'pending' as const, dueDate: '2025-03-31' },
    { title: 'ביקורת ספק CloudSec', module: 'outsourcing' as const, priority: 'medium' as const, status: 'pending' as const, dueDate: '2025-04-15' },
    { title: 'תרגיל DR — מרכז נתונים', module: 'bcp' as const, priority: 'high' as const, status: 'pending' as const, dueDate: '2025-04-30' },
    { title: 'הדרכת סייבר רבעונית', module: 'cyber_protection' as const, priority: 'medium' as const, status: 'completed' as const, dueDate: '2025-02-28' },
    { title: 'סריקת חולשות — Q1', module: 'cyber_governance' as const, priority: 'medium' as const, status: 'overdue' as const, dueDate: '2025-01-31' },
    { title: 'עדכון תוכנית BCP', module: 'bcp' as const, priority: 'low' as const, status: 'pending' as const, dueDate: '2025-05-30' },
    { title: 'בדיקת ציות שנתית', module: 'governance' as const, priority: 'high' as const, status: 'in_progress' as const, dueDate: '2025-03-20' },
  ];
  await db.insert(schema.tasks).values(
    taskData.map(t => ({ ...t, tenantId: tid, assignedTo: demoUserId }))
  );
  console.log(`  ✓ ${taskData.length} tasks`);

  // ═══ 11. DOCUMENTS ═══
  const docData = [
    { title: 'מדיניות ניהול סיכונים 2025', type: 'policy' as const, module: 'governance' as const, status: 'approved' as const, version: '3.0' },
    { title: 'נוהל אירועי סייבר', type: 'procedure' as const, module: 'cyber_incidents' as const, status: 'approved' as const, version: '2.1' },
    { title: 'מדיניות מיקור חוץ', type: 'policy' as const, module: 'outsourcing' as const, status: 'approved' as const, version: '2.0' },
    { title: 'תוכנית המשכיות עסקית', type: 'policy' as const, module: 'bcp' as const, status: 'draft' as const, version: '1.5' },
    { title: 'דוח הערכת סיכונים שנתי', type: 'report' as const, module: 'governance' as const, status: 'draft' as const, version: '1.0' },
    { title: 'נוהל בדיקות חדירה', type: 'procedure' as const, module: 'cyber_protection' as const, status: 'approved' as const, version: '1.2' },
    { title: 'פרוטוקול ישיבת דירקטוריון — Q4/2024', type: 'report' as const, module: 'board' as const, status: 'approved' as const, version: '1.0' },
    { title: 'מדיניות אשראי', type: 'policy' as const, module: 'credit' as const, status: 'approved' as const, version: '4.0' },
    { title: 'נוהל הפרדת תפקידים', type: 'procedure' as const, module: 'operational' as const, status: 'pending_approval' as const, version: '1.1' },
    { title: 'מדיניות הגנת סייבר', type: 'policy' as const, module: 'cyber_governance' as const, status: 'approved' as const, version: '2.0' },
  ];
  await db.insert(schema.documents).values(
    docData.map(d => ({ ...d, tenantId: tid, createdBy: demoUserId }))
  );
  console.log(`  ✓ ${docData.length} documents`);

  // ═══ 12. CYBER INCIDENTS ═══
  const incidentData = [
    { title: 'ניסיון פישינג ממוקד — ינואר 2025', severity: 'high' as const, status: 'resolved' as const, incidentType: 'phishing', detectedAt: new Date('2025-01-15T08:30:00'), resolvedAt: new Date('2025-01-15T14:00:00') },
    { title: 'סריקת פורטים חשודה', severity: 'medium' as const, status: 'closed' as const, incidentType: 'reconnaissance', detectedAt: new Date('2025-01-20T03:15:00'), resolvedAt: new Date('2025-01-20T06:00:00') },
    { title: 'ניסיון גישה לא מורשית — VPN', severity: 'high' as const, status: 'contained' as const, incidentType: 'unauthorized_access', detectedAt: new Date('2025-02-10T22:45:00') },
    { title: 'דליפת מידע חשודה — ספק צד שלישי', severity: 'critical' as const, status: 'investigating' as const, incidentType: 'data_leak', detectedAt: new Date('2025-02-18T11:00:00'), dataExposed: true },
  ];
  await db.insert(schema.cyberIncidents).values(
    incidentData.map(i => ({ ...i, tenantId: tid }))
  );
  console.log(`  ✓ ${incidentData.length} cyber incidents`);

  // ═══ 13. BOARD MEETINGS ═══
  const meetingData = [
    { meetingType: 'ישיבת דירקטוריון רבעונית', date: '2025-01-15', quarter: 'Q4/2024', status: 'completed' as const, agenda: ['סקירת סיכונים', 'דוח ציות', 'אישור תקציב'] },
    { meetingType: 'ישיבת דירקטוריון רבעונית', date: '2025-04-15', quarter: 'Q1/2025', status: 'scheduled' as const, agenda: ['דוח סיכונים Q1', 'סקירת סייבר', 'אישור מדיניות'] },
    { meetingType: 'ישיבה מיוחדת — סייבר', date: '2025-02-20', quarter: '', status: 'scheduled' as const, agenda: ['אירוע סייבר פברואר', 'תוכנית תגובה', 'שיפורי אבטחה'] },
  ];
  const meetings = await db.insert(schema.boardMeetings).values(
    meetingData.map(m => ({ ...m, tenantId: tid, attendees: directorData.map(d => d.fullName) }))
  ).returning();
  console.log(`  ✓ ${meetings.length} board meetings`);

  // Board decisions for completed meeting
  await db.insert(schema.boardDecisions).values([
    { meetingId: meetings[0].id, tenantId: tid, text: 'אישור תקציב סייבר 2025 — ₪2.1M', ownerName: 'אבי ברק', dueDate: '2025-02-28', status: 'done' },
    { meetingId: meetings[0].id, tenantId: tid, text: 'מינוי יועץ חיצוני לביקורת מיקור חוץ', ownerName: 'דוד כהן', dueDate: '2025-03-15', status: 'in_progress' },
    { meetingId: meetings[0].id, tenantId: tid, text: 'עדכון מדיניות סיכון אשראי', ownerName: 'דוד כהן', dueDate: '2025-03-31', status: 'pending' },
  ]);
  console.log('  ✓ 3 board decisions');

  // ═══ 14. KRIs ═══
  const kriData = [
    { name: 'שיעור כשלי אשראי', threshold: '<5%', currentValue: '4.2%', previousValue: '3.8%', trend: 'deteriorating', breached: false },
    { name: 'זמן זיהוי אירוע סייבר (MTTD)', threshold: '<4h', currentValue: '2.5h', previousValue: '3.1h', trend: 'improving', breached: false },
    { name: 'אחוז בקרות אפקטיביות', threshold: '>80%', currentValue: '85%', previousValue: '82%', trend: 'improving', breached: false },
    { name: 'ציון סיכון ספקים קריטיים', threshold: '<3', currentValue: '3.2', previousValue: '2.8', trend: 'deteriorating', breached: true },
    { name: 'אחוז ציות רגולטורי', threshold: '>90%', currentValue: '78%', previousValue: '75%', trend: 'improving', breached: true },
    { name: 'משימות באיחור', threshold: '<5', currentValue: '3', previousValue: '7', trend: 'improving', breached: false },
    { name: 'זמן תגובה לאירוע (MTTR)', threshold: '<8h', currentValue: '5.2h', previousValue: '6.1h', trend: 'improving', breached: false },
    { name: 'חשיפה לספק בודד', threshold: '<30%', currentValue: '35%', previousValue: '32%', trend: 'deteriorating', breached: true },
  ];
  await db.insert(schema.kris).values(
    kriData.map(k => ({ ...k, tenantId: tid }))
  );
  console.log(`  ✓ ${kriData.length} KRIs`);

  // ═══ 15. BCP PLAN ═══
  await db.insert(schema.bcpPlans).values({
    tenantId: tid,
    version: '2.0',
    status: 'approved',
    content: { lastDRTest: '2024-11-15', rto: '4h', rpo: '1h' },
    nextReview: '2025-06-01',
  });
  await db.insert(schema.bcpCriticalFunctions).values([
    { tenantId: tid, functionName: 'מערכת Core Banking', department: 'טכנולוגיה', rtoHours: 4, rpoHours: 1, impactLevel: 5, priorityOrder: 1 },
    { tenantId: tid, functionName: 'שירותי סליקה', department: 'תפעול', rtoHours: 2, rpoHours: 0, impactLevel: 5, priorityOrder: 2 },
    { tenantId: tid, functionName: 'אתר אינטרנט ללקוחות', department: 'דיגיטל', rtoHours: 8, rpoHours: 4, impactLevel: 4, priorityOrder: 3 },
    { tenantId: tid, functionName: 'מערכת CRM', department: 'שירות', rtoHours: 24, rpoHours: 8, impactLevel: 3, priorityOrder: 4 },
  ]);
  console.log('  ✓ BCP plan + 4 critical functions');

  // ═══ 16. COMPLIANCE STATUS (sample) ═══
  // Get all requirements and mark some as compliant
  const allReqs = await db.select().from(schema.regRequirements);
  const compStatuses = allReqs.map((req, i) => ({
    tenantId: tid,
    requirementId: req.id,
    status: (i % 4 === 0 ? 'compliant' : i % 4 === 1 ? 'in_progress' : i % 4 === 2 ? 'compliant' : 'not_started') as typeof schema.complianceStatusEnum.enumValues[number],
  }));
  await db.insert(schema.complianceStatus).values(compStatuses);
  const compliantCount = compStatuses.filter(s => s.status === 'compliant').length;
  console.log(`  ✓ ${compStatuses.length} compliance statuses (${compliantCount} compliant)`);

  // ═══ 17. AUDIT LOG (sample entries) ═══
  const auditEntries = [
    { action: 'risk.created', entityType: 'risk', details: { title: 'סיכון אשראי צרכני' } },
    { action: 'control.created', entityType: 'control', details: { title: 'אימות זהות לווה' } },
    { action: 'document.approved', entityType: 'document', details: { title: 'מדיניות ניהול סיכונים 2025' } },
    { action: 'vendor.created', entityType: 'vendor', details: { name: 'CloudSec Ltd' } },
    { action: 'task.completed', entityType: 'task', details: { title: 'הדרכת סייבר רבעונית' } },
    { action: 'cyber_incident.created', entityType: 'cyber_incident', details: { title: 'ניסיון פישינג ממוקד' } },
    { action: 'board_meeting.created', entityType: 'board_meeting', details: { type: 'ישיבת דירקטוריון רבעונית' } },
    { action: 'kri.updated', entityType: 'kri', details: { name: 'שיעור כשלי אשראי', value: '4.2%' } },
    { action: 'tenant.onboarding_completed', entityType: 'tenant', details: { name: 'אשראי פלוס בע"מ' } },
    { action: 'user.login', entityType: 'user', details: { email: 'demo@riskguard.co.il' } },
  ];
  await db.insert(schema.auditLog).values(
    auditEntries.map(e => ({ ...e, tenantId: tid, userId: demoUserId }))
  );
  console.log(`  ✓ ${auditEntries.length} audit log entries`);

  // ═══ 18. NOTIFICATIONS ═══
  await db.insert(schema.notifications).values([
    { tenantId: tid, userId: demoUserId, type: 'task_overdue', title: 'משימה באיחור', body: 'סריקת חולשות — Q1 חורגת מלוח הזמנים' },
    { tenantId: tid, userId: demoUserId, type: 'kri_breach', title: 'חריגת KRI', body: 'ציון סיכון ספקים קריטיים חרג מהסף (3.2 > 3)' },
    { tenantId: tid, userId: demoUserId, type: 'incident_created', title: 'אירוע סייבר חדש', body: 'דליפת מידע חשודה — ספק צד שלישי' },
    { tenantId: tid, userId: demoUserId, type: 'document_expiring', title: 'מסמך לחידוש', body: 'תוכנית המשכיות עסקית — גרסה 1.5 ממתינה לאישור' },
  ]);
  console.log('  ✓ 4 notifications');

  console.log('\n✅ Seed completed successfully!');
  console.log(`   Tenant ID: ${tid}`);
  console.log(`   Demo User: demo@riskguard.co.il (admin)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
