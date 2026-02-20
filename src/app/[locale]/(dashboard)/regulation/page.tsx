'use client';

import { useState } from 'react';
import {
  BookOpen, Shield, Lock, ChevronDown, ChevronRight, ChevronLeft,
  Search, CheckSquare, Clock, X, FileText, AlertTriangle,
} from 'lucide-react';

/* ═══ Design System ═══ */
const C = {
  navBg: '#1E2D3D', navHover: '#2A3F52',
  accent: '#4A8EC2', accentTeal: '#5BB8C9',
  accentLight: '#E8F4FA', accentDark: '#3A7AAF',
  accentGrad: 'linear-gradient(135deg, #4A8EC2, #5BB8C9)',
  success: '#2E8B57', successBg: '#EFF8F2',
  warning: '#C8922A', warningBg: '#FDF8ED',
  danger: '#C0392B', dangerBg: '#FDF0EE',
  bg: '#F5F7FA', surface: '#FFFFFF',
  text: '#1A2332', textSec: '#4A5568', textMuted: '#8896A6',
  border: '#E1E8EF', borderLight: '#F0F3F7',
};

const STATUS_LABELS = {
  met: { l: 'עומד', c: C.success, bg: C.successBg },
  partial: { l: 'חלקי', c: C.warning, bg: C.warningBg },
  not_met: { l: 'לא עומד', c: C.danger, bg: C.dangerBg },
} as const;

/* ═══ RISK_BANK for linked risks ═══ */
const RISK_LEVELS = { 1: { label: 'זניח', color: '#7CB5A0' }, 2: { label: 'נמוך', color: C.success }, 3: { label: 'בינוני', color: C.warning }, 4: { label: 'גבוה', color: '#E8875B' }, 5: { label: 'קריטי', color: C.danger } } as Record<number, { label: string; color: string }>;
const CTRL_EFF = { 1: { label: 'לא קיימת', color: C.danger }, 2: { label: 'חלקית', color: '#E8875B' }, 3: { label: 'מיושמת', color: C.warning }, 4: { label: 'אפקטיבית', color: '#5CAD6F' }, 5: { label: 'אפקטיבית מאוד', color: C.success } } as Record<number, { label: string; color: string }>;
const MATRIX: Record<number, Record<number, number>> = { 5:{1:5,2:5,3:4,4:3,5:2}, 4:{1:4,2:4,3:3,4:2,5:1}, 3:{1:3,2:3,3:2,4:2,5:1}, 2:{1:2,2:2,3:1,4:1,5:1}, 1:{1:1,2:1,3:1,4:1,5:1} };
const calcResidual = (inherent: number, controls: { effectiveness: number }[]) => {
  if (!controls || controls.length === 0) return inherent;
  const avgEff = Math.round(controls.reduce((a, c) => a + c.effectiveness, 0) / controls.length);
  return MATRIX[inherent]?.[avgEff] ?? inherent;
};

type Control = { id: string; name: string; effectiveness: number; reg: string; section: string; reqId: string };
type Risk = { id: string; name: string; cat: string; module: string; inherent: number; reg: string; section: string; reqId: string; controls: Control[]; tier?: string };

const RISK_BANK: Risk[] = [
  { id:'R01',name:'היעדר מדיניות ניהול סיכונים מעודכנת ומאושרת',cat:'ממשל',module:'gov',inherent:4,reg:'2024-10-2',section:'2(א)',reqId:'GOV-01',controls:[{id:'C01',name:'מדיניות ניהול סיכונים מאושרת ע״י הדירקטוריון',effectiveness:4,reg:'2024-10-2',section:'2(א)',reqId:'GOV-01'},{id:'C02',name:'עדכון שנתי של המדיניות ובחינת רלוונטיות',effectiveness:3,reg:'2024-10-2',section:'2(א)',reqId:'GOV-02'}]},
  { id:'R02',name:'חוסר מעורבות הדירקטוריון בפיקוח על ניהול סיכונים',cat:'ממשל',module:'gov',inherent:5,reg:'2024-10-2',section:'2(א)',reqId:'GOV-03',controls:[{id:'C03',name:'דיווח רבעוני לדירקטוריון על מפת סיכונים',effectiveness:4,reg:'2024-10-2',section:'2(א)',reqId:'GOV-03'},{id:'C04',name:'ועדת סיכונים בדירקטוריון עם תוכנית עבודה',effectiveness:3,reg:'2024-10-2',section:'3',reqId:'GOV-04'}]},
  { id:'R03',name:'היעדר מנהל סיכונים ייעודי עם סמכות מספקת',cat:'ממשל',module:'gov',inherent:4,reg:'2024-10-2',section:'2(ב)',reqId:'GOV-05',controls:[{id:'C05',name:'מינוי מנהל סיכונים עם קו דיווח ישיר להנהלה',effectiveness:5,reg:'2024-10-2',section:'2(ב)',reqId:'GOV-05'},{id:'C06',name:'הגדרת תפקיד ואחריות מתועדת',effectiveness:4,reg:'2024-10-2',section:'2(ב)',reqId:'GOV-06'}]},
  { id:'R04',name:'היעדר תהליך זיהוי והערכת סיכונים שיטתי',cat:'ממשל',module:'gov',inherent:3,reg:'2024-10-2',section:'2(ב)(1)',reqId:'GOV-07',controls:[{id:'C07',name:'מתודולוגיה מתועדת לזיהוי והערכת סיכונים',effectiveness:3,reg:'2024-10-2',section:'2(ב)(1)',reqId:'GOV-07'},{id:'C08',name:'ביצוע סקר סיכונים שנתי מקיף',effectiveness:2,reg:'2024-10-2',section:'2(ב)(1)',reqId:'GOV-08'}]},
  { id:'R05',name:'כשל במערכת הליבה לניהול תיקי אשראי',cat:'תפעולי',module:'ops',inherent:5,reg:'2024-10-2',section:'2(ב)(2)',reqId:'OPS-01',controls:[{id:'C09',name:'SLA עם ספק המערכת כולל זמני תגובה',effectiveness:3,reg:'2024-10-2',section:'2(ב)(2)',reqId:'OPS-01'},{id:'C10',name:'מערכת גיבוי ותוכנית DR',effectiveness:2,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-03'},{id:'C11',name:'ניטור ביצועי מערכת בזמן אמת',effectiveness:3,reg:'2024-10-2',section:'2(ב)(2)',reqId:'OPS-02'}]},
  { id:'R10',name:'תלות קריטית בספק יחיד ללא חלופה',cat:'מיקור חוץ',module:'out',inherent:4,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-01',controls:[{id:'C20',name:'מיפוי ספקים קריטיים עם תוכנית חלופות',effectiveness:2,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-01'},{id:'C21',name:'סעיפי יציאה (Exit Strategy) בחוזי ספקים',effectiveness:2,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-02'}]},
  { id:'R11',name:'ספק ענן ללא עמידה בתקני אבטחת מידע',cat:'מיקור חוץ',module:'out',inherent:4,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-03',controls:[{id:'C22',name:'דרישת אישורי SOC2/ISO27001 מספקים',effectiveness:3,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-03'},{id:'C23',name:'הערכת סיכוני ספקים שנתית מתועדת',effectiveness:2,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-04'}]},
  { id:'R12',name:'חשיפת נתוני לקוחות לספק חיצוני ללא בקרה',cat:'מיקור חוץ',module:'out',inherent:5,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-05',controls:[{id:'C24',name:'הסכמי סודיות (NDA) עם כל הספקים',effectiveness:4,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-05'},{id:'C25',name:'הגבלת גישה לנתונים רגישים (Need-to-Know)',effectiveness:3,reg:'2024-10-2',section:'2(ב)(4)',reqId:'OUT-06'}]},
  { id:'R14',name:'היעדר תוכנית המשכיות עסקית (BCP) מעודכנת',cat:'המשכיות',module:'bcp',inherent:4,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-01',controls:[{id:'C28',name:'תוכנית BCP מתועדת ומאושרת',effectiveness:2,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-01'},{id:'C29',name:'תרגיל שנתי של תוכנית ההמשכיות',effectiveness:1,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-02'}]},
  { id:'R15',name:'אי-ביצוע ניתוח השפעה עסקית (BIA)',cat:'המשכיות',module:'bcp',inherent:3,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-05',controls:[{id:'C30',name:'ביצוע BIA שנתי לכל הפונקציות הקריטיות',effectiveness:2,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-05'}]},
  { id:'R16',name:'כשל בשחזור מערכות לאחר אסון',cat:'המשכיות',module:'bcp',inherent:5,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-03',controls:[{id:'C31',name:'תוכנית DR מתועדת עם RTO/RPO מוגדרים',effectiveness:2,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-03'},{id:'C32',name:'אתר DR חלופי פעיל',effectiveness:1,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-06'},{id:'C33',name:'בדיקת שחזור חצי-שנתית',effectiveness:1,reg:'2024-10-2',section:'2(ב)(5)',reqId:'BCP-04'}]},
  { id:'R18',name:'היעדר מדיניות אבטחת מידע וסייבר מאושרת',cat:'ממשל סייבר',module:'cgov',inherent:4,reg:'2022-10-9',section:'2(א)',reqId:'CYB-GOV-01',tier:'pro',controls:[{id:'C36',name:'מדיניות סייבר מאושרת ע״י הדירקטוריון',effectiveness:3,reg:'2022-10-9',section:'2(א)',reqId:'CYB-GOV-01'},{id:'C37',name:'תוכנית עבודה שנתית לסייבר',effectiveness:2,reg:'2022-10-9',section:'2(ב)',reqId:'CYB-GOV-02'}]},
  { id:'R21',name:'תקיפת כופרה (Ransomware) על תשתיות החברה',cat:'הגנת סייבר',module:'cpro',inherent:5,reg:'2022-10-9',section:'4(א)',reqId:'CYB-PRO-01',tier:'pro',controls:[{id:'C42',name:'מערכת EDR על כלל תחנות העבודה',effectiveness:3,reg:'2022-10-9',section:'4(א)',reqId:'CYB-PRO-01'},{id:'C43',name:'גיבוי מבודד (Air-Gapped) לנתונים קריטיים',effectiveness:2,reg:'2022-10-9',section:'4(א)',reqId:'CYB-PRO-02'}]},
  { id:'R26',name:'היעדר יכולת זיהוי וניטור אירועי סייבר',cat:'אירועי סייבר',module:'cinc',inherent:4,reg:'2022-10-9',section:'5(א)',reqId:'CYB-INC-01',tier:'pro',controls:[{id:'C54',name:'מערכת SIEM לניטור אירועים',effectiveness:4,reg:'2022-10-9',section:'5(א)',reqId:'CYB-INC-01'},{id:'C55',name:'SOC (מרכז תפעול אבטחה) — פנימי או חיצוני',effectiveness:4,reg:'2022-10-9',section:'5(א)',reqId:'CYB-INC-02'}]},
];

const RiskBadge = ({ level }: { level: number }) => {
  const r = RISK_LEVELS[level] || RISK_LEVELS[1];
  return <span style={{ background: `${r.color}18`, color: r.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>{level} — {r.label}</span>;
};

/* ═══ REG_TREE — from V11 ═══ */
type Req = { reqId: string; text: string; feature: string; featureNav: string; status: 'met' | 'partial' | 'not_met'; evidence: string[] };
type Section = { id: string; ref: string; title: string; reqs: Req[] };
type Regulation = { id: string; name: string; circular: string; tier: string; icon: 'shield' | 'lock'; sections: Section[] };

const REG_TREE: Regulation[] = [
  { id: 'reg-risk', name: 'ניהול סיכונים כללי', circular: '2024-10-2', tier: 'starter', icon: 'shield', sections: [
    { id: '2a', ref: '2(א)', title: 'חובות הדירקטוריון', reqs: [
      { reqId: 'GOV-01', text: 'אישור מדיניות ניהול סיכונים בכתב', feature: 'אשף מדיניות', featureNav: 'gov', status: 'met', evidence: ['T01 — מדיניות ניהול סיכונים v2.0 (אושר 10/01/2026)'] },
      { reqId: 'GOV-02', text: 'עדכון שנתי של תוכנית ניהול סיכונים', feature: 'מעקב עדכון שנתי', featureNav: 'gov', status: 'met', evidence: ['סקירה שנתית הושלמה 01/2026'] },
      { reqId: 'GOV-03', text: 'פיקוח הדירקטוריון על ניהול סיכונים — דיווח רבעוני', feature: 'דוח דירקטוריון', featureNav: 'gov', status: 'partial', evidence: ['T05 — דוח Q4/2025 הוגש', 'דוח Q1/2026 — בתהליך'] },
      { reqId: 'GOV-04', text: 'ועדת סיכונים בדירקטוריון', feature: 'ממשל — ועדת היגוי', featureNav: 'gov', status: 'met', evidence: ['T04 — פרוטוקול ועדת סיכונים 12/2025'] },
    ]},
    { id: '2b', ref: '2(ב)', title: 'חובות המנכ״ל ומנהל הסיכונים', reqs: [
      { reqId: 'GOV-05', text: 'מינוי מנהל סיכונים עם קו דיווח ישיר', feature: 'פרופיל מנהל סיכונים', featureNav: 'gov', status: 'met', evidence: ['T03 — כתב מינוי מנהל סיכונים'] },
      { reqId: 'GOV-06', text: 'הגדרת תפקיד ואחריות מתועדת', feature: 'הגדרת תפקיד', featureNav: 'gov', status: 'met', evidence: ['מסמך תיאור תפקיד מנהל סיכונים v1.2'] },
      { reqId: 'GOV-07', text: 'מתודולוגיה לזיהוי והערכת סיכונים', feature: 'רישום סיכונים', featureNav: 'riskreg', status: 'partial', evidence: ['בנק 30 סיכונים מאוכלס', 'סקר שנתי — לא הושלם'] },
      { reqId: 'GOV-08', text: 'סקר סיכונים שנתי מקיף', feature: 'הערכת סיכונים שנתית', featureNav: 'riskreg', status: 'not_met', evidence: [] },
    ]},
    { id: '2b2', ref: '2(ב)(2)', title: 'סיכון תפעולי', reqs: [
      { reqId: 'OPS-01', text: 'ניהול סיכוני מערכות ליבה', feature: 'רישום סיכונים — תפעולי', featureNav: 'riskreg', status: 'partial', evidence: ['R05 — סיכון מזוהה, בקרות חלקיות'] },
      { reqId: 'OPS-03', text: 'בקרות על תהליך חיתום ואישור', feature: 'בקרות חיתום', featureNav: 'ops', status: 'met', evidence: ['C12 — Scoring אוטומטי פעיל', 'C13 — Dual Approval מיושם'] },
      { reqId: 'OPS-05', text: 'בקרות ממשקים פיננסיים', feature: 'ניטור ממשקים', featureNav: 'ops', status: 'partial', evidence: ['C14 — Reconciliation יומי'] },
      { reqId: 'OPS-07', text: 'מדיניות גיבוי ושחזור נתונים', feature: 'ניהול גיבויים', featureNav: 'ops', status: 'partial', evidence: ['C16 — גיבוי יומי פעיל', 'C17 — בדיקת שחזור לא בוצעה'] },
    ]},
    { id: '2b3', ref: '2(ב)(3)', title: 'מניעת הונאה', reqs: [
      { reqId: 'OPS-08', text: 'מנגנוני זיהוי ומניעת הונאה', feature: 'מודול הונאה', featureNav: 'ops', status: 'partial', evidence: ['C18 — מנגנון אוטומטי מיושם חלקית'] },
      { reqId: 'OPS-09', text: 'ביקורת פנימית תקופתית', feature: 'ביקורת פנימית', featureNav: 'ops', status: 'met', evidence: ['ביקורת פנימית Q4/2025 הושלמה'] },
    ]},
    { id: '2b4', ref: '2(ב)(4)', title: 'ניהול מיקור חוץ', reqs: [
      { reqId: 'OUT-01', text: 'מיפוי ספקים קריטיים', feature: 'מרשם ספקים', featureNav: 'out', status: 'partial', evidence: ['6 ספקים רשומים', 'חסר: חלופות לספק יחיד'] },
      { reqId: 'OUT-02', text: 'תוכנית יציאה לכל ספק קריטי', feature: 'Exit Strategy', featureNav: 'out', status: 'not_met', evidence: [] },
      { reqId: 'OUT-03', text: 'הערכת עמידה בתקני אבטחה', feature: 'הערכת ספקים', featureNav: 'out', status: 'partial', evidence: ['C22 — דרישת SOC2 קיימת', 'הערכה שנתית לא הושלמה'] },
      { reqId: 'OUT-05', text: 'הגנה על נתוני לקוחות אצל ספקים', feature: 'NDA + הגבלת גישה', featureNav: 'out', status: 'met', evidence: ['C24 — NDA עם כל הספקים', 'C25 — Need-to-Know מיושם'] },
    ]},
    { id: '2b5', ref: '2(ב)(5)', title: 'המשכיות עסקית', reqs: [
      { reqId: 'BCP-01', text: 'תוכנית המשכיות עסקית מתועדת', feature: 'אשף BCP', featureNav: 'bcp', status: 'partial', evidence: ['T10 — תוכנית BCP v1.0 (לא מעודכנת)'] },
      { reqId: 'BCP-02', text: 'תרגיל שנתי של תוכנית המשכיות', feature: 'ניהול תרגילים', featureNav: 'bcp', status: 'not_met', evidence: [] },
      { reqId: 'BCP-03', text: 'תוכנית DR עם RTO/RPO מוגדרים', feature: 'Disaster Recovery', featureNav: 'bcp', status: 'partial', evidence: ['C31 — תוכנית DR קיימת', 'RTO/RPO לא נבדקו'] },
      { reqId: 'BCP-05', text: 'ניתוח השפעה עסקית (BIA)', feature: 'תבנית BIA', featureNav: 'bcp', status: 'not_met', evidence: [] },
    ]},
  ]},
  { id: 'reg-cyber', name: 'ניהול סיכוני סייבר', circular: '2022-10-9', tier: 'pro', icon: 'lock', sections: [
    { id: 'c2a', ref: '2(א)', title: 'מדיניות סייבר', reqs: [
      { reqId: 'CYB-GOV-01', text: 'מדיניות אבטחת מידע וסייבר מאושרת', feature: 'אשף מדיניות סייבר', featureNav: 'cgov', status: 'partial', evidence: ['T20 — טיוטת מדיניות v1.0'] },
      { reqId: 'CYB-GOV-02', text: 'תוכנית עבודה שנתית לסייבר', feature: 'תוכנית עבודה', featureNav: 'cgov', status: 'not_met', evidence: [] },
    ]},
    { id: 'c3a', ref: '3(א)', title: 'מודעות והדרכה', reqs: [
      { reqId: 'CYB-GOV-03', text: 'הדרכת מודעות סייבר שנתית', feature: 'מעקב הדרכות', featureNav: 'cgov', status: 'partial', evidence: ['הדרכה אחרונה: 06/2025'] },
      { reqId: 'CYB-GOV-04', text: 'סימולציות פישינג תקופתיות', feature: 'מעקב סימולציות', featureNav: 'cgov', status: 'not_met', evidence: [] },
    ]},
    { id: 'c3b', ref: '3(ב)', title: 'מיפוי נכסי מידע', reqs: [
      { reqId: 'CYB-GOV-05', text: 'מרשם נכסי מידע מעודכן', feature: 'Asset Inventory', featureNav: 'cgov', status: 'partial', evidence: ['רשימה חלקית — 60% מהנכסים'] },
      { reqId: 'CYB-GOV-06', text: 'סיווג רמות רגישות', feature: 'סיווג נכסים', featureNav: 'cgov', status: 'not_met', evidence: [] },
    ]},
    { id: 'c4a', ref: '4(א)', title: 'אמצעי הגנה', reqs: [
      { reqId: 'CYB-PRO-01', text: 'הגנה מפני תוכנות זדוניות (EDR)', feature: 'מעקב EDR', featureNav: 'cpro', status: 'partial', evidence: ['C42 — EDR בפריסה, 70% כיסוי'] },
      { reqId: 'CYB-PRO-02', text: 'גיבוי מבודד לנתונים קריטיים', feature: 'ניהול גיבויים', featureNav: 'cpro', status: 'not_met', evidence: [] },
      { reqId: 'CYB-PRO-04', text: 'הגנה מפני פישינג ודוא״ל זדוני', feature: 'Email Gateway', featureNav: 'cpro', status: 'met', evidence: ['C45 — Email Gateway פעיל', 'C46 — MFA לכלל המשתמשים'] },
    ]},
    { id: 'c4b', ref: '4(ב)', title: 'ניהול פגיעויות', reqs: [
      { reqId: 'CYB-PRO-06', text: 'סריקת פגיעויות תקופתית', feature: 'מעקב סריקות', featureNav: 'cpro', status: 'partial', evidence: ['סריקה אחרונה: 11/2025'] },
      { reqId: 'CYB-PRO-07', text: 'ניהול עדכוני אבטחה', feature: 'Patch Management', featureNav: 'cpro', status: 'partial', evidence: ['C48 — תהליך קיים, לא מלא'] },
      { reqId: 'CYB-PRO-08', text: 'מבחן חדירה שנתי', feature: 'מעקב Pen Test', featureNav: 'cpro', status: 'not_met', evidence: [] },
    ]},
    { id: 'c4c', ref: '4(ג)', title: 'ניהול הרשאות וגישה', reqs: [
      { reqId: 'CYB-PRO-09', text: 'ניהול זהויות והרשאות (IAM)', feature: 'IAM Dashboard', featureNav: 'cpro', status: 'partial', evidence: ['C50 — IAM בסיסי פעיל'] },
      { reqId: 'CYB-PRO-10', text: 'סקירת הרשאות רבעונית', feature: 'Access Review', featureNav: 'cpro', status: 'not_met', evidence: [] },
    ]},
    { id: 'c4d', ref: '4(ד)', title: 'הגנת מידע', reqs: [
      { reqId: 'CYB-PRO-11', text: 'מניעת דליפת מידע (DLP)', feature: 'DLP Dashboard', featureNav: 'cpro', status: 'not_met', evidence: [] },
      { reqId: 'CYB-PRO-12', text: 'הצפנת נתונים', feature: 'Encryption Inventory', featureNav: 'cpro', status: 'partial', evidence: ['C53 — In-Transit מוצפן, At-Rest חלקי'] },
    ]},
    { id: 'c5a', ref: '5(א)', title: 'זיהוי וניטור אירועים', reqs: [
      { reqId: 'CYB-INC-01', text: 'מערכת SIEM לניטור אירועים', feature: 'SIEM Integration', featureNav: 'cinc', status: 'met', evidence: ['C54 — SIEM פעיל'] },
      { reqId: 'CYB-INC-02', text: 'מרכז תפעול אבטחה (SOC)', feature: 'SOC Dashboard', featureNav: 'cinc', status: 'met', evidence: ['C55 — SOC חיצוני פעיל'] },
    ]},
    { id: 'c5b', ref: '5(ב)', title: 'תגובה לאירועים', reqs: [
      { reqId: 'CYB-INC-03', text: 'נוהל תגובה לאירועי סייבר (IRP)', feature: 'Incident Response', featureNav: 'cinc', status: 'met', evidence: ['C56 — IRP מתועד ומאושר'] },
      { reqId: 'CYB-INC-04', text: 'תרגיל תגובה שנתי', feature: 'ניהול תרגילים', featureNav: 'cinc', status: 'partial', evidence: ['תרגיל אחרון: 08/2025'] },
    ]},
    { id: 'c5c', ref: '5(ג)', title: 'דיווח לרגולטור', reqs: [
      { reqId: 'CYB-INC-05', text: 'נוהל דיווח לרשות שוק ההון', feature: 'דוח ISA', featureNav: 'cinc', status: 'met', evidence: ['C58 — נוהל דיווח מוסדר פעיל'] },
      { reqId: 'CYB-INC-06', text: 'ניתוח שורש אירועים', feature: 'Root Cause Analysis', featureNav: 'cinc', status: 'met', evidence: ['C59 — מנגנון RCA פעיל'] },
    ]},
  ]},
];

/* ═══ MAIN COMPONENT ═══ */
export default function RegulationPage() {
  const [expandedRegs, setExpandedRegs] = useState<Record<string, boolean>>({ 'reg-risk': true, 'reg-cyber': false });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'met' | 'partial' | 'not_met'>('all');

  const toggleReg = (id: string) => setExpandedRegs(p => ({ ...p, [id]: !p[id] }));
  const toggleSection = (id: string) => setExpandedSections(p => ({ ...p, [id]: !p[id] }));

  const allReqs = REG_TREE.flatMap(r => r.sections.flatMap(s => s.reqs));
  const stats = { met: allReqs.filter(r => r.status === 'met').length, partial: allReqs.filter(r => r.status === 'partial').length, not_met: allReqs.filter(r => r.status === 'not_met').length };
  const totalPct = Math.round((stats.met / allReqs.length) * 100);

  const matchesFilter = (req: Req) => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchQ && !req.text.includes(searchQ) && !req.reqId.toLowerCase().includes(searchQ.toLowerCase()) && !req.feature.includes(searchQ)) return false;
    return true;
  };

  const selectedReqData = selectedReq ? allReqs.find(r => r.reqId === selectedReq) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={20} color={C.accent} /> נווט רגולציה
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            {allReqs.length} דרישות · {stats.met} עומד · {stats.partial} חלקי · {stats.not_met} לא עומד
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: totalPct >= 60 ? C.success : C.warning, fontFamily: 'var(--font-rubik)' }}>{totalPct}%</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>עמידה כוללת</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', flex: '0 0 220px' }}>
          <Search size={13} color={C.textMuted} />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="חיפוש דרישה, סעיף, פיצ׳ר..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, fontFamily: 'var(--font-assistant)', color: C.text, width: '100%', direction: 'rtl' }} />
        </div>
        {([{ id: 'all' as const, l: 'הכל', c: undefined }, { id: 'met' as const, l: 'עומד', c: C.success }, { id: 'partial' as const, l: 'חלקי', c: C.warning }, { id: 'not_met' as const, l: 'לא עומד', c: C.danger }]).map(f => (
          <button key={f.id} onClick={() => setFilterStatus(f.id)} style={{
            background: filterStatus === f.id ? (f.c || C.accent) : C.surface,
            color: filterStatus === f.id ? 'white' : C.textSec,
            border: `1px solid ${filterStatus === f.id ? (f.c || C.accent) : C.border}`,
            borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: filterStatus === f.id ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-rubik)',
          }}>{f.l} {f.id !== 'all' && `(${stats[f.id]})`}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Tree */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {REG_TREE.map(reg => {
            const regReqs = reg.sections.flatMap(s => s.reqs);
            const regMet = regReqs.filter(r => r.status === 'met').length;
            const regPct = Math.round((regMet / regReqs.length) * 100);
            const isExpanded = expandedRegs[reg.id];
            const Ic = reg.icon === 'lock' ? Lock : Shield;

            return (
              <div key={reg.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                {/* Regulation header */}
                <div onClick={() => toggleReg(reg.id)} style={{
                  padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  background: isExpanded ? C.accentLight : C.surface, borderBottom: isExpanded ? `1px solid ${C.border}` : 'none',
                  transition: 'background 0.1s',
                }}>
                  {isExpanded ? <ChevronDown size={16} color={C.accent} /> : <ChevronRight size={16} color={C.textMuted} />}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: reg.tier === 'pro' ? '#EDE9FE' : C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ic size={16} color={reg.tier === 'pro' ? '#7C3AED' : C.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {reg.name}
                      {reg.tier === 'pro' && <span style={{ background: 'rgba(91,184,201,0.2)', color: C.accentTeal, fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>PRO</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>חוזר {reg.circular} · {regReqs.length} דרישות · {reg.sections.length} סעיפים</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 50 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: regPct >= 60 ? C.success : regPct >= 30 ? C.warning : C.danger, fontFamily: 'var(--font-rubik)' }}>{regPct}%</div>
                    <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>עמידה</div>
                  </div>
                  <div style={{ width: 60, background: C.borderLight, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${regPct}%`, height: '100%', borderRadius: 4, background: regPct >= 60 ? C.success : regPct >= 30 ? C.warning : C.danger }} />
                  </div>
                </div>

                {/* Sections */}
                {isExpanded && reg.sections.map(section => {
                  const secReqs = section.reqs.filter(matchesFilter);
                  if (secReqs.length === 0 && (searchQ || filterStatus !== 'all')) return null;
                  const secExpanded = expandedSections[section.id] !== false;
                  const secMet = section.reqs.filter(r => r.status === 'met').length;
                  const secTotal = section.reqs.length;

                  return (
                    <div key={section.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <div onClick={() => toggleSection(section.id)} style={{
                        padding: '10px 16px 10px 40px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        background: secExpanded ? '#FAFCFE' : 'white',
                      }}>
                        {secExpanded ? <ChevronDown size={13} color={C.textSec} /> : <ChevronRight size={13} color={C.textMuted} />}
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: 'var(--font-rubik)', minWidth: 50 }}>§ {section.ref}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', flex: 1 }}>{section.title}</span>
                        <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{secMet}/{secTotal}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {section.reqs.map(r => (
                            <div key={r.reqId} style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_LABELS[r.status].c }} />
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      {secExpanded && (searchQ || filterStatus !== 'all' ? secReqs : section.reqs).map(req => {
                        const st = STATUS_LABELS[req.status];
                        const isSel = selectedReq === req.reqId;
                        return (
                          <div key={req.reqId} onClick={() => setSelectedReq(isSel ? null : req.reqId)} style={{
                            padding: '10px 16px 10px 64px', display: 'flex', alignItems: 'flex-start', gap: 10,
                            cursor: 'pointer', background: isSel ? C.accentLight : 'white',
                            borderInlineEnd: isSel ? `3px solid ${C.accent}` : '3px solid transparent',
                            borderBottom: `1px solid ${C.borderLight}`, transition: 'background 0.1s',
                          }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                              {req.status === 'met' ? <CheckSquare size={10} color={st.c} /> : req.status === 'partial' ? <Clock size={10} color={st.c} /> : <X size={10} color={st.c} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: C.text, fontFamily: 'var(--font-assistant)', fontWeight: 500, lineHeight: 1.4 }}>{req.text}</div>
                              <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 9, fontWeight: 600, color: C.accent, background: C.accentLight, padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--font-rubik)' }}>{req.reqId}</span>
                                <span style={{ fontSize: 9, color: C.textSec, fontFamily: 'var(--font-assistant)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <ChevronRight size={8} /> {req.feature}
                                </span>
                                {req.evidence.length > 0 && <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{req.evidence.length} ראיות</span>}
                              </div>
                            </div>
                            <span style={{ background: st.bg, color: st.c, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap', flexShrink: 0 }}>{st.l}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedReqData && (() => {
          const req = selectedReqData;
          const st = STATUS_LABELS[req.status];
          const linkedRisks = RISK_BANK.filter(r => r.reqId === req.reqId || r.controls.some(c => c.reqId === req.reqId));
          const linkedControls = RISK_BANK.flatMap(r => r.controls).filter(c => c.reqId === req.reqId);

          return (
            <div style={{ width: 360, background: C.surface, borderInlineStart: `1px solid ${C.border}`, borderRadius: '12px 0 0 12px', padding: 20, overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{req.reqId}</span>
                <button onClick={() => setSelectedReq(null)} style={{ background: C.borderLight, border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color={C.textSec} /></button>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 10, lineHeight: 1.5 }}>{req.text}</h3>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14 }}>
                <span style={{ background: st.bg, color: st.c, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5, fontFamily: 'var(--font-rubik)' }}>{st.l}</span>
              </div>

              {/* Feature Link */}
              <div style={{ background: C.accentLight, borderRadius: 8, padding: '10px 12px', marginBottom: 14, cursor: 'pointer', border: `1px solid ${C.accent}20` }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 3 }}>פיצ׳ר מקושר</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {req.feature} <ChevronLeft size={12} />
                </div>
              </div>

              {/* Evidence */}
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FileText size={12} color={C.accent} /> ראיות ({req.evidence.length})
                </h4>
                {req.evidence.length > 0 ? req.evidence.map((ev, i) => (
                  <div key={i} style={{ background: C.borderLight, borderRadius: 6, padding: '8px 10px', marginBottom: 4, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckSquare size={10} color={C.success} /> {ev}
                  </div>
                )) : (
                  <div style={{ background: C.dangerBg, borderRadius: 6, padding: '10px 12px', fontSize: 11, color: C.danger, fontFamily: 'var(--font-assistant)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={12} /> לא נמצאו ראיות — נדרשת פעולה
                  </div>
                )}
              </div>

              {/* Linked Risks */}
              {linkedRisks.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertTriangle size={12} color={C.warning} /> סיכונים מקושרים ({linkedRisks.length})
                  </h4>
                  {linkedRisks.map(risk => (
                    <div key={risk.id} style={{ background: C.borderLight, borderRadius: 6, padding: '8px 10px', marginBottom: 4, fontSize: 11, fontFamily: 'var(--font-assistant)' }}>
                      <span style={{ fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', marginInlineEnd: 4 }}>{risk.id}</span> {risk.name}
                      <div style={{ marginTop: 3 }}>
                        <RiskBadge level={risk.inherent} />
                        <span style={{ margin: '0 4px', color: C.textMuted }}>→</span>
                        <RiskBadge level={calcResidual(risk.inherent, risk.controls)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Controls */}
              {linkedControls.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Shield size={12} color={C.success} /> בקרות מקושרות ({linkedControls.length})
                  </h4>
                  {linkedControls.map(ctrl => (
                    <div key={ctrl.id} style={{ background: C.borderLight, borderRadius: 6, padding: '8px 10px', marginBottom: 4, fontSize: 11, fontFamily: 'var(--font-assistant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span style={{ fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{ctrl.id}</span> {ctrl.name}</div>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: CTRL_EFF[ctrl.effectiveness].color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700 }}>{ctrl.effectiveness}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
