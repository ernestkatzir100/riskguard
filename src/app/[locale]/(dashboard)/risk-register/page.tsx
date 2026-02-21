'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Grid3X3, List, X, Pencil, Save,
  Shield, Info, BookOpen,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { getRisks, createRisk } from '@/app/actions/risks';
import { FormModal } from '@/shared/components/form-modal';
import { RiskForm } from '@/shared/components/forms/risk-form';

/* ═══════════════════════════════════════════════
   Risk & Control constants
   ═══════════════════════════════════════════════ */
const RISK_LEVELS: Record<number, { label: string; color: string }> = {
  1: { label: 'זניח', color: '#7CB5A0' },
  2: { label: 'נמוך', color: C.success },
  3: { label: 'בינוני', color: C.warning },
  4: { label: 'גבוה', color: '#E8875B' },
  5: { label: 'קריטי', color: C.danger },
};

const CTRL_EFF: Record<number, { label: string; color: string }> = {
  1: { label: 'לא קיימת', color: C.danger },
  2: { label: 'חלקית', color: '#E8875B' },
  3: { label: 'מיושמת', color: C.warning },
  4: { label: 'אפקטיבית', color: '#5CAD6F' },
  5: { label: 'אפקטיבית מאוד', color: C.success },
};

const CATEGORIES = ['הכל', 'ממשל', 'תפעולי', 'מיקור חוץ', 'המשכיות', 'ממשל סייבר', 'הגנת סייבר', 'אירועי סייבר', 'ציות'];

/* ═══════════════════════════════════════════════
   Residual risk matrix
   ═══════════════════════════════════════════════ */
const MATRIX: Record<number, Record<number, number>> = {
  5: { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 },
  4: { 1: 4, 2: 4, 3: 3, 4: 2, 5: 1 },
  3: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 1 },
  2: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 1 },
  1: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
};

type Control = {
  id: string;
  name: string;
  effectiveness: number;
  reg: string;
  section: string;
  reqId: string;
};

type Risk = {
  id: string;
  name: string;
  cat: string;
  module: string;
  inherent: number;
  reg: string;
  section: string;
  reqId: string;
  controls: Control[];
  tier?: string;
};

const calcResidual = (inherent: number, controls: Control[]) => {
  if (!controls || controls.length === 0) return inherent;
  const avgEff = Math.round(controls.reduce((a, c) => a + c.effectiveness, 0) / controls.length);
  return MATRIX[inherent]?.[avgEff] ?? inherent;
};

/* ═══════════════════════════════════════════════
   Risk Badge
   ═══════════════════════════════════════════════ */
function RiskBadge({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
  const r = RISK_LEVELS[level] || RISK_LEVELS[1];
  const sz = size === 'lg'
    ? { fs: 16, p: '5px 14px', br: 8 }
    : size === 'sm'
      ? { fs: 10, p: '2px 7px', br: 4 }
      : { fs: 12, p: '3px 10px', br: 6 };
  return (
    <span style={{
      background: `${r.color}18`,
      color: r.color,
      fontSize: sz.fs,
      fontWeight: 700,
      padding: sz.p,
      borderRadius: sz.br,
      fontFamily: 'var(--font-rubik)',
      whiteSpace: 'nowrap',
    }}>
      {level} — {r.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   RISK_BANK — all 30 risks from V11
   ═══════════════════════════════════════════════ */
const RISK_BANK: Risk[] = [
  // ── ממשל ניהול סיכונים (4) ──
  { id: 'R01', name: 'היעדר מדיניות ניהול סיכונים מעודכנת ומאושרת', cat: 'ממשל', module: 'gov', inherent: 4, reg: '2024-10-2', section: '2(א)', reqId: 'GOV-01', controls: [
    { id: 'C01', name: 'מדיניות ניהול סיכונים מאושרת ע״י הדירקטוריון', effectiveness: 4, reg: '2024-10-2', section: '2(א)', reqId: 'GOV-01' },
    { id: 'C02', name: 'עדכון שנתי של המדיניות ובחינת רלוונטיות', effectiveness: 3, reg: '2024-10-2', section: '2(א)', reqId: 'GOV-02' },
  ]},
  { id: 'R02', name: 'חוסר מעורבות הדירקטוריון בפיקוח על ניהול סיכונים', cat: 'ממשל', module: 'gov', inherent: 5, reg: '2024-10-2', section: '2(א)', reqId: 'GOV-03', controls: [
    { id: 'C03', name: 'דיווח רבעוני לדירקטוריון על מפת סיכונים', effectiveness: 4, reg: '2024-10-2', section: '2(א)', reqId: 'GOV-03' },
    { id: 'C04', name: 'ועדת סיכונים בדירקטוריון עם תוכנית עבודה', effectiveness: 3, reg: '2024-10-2', section: '3', reqId: 'GOV-04' },
  ]},
  { id: 'R03', name: 'היעדר מנהל סיכונים ייעודי עם סמכות מספקת', cat: 'ממשל', module: 'gov', inherent: 4, reg: '2024-10-2', section: '2(ב)', reqId: 'GOV-05', controls: [
    { id: 'C05', name: 'מינוי מנהל סיכונים עם קו דיווח ישיר להנהלה', effectiveness: 5, reg: '2024-10-2', section: '2(ב)', reqId: 'GOV-05' },
    { id: 'C06', name: 'הגדרת תפקיד ואחריות מתועדת', effectiveness: 4, reg: '2024-10-2', section: '2(ב)', reqId: 'GOV-06' },
  ]},
  { id: 'R04', name: 'היעדר תהליך זיהוי והערכת סיכונים שיטתי', cat: 'ממשל', module: 'gov', inherent: 3, reg: '2024-10-2', section: '2(ב)(1)', reqId: 'GOV-07', controls: [
    { id: 'C07', name: 'מתודולוגיה מתועדת לזיהוי והערכת סיכונים', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(1)', reqId: 'GOV-07' },
    { id: 'C08', name: 'ביצוע סקר סיכונים שנתי מקיף', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(1)', reqId: 'GOV-08' },
  ]},
  // ── סיכון תפעולי (5) ──
  { id: 'R05', name: 'כשל במערכת הליבה לניהול תיקי אשראי', cat: 'תפעולי', module: 'ops', inherent: 5, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-01', controls: [
    { id: 'C09', name: 'SLA עם ספק המערכת כולל זמני תגובה', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-01' },
    { id: 'C10', name: 'מערכת גיבוי ותוכנית DR', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-03' },
    { id: 'C11', name: 'ניטור ביצועי מערכת בזמן אמת', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-02' },
  ]},
  { id: 'R06', name: 'טעויות אנוש בתהליך חיתום ואישור אשראי', cat: 'תפעולי', module: 'ops', inherent: 4, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-03', controls: [
    { id: 'C12', name: 'מערכת scoring אוטומטית לחיתום', effectiveness: 4, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-03' },
    { id: 'C13', name: 'תהליך אישור דו-שלבי (Dual Approval)', effectiveness: 4, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-04' },
  ]},
  { id: 'R07', name: 'כשל בממשק העברות בנקאיות ותשלומים', cat: 'תפעולי', module: 'ops', inherent: 4, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-05', controls: [
    { id: 'C14', name: 'מנגנון reconciliation יומי', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-05' },
    { id: 'C15', name: 'ניטור חריגות בממשק בזמן אמת', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-06' },
  ]},
  { id: 'R08', name: 'אובדן מידע עקב כשל בגיבוי נתונים', cat: 'תפעולי', module: 'ops', inherent: 5, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-07', controls: [
    { id: 'C16', name: 'גיבוי יומי אוטומטי למיקום חיצוני', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(2)', reqId: 'OPS-07' },
    { id: 'C17', name: 'בדיקת שחזור רבעונית מתועדת', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-04' },
  ]},
  { id: 'R09', name: 'הונאה פנימית בתהליכי אשראי ותשלומים', cat: 'תפעולי', module: 'ops', inherent: 4, reg: '2024-10-2', section: '2(ב)(3)', reqId: 'OPS-08', controls: [
    { id: 'C18', name: 'מנגנון זיהוי הונאות אוטומטי', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(3)', reqId: 'OPS-08' },
    { id: 'C19', name: 'ביקורת פנימית תקופתית על תהליכי אישור', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(3)', reqId: 'OPS-09' },
  ]},
  // ── מיקור חוץ (4) ──
  { id: 'R10', name: 'תלות קריטית בספק יחיד ללא חלופה', cat: 'מיקור חוץ', module: 'out', inherent: 4, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-01', controls: [
    { id: 'C20', name: 'מיפוי ספקים קריטיים עם תוכנית חלופות', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-01' },
    { id: 'C21', name: 'סעיפי יציאה (Exit Strategy) בחוזי ספקים', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-02' },
  ]},
  { id: 'R11', name: 'ספק ענן ללא עמידה בתקני אבטחת מידע', cat: 'מיקור חוץ', module: 'out', inherent: 4, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-03', controls: [
    { id: 'C22', name: 'דרישת אישורי SOC2/ISO27001 מספקים', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-03' },
    { id: 'C23', name: 'הערכת סיכוני ספקים שנתית מתועדת', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-04' },
  ]},
  { id: 'R12', name: 'חשיפת נתוני לקוחות לספק חיצוני ללא בקרה', cat: 'מיקור חוץ', module: 'out', inherent: 5, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-05', controls: [
    { id: 'C24', name: 'הסכמי סודיות (NDA) עם כל הספקים', effectiveness: 4, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-05' },
    { id: 'C25', name: 'הגבלת גישה לנתונים רגישים (Need-to-Know)', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-06' },
  ]},
  { id: 'R13', name: 'הפסקת שירות פתאומית מספק קריטי', cat: 'מיקור חוץ', module: 'out', inherent: 4, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-07', controls: [
    { id: 'C26', name: 'תוכנית המשכיות עסקית לתרחיש כשל ספק', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-07' },
    { id: 'C27', name: 'SLA עם קנסות וזמני תגובה מוגדרים', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-08' },
  ]},
  // ── המשכיות עסקית (4) ──
  { id: 'R14', name: 'היעדר תוכנית המשכיות עסקית (BCP) מעודכנת', cat: 'המשכיות', module: 'bcp', inherent: 4, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-01', controls: [
    { id: 'C28', name: 'תוכנית BCP מתועדת ומאושרת', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-01' },
    { id: 'C29', name: 'תרגיל שנתי של תוכנית ההמשכיות', effectiveness: 1, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-02' },
  ]},
  { id: 'R15', name: 'אי-ביצוע ניתוח השפעה עסקית (BIA)', cat: 'המשכיות', module: 'bcp', inherent: 3, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-05', controls: [
    { id: 'C30', name: 'ביצוע BIA שנתי לכל הפונקציות הקריטיות', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-05' },
  ]},
  { id: 'R16', name: 'כשל בשחזור מערכות לאחר אסון', cat: 'המשכיות', module: 'bcp', inherent: 5, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-03', controls: [
    { id: 'C31', name: 'תוכנית DR מתועדת עם RTO/RPO מוגדרים', effectiveness: 2, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-03' },
    { id: 'C32', name: 'אתר DR חלופי פעיל', effectiveness: 1, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-06' },
    { id: 'C33', name: 'בדיקת שחזור חצי-שנתית', effectiveness: 1, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-04' },
  ]},
  { id: 'R17', name: 'השבתה ממושכת עקב אירוע חירום', cat: 'המשכיות', module: 'bcp', inherent: 4, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-07', controls: [
    { id: 'C34', name: 'צוות חירום מוגדר עם אחריות ברורות', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-07' },
    { id: 'C35', name: 'תקשורת חירום רב-ערוצית', effectiveness: 3, reg: '2024-10-2', section: '2(ב)(5)', reqId: 'BCP-08' },
  ]},
  // ── ממשל סייבר (3) — PRO ──
  { id: 'R18', name: 'היעדר מדיניות אבטחת מידע וסייבר מאושרת', cat: 'ממשל סייבר', module: 'cgov', inherent: 4, reg: '2022-10-9', section: '2(א)', reqId: 'CYB-GOV-01', tier: 'pro', controls: [
    { id: 'C36', name: 'מדיניות סייבר מאושרת ע״י הדירקטוריון', effectiveness: 3, reg: '2022-10-9', section: '2(א)', reqId: 'CYB-GOV-01' },
    { id: 'C37', name: 'תוכנית עבודה שנתית לסייבר', effectiveness: 2, reg: '2022-10-9', section: '2(ב)', reqId: 'CYB-GOV-02' },
  ]},
  { id: 'R19', name: 'חוסר מודעות עובדים לאיומי סייבר', cat: 'ממשל סייבר', module: 'cgov', inherent: 3, reg: '2022-10-9', section: '3(א)', reqId: 'CYB-GOV-03', tier: 'pro', controls: [
    { id: 'C38', name: 'הדרכת מודעות סייבר שנתית לכלל העובדים', effectiveness: 3, reg: '2022-10-9', section: '3(א)', reqId: 'CYB-GOV-03' },
    { id: 'C39', name: 'סימולציות פישינג תקופתיות', effectiveness: 2, reg: '2022-10-9', section: '3(א)', reqId: 'CYB-GOV-04' },
  ]},
  { id: 'R20', name: 'אי-מיפוי נכסי מידע קריטיים', cat: 'ממשל סייבר', module: 'cgov', inherent: 3, reg: '2022-10-9', section: '3(ב)', reqId: 'CYB-GOV-05', tier: 'pro', controls: [
    { id: 'C40', name: 'מרשם נכסי מידע (Asset Inventory) מעודכן', effectiveness: 2, reg: '2022-10-9', section: '3(ב)', reqId: 'CYB-GOV-05' },
    { id: 'C41', name: 'סיווג רמות רגישות לנכסי מידע', effectiveness: 2, reg: '2022-10-9', section: '3(ב)', reqId: 'CYB-GOV-06' },
  ]},
  // ── הגנת סייבר (5) — PRO ──
  { id: 'R21', name: 'תקיפת כופרה (Ransomware) על תשתיות החברה', cat: 'הגנת סייבר', module: 'cpro', inherent: 5, reg: '2022-10-9', section: '4(א)', reqId: 'CYB-PRO-01', tier: 'pro', controls: [
    { id: 'C42', name: 'מערכת EDR על כלל תחנות העבודה', effectiveness: 3, reg: '2022-10-9', section: '4(א)', reqId: 'CYB-PRO-01' },
    { id: 'C43', name: 'גיבוי מבודד (Air-Gapped) לנתונים קריטיים', effectiveness: 2, reg: '2022-10-9', section: '4(א)', reqId: 'CYB-PRO-02' },
    { id: 'C44', name: 'הפרדת רשתות (Network Segmentation)', effectiveness: 2, reg: '2022-10-9', section: '4(ב)', reqId: 'CYB-PRO-03' },
  ]},
  { id: 'R22', name: 'חדירה דרך פישינג ממוקד (Spear Phishing)', cat: 'הגנת סייבר', module: 'cpro', inherent: 4, reg: '2022-10-9', section: '4(א)', reqId: 'CYB-PRO-04', tier: 'pro', controls: [
    { id: 'C45', name: 'סינון דוא״ל מתקדם (Email Gateway)', effectiveness: 3, reg: '2022-10-9', section: '4(א)', reqId: 'CYB-PRO-04' },
    { id: 'C46', name: 'אימות דו-שלבי (MFA) לכל המשתמשים', effectiveness: 4, reg: '2022-10-9', section: '4(ג)', reqId: 'CYB-PRO-05' },
  ]},
  { id: 'R23', name: 'ניצול פגיעויות (Vulnerabilities) במערכות', cat: 'הגנת סייבר', module: 'cpro', inherent: 4, reg: '2022-10-9', section: '4(ב)', reqId: 'CYB-PRO-06', tier: 'pro', controls: [
    { id: 'C47', name: 'סריקת פגיעויות רבעונית', effectiveness: 2, reg: '2022-10-9', section: '4(ב)', reqId: 'CYB-PRO-06' },
    { id: 'C48', name: 'ניהול עדכוני אבטחה (Patch Management)', effectiveness: 2, reg: '2022-10-9', section: '4(ב)', reqId: 'CYB-PRO-07' },
    { id: 'C49', name: 'מבחן חדירה שנתי', effectiveness: 1, reg: '2022-10-9', section: '4(ב)', reqId: 'CYB-PRO-08' },
  ]},
  { id: 'R24', name: 'גישה לא מורשית למערכות ונתונים', cat: 'הגנת סייבר', module: 'cpro', inherent: 4, reg: '2022-10-9', section: '4(ג)', reqId: 'CYB-PRO-09', tier: 'pro', controls: [
    { id: 'C50', name: 'ניהול זהויות והרשאות (IAM)', effectiveness: 3, reg: '2022-10-9', section: '4(ג)', reqId: 'CYB-PRO-09' },
    { id: 'C51', name: 'סקירת הרשאות רבעונית', effectiveness: 2, reg: '2022-10-9', section: '4(ג)', reqId: 'CYB-PRO-10' },
  ]},
  { id: 'R25', name: 'דליפת מידע רגיש (Data Leakage)', cat: 'הגנת סייבר', module: 'cpro', inherent: 5, reg: '2022-10-9', section: '4(ד)', reqId: 'CYB-PRO-11', tier: 'pro', controls: [
    { id: 'C52', name: 'מערכת DLP (Data Loss Prevention)', effectiveness: 2, reg: '2022-10-9', section: '4(ד)', reqId: 'CYB-PRO-11' },
    { id: 'C53', name: 'הצפנת נתונים רגישים (At-Rest & In-Transit)', effectiveness: 3, reg: '2022-10-9', section: '4(ד)', reqId: 'CYB-PRO-12' },
  ]},
  // ── אירועי סייבר (3) — PRO ──
  { id: 'R26', name: 'היעדר יכולת זיהוי וניטור אירועי סייבר', cat: 'אירועי סייבר', module: 'cinc', inherent: 4, reg: '2022-10-9', section: '5(א)', reqId: 'CYB-INC-01', tier: 'pro', controls: [
    { id: 'C54', name: 'מערכת SIEM לניטור אירועים', effectiveness: 4, reg: '2022-10-9', section: '5(א)', reqId: 'CYB-INC-01' },
    { id: 'C55', name: 'SOC (מרכז תפעול אבטחה) — פנימי או חיצוני', effectiveness: 4, reg: '2022-10-9', section: '5(א)', reqId: 'CYB-INC-02' },
  ]},
  { id: 'R27', name: 'היעדר נוהל תגובה לאירועי סייבר', cat: 'אירועי סייבר', module: 'cinc', inherent: 3, reg: '2022-10-9', section: '5(ב)', reqId: 'CYB-INC-03', tier: 'pro', controls: [
    { id: 'C56', name: 'נוהל IRP (Incident Response Plan) מתועד', effectiveness: 4, reg: '2022-10-9', section: '5(ב)', reqId: 'CYB-INC-03' },
    { id: 'C57', name: 'תרגיל תגובה לאירוע סייבר שנתי', effectiveness: 3, reg: '2022-10-9', section: '5(ב)', reqId: 'CYB-INC-04' },
  ]},
  { id: 'R28', name: 'אי-דיווח על אירועי סייבר כנדרש ברגולציה', cat: 'אירועי סייבר', module: 'cinc', inherent: 3, reg: '2022-10-9', section: '5(ג)', reqId: 'CYB-INC-05', tier: 'pro', controls: [
    { id: 'C58', name: 'נוהל דיווח מוסדר לרשות שוק ההון', effectiveness: 4, reg: '2022-10-9', section: '5(ג)', reqId: 'CYB-INC-05' },
    { id: 'C59', name: 'מנגנון תיעוד וניתוח שורש אירועים', effectiveness: 3, reg: '2022-10-9', section: '5(ג)', reqId: 'CYB-INC-06' },
  ]},
  // ── ציות (2) ──
  { id: 'R29', name: 'אי-עמידה בדרישות הלימות הון ונזילות', cat: 'ציות', module: 'gov', inherent: 4, reg: '2024-10-2', section: '2(א)', reqId: 'CMP-01', controls: [
    { id: 'C60', name: 'ניטור הלימות הון שוטף מול דרישות', effectiveness: 3, reg: '2024-10-2', section: '2(א)', reqId: 'CMP-01' },
    { id: 'C61', name: 'דיווח רבעוני לרשות שוק ההון', effectiveness: 4, reg: '2024-10-2', section: '2(א)', reqId: 'CMP-02' },
  ]},
  { id: 'R30', name: 'אי-דיווח במועד לרשות שוק ההון', cat: 'ציות', module: 'gov', inherent: 3, reg: '2024-10-2', section: '3', reqId: 'CMP-03', controls: [
    { id: 'C62', name: 'לוח שנה רגולטורי עם התראות אוטומטיות', effectiveness: 4, reg: '2024-10-2', section: '3', reqId: 'CMP-03' },
    { id: 'C63', name: 'אחראי ציות ייעודי עם מעקב שוטף', effectiveness: 3, reg: '2024-10-2', section: '3', reqId: 'CMP-04' },
  ]},
];

/* ═══════════════════════════════════════════════
   RiskRegister Page
   ═══════════════════════════════════════════════ */
export default function RiskRegisterPage() {
  const [risks, setRisks] = useState<Risk[]>(RISK_BANK);
  const [filterCat, setFilterCat] = useState('הכל');
  const [view, setView] = useState<'heatmap' | 'table'>('heatmap');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showAddRisk, setShowAddRisk] = useState(false);

  async function loadData() {
    try {
      const result = await getRisks();
      if (result && Array.isArray(result) && result.length > 0) {
        const mapped: Risk[] = result.map((r: Record<string, unknown>) => ({
          id: String(r.id ?? ''),
          name: String(r.title ?? ''),
          cat: String(r.category ?? ''),
          module: String(r.module ?? ''),
          inherent: Number(r.riskScore ?? (Number(r.probability ?? 3) * Number(r.impact ?? 3))),
          reg: String(r.regulationCode ?? ''),
          section: String(r.sectionRef ?? ''),
          reqId: String(r.reqCode ?? ''),
          controls: [],
          tier: undefined,
        }));
        setRisks(mapped);
      }
    } catch { /* fallback to demo */ }
  }
  useEffect(() => { loadData(); }, []);

  const filtered = filterCat === 'הכל' ? risks : risks.filter(r => r.cat === filterCat);
  const selected = risks.find(r => r.id === selectedId);

  const updateControlEff = (riskId: string, ctrlId: string, eff: number) => {
    setRisks(prev => prev.map(r =>
      r.id === riskId
        ? { ...r, controls: r.controls.map(c => c.id === ctrlId ? { ...c, effectiveness: eff } : c) }
        : r
    ));
  };

  const updateRiskName = (riskId: string, newName: string) => {
    if (newName.trim()) setRisks(prev => prev.map(r => r.id === riskId ? { ...r, name: newName.trim() } : r));
    setEditingName(false);
  };

  const totalControls = risks.reduce((a, r) => a + r.controls.length, 0);
  const avgResidual = (risks.reduce((a, r) => a + calcResidual(r.inherent, r.controls), 0) / risks.length).toFixed(1);

  return (
    <>
    <div>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={20} color={C.accent} /> מאגר סיכונים ובקרות
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            {risks.length} סיכונים · {totalControls} בקרות · ציון שיורי ממוצע: {avgResidual}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAddRisk(true)} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5 }}>
            + הוסף סיכון
          </button>
          <div style={{ display: 'flex', background: C.borderLight, borderRadius: 8, padding: 3 }}>
            {[
              { id: 'heatmap' as const, Icon: Grid3X3, l: 'מפת חום' },
              { id: 'table' as const, Icon: List, l: 'טבלה' },
            ].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                background: view === v.id ? C.surface : 'transparent',
                border: view === v.id ? `1px solid ${C.border}` : '1px solid transparent',
                borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
                fontSize: 11, fontWeight: view === v.id ? 600 : 400,
                color: view === v.id ? C.text : C.textMuted,
                fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <v.Icon size={12} /> {v.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Category filters ═══ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{
            background: filterCat === c ? C.accent : C.surface,
            color: filterCat === c ? 'white' : C.textSec,
            border: `1px solid ${filterCat === c ? C.accent : C.border}`,
            borderRadius: 6, padding: '5px 12px', fontSize: 11,
            fontWeight: filterCat === c ? 600 : 400, cursor: 'pointer',
            fontFamily: 'var(--font-rubik)',
          }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* ═══ Main Content ═══ */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Table view ── */}
          {view === 'table' && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: selectedId ? '0 10px 10px 0' : 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
                <thead>
                  <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                    {['#', 'סיכון', 'קטגוריה', 'שורשי', 'בקרות', 'שיורי'].map(h => (
                      <th key={h} style={{ textAlign: 'right', padding: '9px 10px', fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const residual = calcResidual(r.inherent, r.controls);
                    const isSel = selectedId === r.id;
                    return (
                      <tr key={r.id} onClick={() => setSelectedId(isSel ? null : r.id)} style={{
                        borderBottom: `1px solid ${C.borderLight}`, cursor: 'pointer',
                        background: isSel ? C.accentLight : i % 2 === 0 ? 'white' : '#FAFBFC',
                        borderRight: isSel ? `3px solid ${C.accent}` : '3px solid transparent',
                        transition: 'background 0.1s',
                      }}>
                        <td style={{ padding: '9px 10px', color: C.textMuted, fontSize: 11, fontFamily: 'var(--font-rubik)' }}>{r.id}</td>
                        <td style={{ padding: '9px 10px', maxWidth: 280 }}>
                          <div style={{ fontWeight: 500, color: C.text, fontSize: 12, marginBottom: 2 }}>{r.name}</div>
                          <span style={{ background: r.reg === '2022-10-9' ? '#EDE9FE' : '#E0F2FE', color: r.reg === '2022-10-9' ? '#7C3AED' : '#0369A1', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--font-rubik)' }}>§ {r.reg} {r.section}</span>
                          {r.tier === 'pro' && <span style={{ background: 'rgba(91,184,201,0.15)', color: C.accentTeal, fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, marginRight: 3, fontFamily: 'var(--font-rubik)' }}>PRO</span>}
                        </td>
                        <td style={{ padding: '9px 10px' }}><span style={{ background: C.borderLight, padding: '2px 7px', borderRadius: 4, fontSize: 10, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{r.cat}</span></td>
                        <td style={{ padding: '9px 10px' }}><RiskBadge level={r.inherent} size="sm" /></td>
                        <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {r.controls.map(c => {
                              const ce = CTRL_EFF[c.effectiveness];
                              return (
                                <div key={c.id} title={`${c.name}: ${ce.label}`} style={{
                                  width: 18, height: 18, borderRadius: 4, background: ce.color,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontSize: 9, fontWeight: 700,
                                }}>
                                  {c.effectiveness}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '9px 10px' }}><RiskBadge level={residual} size="sm" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Heatmap view ── */}
          {view === 'heatmap' && (() => {
            const heatRisks = filtered;
            const critCount = heatRisks.filter(r => calcResidual(r.inherent, r.controls) >= 4).length;
            const lowCount = heatRisks.filter(r => calcResidual(r.inherent, r.controls) <= 2).length;
            const midCount = heatRisks.length - critCount - lowCount;
            const filtAvg = heatRisks.length ? (heatRisks.reduce((a, r) => a + calcResidual(r.inherent, r.controls), 0) / heatRisks.length).toFixed(1) : '—';

            return (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: selectedId ? '0 12px 12px 0' : 12, overflow: 'hidden' }}>
                {/* Stats bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: `1px solid ${C.border}` }}>
                  {[
                    { label: 'סיכונים מוצגים', value: heatRisks.length, c: C.accent },
                    { label: 'סיכון שיורי ממוצע', value: filtAvg, c: parseFloat(String(filtAvg)) >= 3.5 ? C.danger : parseFloat(String(filtAvg)) >= 2.5 ? C.warning : C.success },
                    { label: 'גבוה + קריטי', value: critCount, c: C.danger },
                    { label: 'בינוני', value: midCount, c: C.warning },
                    { label: 'נמוך + זניח', value: lowCount, c: C.success },
                  ].map((s, i) => (
                    <div key={i} style={{ flex: 1, padding: '12px 14px', textAlign: 'center', borderLeft: i > 0 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: 'var(--font-rubik)' }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '20px 24px' }}>
                  {/* Legend */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {[
                        { l: 'קריטי (5)', c: C.danger },
                        { l: 'גבוה (4)', c: '#E8875B' },
                        { l: 'בינוני (3)', c: C.warning },
                        { l: 'נמוך (2)', c: C.success },
                        { l: 'זניח (1)', c: '#6DB6A0' },
                      ].map(x => (
                        <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: x.c }} />{x.l}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>לחץ על סיכון לפרטים ועריכה</span>
                  </div>

                  {/* Heatmap grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: 4 }}>
                    {/* Header row */}
                    <div style={{ padding: 6 }} />
                    {[1, 2, 3, 4, 5].map(r => (
                      <div key={r} style={{ textAlign: 'center', padding: '6px 0' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: RISK_LEVELS[r].color, fontFamily: 'var(--font-rubik)' }}>{RISK_LEVELS[r].label}</div>
                        <div style={{ fontSize: 8, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>שיורי {r}</div>
                      </div>
                    ))}

                    {/* Rows */}
                    {[5, 4, 3, 2, 1].map(inh => (
                      <div key={`row-${inh}`} style={{ display: 'contents' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: RISK_LEVELS[inh].color, fontFamily: 'var(--font-rubik)' }}>{RISK_LEVELS[inh].label}</div>
                          <div style={{ fontSize: 8, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>שורשי {inh}</div>
                        </div>
                        {[1, 2, 3, 4, 5].map(res => {
                          const here = heatRisks.filter(r => r.inherent === inh && calcResidual(r.inherent, r.controls) === res);
                          const cellLevel = Math.max(inh, res);
                          const cellColor = RISK_LEVELS[cellLevel]?.color || '#ccc';
                          return (
                            <div key={`${inh}-${res}`} style={{
                              background: here.length > 0 ? `${cellColor}12` : `${C.borderLight}60`,
                              border: here.length > 0 ? `2px solid ${cellColor}40` : `1px solid ${C.borderLight}`,
                              borderRadius: 8, minHeight: 56, padding: 5,
                              display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', justifyContent: 'center',
                              position: 'relative', transition: 'all 0.15s',
                            }}>
                              {here.length === 0 && <div style={{ fontSize: 8, color: `${C.textMuted}60`, fontFamily: 'var(--font-rubik)' }}>—</div>}
                              {here.map(r => {
                                const rRes = calcResidual(r.inherent, r.controls);
                                const isSel = selectedId === r.id;
                                return (
                                  <div key={r.id} onClick={() => setSelectedId(isSel ? null : r.id)} title={r.name} style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: `linear-gradient(135deg, ${RISK_LEVELS[rRes].color}, ${RISK_LEVELS[rRes].color}CC)`,
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-rubik)',
                                    cursor: 'pointer',
                                    boxShadow: isSel ? `0 0 0 3px white, 0 0 0 5px ${RISK_LEVELS[rRes].color}` : `0 2px 6px ${RISK_LEVELS[rRes].color}40`,
                                    transform: isSel ? 'scale(1.2)' : 'scale(1)',
                                    transition: 'all 0.15s', zIndex: isSel ? 5 : 1,
                                  }}>
                                    {r.id.replace('R0', '').replace('R', '')}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Axis labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, padding: '0 90px 0 0' }}>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      ← סיכון שיורי נמוך
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      סיכון שיורי גבוה →
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ═══ Detail Panel ═══ */}
        {selected && (
          <div style={{ width: 380, background: C.surface, borderRight: `1px solid ${C.border}`, borderRadius: '12px 0 0 12px', padding: 20, overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{selected.id} · {selected.cat}</span>
              <button onClick={() => setSelectedId(null)} style={{ background: C.borderLight, border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color={C.textSec} />
              </button>
            </div>

            {/* Risk name — editable */}
            {editingName ? (
              <div style={{ marginBottom: 8 }}>
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') updateRiskName(selected.id, nameInput); if (e.key === 'Escape') setEditingName(false); }}
                  style={{ width: '100%', fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', border: `2px solid ${C.accent}`, borderRadius: 8, padding: '8px 10px', outline: 'none', background: C.accentLight, direction: 'rtl', lineHeight: 1.5, boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <button onClick={() => updateRiskName(selected.id, nameInput)} style={{ background: C.accent, color: 'white', border: 'none', borderRadius: 5, padding: '4px 12px', fontSize: 10, fontFamily: 'var(--font-rubik)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Save size={10} /> שמור
                  </button>
                  <button onClick={() => setEditingName(false)} style={{ background: C.borderLight, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 12px', fontSize: 10, fontFamily: 'var(--font-rubik)', cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8, cursor: 'pointer', borderRadius: 8, padding: '6px 8px', margin: '-6px -8px 8px -8px', transition: 'background 0.1s' }}
                onClick={() => { setEditingName(true); setNameInput(selected.name); }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', lineHeight: 1.5, flex: 1, margin: 0 }}>{selected.name}</h3>
                <Pencil size={12} color={C.textMuted} style={{ marginTop: 4, flexShrink: 0 }} />
              </div>
            )}

            {/* Traceability tags */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ background: selected.reg === '2022-10-9' ? '#EDE9FE' : '#E0F2FE', color: selected.reg === '2022-10-9' ? '#7C3AED' : '#0369A1', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <BookOpen size={10} /> חוזר {selected.reg}
              </span>
              <span style={{ background: C.borderLight, color: C.textSec, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>§ {selected.section}</span>
              <span style={{ background: C.borderLight, color: C.textSec, fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{selected.reqId}</span>
              {selected.tier === 'pro' && <span style={{ background: 'rgba(91,184,201,0.2)', color: C.accentTeal, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>PRO</span>}
            </div>

            {/* Scores row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              <div style={{ background: C.borderLight, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 4 }}>סיכון שורשי</div>
                <RiskBadge level={selected.inherent} size="lg" />
                <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 4 }}>נקבע לפי פרופיל החברה</div>
              </div>
              <div style={{ background: C.borderLight, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 4 }}>סיכון שיורי</div>
                <RiskBadge level={calcResidual(selected.inherent, selected.controls)} size="lg" />
                <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 4 }}>מחושב אוטומטית</div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Shield size={13} color={C.accent} /> בקרות ({selected.controls.length})
              </h4>
              {selected.controls.map(ctrl => (
                <div key={ctrl.id} style={{ background: C.borderLight, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: 'var(--font-assistant)', flex: 1 }}>
                      {ctrl.name}
                    </div>
                    <span style={{ fontSize: 8, color: C.textMuted, fontFamily: 'var(--font-rubik)', background: 'white', padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap', marginRight: 4 }}>{ctrl.reqId}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 2, alignItems: 'center' }}>
                    <span style={{ fontSize: 8, color: ctrl.reg === '2022-10-9' ? '#7C3AED' : '#0369A1', fontFamily: 'var(--font-rubik)', fontWeight: 500 }}>§ {ctrl.reg} {ctrl.section}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)', marginBottom: 6 }}>אפקטיביות:</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const ce = CTRL_EFF[n];
                      const isActive = ctrl.effectiveness === n;
                      return (
                        <button key={n} onClick={() => updateControlEff(selected.id, ctrl.id, n)} title={ce.label}
                          style={{
                            flex: 1, padding: '6px 0', border: `1.5px solid ${isActive ? ce.color : C.border}`,
                            borderRadius: 6, background: isActive ? ce.color : 'white',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            color: isActive ? 'white' : C.textMuted, fontFamily: 'var(--font-rubik)',
                            transition: 'all 0.1s',
                          }}>
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: CTRL_EFF[ctrl.effectiveness].color, fontFamily: 'var(--font-assistant)', fontWeight: 600 }}>
                      {CTRL_EFF[ctrl.effectiveness].label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix explanation */}
            <div style={{ background: C.accentLight, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.accent}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Info size={12} color={C.accent} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: 'var(--font-rubik)' }}>חישוב סיכון שיורי</span>
              </div>
              <div style={{ fontSize: 10, color: C.textSec, fontFamily: 'var(--font-assistant)', lineHeight: 1.6 }}>
                שורשי ({selected.inherent}) × ממוצע אפקטיביות ({(selected.controls.reduce((a, c) => a + c.effectiveness, 0) / selected.controls.length).toFixed(1)}) = שיורי ({calcResidual(selected.inherent, selected.controls)})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <FormModal
      open={showAddRisk}
      onClose={() => setShowAddRisk(false)}
      title="הוסף סיכון חדש"
      onSubmit={() => {}}
    >
      <RiskForm
        mode="create"
        onSubmit={async (data) => {
          await createRisk(data);
          setShowAddRisk(false);
          await loadData();
        }}
        onCancel={() => setShowAddRisk(false)}
      />
    </FormModal>
    </>
  );
}
