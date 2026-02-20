import { useState, useEffect } from "react";
import {
  LayoutDashboard, Shield, BarChart3, Handshake, ShieldCheck,
  Lock, ShieldAlert, Zap, FileText, BookOpen, CheckSquare,
  Settings, Bell, ChevronLeft, AlertTriangle, Plus, FileOutput,
  Eye, TrendingUp, Users, Clock, Activity, Building2,
  ChevronDown, ChevronUp, Target, ArrowUpRight, ArrowDownRight,
  X, Filter, Grid3X3, List, Search, Save, Layers, Info, Star, ChevronRight,
  MessageCircle, Sparkles, HelpCircle, ExternalLink, Pencil,
  DollarSign, CreditCard, Gauge, FileWarning, TrendingDown, Percent, Receipt, Crown,
  Calendar, Briefcase, ClipboardList, Vote, Mail, Send, RotateCcw, BellRing,
  Bot, MessageSquare, Play, Pause, UserCog
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart as RPieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const C = {
  navBg: "#1E2D3D", navHover: "#2A3F52",
  accent: "#4A8EC2", accentTeal: "#5BB8C9",
  accentLight: "#E8F4FA", accentDark: "#3A7AAF",
  accentGrad: "linear-gradient(135deg, #4A8EC2, #5BB8C9)",
  success: "#2E8B57", successBg: "#EFF8F2",
  warning: "#C8922A", warningBg: "#FDF8ED",
  danger: "#C0392B", dangerBg: "#FDF0EE",
  bg: "#F5F7FA", surface: "#FFFFFF",
  text: "#1A2332", textSec: "#4A5568", textMuted: "#8896A6",
  border: "#E1E8EF", borderLight: "#F0F3F7",
};

const COMPANY = { name: "אשראי פייננס בע״מ", officer: "יוסי לוי" };

// ═══════════════════════════════════════════════
// RISK LEVEL & CONTROL EFFECTIVENESS SCALES
// ═══════════════════════════════════════════════
const RISK_LEVELS = { 1: { label: "זניח", color: "#7CB5A0" }, 2: { label: "נמוך", color: C.success }, 3: { label: "בינוני", color: C.warning }, 4: { label: "גבוה", color: "#E8875B" }, 5: { label: "קריטי", color: C.danger } };
const CTRL_EFF = { 1: { label: "לא קיימת", color: C.danger }, 2: { label: "חלקית", color: "#E8875B" }, 3: { label: "מיושמת", color: C.warning }, 4: { label: "אפקטיבית", color: "#5CAD6F" }, 5: { label: "אפקטיבית מאוד", color: C.success } };

// Residual Risk Matrix: MATRIX[inherent][controlEffectiveness] = residual
const MATRIX = {
  5: { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 },
  4: { 1: 4, 2: 4, 3: 3, 4: 2, 5: 1 },
  3: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 1 },
  2: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 1 },
  1: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
};

const calcResidual = (inherent, controls) => {
  if (!controls || controls.length === 0) return inherent;
  const avgEff = Math.round(controls.reduce((a, c) => a + c.effectiveness, 0) / controls.length);
  return MATRIX[inherent]?.[avgEff] ?? inherent;
};

// ═══════════════════════════════════════════════
// RISK BANK — 30 Pre-defined Risks with Traceability
// Every entity: { reg, section, reqId }
// reg: "2024-10-2" | "2022-10-9"
// section: regulatory section reference
// reqId: unique requirement ID for linkage
// ═══════════════════════════════════════════════
const RISK_BANK = [
  // ── ממשל ניהול סיכונים (4) ──
  { id: "R01", name: "היעדר מדיניות ניהול סיכונים מעודכנת ומאושרת", cat: "ממשל", module: "gov", inherent: 4, reg: "2024-10-2", section: "2(א)", reqId: "GOV-01", controls: [
    { id: "C01", name: "מדיניות ניהול סיכונים מאושרת ע״י הדירקטוריון", effectiveness: 4, reg: "2024-10-2", section: "2(א)", reqId: "GOV-01" },
    { id: "C02", name: "עדכון שנתי של המדיניות ובחינת רלוונטיות", effectiveness: 3, reg: "2024-10-2", section: "2(א)", reqId: "GOV-02" },
  ]},
  { id: "R02", name: "חוסר מעורבות הדירקטוריון בפיקוח על ניהול סיכונים", cat: "ממשל", module: "gov", inherent: 5, reg: "2024-10-2", section: "2(א)", reqId: "GOV-03", controls: [
    { id: "C03", name: "דיווח רבעוני לדירקטוריון על מפת סיכונים", effectiveness: 4, reg: "2024-10-2", section: "2(א)", reqId: "GOV-03" },
    { id: "C04", name: "ועדת סיכונים בדירקטוריון עם תוכנית עבודה", effectiveness: 3, reg: "2024-10-2", section: "3", reqId: "GOV-04" },
  ]},
  { id: "R03", name: "היעדר מנהל סיכונים ייעודי עם סמכות מספקת", cat: "ממשל", module: "gov", inherent: 4, reg: "2024-10-2", section: "2(ב)", reqId: "GOV-05", controls: [
    { id: "C05", name: "מינוי מנהל סיכונים עם קו דיווח ישיר להנהלה", effectiveness: 5, reg: "2024-10-2", section: "2(ב)", reqId: "GOV-05" },
    { id: "C06", name: "הגדרת תפקיד ואחריות מתועדת", effectiveness: 4, reg: "2024-10-2", section: "2(ב)", reqId: "GOV-06" },
  ]},
  { id: "R04", name: "היעדר תהליך זיהוי והערכת סיכונים שיטתי", cat: "ממשל", module: "gov", inherent: 3, reg: "2024-10-2", section: "2(ב)(1)", reqId: "GOV-07", controls: [
    { id: "C07", name: "מתודולוגיה מתועדת לזיהוי והערכת סיכונים", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(1)", reqId: "GOV-07" },
    { id: "C08", name: "ביצוע סקר סיכונים שנתי מקיף", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(1)", reqId: "GOV-08" },
  ]},

  // ── סיכון תפעולי (5) ──
  { id: "R05", name: "כשל במערכת הליבה לניהול תיקי אשראי", cat: "תפעולי", module: "ops", inherent: 5, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-01", controls: [
    { id: "C09", name: "SLA עם ספק המערכת כולל זמני תגובה", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-01" },
    { id: "C10", name: "מערכת גיבוי ותוכנית DR", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-03" },
    { id: "C11", name: "ניטור ביצועי מערכת בזמן אמת", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-02" },
  ]},
  { id: "R06", name: "טעויות אנוש בתהליך חיתום ואישור אשראי", cat: "תפעולי", module: "ops", inherent: 4, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-03", controls: [
    { id: "C12", name: "מערכת scoring אוטומטית לחיתום", effectiveness: 4, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-03" },
    { id: "C13", name: "תהליך אישור דו-שלבי (Dual Approval)", effectiveness: 4, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-04" },
  ]},
  { id: "R07", name: "כשל בממשק העברות בנקאיות ותשלומים", cat: "תפעולי", module: "ops", inherent: 4, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-05", controls: [
    { id: "C14", name: "מנגנון reconciliation יומי", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-05" },
    { id: "C15", name: "ניטור חריגות בממשק בזמן אמת", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-06" },
  ]},
  { id: "R08", name: "אובדן מידע עקב כשל בגיבוי נתונים", cat: "תפעולי", module: "ops", inherent: 5, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-07", controls: [
    { id: "C16", name: "גיבוי יומי אוטומטי למיקום חיצוני", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(2)", reqId: "OPS-07" },
    { id: "C17", name: "בדיקת שחזור רבעונית מתועדת", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-04" },
  ]},
  { id: "R09", name: "הונאה פנימית בתהליכי אשראי ותשלומים", cat: "תפעולי", module: "ops", inherent: 4, reg: "2024-10-2", section: "2(ב)(3)", reqId: "OPS-08", controls: [
    { id: "C18", name: "מנגנון זיהוי הונאות אוטומטי", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(3)", reqId: "OPS-08" },
    { id: "C19", name: "ביקורת פנימית תקופתית על תהליכי אישור", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(3)", reqId: "OPS-09" },
  ]},

  // ── מיקור חוץ (4) ──
  { id: "R10", name: "תלות קריטית בספק יחיד ללא חלופה", cat: "מיקור חוץ", module: "out", inherent: 4, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-01", controls: [
    { id: "C20", name: "מיפוי ספקים קריטיים עם תוכנית חלופות", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-01" },
    { id: "C21", name: "סעיפי יציאה (Exit Strategy) בחוזי ספקים", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-02" },
  ]},
  { id: "R11", name: "ספק ענן ללא עמידה בתקני אבטחת מידע", cat: "מיקור חוץ", module: "out", inherent: 4, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-03", controls: [
    { id: "C22", name: "דרישת אישורי SOC2/ISO27001 מספקים", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-03" },
    { id: "C23", name: "הערכת סיכוני ספקים שנתית מתועדת", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-04" },
  ]},
  { id: "R12", name: "חשיפת נתוני לקוחות לספק חיצוני ללא בקרה", cat: "מיקור חוץ", module: "out", inherent: 5, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-05", controls: [
    { id: "C24", name: "הסכמי סודיות (NDA) עם כל הספקים", effectiveness: 4, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-05" },
    { id: "C25", name: "הגבלת גישה לנתונים רגישים (Need-to-Know)", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-06" },
  ]},
  { id: "R13", name: "הפסקת שירות פתאומית מספק קריטי", cat: "מיקור חוץ", module: "out", inherent: 4, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-07", controls: [
    { id: "C26", name: "תוכנית המשכיות עסקית לתרחיש כשל ספק", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-07" },
    { id: "C27", name: "SLA עם קנסות וזמני תגובה מוגדרים", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-08" },
  ]},

  // ── המשכיות עסקית (4) ──
  { id: "R14", name: "היעדר תוכנית המשכיות עסקית (BCP) מעודכנת", cat: "המשכיות", module: "bcp", inherent: 4, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-01", controls: [
    { id: "C28", name: "תוכנית BCP מתועדת ומאושרת", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-01" },
    { id: "C29", name: "תרגיל שנתי של תוכנית ההמשכיות", effectiveness: 1, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-02" },
  ]},
  { id: "R15", name: "אי-ביצוע ניתוח השפעה עסקית (BIA)", cat: "המשכיות", module: "bcp", inherent: 3, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-05", controls: [
    { id: "C30", name: "ביצוע BIA שנתי לכל הפונקציות הקריטיות", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-05" },
  ]},
  { id: "R16", name: "כשל בשחזור מערכות לאחר אסון", cat: "המשכיות", module: "bcp", inherent: 5, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-03", controls: [
    { id: "C31", name: "תוכנית DR מתועדת עם RTO/RPO מוגדרים", effectiveness: 2, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-03" },
    { id: "C32", name: "אתר DR חלופי פעיל", effectiveness: 1, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-06" },
    { id: "C33", name: "בדיקת שחזור חצי-שנתית", effectiveness: 1, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-04" },
  ]},
  { id: "R17", name: "השבתה ממושכת עקב אירוע חירום", cat: "המשכיות", module: "bcp", inherent: 4, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-07", controls: [
    { id: "C34", name: "צוות חירום מוגדר עם אחריות ברורות", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-07" },
    { id: "C35", name: "תקשורת חירום רב-ערוצית", effectiveness: 3, reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-08" },
  ]},

  // ── ממשל סייבר (3) — PRO ──
  { id: "R18", name: "היעדר מדיניות אבטחת מידע וסייבר מאושרת", cat: "ממשל סייבר", module: "cgov", inherent: 4, reg: "2022-10-9", section: "2(א)", reqId: "CYB-GOV-01", tier: "pro", controls: [
    { id: "C36", name: "מדיניות סייבר מאושרת ע״י הדירקטוריון", effectiveness: 3, reg: "2022-10-9", section: "2(א)", reqId: "CYB-GOV-01" },
    { id: "C37", name: "תוכנית עבודה שנתית לסייבר", effectiveness: 2, reg: "2022-10-9", section: "2(ב)", reqId: "CYB-GOV-02" },
  ]},
  { id: "R19", name: "חוסר מודעות עובדים לאיומי סייבר", cat: "ממשל סייבר", module: "cgov", inherent: 3, reg: "2022-10-9", section: "3(א)", reqId: "CYB-GOV-03", tier: "pro", controls: [
    { id: "C38", name: "הדרכת מודעות סייבר שנתית לכלל העובדים", effectiveness: 3, reg: "2022-10-9", section: "3(א)", reqId: "CYB-GOV-03" },
    { id: "C39", name: "סימולציות פישינג תקופתיות", effectiveness: 2, reg: "2022-10-9", section: "3(א)", reqId: "CYB-GOV-04" },
  ]},
  { id: "R20", name: "אי-מיפוי נכסי מידע קריטיים", cat: "ממשל סייבר", module: "cgov", inherent: 3, reg: "2022-10-9", section: "3(ב)", reqId: "CYB-GOV-05", tier: "pro", controls: [
    { id: "C40", name: "מרשם נכסי מידע (Asset Inventory) מעודכן", effectiveness: 2, reg: "2022-10-9", section: "3(ב)", reqId: "CYB-GOV-05" },
    { id: "C41", name: "סיווג רמות רגישות לנכסי מידע", effectiveness: 2, reg: "2022-10-9", section: "3(ב)", reqId: "CYB-GOV-06" },
  ]},

  // ── הגנת סייבר (5) — PRO ──
  { id: "R21", name: "תקיפת כופרה (Ransomware) על תשתיות החברה", cat: "הגנת סייבר", module: "cpro", inherent: 5, reg: "2022-10-9", section: "4(א)", reqId: "CYB-PRO-01", tier: "pro", controls: [
    { id: "C42", name: "מערכת EDR על כלל תחנות העבודה", effectiveness: 3, reg: "2022-10-9", section: "4(א)", reqId: "CYB-PRO-01" },
    { id: "C43", name: "גיבוי מבודד (Air-Gapped) לנתונים קריטיים", effectiveness: 2, reg: "2022-10-9", section: "4(א)", reqId: "CYB-PRO-02" },
    { id: "C44", name: "הפרדת רשתות (Network Segmentation)", effectiveness: 2, reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-03" },
  ]},
  { id: "R22", name: "חדירה דרך פישינג ממוקד (Spear Phishing)", cat: "הגנת סייבר", module: "cpro", inherent: 4, reg: "2022-10-9", section: "4(א)", reqId: "CYB-PRO-04", tier: "pro", controls: [
    { id: "C45", name: "סינון דוא״ל מתקדם (Email Gateway)", effectiveness: 3, reg: "2022-10-9", section: "4(א)", reqId: "CYB-PRO-04" },
    { id: "C46", name: "אימות דו-שלבי (MFA) לכל המשתמשים", effectiveness: 4, reg: "2022-10-9", section: "4(ג)", reqId: "CYB-PRO-05" },
  ]},
  { id: "R23", name: "ניצול פגיעויות (Vulnerabilities) במערכות", cat: "הגנת סייבר", module: "cpro", inherent: 4, reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-06", tier: "pro", controls: [
    { id: "C47", name: "סריקת פגיעויות רבעונית", effectiveness: 2, reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-06" },
    { id: "C48", name: "ניהול עדכוני אבטחה (Patch Management)", effectiveness: 2, reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-07" },
    { id: "C49", name: "מבחן חדירה שנתי", effectiveness: 1, reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-08" },
  ]},
  { id: "R24", name: "גישה לא מורשית למערכות ונתונים", cat: "הגנת סייבר", module: "cpro", inherent: 4, reg: "2022-10-9", section: "4(ג)", reqId: "CYB-PRO-09", tier: "pro", controls: [
    { id: "C50", name: "ניהול זהויות והרשאות (IAM)", effectiveness: 3, reg: "2022-10-9", section: "4(ג)", reqId: "CYB-PRO-09" },
    { id: "C51", name: "סקירת הרשאות רבעונית", effectiveness: 2, reg: "2022-10-9", section: "4(ג)", reqId: "CYB-PRO-10" },
  ]},
  { id: "R25", name: "דליפת מידע רגיש (Data Leakage)", cat: "הגנת סייבר", module: "cpro", inherent: 5, reg: "2022-10-9", section: "4(ד)", reqId: "CYB-PRO-11", tier: "pro", controls: [
    { id: "C52", name: "מערכת DLP (Data Loss Prevention)", effectiveness: 2, reg: "2022-10-9", section: "4(ד)", reqId: "CYB-PRO-11" },
    { id: "C53", name: "הצפנת נתונים רגישים (At-Rest & In-Transit)", effectiveness: 3, reg: "2022-10-9", section: "4(ד)", reqId: "CYB-PRO-12" },
  ]},

  // ── אירועי סייבר (3) — PRO ──
  { id: "R26", name: "היעדר יכולת זיהוי וניטור אירועי סייבר", cat: "אירועי סייבר", module: "cinc", inherent: 4, reg: "2022-10-9", section: "5(א)", reqId: "CYB-INC-01", tier: "pro", controls: [
    { id: "C54", name: "מערכת SIEM לניטור אירועים", effectiveness: 4, reg: "2022-10-9", section: "5(א)", reqId: "CYB-INC-01" },
    { id: "C55", name: "SOC (מרכז תפעול אבטחה) — פנימי או חיצוני", effectiveness: 4, reg: "2022-10-9", section: "5(א)", reqId: "CYB-INC-02" },
  ]},
  { id: "R27", name: "היעדר נוהל תגובה לאירועי סייבר", cat: "אירועי סייבר", module: "cinc", inherent: 3, reg: "2022-10-9", section: "5(ב)", reqId: "CYB-INC-03", tier: "pro", controls: [
    { id: "C56", name: "נוהל IRP (Incident Response Plan) מתועד", effectiveness: 4, reg: "2022-10-9", section: "5(ב)", reqId: "CYB-INC-03" },
    { id: "C57", name: "תרגיל תגובה לאירוע סייבר שנתי", effectiveness: 3, reg: "2022-10-9", section: "5(ב)", reqId: "CYB-INC-04" },
  ]},
  { id: "R28", name: "אי-דיווח על אירועי סייבר כנדרש ברגולציה", cat: "אירועי סייבר", module: "cinc", inherent: 3, reg: "2022-10-9", section: "5(ג)", reqId: "CYB-INC-05", tier: "pro", controls: [
    { id: "C58", name: "נוהל דיווח מוסדר לרשות שוק ההון", effectiveness: 4, reg: "2022-10-9", section: "5(ג)", reqId: "CYB-INC-05" },
    { id: "C59", name: "מנגנון תיעוד וניתוח שורש אירועים", effectiveness: 3, reg: "2022-10-9", section: "5(ג)", reqId: "CYB-INC-06" },
  ]},

  // ── ציות (2) ──
  { id: "R29", name: "אי-עמידה בדרישות הלימות הון ונזילות", cat: "ציות", module: "gov", inherent: 4, reg: "2024-10-2", section: "2(א)", reqId: "CMP-01", controls: [
    { id: "C60", name: "ניטור הלימות הון שוטף מול דרישות", effectiveness: 3, reg: "2024-10-2", section: "2(א)", reqId: "CMP-01" },
    { id: "C61", name: "דיווח רבעוני לרשות שוק ההון", effectiveness: 4, reg: "2024-10-2", section: "2(א)", reqId: "CMP-02" },
  ]},
  { id: "R30", name: "אי-דיווח במועד לרשות שוק ההון", cat: "ציות", module: "gov", inherent: 3, reg: "2024-10-2", section: "3", reqId: "CMP-03", controls: [
    { id: "C62", name: "לוח שנה רגולטורי עם התראות אוטומטיות", effectiveness: 4, reg: "2024-10-2", section: "3", reqId: "CMP-03" },
    { id: "C63", name: "אחראי ציות ייעודי עם מעקב שוטף", effectiveness: 3, reg: "2024-10-2", section: "3", reqId: "CMP-04" },
  ]},
];

const CATEGORIES = ["הכל", "ממשל", "תפעולי", "מיקור חוץ", "המשכיות", "ממשל סייבר", "הגנת סייבר", "אירועי סייבר", "ציות"];

// ═══ ALL MODULE DATA / NAV / CHARTS — same as v7 ═══
const ALL_MODULES = [
  { id: "gov", Icon: Shield, name: "ממשל סיכונים", score: 78, tasks: 2, reqs: 14, met: 11, reg: "risk" },
  { id: "ops", Icon: BarChart3, name: "סיכון תפעולי", score: 65, tasks: 4, reqs: 18, met: 12, reg: "risk" },
  { id: "out", Icon: Handshake, name: "מיקור חוץ", score: 70, tasks: 1, reqs: 10, met: 7, reg: "risk" },
  { id: "bcp", Icon: ShieldCheck, name: "המשכיות עסקית", score: 45, tasks: 3, reqs: 12, met: 5, reg: "risk" },
  { id: "cgov", Icon: Lock, name: "ממשל סייבר", score: 55, tasks: 2, reqs: 16, met: 9, reg: "cyber" },
  { id: "cpro", Icon: ShieldAlert, name: "הגנת סייבר", score: 40, tasks: 5, reqs: 22, met: 9, reg: "cyber" },
  { id: "cinc", Icon: Zap, name: "אירועי סייבר", score: 80, tasks: 0, reqs: 8, met: 6, reg: "cyber" },
  { id: "credit", Icon: CreditCard, name: "סיכון אשראי", score: 58, tasks: 3, reqs: 16, met: 9, reg: "risk", tier: "pro" },
  { id: "kri", Icon: Gauge, name: "מדדי סיכון (KRI)", score: 52, tasks: 2, reqs: 10, met: 5, reg: "risk", tier: "pro" },
  { id: "events", Icon: FileWarning, name: "דיווח אירועים", score: 65, tasks: 1, reqs: 8, met: 5, reg: "risk", tier: "pro" },
  { id: "reports", Icon: FileOutput, name: "דוחות", score: 70, tasks: 2, reqs: 6, met: 4, reg: "risk", tier: "pro" },
];
const NAV_GROUPS = [
  { label: null, items: [{ id: "dash", label: "דשבורד", Icon: LayoutDashboard }, { id: "riskreg", label: "מאגר סיכונים ובקרות", Icon: Shield }, { id: "agents", label: "סוכנים", Icon: Bot }] },
  { label: "ממשל תאגידי", sub: "Corporate Governance", items: [
    { id: "board", label: "דירקטוריון", Icon: Briefcase }, { id: "gov", label: "ממשל סיכונים", Icon: Shield },
    { id: "cgov", label: "ממשל סייבר", Icon: Lock },
  ]},
  { label: "ניהול סיכונים", sub: "2024-10-2", items: [
    { id: "ops", label: "סיכון תפעולי", Icon: BarChart3 },
    { id: "out", label: "מיקור חוץ", Icon: Handshake }, { id: "bcp", label: "המשכיות עסקית", Icon: ShieldCheck },
  ]},
  { label: "ניהול סיכוני סייבר", sub: "2022-10-9", items: [
    { id: "cpro", label: "הגנת סייבר", Icon: ShieldAlert },
    { id: "cinc", label: "אירועי סייבר", Icon: Zap },
  ]},
  { label: "PRO", items: [
    { id: "credit", label: "סיכון אשראי", Icon: CreditCard }, { id: "kri", label: "KRI", Icon: Gauge },
    { id: "events", label: "דיווח אירועים", Icon: FileWarning },
    { id: "reports", label: "דוחות", Icon: FileOutput },
  ]},
  { label: "כלים", items: [
    { id: "docs", label: "מסמכים", Icon: FileText }, { id: "reg", label: "רגולציה", Icon: BookOpen },
    { id: "tasks", label: "משימות", Icon: CheckSquare },
    { id: "settings", label: "הגדרות", Icon: Settings },
  ]},
];
const TREND_DATA = {
  all: [{ month: "ספט", score: 32, benchmark: 50 },{ month: "אוק", score: 38, benchmark: 52 },{ month: "נוב", score: 44, benchmark: 53 },{ month: "דצמ", score: 50, benchmark: 54 },{ month: "ינו", score: 55, benchmark: 56 },{ month: "פבר", score: 62, benchmark: 58 }],
  risk: [{ month: "ספט", score: 38, benchmark: 52 },{ month: "אוק", score: 45, benchmark: 54 },{ month: "נוב", score: 51, benchmark: 55 },{ month: "דצמ", score: 56, benchmark: 57 },{ month: "ינו", score: 60, benchmark: 58 },{ month: "פבר", score: 66, benchmark: 60 }],
  cyber: [{ month: "ספט", score: 22, benchmark: 48 },{ month: "אוק", score: 28, benchmark: 49 },{ month: "נוב", score: 35, benchmark: 50 },{ month: "דצמ", score: 42, benchmark: 51 },{ month: "ינו", score: 48, benchmark: 53 },{ month: "פבר", score: 54, benchmark: 55 }],
};
const RADAR_DATA = {
  all: [{ subject: "ממשל", you: 78, market: 65 },{ subject: "תפעולי", you: 65, market: 60 },{ subject: "מיקור חוץ", you: 70, market: 55 },{ subject: "המשכיות", you: 45, market: 50 },{ subject: "ממשל סייבר", you: 55, market: 50 },{ subject: "הגנה", you: 40, market: 45 },{ subject: "אירועים", you: 80, market: 55 }],
  risk: [{ subject: "ממשל", you: 78, market: 65 },{ subject: "תפעולי", you: 65, market: 60 },{ subject: "מיקור חוץ", you: 70, market: 55 },{ subject: "המשכיות", you: 45, market: 50 }],
  cyber: [{ subject: "ממשל סייבר", you: 55, market: 50 },{ subject: "הגנה", you: 40, market: 45 },{ subject: "אירועים", you: 80, market: 55 }],
};
const RISK_DIST = [{ name: "קריטי", value: 2, color: C.danger },{ name: "גבוה", value: 4, color: "#E8875B" },{ name: "בינוני", value: 4, color: C.warning },{ name: "נמוך", value: 2, color: C.success }];
const COMPLIANCE_DIST = [{ name: "עומד", value: 38, color: C.success },{ name: "בתהליך", value: 18, color: C.warning },{ name: "לא עומד", value: 12, color: C.danger },{ name: "טרם הוחל", value: 12, color: "#B0B8C4" }];
const SCORES = { all: 62, risk: 66, cyber: 54 };
const BENCHMARKS = { all: 58, risk: 60, cyber: 55 };
const TASKS = [
  { title: "השלמת BIA לפונקציות קריטיות", mod: "המשכיות", due: "15/03/2026", status: "overdue", reg: "risk", regRef: "2024-10-2 § 2(ב)(5)", reqId: "BCP-05" },
  { title: "דוח רבעוני Q1 לדירקטוריון", mod: "ממשל", due: "31/03/2026", status: "active", reg: "risk", regRef: "2024-10-2 § 2(א)", reqId: "GOV-03" },
  { title: "סריקת פגיעויות Q1", mod: "הגנת סייבר", due: "31/03/2026", status: "pending", reg: "cyber", regRef: "2022-10-9 § 4(ב)", reqId: "CYB-PRO-06" },
  { title: "חידוש הערכת ספק קלאודפיי", mod: "מיקור חוץ", due: "15/04/2026", status: "pending", reg: "risk", regRef: "2024-10-2 § 2(ב)(4)", reqId: "OUT-04" },
  { title: "מבחן חדירה שנתי", mod: "הגנת סייבר", due: "30/06/2026", status: "pending", reg: "cyber", regRef: "2022-10-9 § 4(ב)", reqId: "CYB-PRO-08" },
];
const ACTIVITIES = [
  { action: "עדכן סיכון", detail: "כשל מערכת הליבה — ציון 16", user: "יוסי לוי", time: "היום 14:32", Icon: BarChart3 },
  { action: "אישר מדיניות", detail: "מדיניות הגנת סייבר v2.1", user: "דנה כהן", time: "היום 11:15", Icon: CheckSquare },
  { action: "הוסיף ספק", detail: "דיגיפורם — דיגיטל", user: "יוסי לוי", time: "אתמול 16:40", Icon: Handshake },
  { action: "סגר אירוע", detail: "אירוע סייבר #001", user: "יוסי לוי", time: "אתמול 09:22", Icon: Zap },
];

// ═══════════════════════════════════════════════
// REGULATION TREE — Real Circular Structure
// ═══════════════════════════════════════════════
const REG_TREE = [
  { id: "reg-risk", name: "ניהול סיכונים כללי", circular: "2024-10-2", tier: "starter", Icon: Shield, sections: [
    { id: "2a", ref: "2(א)", title: "חובות הדירקטוריון", reqs: [
      { reqId: "GOV-01", text: "אישור מדיניות ניהול סיכונים בכתב", feature: "אשף מדיניות", featureNav: "gov", status: "met", evidence: ["T01 — מדיניות ניהול סיכונים v2.0 (אושר 10/01/2026)"] },
      { reqId: "GOV-02", text: "עדכון שנתי של תוכנית ניהול סיכונים", feature: "מעקב עדכון שנתי", featureNav: "gov", status: "met", evidence: ["סקירה שנתית הושלמה 01/2026"] },
      { reqId: "GOV-03", text: "פיקוח הדירקטוריון על ניהול סיכונים — דיווח רבעוני", feature: "דוח דירקטוריון", featureNav: "gov", status: "partial", evidence: ["T05 — דוח Q4/2025 הוגש", "דוח Q1/2026 — בתהליך"] },
      { reqId: "GOV-04", text: "ועדת סיכונים בדירקטוריון", feature: "ממשל — ועדת היגוי", featureNav: "gov", status: "met", evidence: ["T04 — פרוטוקול ועדת סיכונים 12/2025"] },
    ]},
    { id: "2b", ref: "2(ב)", title: "חובות המנכ״ל ומנהל הסיכונים", reqs: [
      { reqId: "GOV-05", text: "מינוי מנהל סיכונים עם קו דיווח ישיר", feature: "פרופיל מנהל סיכונים", featureNav: "gov", status: "met", evidence: ["T03 — כתב מינוי מנהל סיכונים"] },
      { reqId: "GOV-06", text: "הגדרת תפקיד ואחריות מתועדת", feature: "הגדרת תפקיד", featureNav: "gov", status: "met", evidence: ["מסמך תיאור תפקיד מנהל סיכונים v1.2"] },
      { reqId: "GOV-07", text: "מתודולוגיה לזיהוי והערכת סיכונים", feature: "רישום סיכונים", featureNav: "riskreg", status: "partial", evidence: ["בנק 30 סיכונים מאוכלס", "סקר שנתי — לא הושלם"] },
      { reqId: "GOV-08", text: "סקר סיכונים שנתי מקיף", feature: "הערכת סיכונים שנתית", featureNav: "riskreg", status: "not_met", evidence: [] },
    ]},
    { id: "2b2", ref: "2(ב)(2)", title: "סיכון תפעולי", reqs: [
      { reqId: "OPS-01", text: "ניהול סיכוני מערכות ליבה", feature: "רישום סיכונים — תפעולי", featureNav: "riskreg", status: "partial", evidence: ["R05 — סיכון מזוהה, בקרות חלקיות"] },
      { reqId: "OPS-03", text: "בקרות על תהליך חיתום ואישור", feature: "בקרות חיתום", featureNav: "ops", status: "met", evidence: ["C12 — Scoring אוטומטי פעיל", "C13 — Dual Approval מיושם"] },
      { reqId: "OPS-05", text: "בקרות ממשקים פיננסיים", feature: "ניטור ממשקים", featureNav: "ops", status: "partial", evidence: ["C14 — Reconciliation יומי"] },
      { reqId: "OPS-07", text: "מדיניות גיבוי ושחזור נתונים", feature: "ניהול גיבויים", featureNav: "ops", status: "partial", evidence: ["C16 — גיבוי יומי פעיל", "C17 — בדיקת שחזור לא בוצעה"] },
    ]},
    { id: "2b3", ref: "2(ב)(3)", title: "מניעת הונאה", reqs: [
      { reqId: "OPS-08", text: "מנגנוני זיהוי ומניעת הונאה", feature: "מודול הונאה", featureNav: "ops", status: "partial", evidence: ["C18 — מנגנון אוטומטי מיושם חלקית"] },
      { reqId: "OPS-09", text: "ביקורת פנימית תקופתית", feature: "ביקורת פנימית", featureNav: "ops", status: "met", evidence: ["ביקורת פנימית Q4/2025 הושלמה"] },
    ]},
    { id: "2b4", ref: "2(ב)(4)", title: "ניהול מיקור חוץ", reqs: [
      { reqId: "OUT-01", text: "מיפוי ספקים קריטיים", feature: "מרשם ספקים", featureNav: "out", status: "partial", evidence: ["6 ספקים רשומים", "חסר: חלופות לספק יחיד"] },
      { reqId: "OUT-02", text: "תוכנית יציאה לכל ספק קריטי", feature: "Exit Strategy", featureNav: "out", status: "not_met", evidence: [] },
      { reqId: "OUT-03", text: "הערכת עמידה בתקני אבטחה", feature: "הערכת ספקים", featureNav: "out", status: "partial", evidence: ["C22 — דרישת SOC2 קיימת", "הערכה שנתית לא הושלמה"] },
      { reqId: "OUT-05", text: "הגנה על נתוני לקוחות אצל ספקים", feature: "NDA + הגבלת גישה", featureNav: "out", status: "met", evidence: ["C24 — NDA עם כל הספקים", "C25 — Need-to-Know מיושם"] },
    ]},
    { id: "2b5", ref: "2(ב)(5)", title: "המשכיות עסקית", reqs: [
      { reqId: "BCP-01", text: "תוכנית המשכיות עסקית מתועדת", feature: "אשף BCP", featureNav: "bcp", status: "partial", evidence: ["T10 — תוכנית BCP v1.0 (לא מעודכנת)"] },
      { reqId: "BCP-02", text: "תרגיל שנתי של תוכנית המשכיות", feature: "ניהול תרגילים", featureNav: "bcp", status: "not_met", evidence: [] },
      { reqId: "BCP-03", text: "תוכנית DR עם RTO/RPO מוגדרים", feature: "Disaster Recovery", featureNav: "bcp", status: "partial", evidence: ["C31 — תוכנית DR קיימת", "RTO/RPO לא נבדקו"] },
      { reqId: "BCP-05", text: "ניתוח השפעה עסקית (BIA)", feature: "תבנית BIA", featureNav: "bcp", status: "not_met", evidence: [] },
    ]},
  ]},
  { id: "reg-cyber", name: "ניהול סיכוני סייבר", circular: "2022-10-9", tier: "pro", Icon: Lock, sections: [
    { id: "c2a", ref: "2(א)", title: "מדיניות סייבר", reqs: [
      { reqId: "CYB-GOV-01", text: "מדיניות אבטחת מידע וסייבר מאושרת", feature: "אשף מדיניות סייבר", featureNav: "cgov", status: "partial", evidence: ["T20 — טיוטת מדיניות v1.0"] },
      { reqId: "CYB-GOV-02", text: "תוכנית עבודה שנתית לסייבר", feature: "תוכנית עבודה", featureNav: "cgov", status: "not_met", evidence: [] },
    ]},
    { id: "c3a", ref: "3(א)", title: "מודעות והדרכה", reqs: [
      { reqId: "CYB-GOV-03", text: "הדרכת מודעות סייבר שנתית", feature: "מעקב הדרכות", featureNav: "cgov", status: "partial", evidence: ["הדרכה אחרונה: 06/2025"] },
      { reqId: "CYB-GOV-04", text: "סימולציות פישינג תקופתיות", feature: "מעקב סימולציות", featureNav: "cgov", status: "not_met", evidence: [] },
    ]},
    { id: "c3b", ref: "3(ב)", title: "מיפוי נכסי מידע", reqs: [
      { reqId: "CYB-GOV-05", text: "מרשם נכסי מידע מעודכן", feature: "Asset Inventory", featureNav: "cgov", status: "partial", evidence: ["רשימה חלקית — 60% מהנכסים"] },
      { reqId: "CYB-GOV-06", text: "סיווג רמות רגישות", feature: "סיווג נכסים", featureNav: "cgov", status: "not_met", evidence: [] },
    ]},
    { id: "c4a", ref: "4(א)", title: "אמצעי הגנה", reqs: [
      { reqId: "CYB-PRO-01", text: "הגנה מפני תוכנות זדוניות (EDR)", feature: "מעקב EDR", featureNav: "cpro", status: "partial", evidence: ["C42 — EDR בפריסה, 70% כיסוי"] },
      { reqId: "CYB-PRO-02", text: "גיבוי מבודד לנתונים קריטיים", feature: "ניהול גיבויים", featureNav: "cpro", status: "not_met", evidence: [] },
      { reqId: "CYB-PRO-04", text: "הגנה מפני פישינג ודוא״ל זדוני", feature: "Email Gateway", featureNav: "cpro", status: "met", evidence: ["C45 — Email Gateway פעיל", "C46 — MFA לכלל המשתמשים"] },
    ]},
    { id: "c4b", ref: "4(ב)", title: "ניהול פגיעויות", reqs: [
      { reqId: "CYB-PRO-06", text: "סריקת פגיעויות תקופתית", feature: "מעקב סריקות", featureNav: "cpro", status: "partial", evidence: ["סריקה אחרונה: 11/2025"] },
      { reqId: "CYB-PRO-07", text: "ניהול עדכוני אבטחה", feature: "Patch Management", featureNav: "cpro", status: "partial", evidence: ["C48 — תהליך קיים, לא מלא"] },
      { reqId: "CYB-PRO-08", text: "מבחן חדירה שנתי", feature: "מעקב Pen Test", featureNav: "cpro", status: "not_met", evidence: [] },
    ]},
    { id: "c4c", ref: "4(ג)", title: "ניהול הרשאות וגישה", reqs: [
      { reqId: "CYB-PRO-09", text: "ניהול זהויות והרשאות (IAM)", feature: "IAM Dashboard", featureNav: "cpro", status: "partial", evidence: ["C50 — IAM בסיסי פעיל"] },
      { reqId: "CYB-PRO-10", text: "סקירת הרשאות רבעונית", feature: "Access Review", featureNav: "cpro", status: "not_met", evidence: [] },
    ]},
    { id: "c4d", ref: "4(ד)", title: "הגנת מידע", reqs: [
      { reqId: "CYB-PRO-11", text: "מניעת דליפת מידע (DLP)", feature: "DLP Dashboard", featureNav: "cpro", status: "not_met", evidence: [] },
      { reqId: "CYB-PRO-12", text: "הצפנת נתונים", feature: "Encryption Inventory", featureNav: "cpro", status: "partial", evidence: ["C53 — In-Transit מוצפן, At-Rest חלקי"] },
    ]},
    { id: "c5a", ref: "5(א)", title: "זיהוי וניטור אירועים", reqs: [
      { reqId: "CYB-INC-01", text: "מערכת SIEM לניטור אירועים", feature: "SIEM Integration", featureNav: "cinc", status: "met", evidence: ["C54 — SIEM פעיל"] },
      { reqId: "CYB-INC-02", text: "מרכז תפעול אבטחה (SOC)", feature: "SOC Dashboard", featureNav: "cinc", status: "met", evidence: ["C55 — SOC חיצוני פעיל"] },
    ]},
    { id: "c5b", ref: "5(ב)", title: "תגובה לאירועים", reqs: [
      { reqId: "CYB-INC-03", text: "נוהל תגובה לאירועי סייבר (IRP)", feature: "Incident Response", featureNav: "cinc", status: "met", evidence: ["C56 — IRP מתועד ומאושר"] },
      { reqId: "CYB-INC-04", text: "תרגיל תגובה שנתי", feature: "ניהול תרגילים", featureNav: "cinc", status: "partial", evidence: ["תרגיל אחרון: 08/2025"] },
    ]},
    { id: "c5c", ref: "5(ג)", title: "דיווח לרגולטור", reqs: [
      { reqId: "CYB-INC-05", text: "נוהל דיווח לרשות שוק ההון", feature: "דוח ISA", featureNav: "cinc", status: "met", evidence: ["C58 — נוהל דיווח מוסדר פעיל"] },
      { reqId: "CYB-INC-06", text: "ניתוח שורש אירועים", feature: "Root Cause Analysis", featureNav: "cinc", status: "met", evidence: ["C59 — מנגנון RCA פעיל"] },
    ]},
  ]},
];

const STATUS_LABELS = { met: { l: "עומד", c: C.success, bg: C.successBg }, partial: { l: "חלקי", c: C.warning, bg: C.warningBg }, not_met: { l: "לא עומד", c: C.danger, bg: C.dangerBg } };

// ═══ SHARED UI COMPONENTS ═══
const ChartCard = ({ title, Icon: Ic, children }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
      {Ic && <Ic size={14} color={C.accent} />} {title}
    </h3>
    {children}
  </div>
);

function ScoreRing({ score, size = 110, label }) {
  const [v, setV] = useState(0);
  useEffect(() => { let s = 0; const f = () => { s += 1.5; if (s >= score) { setV(score); return; } setV(Math.round(s)); requestAnimationFrame(f); }; requestAnimationFrame(f); }, [score]);
  const color = v >= 80 ? C.success : v >= 50 ? C.warning : C.danger;
  const r = (size - 16) / 2, circ = 2 * Math.PI * r, arc = circ * 0.75;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.borderLight} strokeWidth="8" strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${arc} ${circ}`} strokeDashoffset={arc-(arc*v)/100} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-42%)", textAlign: "center" }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{v}%</div>
        {label && <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>{label}</div>}
      </div>
    </div>
  );
}
const CustomTooltip = ({ active, payload, label }) => { if (!active || !payload?.length) return null; return (<div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", direction: "rtl", fontFamily: "Assistant", fontSize: 12 }}><div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>{payload.map((p, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: p.color }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />{p.name}: {p.value}%</div>))}</div>); };
const taskStyle = { overdue: { bg: C.dangerBg, c: C.danger, l: "באיחור", Icon: AlertTriangle }, active: { bg: C.warningBg, c: C.warning, l: "בתהליך", Icon: TrendingUp }, pending: { bg: C.borderLight, c: C.textSec, l: "ממתין", Icon: Clock } };

const RiskBadge = ({ level, size = "md" }) => {
  const r = RISK_LEVELS[level] || RISK_LEVELS[1];
  const sz = size === "lg" ? { fs: 16, p: "5px 14px", br: 8 } : size === "sm" ? { fs: 10, p: "2px 7px", br: 4 } : { fs: 12, p: "3px 10px", br: 6 };
  return <span style={{ background: `${r.color}18`, color: r.color, fontSize: sz.fs, fontWeight: 700, padding: sz.p, borderRadius: sz.br, fontFamily: "Rubik", whiteSpace: "nowrap" }}>{level} — {r.label}</span>;
};

// ═══════════════════════════════════════════════
// RISK REGISTER — Bank-Based
// ═══════════════════════════════════════════════
function RiskRegister({ onAskNutela, onOpenDetail, risks, setRisks }) {
  const [filterCat, setFilterCat] = useState("הכל");
  const [view, setView] = useState("heatmap");
  const [selectedId, setSelectedId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const filtered = filterCat === "הכל" ? risks : risks.filter(r => r.cat === filterCat);
  const selected = risks.find(r => r.id === selectedId);

  const updateControlEff = (riskId, ctrlId, eff) => {
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, controls: r.controls.map(c => c.id === ctrlId ? { ...c, effectiveness: eff } : c) } : r));
  };
  const updateRiskName = (riskId, newName) => {
    if (newName.trim()) setRisks(prev => prev.map(r => r.id === riskId ? { ...r, name: newName.trim() } : r));
    setEditingName(false);
  };

  // Summary stats
  const totalControls = risks.reduce((a, r) => a + r.controls.length, 0);
  const avgResidual = (risks.reduce((a, r) => a + calcResidual(r.inherent, r.controls), 0) / risks.length).toFixed(1);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={20} color={C.accent} /> מאגר סיכונים ובקרות
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>
            {risks.length} סיכונים · {totalControls} בקרות · ציון שיורי ממוצע: {avgResidual}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", background: C.borderLight, borderRadius: 8, padding: 3 }}>
            {[{ id: "heatmap", Icon: Grid3X3, l: "מפת חום" }, { id: "table", Icon: List, l: "טבלה" }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{ background: view === v.id ? C.surface : "transparent", border: view === v.id ? `1px solid ${C.border}` : "1px solid transparent", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: view === v.id ? 600 : 400, color: view === v.id ? C.text : C.textMuted, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
                <v.Icon size={12} /> {v.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? C.accent : C.surface, color: filterCat === c ? "white" : C.textSec, border: `1px solid ${filterCat === c ? C.accent : C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: filterCat === c ? 600 : 400, cursor: "pointer", fontFamily: "Rubik" }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* ── Main Content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {view === "table" && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: selectedId ? "0 10px 10px 0" : 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Assistant" }}>
                <thead>
                  <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                    {["#", "סיכון", "קטגוריה", "שורשי", "בקרות", "שיורי"].map(h => (
                      <th key={h} style={{ textAlign: "right", padding: "9px 10px", fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: "Rubik", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const residual = calcResidual(r.inherent, r.controls);
                    const isSel = selectedId === r.id;
                    return (
                      <tr key={r.id} onClick={() => setSelectedId(isSel ? null : r.id)} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", background: isSel ? C.accentLight : i % 2 === 0 ? "white" : "#FAFBFC", borderRight: isSel ? `3px solid ${C.accent}` : "3px solid transparent", transition: "background 0.1s" }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F5F8FB"; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isSel ? C.accentLight : i % 2 === 0 ? "white" : "#FAFBFC"; }}>
                        <td style={{ padding: "9px 10px", color: C.textMuted, fontSize: 11, fontFamily: "Rubik" }}>{r.id}</td>
                        <td style={{ padding: "9px 10px", maxWidth: 280 }}>
                          <div style={{ fontWeight: 500, color: C.text, fontSize: 12, marginBottom: 2 }}>{r.name}</div>
                          <span style={{ background: r.reg === "2022-10-9" ? "#EDE9FE" : "#E0F2FE", color: r.reg === "2022-10-9" ? "#7C3AED" : "#0369A1", fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 3, fontFamily: "Rubik" }}>§ {r.reg} {r.section}</span>
                          {r.tier === "pro" && <span style={{ background: "rgba(91,184,201,0.15)", color: C.accentTeal, fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginRight: 3, fontFamily: "Rubik" }}>PRO</span>}
                        </td>
                        <td style={{ padding: "9px 10px" }}><span style={{ background: C.borderLight, padding: "2px 7px", borderRadius: 4, fontSize: 10, color: C.textSec, fontFamily: "Rubik" }}>{r.cat}</span></td>
                        <td style={{ padding: "9px 10px" }}><RiskBadge level={r.inherent} size="sm" /></td>
                        <td style={{ padding: "9px 10px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 2 }}>
                            {r.controls.map(c => {
                              const ce = CTRL_EFF[c.effectiveness];
                              return <div key={c.id} title={`${c.name}: ${ce.label}`} style={{ width: 18, height: 18, borderRadius: 4, background: ce.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 700 }}>{c.effectiveness}</div>;
                            })}
                          </div>
                        </td>
                        <td style={{ padding: "9px 10px" }}><RiskBadge level={residual} size="sm" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {view === "heatmap" && (() => {
            const heatRisks = filtered;
            const critCount = heatRisks.filter(r => calcResidual(r.inherent, r.controls) >= 4).length;
            const lowCount = heatRisks.filter(r => calcResidual(r.inherent, r.controls) <= 2).length;
            const midCount = heatRisks.length - critCount - lowCount;
            const filtAvg = heatRisks.length ? (heatRisks.reduce((a, r) => a + calcResidual(r.inherent, r.controls), 0) / heatRisks.length).toFixed(1) : "—";

            return (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: selectedId ? "0 12px 12px 0" : 12, overflow: "hidden" }}>
              {/* Stats bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `1px solid ${C.border}` }}>
                {[
                  { label: "סיכונים מוצגים", value: heatRisks.length, c: C.accent },
                  { label: "סיכון שיורי ממוצע", value: filtAvg, c: parseFloat(filtAvg) >= 3.5 ? C.danger : parseFloat(filtAvg) >= 2.5 ? C.warning : C.success },
                  { label: "גבוה + קריטי", value: critCount, c: C.danger },
                  { label: "בינוני", value: midCount, c: C.warning },
                  { label: "נמוך + זניח", value: lowCount, c: C.success },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, padding: "12px 14px", textAlign: "center", borderLeft: i > 0 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: "Rubik" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "20px 24px" }}>
                {/* Legend */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    {[{ l: "קריטי (5)", c: C.danger }, { l: "גבוה (4)", c: "#E8875B" }, { l: "בינוני (3)", c: C.warning }, { l: "נמוך (2)", c: C.success }, { l: "זניח (1)", c: "#6DB6A0" }].map(x => (
                      <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSec, fontFamily: "Assistant" }}><div style={{ width: 10, height: 10, borderRadius: 3, background: x.c }} />{x.l}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>לחץ על סיכון לפרטים ועריכה</span>
                </div>

                {/* Heatmap grid */}
                <div style={{ display: "grid", gridTemplateColumns: "90px repeat(5, 1fr)", gap: 4 }}>
                  {/* Header row */}
                  <div style={{ padding: 6 }} />
                  {[1,2,3,4,5].map(r => (
                    <div key={r} style={{ textAlign: "center", padding: "6px 0" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: RISK_LEVELS[r].color, fontFamily: "Rubik" }}>{RISK_LEVELS[r].label}</div>
                      <div style={{ fontSize: 8, color: C.textMuted, fontFamily: "Assistant" }}>שיורי {r}</div>
                    </div>
                  ))}

                  {/* Rows */}
                  {[5,4,3,2,1].map(inh => (
                    <>
                      <div key={`label-${inh}`} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", paddingLeft: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: RISK_LEVELS[inh].color, fontFamily: "Rubik" }}>{RISK_LEVELS[inh].label}</div>
                        <div style={{ fontSize: 8, color: C.textMuted, fontFamily: "Assistant" }}>שורשי {inh}</div>
                      </div>
                      {[1,2,3,4,5].map(res => {
                        const here = heatRisks.filter(r => r.inherent === inh && calcResidual(r.inherent, r.controls) === res);
                        const cellLevel = Math.max(inh, res);
                        const cellColor = RISK_LEVELS[cellLevel]?.color || "#ccc";
                        const isHot = cellLevel >= 4;
                        return (
                          <div key={`${inh}-${res}`} style={{
                            background: here.length > 0 ? `${cellColor}12` : `${C.borderLight}60`,
                            border: here.length > 0 ? `2px solid ${cellColor}40` : `1px solid ${C.borderLight}`,
                            borderRadius: 8, minHeight: 56, padding: 5,
                            display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", justifyContent: "center",
                            position: "relative",
                            transition: "all 0.15s",
                          }}>
                            {here.length === 0 && <div style={{ fontSize: 8, color: `${C.textMuted}60`, fontFamily: "Rubik" }}>—</div>}
                            {here.map(r => {
                              const rRes = calcResidual(r.inherent, r.controls);
                              const isSel = selectedId === r.id;
                              return (
                                <div key={r.id} onClick={() => setSelectedId(isSel ? null : r.id)} title={r.name} style={{
                                  width: 30, height: 30, borderRadius: 8,
                                  background: `linear-gradient(135deg, ${RISK_LEVELS[rRes].color}, ${RISK_LEVELS[rRes].color}CC)`,
                                  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 9, fontWeight: 700, fontFamily: "Rubik",
                                  cursor: "pointer", boxShadow: isSel ? `0 0 0 3px white, 0 0 0 5px ${RISK_LEVELS[rRes].color}` : `0 2px 6px ${RISK_LEVELS[rRes].color}40`,
                                  transform: isSel ? "scale(1.2)" : "scale(1)",
                                  transition: "all 0.15s", zIndex: isSel ? 5 : 1,
                                }}
                                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.transform = "scale(1.1)"; }}
                                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.transform = isSel ? "scale(1.2)" : "scale(1)"; }}
                                >{r.id.replace("R0", "").replace("R", "")}</div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>

                {/* Axis labels */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "0 90px 0 0" }}>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
                    ← סיכון שיורי נמוך
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
                    סיכון שיורי גבוה →
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
        </div>

        {/* ── Detail Panel (Left in RTL) ── */}
        {selected && (
          <div style={{ width: 380, background: C.surface, borderRight: `1px solid ${C.border}`, borderRadius: "12px 0 0 12px", padding: 20, overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: "Rubik" }}>{selected.id} · {selected.cat}</span>
              <button onClick={() => setSelectedId(null)} style={{ background: C.borderLight, border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} color={C.textSec} /></button>
            </div>

            {/* Risk name — editable */}
            {editingName ? (
              <div style={{ marginBottom: 8 }}>
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus
                  onKeyDown={e => { if (e.key === "Enter") updateRiskName(selected.id, nameInput); if (e.key === "Escape") setEditingName(false); }}
                  style={{ width: "100%", fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "Rubik", border: `2px solid ${C.accent}`, borderRadius: 8, padding: "8px 10px", outline: "none", background: C.accentLight, direction: "rtl", lineHeight: 1.5, boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  <button onClick={() => updateRiskName(selected.id, nameInput)} style={{ background: C.accent, color: "white", border: "none", borderRadius: 5, padding: "4px 12px", fontSize: 10, fontFamily: "Rubik", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Save size={10} /> שמור</button>
                  <button onClick={() => setEditingName(false)} style={{ background: C.borderLight, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 12px", fontSize: 10, fontFamily: "Rubik", cursor: "pointer" }}>ביטול</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 8, cursor: "pointer", borderRadius: 8, padding: "6px 8px", margin: "-6px -8px 8px -8px", transition: "background 0.1s" }}
                onClick={() => { setEditingName(true); setNameInput(selected.name); }}
                onMouseEnter={e => e.currentTarget.style.background = C.borderLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "Rubik", lineHeight: 1.5, flex: 1, margin: 0 }}>{selected.name}</h3>
                <Pencil size={12} color={C.textMuted} style={{ marginTop: 4, flexShrink: 0 }} />
              </div>
            )}

            {/* Traceability tag */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ background: selected.reg === "2022-10-9" ? "#EDE9FE" : "#E0F2FE", color: selected.reg === "2022-10-9" ? "#7C3AED" : "#0369A1", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 3 }}>
                <BookOpen size={10} /> חוזר {selected.reg}
              </span>
              <span style={{ background: C.borderLight, color: C.textSec, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, fontFamily: "Rubik" }}>§ {selected.section}</span>
              <span style={{ background: C.borderLight, color: C.textSec, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 4, fontFamily: "Rubik" }}>{selected.reqId}</span>
              {selected.tier === "pro" && <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>PRO</span>}
            </div>

            {/* Scores row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div style={{ background: C.borderLight, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant", marginBottom: 4 }}>סיכון שורשי</div>
                <RiskBadge level={selected.inherent} size="lg" />
                <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant", marginTop: 4 }}>נקבע לפי פרופיל החברה</div>
              </div>
              <div style={{ background: C.borderLight, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant", marginBottom: 4 }}>סיכון שיורי</div>
                <RiskBadge level={calcResidual(selected.inherent, selected.controls)} size="lg" />
                <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant", marginTop: 4 }}>מחושב אוטומטית</div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <Shield size={13} color={C.accent} /> בקרות ({selected.controls.length})
              </h4>
              {selected.controls.map(ctrl => (
                <div key={ctrl.id} style={{ background: C.borderLight, borderRadius: 8, padding: "12px", marginBottom: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div onClick={() => onOpenDetail && onOpenDetail({ type: "control", id: ctrl.id })} style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant", flex: 1, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.color = C.accent} onMouseLeave={e => e.currentTarget.style.color = C.text}>
                      {ctrl.name}
                    </div>
                    <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "Rubik", background: "white", padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", marginRight: 4 }}>{ctrl.reqId}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 2, alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: ctrl.reg === "2022-10-9" ? "#7C3AED" : "#0369A1", fontFamily: "Rubik", fontWeight: 500 }}>§ {ctrl.reg} {ctrl.section}</span>
                    {(() => { const dc = getCtrlLinkedDocs(ctrl.id).length; const ec = getCtrlEvidence(ctrl.id).length; const vc = getCtrlEvidence(ctrl.id).filter(e => e.status === "verified").length;
                      return <>{dc > 0 && <span style={{ fontSize: 8, background: C.accentLight, color: C.accent, padding: "0 4px", borderRadius: 2, fontFamily: "Rubik" }}>📄{dc}</span>}{ec > 0 && <span style={{ fontSize: 8, background: vc === ec ? C.successBg : C.warningBg, color: vc === ec ? C.success : C.warning, padding: "0 4px", borderRadius: 2, fontFamily: "Rubik" }}>✓{vc}/{ec}</span>}</>;
                    })()}
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Rubik", marginBottom: 6 }}>אפקטיביות:</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const ce = CTRL_EFF[n];
                      const isActive = ctrl.effectiveness === n;
                      return (
                        <button key={n} onClick={() => updateControlEff(selected.id, ctrl.id, n)} title={ce.label}
                          style={{
                            flex: 1, padding: "6px 0", border: `1.5px solid ${isActive ? ce.color : C.border}`,
                            borderRadius: 6, background: isActive ? ce.color : "white",
                            cursor: "pointer", fontSize: 11, fontWeight: 600,
                            color: isActive ? "white" : C.textMuted, fontFamily: "Rubik",
                            transition: "all 0.1s",
                          }}>
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: CTRL_EFF[ctrl.effectiveness].color, fontFamily: "Assistant", fontWeight: 600 }}>
                      {CTRL_EFF[ctrl.effectiveness].label}
                    </div>
                    {onAskNutela && <button onClick={(e) => { e.stopPropagation(); onAskNutela(ctrl); }} style={{ background: "linear-gradient(135deg, #7B61FF, #BD34FE, #FF6B9D)", border: "none", borderRadius: 5, padding: "3px 8px", fontSize: 9, fontFamily: "Rubik", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600, opacity: 0.85, transition: "opacity 0.1s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.85"}><Sparkles size={9} /> שאלי NuTeLa</button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix explanation */}
            <div style={{ background: C.accentLight, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.accent}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <Info size={12} color={C.accent} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: "Rubik" }}>חישוב סיכון שיורי</span>
              </div>
              <div style={{ fontSize: 10, color: C.textSec, fontFamily: "Assistant", lineHeight: 1.6 }}>
                שורשי ({selected.inherent}) × ממוצע אפקטיביות ({(selected.controls.reduce((a,c) => a + c.effectiveness, 0) / selected.controls.length).toFixed(1)}) = שיורי ({calcResidual(selected.inherent, selected.controls)})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// REGULATION NAVIGATOR
// ═══════════════════════════════════════════════
function RegulationNavigator({ onNav }) {
  const [expandedRegs, setExpandedRegs] = useState({ "reg-risk": true, "reg-cyber": false });
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | met | partial | not_met

  const toggleReg = id => setExpandedRegs(p => ({ ...p, [id]: !p[id] }));
  const toggleSection = id => setExpandedSections(p => ({ ...p, [id]: !p[id] }));

  // Stats
  const allReqs = REG_TREE.flatMap(r => r.sections.flatMap(s => s.reqs));
  const stats = { met: allReqs.filter(r => r.status === "met").length, partial: allReqs.filter(r => r.status === "partial").length, not_met: allReqs.filter(r => r.status === "not_met").length };
  const totalPct = Math.round((stats.met / allReqs.length) * 100);

  const matchesFilter = (req) => {
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    if (searchQ && !req.text.includes(searchQ) && !req.reqId.toLowerCase().includes(searchQ.toLowerCase()) && !req.feature.includes(searchQ)) return false;
    return true;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={20} color={C.accent} /> נווט רגולציה
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>
            {allReqs.length} דרישות · {stats.met} עומד · {stats.partial} חלקי · {stats.not_met} לא עומד
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: totalPct >= 60 ? C.success : C.warning, fontFamily: "Rubik" }}>{totalPct}%</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>עמידה כוללת</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", flex: "0 0 220px" }}>
          <Search size={13} color={C.textMuted} />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="חיפוש דרישה, סעיף, פיצ׳ר..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: "Assistant", color: C.text, width: "100%", direction: "rtl" }} />
        </div>
        {[{ id: "all", l: "הכל" }, { id: "met", l: "עומד", c: C.success }, { id: "partial", l: "חלקי", c: C.warning }, { id: "not_met", l: "לא עומד", c: C.danger }].map(f => (
          <button key={f.id} onClick={() => setFilterStatus(f.id)} style={{
            background: filterStatus === f.id ? (f.c || C.accent) : C.surface,
            color: filterStatus === f.id ? "white" : C.textSec,
            border: `1px solid ${filterStatus === f.id ? (f.c || C.accent) : C.border}`,
            borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: filterStatus === f.id ? 600 : 400,
            cursor: "pointer", fontFamily: "Rubik",
          }}>{f.l} {f.id !== "all" && `(${stats[f.id]})`}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* ── Tree ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {REG_TREE.map(reg => {
            const regReqs = reg.sections.flatMap(s => s.reqs);
            const regMet = regReqs.filter(r => r.status === "met").length;
            const regPct = Math.round((regMet / regReqs.length) * 100);
            const isExpanded = expandedRegs[reg.id];
            const Ic = reg.Icon;

            return (
              <div key={reg.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
                {/* Regulation header */}
                <div onClick={() => toggleReg(reg.id)} style={{
                  padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  background: isExpanded ? C.accentLight : C.surface, borderBottom: isExpanded ? `1px solid ${C.border}` : "none",
                  transition: "background 0.1s",
                }}>
                  {isExpanded ? <ChevronDown size={16} color={C.accent} /> : <ChevronRight size={16} color={C.textMuted} />}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: reg.tier === "pro" ? "#EDE9FE" : C.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic size={16} color={reg.tier === "pro" ? "#7C3AED" : C.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 6 }}>
                      {reg.name}
                      {reg.tier === "pro" && <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 4, fontFamily: "Rubik" }}>PRO</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>חוזר {reg.circular} · {regReqs.length} דרישות · {reg.sections.length} סעיפים</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: regPct >= 60 ? C.success : regPct >= 30 ? C.warning : C.danger, fontFamily: "Rubik" }}>{regPct}%</div>
                    <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>עמידה</div>
                  </div>
                  <div style={{ width: 60, background: C.borderLight, borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${regPct}%`, height: "100%", borderRadius: 4, background: regPct >= 60 ? C.success : regPct >= 30 ? C.warning : C.danger }} />
                  </div>
                </div>

                {/* Sections */}
                {isExpanded && reg.sections.map(section => {
                  const secReqs = section.reqs.filter(matchesFilter);
                  if (secReqs.length === 0 && (searchQ || filterStatus !== "all")) return null;
                  const secExpanded = expandedSections[section.id] !== false; // default open
                  const secMet = section.reqs.filter(r => r.status === "met").length;
                  const secTotal = section.reqs.length;

                  return (
                    <div key={section.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      {/* Section header */}
                      <div onClick={() => toggleSection(section.id)} style={{
                        padding: "10px 16px 10px 40px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                        background: secExpanded ? "#FAFCFE" : "white",
                      }}>
                        {secExpanded ? <ChevronDown size={13} color={C.textSec} /> : <ChevronRight size={13} color={C.textMuted} />}
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: "Rubik", minWidth: 50 }}>§ {section.ref}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text, fontFamily: "Rubik", flex: 1 }}>{section.title}</span>
                        <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{secMet}/{secTotal}</span>
                        <div style={{ display: "flex", gap: 2 }}>
                          {section.reqs.map(r => (
                            <div key={r.reqId} style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_LABELS[r.status].c }} />
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      {secExpanded && (searchQ || filterStatus !== "all" ? secReqs : section.reqs).map(req => {
                        const st = STATUS_LABELS[req.status];
                        const isSel = selectedReq === req.reqId;
                        return (
                          <div key={req.reqId} onClick={() => setSelectedReq(isSel ? null : req.reqId)} style={{
                            padding: "10px 16px 10px 64px", display: "flex", alignItems: "flex-start", gap: 10,
                            cursor: "pointer", background: isSel ? C.accentLight : "white",
                            borderRight: isSel ? `3px solid ${C.accent}` : "3px solid transparent",
                            borderBottom: `1px solid ${C.borderLight}`, transition: "background 0.1s",
                          }}
                            onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F8FAFC"; }}
                            onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "white"; }}
                          >
                            <div style={{ width: 18, height: 18, borderRadius: 4, background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                              {req.status === "met" ? <CheckSquare size={10} color={st.c} /> : req.status === "partial" ? <Clock size={10} color={st.c} /> : <X size={10} color={st.c} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: C.text, fontFamily: "Assistant", fontWeight: 500, lineHeight: 1.4 }}>{req.text}</div>
                              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: 9, fontWeight: 600, color: C.accent, background: C.accentLight, padding: "1px 6px", borderRadius: 3, fontFamily: "Rubik" }}>{req.reqId}</span>
                                <span style={{ fontSize: 9, color: C.textSec, fontFamily: "Assistant", display: "flex", alignItems: "center", gap: 2 }}>
                                  <ChevronRight size={8} /> {req.feature}
                                </span>
                                {req.evidence.length > 0 && <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>{req.evidence.length} ראיות</span>}
                              </div>
                            </div>
                            <span style={{ background: st.bg, color: st.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: "Rubik", whiteSpace: "nowrap", flexShrink: 0 }}>{st.l}</span>
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

        {/* ── Detail Panel ── */}
        {selectedReq && (() => {
          const req = allReqs.find(r => r.reqId === selectedReq);
          if (!req) return null;
          const st = STATUS_LABELS[req.status];
          const linkedRisks = RISK_BANK.filter(r => r.reqId === req.reqId || r.controls.some(c => c.reqId === req.reqId));
          const linkedControls = RISK_BANK.flatMap(r => r.controls).filter(c => c.reqId === req.reqId);

          return (
            <div style={{ width: 360, background: C.surface, borderRight: `1px solid ${C.border}`, borderRadius: "12px 0 0 12px", padding: 20, overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "Rubik" }}>{req.reqId}</span>
                <button onClick={() => setSelectedReq(null)} style={{ background: C.borderLight, border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} color={C.textSec} /></button>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "Rubik", marginBottom: 10, lineHeight: 1.5 }}>{req.text}</h3>

              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
                <span style={{ background: st.bg, color: st.c, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 5, fontFamily: "Rubik" }}>{st.l}</span>
              </div>

              {/* Feature Link */}
              <div style={{ background: C.accentLight, borderRadius: 8, padding: "10px 12px", marginBottom: 14, cursor: "pointer", border: `1px solid ${C.accent}20` }} onClick={() => onNav(req.featureNav)}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant", marginBottom: 3 }}>פיצ׳ר מקושר</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
                  {req.feature} <ChevronLeft size={12} />
                </div>
              </div>

              {/* Evidence */}
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                  <FileText size={12} color={C.accent} /> ראיות ({req.evidence.length})
                </h4>
                {req.evidence.length > 0 ? req.evidence.map((ev, i) => (
                  <div key={i} style={{ background: C.borderLight, borderRadius: 6, padding: "8px 10px", marginBottom: 4, fontSize: 11, color: C.textSec, fontFamily: "Assistant", display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckSquare size={10} color={C.success} /> {ev}
                  </div>
                )) : (
                  <div style={{ background: C.dangerBg, borderRadius: 6, padding: "10px 12px", fontSize: 11, color: C.danger, fontFamily: "Assistant", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={12} /> לא נמצאו ראיות — נדרשת פעולה
                  </div>
                )}
              </div>

              {/* Linked Risks */}
              {linkedRisks.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <AlertTriangle size={12} color={C.warning} /> סיכונים מקושרים ({linkedRisks.length})
                  </h4>
                  {linkedRisks.map(risk => (
                    <div key={risk.id} style={{ background: C.borderLight, borderRadius: 6, padding: "8px 10px", marginBottom: 4, fontSize: 11, fontFamily: "Assistant" }}>
                      <span style={{ fontWeight: 600, color: C.textSec, fontFamily: "Rubik", marginLeft: 4 }}>{risk.id}</span> {risk.name}
                      <div style={{ marginTop: 3 }}>
                        <RiskBadge level={risk.inherent} size="sm" />
                        <span style={{ margin: "0 4px", color: C.textMuted }}>→</span>
                        <RiskBadge level={calcResidual(risk.inherent, risk.controls)} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Controls */}
              {linkedControls.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <Shield size={12} color={C.success} /> בקרות מקושרות ({linkedControls.length})
                  </h4>
                  {linkedControls.map(ctrl => (
                    <div key={ctrl.id} style={{ background: C.borderLight, borderRadius: 6, padding: "8px 10px", marginBottom: 4, fontSize: 11, fontFamily: "Assistant", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div><span style={{ fontWeight: 600, color: C.textSec, fontFamily: "Rubik" }}>{ctrl.id}</span> {ctrl.name}</div>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: CTRL_EFF[ctrl.effectiveness].color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 700 }}>{ctrl.effectiveness}</div>
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

// ═══════════════════════════════════════════════
// NuTeLa — AI Assistant Avatar & Panel
// ═══════════════════════════════════════════════
const NuTelaAvatar = ({ size = 44, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={animate ? { animation: "nutelaFloat 3s ease-in-out infinite" } : {}}>
    <defs>
      {/* Main egg body — vivid electric gradient */}
      <linearGradient id="ntlEgg" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="#00D4FF" />
        <stop offset="35%" stopColor="#7B61FF" />
        <stop offset="70%" stopColor="#BD34FE" />
        <stop offset="100%" stopColor="#FF6B9D" />
      </linearGradient>
      {/* Glass shine overlay */}
      <linearGradient id="ntlShine" x1="0.3" y1="0" x2="0.7" y2="0.6">
        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
        <stop offset="40%" stopColor="white" stopOpacity="0.08" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      {/* Glow filter */}
      <filter id="ntlGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      {/* Outer glow */}
      <radialGradient id="ntlAura" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stopColor="#7B61FF" stopOpacity="0" />
        <stop offset="85%" stopColor="#BD34FE" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0.04" />
      </radialGradient>
      {/* Face area gradient */}
      <radialGradient id="ntlFace" cx="50%" cy="45%" r="35%">
        <stop offset="0%" stopColor="white" stopOpacity="0.55" />
        <stop offset="100%" stopColor="white" stopOpacity="0.08" />
      </radialGradient>
      {/* Eye sparkle */}
      <radialGradient id="ntlEyeGlow" cx="40%" cy="35%" r="50%">
        <stop offset="0%" stopColor="white" />
        <stop offset="100%" stopColor="#F0F4FF" />
      </radialGradient>
    </defs>

    {/* Aura glow ring */}
    <circle cx="50" cy="52" r="48" fill="url(#ntlAura)" />

    {/* Egg body — main shape */}
    <ellipse cx="50" cy="55" rx="30" ry="37" fill="url(#ntlEgg)" filter="url(#ntlGlow)" />

    {/* Glass shine layer */}
    <ellipse cx="50" cy="55" rx="30" ry="37" fill="url(#ntlShine)" />

    {/* Subtle rim light */}
    <ellipse cx="50" cy="55" rx="30" ry="37" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

    {/* Inner face glow area */}
    <ellipse cx="50" cy="48" rx="20" ry="18" fill="url(#ntlFace)" />

    {/* Left eye — big kawaii style */}
    <ellipse cx="40" cy="46" rx="7.5" ry="8.5" fill="url(#ntlEyeGlow)" />
    <ellipse cx="40" cy="46" rx="7" ry="8" fill="white" />
    <circle cx="41.5" cy="45" r="5" fill="#1E1B4B" />
    <circle cx="43.5" cy="43" r="2.2" fill="white" />
    <circle cx="39" cy="47" r="1" fill="white" opacity="0.6" />

    {/* Right eye */}
    <ellipse cx="60" cy="46" rx="7.5" ry="8.5" fill="url(#ntlEyeGlow)" />
    <ellipse cx="60" cy="46" rx="7" ry="8" fill="white" />
    <circle cx="61.5" cy="45" r="5" fill="#1E1B4B" />
    <circle cx="63.5" cy="43" r="2.2" fill="white" />
    <circle cx="59" cy="47" r="1" fill="white" opacity="0.6" />

    {/* Blush — vivid pink glow */}
    <ellipse cx="30" cy="54" rx="5" ry="3" fill="#FF6B9D" opacity="0.3" />
    <ellipse cx="70" cy="54" rx="5" ry="3" fill="#FF6B9D" opacity="0.3" />

    {/* Cute smile */}
    <path d="M 44 57 Q 47 61 50 57.5" fill="none" stroke="#7B61FF" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M 50 57.5 Q 53 61 56 57" fill="none" stroke="#7B61FF" strokeWidth="1.3" strokeLinecap="round" />

    {/* Tiny tongue */}
    <ellipse cx="50" cy="59.5" rx="2.2" ry="1.5" fill="#FF6B9D" opacity="0.7" />

    {/* NTL badge — frosted glass */}
    <rect x="36" y="68" rx="6" ry="6" width="28" height="12" fill="white" opacity="0.85" />
    <rect x="36" y="68" rx="6" ry="6" width="28" height="12" fill="none" stroke="rgba(123,97,255,0.3)" strokeWidth="0.5" />
    <text x="50" y="77" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="Rubik">
      <tspan fill="#7B61FF">N</tspan><tspan fill="#BD34FE">u</tspan><tspan fill="#7B61FF">T</tspan><tspan fill="#BD34FE">e</tspan><tspan fill="#7B61FF">L</tspan><tspan fill="#FF6B9D">a</tspan>
    </text>

    {/* Floating sparkles — neon */}
    <g style={{ animation: animate ? "nutelaSpin 8s linear infinite" : "none", transformOrigin: "50px 52px" }}>
      <circle cx="15" cy="30" r="2" fill="#00D4FF" opacity="0.8" />
      <circle cx="85" cy="28" r="1.5" fill="#FF6B9D" opacity="0.7" />
      <circle cx="12" cy="65" r="1.2" fill="#BD34FE" opacity="0.6" />
      <circle cx="88" cy="70" r="1.8" fill="#7B61FF" opacity="0.5" />
    </g>

    {/* Star sparkles */}
    <g style={{ animation: animate ? "nutelaPulse 2s ease infinite" : "none" }}>
      <path d="M 22 20 L 23 17 L 24 20 L 27 21 L 24 22 L 23 25 L 22 22 L 19 21 Z" fill="#FFD700" opacity="0.9" />
    </g>
    <g style={{ animation: animate ? "nutelaPulse 2s ease infinite 0.7s" : "none" }}>
      <path d="M 78 18 L 79 16 L 80 18 L 82 19 L 80 20 L 79 22 L 78 20 L 76 19 Z" fill="#00D4FF" opacity="0.8" />
    </g>
    <g style={{ animation: animate ? "nutelaPulse 2s ease infinite 1.3s" : "none" }}>
      <path d="M 90 50 L 91 48 L 92 50 L 94 51 L 92 52 L 91 54 L 90 52 L 88 51 Z" fill="#FF6B9D" opacity="0.7" />
    </g>
  </svg>
);

const NUTELA_TIPS = {
  generic: "היי! 👋 אני NuTeLa, עוזרת הסיכונים שלך.\n\nלא בטוח איך לדרג את הבקרה? הנה כלל אצבע:\n\n1 = לא קיימת — אין שום דבר מיושם\n2 = חלקית — יש תהליך אבל לא עקבי\n3 = מיושמת — עובד, אבל יש פערים\n4 = אפקטיבית — עובד טוב, מתועד\n5 = אפקטיבית מאוד — עובד מצוין, נבדק, מוכח",
  מדיניות: "💡 מדיניות טובה צריכה לעמוד ב-3 תנאים:\n\n✓ מאושרת ע״י דירקטוריון\n✓ מעודכנת ב-12 חודשים אחרונים\n✓ מופצת לכל הגורמים הרלוונטיים\n\nכל השלושה → 5\nחסר אישור או לא מעודכנת → 2-3\nלא קיימת → 1",
  גיבוי: "💾 גיבוי לא שווה כלום אם לא נבדק!\n\n✓ גיבוי אוטומטי + שחזור מוצלח → 4-5\n✓ גיבוי אוטומטי ללא בדיקה → 2-3\n✗ גיבוי ידני או חסר → 1\n\nטיפ: בדיקת שחזור חצי-שנתית מעלה את הדירוג",
  הדרכה: "📚 הדרכה זה לא רק מצגת שנתית!\n\n✓ הדרכה + מעקב השתתפות + מבחן → 5\n✓ הדרכה שנתית בלבד → 3\n✓ לא בוצעה השנה → 1-2\n\nטיפ: סימולציות פישינג נחשבות אפקטיביות מאוד",
  ניטור: "📊 ניטור אפקטיבי = בזמן אמת + התראות + מענה\n\n✓ SIEM/SOC פעיל 24/7 → 5\n✓ ניטור בשעות עבודה → 3\n✓ ניטור ידני/ספורדי → 1-2",
  הרשאות: "🔐 IAM חזק = ניהול מלא של מחזור חיי הגישה\n\n✓ IAM + MFA + סקירה רבעונית → 5\n✓ IAM בסיסי + MFA → 3-4\n✓ ניהול ידני, אין MFA → 1-2",
  ספקים: "🤝 בקרה על ספקים = לא רק חוזה!\n\n✓ הערכה שנתית + SLA + ביקורת → 5\n✓ חוזה + SLA בלבד → 3\n✓ אין הערכה סדורה → 1-2\n\nטיפ: ספקים קריטיים דורשים תוכנית יציאה",
  הצפנה: "🔒 הצפנה חייבת לכסות גם At-Rest וגם In-Transit\n\n✓ שניהם + ניהול מפתחות → 5\n✓ In-Transit בלבד → 3\n✓ אין הצפנה → 1",
};

const getNutelaTip = (ctrl) => {
  const name = ctrl.name.toLowerCase();
  if (name.includes("מדיניות") || name.includes("אישור")) return NUTELA_TIPS["מדיניות"];
  if (name.includes("גיבוי") || name.includes("שחזור") || name.includes("DR")) return NUTELA_TIPS["גיבוי"];
  if (name.includes("הדרכ") || name.includes("מודעות") || name.includes("סימולצי")) return NUTELA_TIPS["הדרכה"];
  if (name.includes("ניטור") || name.includes("SIEM") || name.includes("SOC")) return NUTELA_TIPS["ניטור"];
  if (name.includes("הרשאות") || name.includes("IAM") || name.includes("MFA") || name.includes("גישה")) return NUTELA_TIPS["הרשאות"];
  if (name.includes("ספק") || name.includes("SLA") || name.includes("NDA") || name.includes("SOC2")) return NUTELA_TIPS["ספקים"];
  if (name.includes("הצפנ") || name.includes("DLP")) return NUTELA_TIPS["הצפנה"];
  return NUTELA_TIPS.generic;
};

function NuTelaPanel({ ctrl, onClose }) {
  const [typing, setTyping] = useState(true);
  const [input, setInput] = useState("");
  const tip = ctrl ? getNutelaTip(ctrl) : NUTELA_TIPS.generic;
  const lines = tip.split("\n").filter(Boolean);

  useEffect(() => {
    setTyping(true);
    const t1 = setTimeout(() => setTyping(false), 900);
    return () => clearTimeout(t1);
  }, [ctrl?.id]);

  const quickActions = ctrl ? [
    { label: "צור תבנית מסמך", icon: FileText, color: C.accent },
    { label: "הוסף למשימות", icon: CheckSquare, color: C.success },
    { label: "שלח לדירקטוריון", icon: Send, color: "#BD34FE" },
  ] : [
    { label: "סקירת ציות מהירה", icon: Shield, color: C.accent },
    { label: "הפק דוח סיכונים", icon: FileText, color: C.success },
    { label: "בדוק מצב משימות", icon: CheckSquare, color: "#BD34FE" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 90, left: 24, width: 380, maxHeight: 540, borderRadius: 20, boxShadow: "0 12px 60px rgba(123,97,255,0.2), 0 4px 20px rgba(189,52,254,0.1)", zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeInUp 0.3s ease-out", direction: "rtl", border: "1px solid rgba(123,97,255,0.15)" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #00D4FF 0%, #7B61FF 40%, #BD34FE 70%, #FF6B9D 100%)", padding: "18px 20px 14px", position: "relative", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -30, right: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", top: 10, right: 40, width: 4, height: 4, borderRadius: "50%", background: "#FFD700", opacity: 0.7 }} />
        <div style={{ position: "absolute", bottom: 15, left: 60, width: 3, height: 3, borderRadius: "50%", background: "#00D4FF", opacity: 0.6 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 4, backdropFilter: "blur(10px)" }}>
            <NuTelaAvatar size={40} animate={false} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontSize: 16, fontWeight: 800, fontFamily: "Rubik", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
              NuTeLa
              <span style={{ fontSize: 8, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10, fontWeight: 600, letterSpacing: 1 }}>AI</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Assistant", marginTop: 1 }}>יועצת סיכונים חכמה · מבית NTL</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE80" }} />
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}><X size={14} color="rgba(255,255,255,0.8)" /></button>
        </div>
      </div>

      {/* Context Banner */}
      {ctrl && (
        <div style={{ padding: "8px 18px", background: "linear-gradient(90deg, #EDE9FE, #E0F2FE)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
          <Shield size={12} color="#7B61FF" />
          <span style={{ fontSize: 11, color: "#7B61FF", fontFamily: "Rubik", fontWeight: 600 }}>שאלת על:</span>
          <span style={{ fontSize: 11, color: C.text, fontFamily: "Assistant", fontWeight: 500 }}>{ctrl.name}</span>
        </div>
      )}

      {/* Chat Area */}
      <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto", background: "linear-gradient(180deg, #FAFBFD 0%, #F5F7FA 100%)" }}>
        {typing ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, #7B61FF, #BD34FE)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <NuTelaAvatar size={22} animate={false} />
            </div>
            <div style={{ background: "white", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${C.borderLight}`, display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg, #7B61FF, #FF6B9D)", animation: `typingDot 1.2s ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeInUp 0.3s ease-out" }}>
            {/* AI Message */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, #7B61FF, #BD34FE)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <NuTelaAvatar size={22} animate={false} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: "white", borderRadius: "16px 16px 16px 4px", padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${C.borderLight}`, maxWidth: 290 }}>
                  {lines.map((line, i) => {
                    const isHighlight = line.startsWith("✓") || line.startsWith("✗") || line.startsWith("💡");
                    const isEmoji = /^[📚💾📊🔐🤝🔒⚠️]/.test(line);
                    return (
                      <div key={i} style={{
                        fontSize: 12, fontFamily: "Assistant", color: C.text, lineHeight: 1.8,
                        fontWeight: isHighlight || isEmoji ? 600 : 400,
                        background: isHighlight ? (line.startsWith("✓") ? `${C.success}08` : line.startsWith("✗") ? `${C.danger}08` : `${C.accent}08`) : "transparent",
                        borderRadius: isHighlight ? 6 : 0,
                        padding: isHighlight ? "2px 6px" : 0,
                        margin: isHighlight ? "2px 0" : 0,
                      }}>{line}</div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik", marginTop: 4, marginRight: 4 }}>עכשיו · NuTeLa AI</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, fontFamily: "Rubik", marginBottom: 6, marginRight: 38 }}>פעולות מהירות</div>
              <div style={{ display: "flex", gap: 6, marginRight: 38, flexWrap: "wrap" }}>
                {quickActions.map((qa, i) => (
                  <button key={i} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", fontSize: 10, fontFamily: "Rubik", color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 500, transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = qa.color; e.currentTarget.style.background = `${qa.color}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "white"; }}>
                    <qa.icon size={11} color={qa.color} />{qa.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.borderLight}`, background: "white", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="שאל את NuTeLa..." style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 14px", fontSize: 12, fontFamily: "Assistant", color: C.text, outline: "none", background: C.borderLight, direction: "rtl", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7B61FF, #BD34FE)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <Send size={14} color="white" style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 16px", background: "linear-gradient(90deg, #F8FAFC, #F0ECFF)", borderTop: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Sparkles size={10} color="#BD34FE" />
          <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>Powered by NuTeLa AI · NTL Management</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 9, color: C.accent, fontFamily: "Rubik", fontWeight: 600, cursor: "pointer", padding: "2px 6px" }}>סגור</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// DOCUMENT TEMPLATES DATA
// ═══════════════════════════════════════════════
const DOC_TEMPLATES = [
  { id: "T01", name: "מדיניות ניהול סיכונים", cat: "ממשל", module: "gov", tier: "starter", status: "approved", date: "10/01/2026", version: "2.0" },
  { id: "T02", name: "מסמך תיאור תפקיד מנהל סיכונים", cat: "ממשל", module: "gov", tier: "starter", status: "approved", date: "15/12/2025", version: "1.2" },
  { id: "T03", name: "כתב מינוי מנהל סיכונים", cat: "ממשל", module: "gov", tier: "starter", status: "approved", date: "01/09/2025", version: "1.0" },
  { id: "T04", name: "פרוטוקול ועדת סיכונים", cat: "ממשל", module: "gov", tier: "starter", status: "approved", date: "20/12/2025", version: "Q4" },
  { id: "T05", name: "דוח רבעוני לדירקטוריון", cat: "ממשל", module: "gov", tier: "starter", status: "draft", date: "—", version: "Q1/26" },
  { id: "T06", name: "מתודולוגיה להערכת סיכונים", cat: "תפעולי", module: "ops", tier: "starter", status: "approved", date: "05/01/2026", version: "1.1" },
  { id: "T07", name: "נוהל ניהול אירועי כשל תפעולי", cat: "תפעולי", module: "ops", tier: "starter", status: "approved", date: "10/11/2025", version: "1.0" },
  { id: "T08", name: "נוהל מניעת הונאה", cat: "תפעולי", module: "ops", tier: "starter", status: "draft", date: "—", version: "0.9" },
  { id: "T09", name: "מדיניות מיקור חוץ", cat: "מיקור חוץ", module: "out", tier: "starter", status: "approved", date: "01/10/2025", version: "1.0" },
  { id: "T10", name: "תוכנית המשכיות עסקית (BCP)", cat: "המשכיות", module: "bcp", tier: "starter", status: "review", date: "15/08/2025", version: "1.0" },
  { id: "T11", name: "ניתוח השפעה עסקית (BIA)", cat: "המשכיות", module: "bcp", tier: "starter", status: "missing", date: "—", version: "—" },
  { id: "T12", name: "תוכנית Disaster Recovery", cat: "המשכיות", module: "bcp", tier: "starter", status: "review", date: "20/09/2025", version: "1.0" },
  { id: "T13", name: "רשימת ספקים קריטיים", cat: "מיקור חוץ", module: "out", tier: "starter", status: "approved", date: "01/12/2025", version: "2.0" },
  { id: "T14", name: "טופס הערכת סיכוני ספק", cat: "מיקור חוץ", module: "out", tier: "starter", status: "approved", date: "01/12/2025", version: "1.0" },
  { id: "T20", name: "מדיניות אבטחת מידע וסייבר", cat: "ממשל סייבר", module: "cgov", tier: "pro", status: "draft", date: "—", version: "1.0" },
  { id: "T21", name: "תוכנית עבודה שנתית סייבר", cat: "ממשל סייבר", module: "cgov", tier: "pro", status: "missing", date: "—", version: "—" },
  { id: "T22", name: "מרשם נכסי מידע", cat: "ממשל סייבר", module: "cgov", tier: "pro", status: "draft", date: "—", version: "0.8" },
  { id: "T23", name: "נוהל תגובה לאירוע סייבר (IRP)", cat: "אירועי סייבר", module: "cinc", tier: "pro", status: "approved", date: "15/07/2025", version: "1.1" },
  { id: "T24", name: "טופס דיווח אירוע סייבר לרשות", cat: "אירועי סייבר", module: "cinc", tier: "pro", status: "approved", date: "15/07/2025", version: "1.0" },
  { id: "T25", name: "דוח מבחן חדירה", cat: "הגנת סייבר", module: "cpro", tier: "pro", status: "missing", date: "—", version: "—" },
  { id: "T26", name: "דוח סריקת פגיעויות", cat: "הגנת סייבר", module: "cpro", tier: "pro", status: "review", date: "30/11/2025", version: "Q4" },
];
const DOC_STATUS = { approved: { l: "מאושר", c: C.success, bg: C.successBg }, draft: { l: "טיוטה", c: C.warning, bg: C.warningBg }, review: { l: "בסקירה", c: C.accent, bg: C.accentLight }, missing: { l: "חסר", c: C.danger, bg: C.dangerBg } };

// ═══════════════════════════════════════════════
// DOCUMENT GENERATOR — all org docs
// ═══════════════════════════════════════════════
function generateDocPreview(docId) {
  const doc = DOC_TEMPLATES.find(d => d.id === docId);
  if (!doc) return null;
  const css = `
    body{font-family:Arial,sans-serif;direction:rtl;color:#333;line-height:1.8;font-size:11pt}
    h1{color:#1F3A5F;font-size:20pt;border-bottom:3px solid #4A8EC2;padding-bottom:8px;margin:20pt 0 12pt}
    h2{color:#4A8EC2;font-size:14pt;margin:16pt 0 8pt}
    h3{color:#1F3A5F;font-size:12pt;margin:10pt 0 6pt}
    table{border-collapse:collapse;width:100%;margin:8pt 0 14pt;font-size:10pt}
    th{background:#1F3A5F;color:white;padding:7px 10px;text-align:right;font-size:9pt}
    td{padding:6px 10px;border:1px solid #ddd}
    tr:nth-child(even){background:#F8FAFB}
    .cover{text-align:center;padding-top:80px;page-break-after:always}
    .cover h1{border:none;color:#1F3A5F;font-size:26pt}
    .meta td{border:none;padding:3px 10px}
    ul{margin:6pt 20pt 12pt 0;padding-right:16pt}li{margin-bottom:5pt}
    .footer{font-size:8pt;color:#999;text-align:center;border-top:1px solid #ddd;padding-top:6px;margin-top:30px}
    .pb{page-break-before:always}
    .stamp{display:inline-block;border:2px solid #27AE60;color:#27AE60;padding:4px 14px;border-radius:4px;font-weight:bold;font-size:10pt;margin:10px 0}
    .stamp-draft{border-color:#D4A017;color:#D4A017}
  `;
  const co = "אשראי פייננס בע״מ";
  const stampHtml = doc.status === "approved" ? '<div class="stamp">מאושר</div>' : doc.status === "draft" ? '<div class="stamp stamp-draft">טיוטה</div>' : '';
  const coverHtml = `<div class="cover">
    <div style="font-size:18pt;color:#4A8EC2;font-weight:bold">RiskGuard</div>
    <div style="font-size:9pt;color:#999;margin-bottom:30px">NTL Management</div>
    <hr style="border:none;border-top:2px solid #4A8EC2;margin:20px auto;width:50%">
    <h1>${doc.name}</h1>
    <div style="font-size:11pt;color:#7F8C8D;margin-bottom:20px">${co}</div>
    ${stampHtml}
    <table class="meta" style="width:auto;margin:20px auto"><tr><td><b>גרסה:</b></td><td>${doc.version}</td></tr><tr><td><b>תאריך:</b></td><td>${doc.date !== "—" ? doc.date : "טרם נקבע"}</td></tr><tr><td><b>קטגוריה:</b></td><td>${doc.cat}</td></tr><tr><td><b>סיווג:</b></td><td style="color:#C0392B;font-weight:bold">סודי</td></tr></table>
  </div>`;

  const D = {
    T01: `<h1>מדיניות ניהול סיכונים</h1>
<h2>1. מטרה</h2><p>מסמך זה מגדיר את מדיניות ניהול הסיכונים של ${co}, בהתאם לחוזר רשות שוק ההון 2024-10-2.</p>
<h2>2. תחולה</h2><p>המדיניות חלה על כלל פעילויות החברה, כלל העובדים, הנהלה ודירקטוריון.</p>
<h2>3. עקרונות מנחים</h2>
<ul><li>ניהול סיכונים הוא חלק אינטגרלי מתהליכי קבלת ההחלטות בחברה.</li><li>החברה מיישמת מודל שלוש קווי הגנה.</li><li>תיאבון הסיכון נקבע על ידי הדירקטוריון ומתעדכן שנתית.</li><li>כלל הסיכונים מנוהלים בגישה מבוססת הערכה כמותית ואיכותית.</li></ul>
<h2>4. מבנה ארגוני</h2>
<table><tr><th>גורם</th><th>תפקיד</th><th>אחריות</th></tr>
<tr><td><b>דירקטוריון</b></td><td>גוף מפקח</td><td>אישור מדיניות, תיאבון סיכון, פיקוח עליון</td></tr>
<tr><td><b>ועדת סיכונים</b></td><td>ועדה מקצועית</td><td>סקירת מפת סיכונים, אישור מתודולוגיות, מעקב KRI</td></tr>
<tr><td><b>מנהל סיכונים</b></td><td>קו הגנה שני</td><td>ניהול שוטף, דוחות, תיאום, ייעוץ</td></tr>
<tr><td><b>הנהלה</b></td><td>קו הגנה ראשון</td><td>זיהוי וניהול סיכונים בתחומם</td></tr>
<tr><td><b>ביקורת פנימית</b></td><td>קו הגנה שלישי</td><td>ביקורת עצמאית, הערכת אפקטיביות</td></tr></table>
<h2>5. תהליך ניהול סיכונים</h2>
<ul><li><b>זיהוי</b> — מיפוי שוטף של סיכונים חדשים וקיימים.</li><li><b>הערכה</b> — כימות סבירות והשפעה (מטריצה 5×5).</li><li><b>תגובה</b> — הגדרת בקרות מתאימות (הימנעות, הפחתה, העברה, קבלה).</li><li><b>ניטור</b> — מעקב שוטף אחר KRI, בקרות ואירועים.</li><li><b>דיווח</b> — דיווח רבעוני לדירקטוריון ולרגולטור.</li></ul>
<h2>6. תיאבון סיכון</h2>
<table><tr><th>סוג סיכון</th><th>סף עליון</th><th>פעולה נדרשת</th></tr>
<tr><td>סיכון אשראי</td><td>NPL ≤ 5%</td><td>דיווח מיידי + תוכנית הפחתה</td></tr>
<tr><td>ריכוזיות</td><td>≤ 30% לענף</td><td>צמצום חשיפה בתוך רבעון</td></tr>
<tr><td>סיכון תפעולי</td><td>≤ 5 אירועים/רבעון</td><td>ניתוח שורשי + בקרה מתקנת</td></tr>
<tr><td>סיכון סייבר</td><td>0 פריצות</td><td>תגובה מיידית + דיווח לרגולטור</td></tr></table>
<h2>7. דיווח ובקרה</h2><p>דוח ציות רבעוני יוגש לוועדת הסיכונים ולדירקטוריון. דוח שנתי מקיף יוגש לרשות שוק ההון.</p>
<h2>8. עדכון המדיניות</h2><p>מדיניות זו תיסקר ותעודכן לפחות אחת לשנה, או בעקבות שינוי מהותי בסביבה הרגולטורית.</p>`,

    T02: `<h1>תיאור תפקיד — מנהל סיכונים ראשי</h1>
<h2>פרטי התפקיד</h2>
<table><tr><th>שדה</th><th>פירוט</th></tr>
<tr><td>תפקיד</td><td>מנהל סיכונים ראשי (CRO)</td></tr>
<tr><td>כפיפות</td><td>מנכ״ל + דיווח ישיר לדירקטוריון</td></tr>
<tr><td>היקף</td><td>משרה מלאה</td></tr></table>
<h2>תחומי אחריות</h2>
<ul><li>ניהול מערך ניהול הסיכונים הארגוני.</li><li>הכנת דוחות ציות רבעוניים ושנתיים.</li><li>ניטור מדדי סיכון (KRI) ודיווח חריגות.</li><li>ניהול מפת סיכונים ובקרות.</li><li>תיאום עם רגולטורים וביקורת פנימית.</li><li>הכשרת עובדים בנושאי סיכון וציות.</li><li>ייעוץ להנהלה בנושאי סיכון.</li></ul>
<h2>דרישות התפקיד</h2>
<ul><li>תואר ראשון במנהל עסקים, כלכלה או תחום רלוונטי.</li><li>ניסיון של 5+ שנים בניהול סיכונים במוסד פיננסי.</li><li>היכרות עם חוזרי רשות שוק ההון.</li><li>יכולת ניתוח נתונים וכתיבת דוחות.</li></ul>`,

    T03: `<h1>כתב מינוי — מנהל סיכונים</h1>
<p>בהתאם לסעיף 3.1 בחוזר ניהול סיכונים 2024-10-2, הרינו ממנים בזאת:</p>
<table><tr><td><b>שם:</b></td><td>יוסי לוי</td></tr>
<tr><td><b>תפקיד:</b></td><td>מנהל סיכונים ראשי</td></tr>
<tr><td><b>תחילת מינוי:</b></td><td>01/09/2025</td></tr>
<tr><td><b>מדווח ל:</b></td><td>מנכ״ל + דירקטוריון</td></tr></table>
<h2>סמכויות</h2>
<ul><li>גישה מלאה לכלל מערכות המידע הרלוונטיות.</li><li>זכות דיווח ישיר לדירקטוריון.</li><li>סמכות להמליץ על עצירת פעילות בסיכון גבוה.</li><li>תקציב ייעודי לניהול סיכונים.</li></ul>
<p style="margin-top:30px"><b>חתימת יו״ר דירקטוריון:</b> _________________ &nbsp;&nbsp; <b>תאריך:</b> 01/09/2025</p>
<p><b>חתימת מנכ״ל:</b> _________________ &nbsp;&nbsp; <b>תאריך:</b> 01/09/2025</p>`,

    T04: `<h1>פרוטוקול ועדת סיכונים</h1>
<table><tr><td><b>תאריך:</b></td><td>15/01/2026</td></tr><tr><td><b>יו״ר:</b></td><td>רונית גולד</td></tr><tr><td><b>משתתפים:</b></td><td>אבי שרון, משה דוד, יוסי לוי</td></tr><tr><td><b>מספר ישיבה:</b></td><td>2026-01</td></tr></table>
<h2>סדר יום</h2>
<ul><li>סקירת מפת סיכונים Q4/2025</li><li>אישור תקציב הגנת סייבר 2026</li><li>דיווח ריכוזיות אשראי</li></ul>
<h2>דיון וממצאים</h2>
<h3>1. מפת סיכונים Q4</h3><p>מנהל הסיכונים הציג את מפת הסיכונים המעודכנת. 5 סיכונים עיקריים זוהו, מתוכם 2 עם מגמת החמרה.</p>
<h3>2. תקציב סייבר</h3><p>הוצגה בקשת תקציב בסך ₪280K להגנת סייבר. כולל: EDR, הדרכות, מבדק חדירה.</p>
<h3>3. ריכוזיות</h3><p>ריכוזיות ענפית עומדת על 34% — חריגה מסף 30%. נדרשת תוכנית צמצום.</p>
<h2>החלטות</h2>
<table><tr><th>מס׳</th><th>החלטה</th><th>אחראי</th><th>יעד</th></tr>
<tr><td>D01</td><td>אושרה מדיניות ניהול סיכונים 2026</td><td>יוסי לוי</td><td>28/02/2026</td></tr>
<tr><td>D02</td><td>תקציב סייבר ₪280K — אושר</td><td>דנה כהן</td><td>—</td></tr>
<tr><td>D03</td><td>צמצום ריכוזיות נדל״ן ל-30%</td><td>יוסי לוי</td><td>30/06/2026</td></tr></table>`,

    T05: `<h1>דוח רבעוני לדירקטוריון — Q1/2026</h1>
<div class="stamp stamp-draft">טיוטה — טרם הושלם</div>
<h2>תוכן עניינים</h2>
<ul><li>סיכום מנהלים</li><li>סטטוס עמידה רגולטורית</li><li>מפת סיכונים</li><li>מדדי סיכון (KRI)</li><li>מעקב החלטות</li><li>תוכנית פעולה</li></ul>
<p style="color:#D4A017;font-weight:bold;margin-top:20px">הדוח בהכנה — צפוי להיות מוכן עד 20/03/2026.</p>`,

    T06: `<h1>מתודולוגיה להערכת סיכונים</h1>
<h2>1. מטרה</h2><p>הגדרת מתודולוגיה אחידה להערכת סיכונים ב-${co}.</p>
<h2>2. מטריצת סיכון</h2><p>הערכה מבוססת שני צירים: סבירות (1-5) והשפעה (1-5).</p>
<table><tr><th>ציון</th><th>סבירות</th><th>השפעה</th></tr>
<tr><td>1</td><td>נדירה</td><td>זניחה</td></tr><tr><td>2</td><td>נמוכה</td><td>קלה</td></tr><tr><td>3</td><td>בינונית</td><td>משמעותית</td></tr><tr><td>4</td><td>גבוהה</td><td>חמורה</td></tr><tr><td>5</td><td>גבוהה מאוד</td><td>קריטית</td></tr></table>
<h2>3. רמות סיכון</h2>
<table><tr><th>ציון</th><th>רמה</th><th>תגובה נדרשת</th></tr>
<tr><td style="color:#C0392B;font-weight:bold">15-25</td><td>קריטי</td><td>טיפול מיידי, דיווח לדירקטוריון</td></tr>
<tr><td style="color:#E67E22;font-weight:bold">8-14</td><td>גבוה</td><td>תוכנית הפחתה, מעקב חודשי</td></tr>
<tr><td style="color:#D4A017;font-weight:bold">4-7</td><td>בינוני</td><td>בקרה שוטפת, מעקב רבעוני</td></tr>
<tr><td style="color:#27AE60;font-weight:bold">1-3</td><td>נמוך</td><td>ניטור שגרתי</td></tr></table>
<h2>4. אפקטיביות בקרות</h2>
<table><tr><th>ציון</th><th>תיאור</th></tr>
<tr><td>5 — מלאה</td><td>בקרה פועלת באופן מלא ומתועדת</td></tr>
<tr><td>4 — טובה</td><td>בקרה פועלת עם ליקויים קלים</td></tr>
<tr><td>3 — חלקית</td><td>בקרה קיימת אך לא עקבית</td></tr>
<tr><td>2 — חלשה</td><td>בקרה חלקית מאוד, פערים משמעותיים</td></tr>
<tr><td>1 — לא קיימת</td><td>אין בקרה פעילה</td></tr></table>`,

    T07: `<h1>נוהל ניהול אירועי כשל תפעולי</h1>
<h2>1. הגדרות</h2><p><b>אירוע כשל תפעולי:</b> כל אירוע הנובע מכשל בתהליכים, מערכות, אנשים או גורמים חיצוניים.</p>
<h2>2. תהליך דיווח</h2>
<ul><li>כל עובד שזיהה אירוע ידווח מיידית למנהל הישיר.</li><li>המנהל הישיר ידווח למנהל סיכונים תוך 4 שעות.</li><li>אירוע מהותי (מעל ₪10K) — דיווח לדירקטוריון תוך 24 שעות.</li></ul>
<h2>3. סיווג אירועים</h2>
<table><tr><th>רמה</th><th>השפעה כספית</th><th>זמן תגובה</th></tr>
<tr><td style="color:#C0392B;font-weight:bold">קריטי</td><td>מעל ₪50K</td><td>מיידי</td></tr>
<tr><td style="color:#D4A017;font-weight:bold">מהותי</td><td>₪10K-50K</td><td>4 שעות</td></tr>
<tr><td>קל</td><td>מתחת ₪10K</td><td>24 שעות</td></tr></table>
<h2>4. ניתוח שורשי</h2><p>לכל אירוע יבוצע ניתוח שורש בעיה (Root Cause Analysis) תוך 5 ימי עבודה.</p>`,

    T08: `<h1>נוהל מניעת הונאה</h1>
<div class="stamp stamp-draft">טיוטה — v0.9</div>
<h2>1. מטרה</h2><p>הגדרת מנגנונים למניעה, זיהוי וטיפול בהונאות פנימיות וחיצוניות.</p>
<h2>2. עקרונות</h2>
<ul><li>הפרדת תפקידים בכל תהליך פיננסי קריטי.</li><li>ביקורות מפתיעות לפחות אחת לרבעון.</li><li>מנגנון whistleblowing אנונימי.</li><li>ניטור חריגות בזמן אמת.</li></ul>
<h2>3. בקרות עיקריות</h2>
<table><tr><th>בקרה</th><th>תדירות</th><th>אחראי</th></tr>
<tr><td>הפרדת הרשאות</td><td>שוטף</td><td>IT + HR</td></tr>
<tr><td>ביקורת מפתיעה</td><td>רבעוני</td><td>ביקורת פנימית</td></tr>
<tr><td>ניטור חריגות</td><td>יומי</td><td>מנהל סיכונים</td></tr></table>`,

    T09: `<h1>מדיניות מיקור חוץ</h1>
<h2>1. הגדרות</h2><p><b>מיקור חוץ מהותי:</b> העברת פעילות ליבה או תומכת ליבה לספק חיצוני.</p>
<h2>2. תהליך אישור</h2>
<ul><li>הערכת סיכוני ספק לפני חתימת חוזה.</li><li>אישור הנהלה לכל מיקור חוץ מהותי.</li><li>אישור דירקטוריון למיקור חוץ קריטי.</li></ul>
<h2>3. דרישות מינימום מספק</h2>
<table><tr><th>דרישה</th><th>פירוט</th></tr>
<tr><td>SLA</td><td>זמינות מינימלית 99.5%</td></tr>
<tr><td>אבטחת מידע</td><td>ISO 27001 או שווה ערך</td></tr>
<tr><td>BCP</td><td>תוכנית המשכיות עסקית מתועדת</td></tr>
<tr><td>ביקורת</td><td>זכות ביקורת ללא הודעה מוקדמת</td></tr>
<tr><td>חלופה</td><td>תוכנית יציאה ומעבר לספק חלופי</td></tr></table>`,

    T10: `<h1>תוכנית המשכיות עסקית (BCP)</h1>
<h2>1. מטרה</h2><p>הבטחת המשכיות הפעילות העסקית במקרה של שיבוש או אסון.</p>
<h2>2. תהליכים קריטיים</h2>
<table><tr><th>תהליך</th><th>RTO</th><th>RPO</th><th>חלופה</th></tr>
<tr><td><b>מערכת אשראי</b></td><td>4 שעות</td><td>1 שעה</td><td>DR Site</td></tr>
<tr><td><b>מערכת גבייה</b></td><td>8 שעות</td><td>4 שעות</td><td>DR Site</td></tr>
<tr><td><b>CRM</b></td><td>24 שעות</td><td>12 שעות</td><td>גיבוי ענן</td></tr>
<tr><td><b>אתר אינטרנט</b></td><td>12 שעות</td><td>4 שעות</td><td>CDN</td></tr></table>
<h2>3. צוות חירום</h2>
<table><tr><th>תפקיד</th><th>שם</th><th>טלפון</th></tr>
<tr><td>מנהל חירום</td><td>יוסי לוי</td><td>050-XXX-XXXX</td></tr>
<tr><td>IT ראשי</td><td>דנה כהן</td><td>050-XXX-XXXX</td></tr>
<tr><td>תפעול</td><td>רונית גולד</td><td>050-XXX-XXXX</td></tr></table>
<h2>4. תרגילים</h2><p>תרגיל DR שנתי. תרגיל שולחני רבעוני. תרגיל תקשורת חצי-שנתי.</p>`,

    T11: `<h1>ניתוח השפעה עסקית (BIA)</h1>
<div class="stamp stamp-draft">חסר — נדרשת הכנה</div>
<p style="color:#C0392B;font-weight:bold">מסמך זה טרם הוכן. יש להשלים BIA עד Q2/2026 בהתאם לדרישות חוזר 2024-10-2.</p>
<h2>תוכן נדרש</h2>
<ul><li>מיפוי תהליכים עסקיים קריטיים</li><li>הערכת השפעה (כספית, מוניטין, רגולטורית)</li><li>הגדרת RTO/RPO לכל תהליך</li><li>זיהוי תלויות בין תהליכים</li><li>תעדוף שחזור</li></ul>`,

    T12: `<h1>תוכנית Disaster Recovery</h1>
<h2>1. סביבת DR</h2><p>אתר DR ממוקם בענן AWS, אזור eu-west-1. גיבוי אוטומטי כל 4 שעות.</p>
<h2>2. נוהל הפעלה</h2>
<ul><li>זיהוי אסון → הפעלת צוות חירום (15 דקות)</li><li>הערכת נזק → החלטה על failover (30 דקות)</li><li>הפעלת DR → מעבר לאתר חלופי (4 שעות)</li><li>אימות → בדיקת תקינות נתונים (1 שעה)</li></ul>
<h2>3. בדיקות תקופתיות</h2>
<table><tr><th>סוג</th><th>תדירות</th><th>אחרון</th></tr>
<tr><td>Failover מלא</td><td>שנתי</td><td>09/2024</td></tr>
<tr><td>גיבוי ושחזור</td><td>רבעוני</td><td>12/2025</td></tr>
<tr><td>בדיקת תקשורת</td><td>חודשי</td><td>01/2026</td></tr></table>`,

    T13: `<h1>רשימת ספקים קריטיים</h1>
<table><tr><th>ספק</th><th>שירות</th><th>קריטיות</th><th>SLA</th><th>חוזה עד</th><th>חלופה</th></tr>
<tr><td><b>קלאוד-טק</b></td><td>שרתים + תשתית</td><td style="color:#C0392B">קריטי</td><td>99.9%</td><td>12/2026</td><td style="color:#27AE60">קיימת</td></tr>
<tr><td><b>פיננס-סופט</b></td><td>מערכת אשראי</td><td style="color:#C0392B">קריטי</td><td>99.5%</td><td>06/2027</td><td style="color:#C0392B">חסרה</td></tr>
<tr><td><b>סייבר-שילד</b></td><td>הגנת סייבר</td><td style="color:#D4A017">גבוה</td><td>99.8%</td><td>03/2026</td><td style="color:#27AE60">קיימת</td></tr>
<tr><td><b>דאטה-בק</b></td><td>גיבוי ושחזור</td><td style="color:#D4A017">גבוה</td><td>99.9%</td><td>09/2026</td><td style="color:#C0392B">חסרה</td></tr>
<tr><td><b>טלקום-פרו</b></td><td>תקשורת + אינטרנט</td><td>בינוני</td><td>99.5%</td><td>12/2025</td><td style="color:#27AE60">קיימת</td></tr>
<tr><td><b>HR-סרוויס</b></td><td>שירותי שכר</td><td>נמוך</td><td>99%</td><td>12/2026</td><td style="color:#27AE60">קיימת</td></tr></table>`,

    T14: `<h1>טופס הערכת סיכוני ספק</h1>
<table><tr><td><b>שם ספק:</b></td><td>_______________</td></tr><tr><td><b>שירות:</b></td><td>_______________</td></tr><tr><td><b>תאריך הערכה:</b></td><td>_______________</td></tr><tr><td><b>מעריך:</b></td><td>_______________</td></tr></table>
<h2>שאלון הערכה</h2>
<table><tr><th>#</th><th>קריטריון</th><th>ציון (1-5)</th><th>הערות</th></tr>
<tr><td>1</td><td>יציבות פיננסית</td><td>___</td><td></td></tr>
<tr><td>2</td><td>אבטחת מידע (ISO 27001)</td><td>___</td><td></td></tr>
<tr><td>3</td><td>המשכיות עסקית</td><td>___</td><td></td></tr>
<tr><td>4</td><td>עמידה ב-SLA</td><td>___</td><td></td></tr>
<tr><td>5</td><td>ניסיון בתחום</td><td>___</td><td></td></tr>
<tr><td>6</td><td>יכולת קנה מידה</td><td>___</td><td></td></tr>
<tr><td>7</td><td>תוכנית יציאה</td><td>___</td><td></td></tr></table>
<p style="margin-top:20px"><b>ציון כולל:</b> ___ / 35 &nbsp;&nbsp; <b>המלצה:</b> □ אשר □ דחה □ תנאי</p>
<p><b>חתימת מעריך:</b> _________________ &nbsp;&nbsp; <b>תאריך:</b> ___________</p>`,

    T20: `<h1>מדיניות אבטחת מידע וסייבר</h1>
<div class="stamp stamp-draft">טיוטה — v1.0</div>
<h2>1. מטרה</h2><p>הגדרת מדיניות אבטחת מידע והגנת סייבר בהתאם לחוזר 2022-10-9.</p>
<h2>2. עקרונות</h2>
<ul><li>הגנה רב-שכבתית (Defense in Depth).</li><li>מינימום הרשאות (Least Privilege).</li><li>הצפנת נתונים במנוחה ובתנועה.</li><li>ניטור 24/7.</li></ul>
<h2>3. תחומי אבטחה</h2>
<table><tr><th>תחום</th><th>בקרה</th><th>סטטוס</th></tr>
<tr><td>הגנת רשת</td><td>Firewall, IDS/IPS</td><td style="color:#27AE60">פעיל</td></tr>
<tr><td>הגנת נקודות קצה</td><td>EDR</td><td style="color:#27AE60">פעיל</td></tr>
<tr><td>הצפנה</td><td>AES-256 at rest, TLS 1.3</td><td style="color:#27AE60">פעיל</td></tr>
<tr><td>בקרת גישה</td><td>MFA, RBAC</td><td style="color:#D4A017">חלקי</td></tr>
<tr><td>סריקות חולשות</td><td>חודשי</td><td style="color:#C0392B">לא סדיר</td></tr></table>`,

    T21: `<h1>תוכנית עבודה שנתית סייבר</h1>
<div class="stamp stamp-draft">חסר — נדרשת הכנה</div>
<p style="color:#C0392B;font-weight:bold">מסמך זה טרם הוכן. יש להשלים תוכנית עבודה עד Q1/2026.</p>
<h2>סעיפים נדרשים</h2>
<ul><li>יעדי אבטחה שנתיים</li><li>תקציב הגנת סייבר</li><li>לוח זמנים לסריקות ומבדקים</li><li>תוכנית הדרכות</li><li>תרגילי סייבר</li></ul>`,

    T22: `<h1>מרשם נכסי מידע</h1>
<div class="stamp stamp-draft">טיוטה — v0.8</div>
<table><tr><th>נכס</th><th>סוג</th><th>סיווג</th><th>בעלים</th><th>מיקום</th></tr>
<tr><td>מערכת אשראי</td><td>אפליקציה</td><td style="color:#C0392B">קריטי</td><td>CTO</td><td>ענן + On-Prem</td></tr>
<tr><td>בסיס נתוני לקוחות</td><td>מאגר מידע</td><td style="color:#C0392B">קריטי</td><td>DBA</td><td>ענן</td></tr>
<tr><td>מערכת גבייה</td><td>אפליקציה</td><td style="color:#D4A017">גבוה</td><td>CTO</td><td>ענן</td></tr>
<tr><td>דוא״ל ארגוני</td><td>שירות</td><td style="color:#D4A017">גבוה</td><td>IT</td><td>ענן (M365)</td></tr>
<tr><td>אתר אינטרנט</td><td>אפליקציה</td><td>בינוני</td><td>שיווק</td><td>CDN</td></tr>
<tr><td>מערכת HR</td><td>אפליקציה</td><td>בינוני</td><td>HR</td><td>SaaS</td></tr></table>`,

    T23: `<h1>נוהל תגובה לאירוע סייבר (IRP)</h1>
<h2>1. שלבי תגובה</h2>
<table><tr><th>שלב</th><th>פעולה</th><th>זמן</th><th>אחראי</th></tr>
<tr><td>1. זיהוי</td><td>איתור ואישור האירוע</td><td>15 דקות</td><td>SOC / IT</td></tr>
<tr><td>2. הערכה</td><td>סיווג חומרה, היקף פגיעה</td><td>30 דקות</td><td>מנהל סייבר</td></tr>
<tr><td>3. בלימה</td><td>בידוד מערכות, חסימת וקטור</td><td>1 שעה</td><td>IT + סייבר</td></tr>
<tr><td>4. חקירה</td><td>ניתוח פורנזי, זיהוי שורש</td><td>24 שעות</td><td>צוות חקירה</td></tr>
<tr><td>5. שחזור</td><td>שחזור מגיבוי, אימות</td><td>4-24 שעות</td><td>IT</td></tr>
<tr><td>6. דיווח</td><td>דיווח לרגולטור ולהנהלה</td><td>24 שעות</td><td>מנהל סיכונים</td></tr>
<tr><td>7. לקחים</td><td>ניתוח post-mortem, שיפורים</td><td>5 ימים</td><td>צוות סייבר</td></tr></table>
<h2>2. דיווח למערך הסייבר הלאומי</h2><p>דיווח לרשות מערכות מידע ממשלתיות (ISA) תוך 24 שעות מאירוע מהותי.</p>`,

    T24: `<h1>טופס דיווח אירוע סייבר לרשות</h1>
<table><tr><td><b>שם המוסד:</b></td><td>${co}</td></tr>
<tr><td><b>תאריך אירוע:</b></td><td>_______________</td></tr>
<tr><td><b>תאריך דיווח:</b></td><td>_______________</td></tr>
<tr><td><b>מדווח:</b></td><td>_______________</td></tr></table>
<h2>פרטי האירוע</h2>
<table><tr><td><b>סוג אירוע:</b></td><td>□ כופרה □ פישינג □ דלף מידע □ DDoS □ אחר: ____</td></tr>
<tr><td><b>חומרה:</b></td><td>□ קריטי □ גבוה □ בינוני □ נמוך</td></tr>
<tr><td><b>מערכות שנפגעו:</b></td><td>_______________</td></tr>
<tr><td><b>נתונים שנחשפו:</b></td><td>□ כן □ לא □ לא ידוע</td></tr>
<tr><td><b>מספר לקוחות שנפגעו:</b></td><td>_______________</td></tr></table>
<h2>פעולות שננקטו</h2>
<table><tr><td><b>בלימה:</b></td><td>_______________</td></tr>
<tr><td><b>שחזור:</b></td><td>_______________</td></tr>
<tr><td><b>הודעה ללקוחות:</b></td><td>□ בוצעה □ לא נדרשת □ בתכנון</td></tr></table>
<p style="margin-top:20px"><b>חתימה:</b> _________________ <b>תאריך:</b> ___________</p>`,

    T25: `<h1>דוח מבחן חדירה (Penetration Test)</h1>
<div class="stamp stamp-draft">חסר — טרם בוצע</div>
<p style="color:#C0392B;font-weight:bold">מבחן חדירה טרם בוצע. יש לבצע עד Q2/2026 בהתאם לחוזר 2022-10-9.</p>
<h2>דרישות</h2>
<ul><li>מבדק חיצוני ע״י חברה מאושרת</li><li>סקירת אפליקציות וובות</li><li>בדיקת תשתיות רשת</li><li>בדיקת הנדסה חברתית</li><li>דוח ממצאים + תוכנית תיקון</li></ul>`,

    T26: `<h1>דוח סריקת פגיעויות — Q4/2025</h1>
<h2>סיכום</h2><p>סריקה אחרונה בוצעה ב-30/11/2025. כלי: Nessus Professional.</p>
<table><tr><th>חומרה</th><th>כמות</th><th>טופלו</th><th>פתוחות</th></tr>
<tr><td style="color:#C0392B;font-weight:bold">קריטי</td><td>2</td><td>2</td><td>0</td></tr>
<tr><td style="color:#E67E22;font-weight:bold">גבוה</td><td>5</td><td>3</td><td>2</td></tr>
<tr><td style="color:#D4A017;font-weight:bold">בינוני</td><td>12</td><td>8</td><td>4</td></tr>
<tr><td>נמוך</td><td>23</td><td>15</td><td>8</td></tr></table>
<h2>פגיעויות פתוחות בעדיפות גבוהה</h2>
<table><tr><th>CVE</th><th>תיאור</th><th>מערכת</th><th>יעד תיקון</th></tr>
<tr><td>CVE-2025-1234</td><td>SQL Injection בממשק ניהול</td><td>CRM</td><td>15/02/2026</td></tr>
<tr><td>CVE-2025-5678</td><td>XSS בפורטל לקוחות</td><td>אתר</td><td>28/02/2026</td></tr></table>`,
  };

  const content = D[docId] || `<h1>${doc.name}</h1><p>תוכן המסמך בהכנה.</p>`;
  const footer = `<div class="footer">סודי — ${co} | ${doc.date !== "—" ? doc.date : "טיוטה"} | RiskGuard</div>`;

  return { html: `<style>${css}</style>${coverHtml}${content}${footer}`, filename: doc.name };
}

// ═══════════════════════════════════════════════
// 360° LINKAGE: Control → Docs → Evidence
// ═══════════════════════════════════════════════
const CTRL_DOCS = {
  C01: { docs: ["T01"], evidence: [{ id: "E01", desc: "פרוטוקול דירקטוריון מ-10/01/2026 — אישור מדיניות", status: "verified", date: "10/01/2026" }] },
  C02: { docs: ["T01"], evidence: [{ id: "E02", desc: "סיכום סקירה שנתית למדיניות", status: "verified", date: "10/01/2026" }] },
  C03: { docs: ["T05","T04"], evidence: [{ id: "E03", desc: "דוח Q4/2025 שהוצג לדירקטוריון", status: "verified", date: "20/12/2025" }, { id: "E04", desc: "פרוטוקול ועדת סיכונים Q4", status: "verified", date: "20/12/2025" }] },
  C04: { docs: ["T04"], evidence: [{ id: "E05", desc: "תוכנית עבודה שנתית ועדת סיכונים", status: "partial", date: "01/01/2026" }] },
  C05: { docs: ["T03"], evidence: [{ id: "E06", desc: "כתב מינוי חתום — יוסי לוי", status: "verified", date: "01/09/2025" }] },
  C06: { docs: ["T02"], evidence: [{ id: "E07", desc: "מסמך JD חתום ע״י מנכ״ל", status: "verified", date: "15/12/2025" }] },
  C07: { docs: ["T06"], evidence: [{ id: "E08", desc: "מתודולוגיה v1.1 מאושרת", status: "verified", date: "05/01/2026" }] },
  C08: { docs: ["T06"], evidence: [{ id: "E09", desc: "סקר סיכונים שנתי — טרם הושלם", status: "missing", date: "—" }] },
  C09: { docs: [], evidence: [{ id: "E10", desc: "חוזה SLA עם ספק Core Banking", status: "verified", date: "01/06/2025" }] },
  C10: { docs: ["T12"], evidence: [{ id: "E11", desc: "תוכנית DR — בסקירה", status: "partial", date: "20/09/2025" }] },
  C11: { docs: [], evidence: [{ id: "E12", desc: "צילום מסך לוח ניטור Datadog", status: "verified", date: "15/02/2026" }] },
  C12: { docs: [], evidence: [{ id: "E13", desc: "אישור הטמעת מערכת Scoring", status: "verified", date: "01/03/2025" }] },
  C13: { docs: [], evidence: [{ id: "E14", desc: "נוהל Dual Approval חתום", status: "verified", date: "01/06/2025" }] },
  C14: { docs: [], evidence: [{ id: "E15", desc: "דוח Reconciliation יומי — דוגמה", status: "verified", date: "14/02/2026" }] },
  C16: { docs: [], evidence: [{ id: "E16", desc: "לוג גיבוי AWS S3 — ינואר 2026", status: "verified", date: "31/01/2026" }] },
  C17: { docs: ["T12"], evidence: [{ id: "E17", desc: "דוח בדיקת שחזור — טרם בוצע", status: "missing", date: "—" }] },
  C18: { docs: ["T08"], evidence: [{ id: "E18", desc: "אישור הפעלת מודול Anti-Fraud", status: "partial", date: "01/11/2025" }] },
  C19: { docs: ["T08"], evidence: [{ id: "E19", desc: "דוח ביקורת פנימית Q3/2025", status: "verified", date: "30/09/2025" }] },
  C20: { docs: ["T13"], evidence: [{ id: "E20", desc: "טבלת מיפוי ספקים קריטיים", status: "verified", date: "01/12/2025" }] },
  C21: { docs: ["T09"], evidence: [{ id: "E21", desc: "סעיף Exit Strategy — חסר ב-2 חוזים", status: "partial", date: "—" }] },
  C22: { docs: ["T14"], evidence: [{ id: "E22", desc: "תעודת SOC2 קלאודפיי — בתוקף", status: "verified", date: "15/06/2025" }, { id: "E23", desc: "ISO27001 — ממתין לחידוש", status: "partial", date: "—" }] },
  C23: { docs: ["T14"], evidence: [{ id: "E24", desc: "טופס הערכת ספק — קלאודפיי 2025", status: "verified", date: "01/12/2025" }] },
  C24: { docs: ["T09"], evidence: [{ id: "E25", desc: "NDA חתום — קלאודפיי", status: "verified", date: "01/06/2025" }] },
  C25: { docs: [], evidence: [{ id: "E26", desc: "מטריצת הרשאות ספקים", status: "partial", date: "01/12/2025" }] },
  C26: { docs: ["T10"], evidence: [{ id: "E27", desc: "BCP לתרחיש כשל ספק — טיוטה", status: "partial", date: "15/08/2025" }] },
  C27: { docs: [], evidence: [{ id: "E28", desc: "SLA חתום — קלאודפיי", status: "verified", date: "01/06/2025" }] },
  C28: { docs: ["T10"], evidence: [{ id: "E29", desc: "BCP v1.0 — בסקירה", status: "partial", date: "15/08/2025" }] },
  C29: { docs: ["T11"], evidence: [{ id: "E30", desc: "BIA — חסר", status: "missing", date: "—" }] },
  C30: { docs: ["T12"], evidence: [{ id: "E31", desc: "DR Plan — בסקירה", status: "partial", date: "20/09/2025" }] },
  C31: { docs: ["T10"], evidence: [{ id: "E32", desc: "דוח תרגיל BCP — טרם בוצע", status: "missing", date: "—" }] },
  C32: { docs: [], evidence: [{ id: "E33", desc: "אישור גיבוי Off-Site", status: "verified", date: "01/01/2026" }] },
  C34: { docs: ["T20"], evidence: [{ id: "E34", desc: "טיוטת מדיניות סייבר v1.0", status: "partial", date: "—" }] },
  C36: { docs: ["T22"], evidence: [{ id: "E35", desc: "מרשם נכסים v0.8 — טיוטה", status: "partial", date: "—" }] },
  C37: { docs: [], evidence: [{ id: "E36", desc: "תוכנית הדרכה — טרם בוצע", status: "missing", date: "—" }] },
  C42: { docs: [], evidence: [{ id: "E37", desc: "אישור EDR פעיל CrowdStrike", status: "verified", date: "01/01/2026" }] },
  C43: { docs: ["T26"], evidence: [{ id: "E38", desc: "דוח סריקה Q4/2025", status: "verified", date: "30/11/2025" }] },
  C44: { docs: ["T25"], evidence: [{ id: "E39", desc: "מבחן חדירה — טרם בוצע", status: "missing", date: "—" }] },
  C54: { docs: [], evidence: [{ id: "E40", desc: "SIEM פעיל — Splunk Cloud", status: "verified", date: "01/01/2026" }] },
  C56: { docs: ["T23"], evidence: [{ id: "E41", desc: "IRP v1.1 מאושר", status: "verified", date: "15/07/2025" }] },
  C58: { docs: ["T24"], evidence: [{ id: "E42", desc: "טופס דיווח ISA — מוכן", status: "verified", date: "15/07/2025" }] },
};
const getCtrlDocs = (ctrlId) => CTRL_DOCS[ctrlId] || { docs: [], evidence: [] };
const getCtrlLinkedDocs = (ctrlId) => (CTRL_DOCS[ctrlId]?.docs || []).map(dId => DOC_TEMPLATES.find(d => d.id === dId)).filter(Boolean);
const getCtrlEvidence = (ctrlId) => CTRL_DOCS[ctrlId]?.evidence || [];
const EVIDENCE_STATUS = { verified: { l: "מאומת", c: C.success, bg: C.successBg }, partial: { l: "חלקי", c: C.warning, bg: C.warningBg }, missing: { l: "חסר", c: C.danger, bg: C.dangerBg } };
const getAllControls = (risks) => risks.flatMap(r => r.controls.map(c => ({ ...c, riskId: r.id, riskName: r.name, module: r.module, cat: r.cat })));
const ALL_CONTROLS = RISK_BANK.flatMap(r => r.controls.map(c => ({ ...c, riskId: r.id, riskName: r.name, module: r.module, cat: r.cat })));

const ALL_TASKS = [
  { id: "TK01", title: "השלמת BIA לפונקציות קריטיות", module: "bcp", reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-05", owner: "יוסי לוי", email: "yossi@credit-finance.co.il", due: "15/03/2026", status: "overdue", type: "task", notify: true, schedule: "15/03/2026 09:00", notes: "נדרש לתאם עם IT" },
  { id: "TK02", title: "דוח רבעוני Q1 לדירקטוריון", module: "gov", reg: "2024-10-2", section: "2(א)", reqId: "GOV-03", owner: "יוסי לוי", email: "yossi@credit-finance.co.il", due: "31/03/2026", status: "active", type: "task", notify: true, schedule: "25/03/2026 10:00", notes: "" },
  { id: "TK03", title: "סריקת פגיעויות Q1", module: "cpro", reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-06", owner: "דנה כהן", email: "dana@credit-finance.co.il", due: "31/03/2026", status: "pending", type: "task", notify: false, schedule: "", notes: "" },
  { id: "TK04", title: "חידוש הערכת ספק קלאודפיי", module: "out", reg: "2024-10-2", section: "2(ב)(4)", reqId: "OUT-04", owner: "יוסי לוי", email: "yossi@credit-finance.co.il", due: "15/04/2026", status: "pending", type: "task", notify: true, schedule: "10/04/2026 14:00", notes: "לבקש SOC2 חדש" },
  { id: "TK05", title: "מבחן חדירה שנתי", module: "cpro", reg: "2022-10-9", section: "4(ב)", reqId: "CYB-PRO-08", owner: "דנה כהן", email: "dana@credit-finance.co.il", due: "30/06/2026", status: "pending", type: "task", notify: false, schedule: "", notes: "" },
  { id: "TK06", title: "תרגיל BCP שנתי", module: "bcp", reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-02", owner: "יוסי לוי", email: "yossi@credit-finance.co.il", due: "30/04/2026", status: "pending", type: "task", notify: true, schedule: "28/04/2026 09:00", notes: "כולל כל הצוות" },
  { id: "TK07", title: "הדרכת מודעות סייבר שנתית", module: "cgov", reg: "2022-10-9", section: "3(א)", reqId: "CYB-GOV-03", owner: "NTL", email: "support@ntl-risk.co.il", due: "15/05/2026", status: "pending", type: "training", notify: true, schedule: "15/05/2026 11:00", notes: "הדרכה דרך NTL" },
  { id: "TK08", title: "סקירת הרשאות Q1", module: "cpro", reg: "2022-10-9", section: "4(ג)", reqId: "CYB-PRO-10", owner: "דנה כהן", email: "dana@credit-finance.co.il", due: "31/03/2026", status: "active", type: "task", notify: true, schedule: "28/03/2026 08:30", notes: "" },
  { id: "TK09", title: "עדכון מדיניות סייבר", module: "cgov", reg: "2022-10-9", section: "2(א)", reqId: "CYB-GOV-01", owner: "NTL", email: "support@ntl-risk.co.il", due: "28/02/2026", status: "active", type: "task", notify: true, schedule: "20/02/2026 10:00", notes: "טיוטה מוכנה" },
  { id: "TK10", title: "בדיקת שחזור חצי-שנתית", module: "bcp", reg: "2024-10-2", section: "2(ב)(5)", reqId: "BCP-04", owner: "יוסי לוי", email: "yossi@credit-finance.co.il", due: "30/06/2026", status: "pending", type: "task", notify: false, schedule: "", notes: "" },
];

const MODULE_META = {
  gov: { desc: "ממשל תאגידי לניהול סיכונים — דירקטוריון, מדיניות, דיווח", regLabel: "2024-10-2 § 2-3" },
  ops: { desc: "ניהול סיכון תפעולי — מערכות, תהליכים, כשלים, הונאה", regLabel: "2024-10-2 § 2(ב)(2-3)" },
  out: { desc: "ניהול מיקור חוץ — ספקים, חוזים, הערכת סיכונים", regLabel: "2024-10-2 § 2(ב)(4)" },
  bcp: { desc: "המשכיות עסקית — BCP, BIA, DR, תרגילים", regLabel: "2024-10-2 § 2(ב)(5)" },
  cgov: { desc: "ממשל סייבר — מדיניות, מודעות, מיפוי נכסים", regLabel: "2022-10-9 § 2-3" },
  cpro: { desc: "הגנת סייבר — EDR, פגיעויות, הרשאות, הצפנה", regLabel: "2022-10-9 § 4" },
  cinc: { desc: "אירועי סייבר — ניטור, תגובה, דיווח לרגולטור", regLabel: "2022-10-9 § 5" },
  credit: { desc: "ניהול סיכון אשראי — תיק אשראי, PD/LGD, ריכוזיות, הפרשות", regLabel: "2024-10-2 § 2(ב)(1)" },
  kri: { desc: "מדדי סיכון מפתח — ניטור ספים, התראות, דשבורד KRI", regLabel: "2024-10-2 § 2(ב)" },
  events: { desc: "דיווח אירועים — אירועי הפסד, כמעט-אירועים, דיווח לרגולטור", regLabel: "2024-10-2 § 2(ב)(3)" },
  reports: { desc: "מרכז דוחות — הפקת דוחות רגולטוריים, דוחות דירקטוריון, דוחות תקופתיים", regLabel: "2024-10-2 § 2(א)" },
};

// ═══════════════════════════════════════════════
// MODULE SCREEN — Generic for all 7 modules
// ═══════════════════════════════════════════════
function ModuleScreen({ moduleId, onNav, onOpenDetail, onPreviewDoc }) {
  const mod = ALL_MODULES.find(m => m.id === moduleId);
  const meta = MODULE_META[moduleId];
  if (!mod || !meta) return null;
  const Ic = mod.Icon;
  const color = mod.score >= 80 ? C.success : mod.score >= 50 ? C.warning : C.danger;
  const isPro = mod.reg === "cyber";

  const modRisks = RISK_BANK.filter(r => r.module === moduleId);
  const modDocs = DOC_TEMPLATES.filter(d => d.module === moduleId);
  const modTasks = ALL_TASKS.filter(t => t.module === moduleId);
  const regSections = REG_TREE.flatMap(r => r.sections).filter(s => s.reqs.some(req => RISK_BANK.filter(rb => rb.module === moduleId).some(rb => rb.reqId === req.reqId)));

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
            <Ic size={20} color={C.accent} /> {mod.name}
            {isPro && <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>PRO</span>}
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>{meta.desc}</p>
        </div>
        <div style={{ background: meta.regLabel.includes("2022") ? "#EDE9FE" : "#E0F2FE", color: meta.regLabel.includes("2022") ? "#7C3AED" : "#0369A1", fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
          <BookOpen size={12} /> חוזר {meta.regLabel}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { label: "ציון עמידה", value: `${mod.score}%`, c: color },
          { label: "דרישות שהושלמו", value: `${mod.met}/${mod.reqs}`, c: C.accent },
          { label: "סיכונים", value: modRisks.length, c: C.warning },
          { label: "משימות פתוחות", value: modTasks.filter(t => t.status !== "completed").length, c: modTasks.some(t => t.status === "overdue") ? C.danger : C.textSec },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: "Rubik" }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Risks */}
        <ChartCard title={`סיכונים (${modRisks.length})`} Icon={AlertTriangle}>
          {modRisks.map(r => {
            const res = calcResidual(r.inherent, r.controls);
            return (
              <div key={r.id} onClick={() => onOpenDetail ? onOpenDetail({ type: "risk", id: r.id }) : onNav("riskreg")} style={{ padding: "8px 0", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{r.name}</div>
                  <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{r.id} · § {r.section}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <RiskBadge level={r.inherent} size="sm" />
                  <span style={{ color: C.textMuted, fontSize: 10 }}>→</span>
                  <RiskBadge level={res} size="sm" />
                </div>
              </div>
            );
          })}
        </ChartCard>

        {/* Documents */}
        <ChartCard title={`מסמכים (${modDocs.length})`} Icon={FileText}>
          {modDocs.map(d => {
            const s = DOC_STATUS[d.status];
            return (
              <div key={d.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div onClick={() => onOpenDetail && onOpenDetail({ type: "doc", id: d.id })} style={{ flex: 1, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{d.name}</div>
                  <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{d.id} · v{d.version}</span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button onClick={(e) => { e.stopPropagation(); const r = generateDocPreview(d.id); if (r && onPreviewDoc) onPreviewDoc(r); }}
                    style={{ background: C.accentLight, border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 9, cursor: "pointer", fontFamily: "Rubik", color: C.accent, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                    <FileOutput size={8} /> צפה
                  </button>
                  <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: "Rubik" }}>{s.l}</span>
                </div>
              </div>
            );
          })}
          {modDocs.length === 0 && <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", padding: 12, textAlign: "center" }}>אין מסמכים עדיין</div>}
        </ChartCard>

        {/* Tasks */}
        <ChartCard title={`משימות (${modTasks.length})`} Icon={CheckSquare}>
          {modTasks.map(t => {
            const s = taskStyle[t.status] || taskStyle.pending;
            return (
              <div key={t.id} onClick={() => { const ctrl = ALL_CONTROLS.find(c => c.reqId === t.reqId); if (ctrl && onOpenDetail) onOpenDetail({ type: "control", id: ctrl.id }); }}
                style={{ padding: "8px 0", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.borderLight} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{t.title}</div>
                  <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{t.owner} · {t.due}</div>
                </div>
                <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 3 }}><s.Icon size={8} />{s.l}</span>
              </div>
            );
          })}
          {modTasks.length === 0 && <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", padding: 12, textAlign: "center" }}>אין משימות פתוחות</div>}
        </ChartCard>

        {/* Controls Summary */}
        <ChartCard title="בקרות" Icon={Shield}>
          {modRisks.flatMap(r => r.controls.map(c => ({ ...c, riskId: r.id, riskName: r.name, module: r.module, cat: r.cat }))).slice(0, 8).map(ctrl => (
            <CtrlBadge key={ctrl.id} ctrl={ctrl} onOpen={onOpenDetail || (() => {})} />
          ))}
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// DOCUMENT LIBRARY
// ═══════════════════════════════════════════════
function DocumentLibrary({ onOpenDetail, onPreviewDoc }) {
  const [filterCat, setFilterCat] = useState("הכל");
  const docCats = ["הכל", ...new Set(DOC_TEMPLATES.map(d => d.cat))];
  const filtered = filterCat === "הכל" ? DOC_TEMPLATES : DOC_TEMPLATES.filter(d => d.cat === filterCat);
  const stats = { approved: DOC_TEMPLATES.filter(d => d.status === "approved").length, draft: DOC_TEMPLATES.filter(d => d.status === "draft").length, missing: DOC_TEMPLATES.filter(d => d.status === "missing").length };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}><FileText size={20} color={C.accent} /> ספריית מסמכים</h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>{DOC_TEMPLATES.length} תבניות · {stats.approved} מאושרים · {stats.draft} טיוטות · {stats.missing} חסרים</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {docCats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? C.accent : C.surface, color: filterCat === c ? "white" : C.textSec, border: `1px solid ${filterCat === c ? C.accent : C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: filterCat === c ? 600 : 400, cursor: "pointer", fontFamily: "Rubik" }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {filtered.map(d => {
          const s = DOC_STATUS[d.status];
          return (
            <div key={d.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, transition: "border-color 0.1s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div onClick={() => onOpenDetail && onOpenDetail({ type: "doc", id: d.id })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: d.tier === "pro" ? "#EDE9FE" : C.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={14} color={d.tier === "pro" ? "#7C3AED" : C.accent} /></div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {d.tier === "pro" && <span style={{ background: "rgba(91,184,201,0.15)", color: C.accentTeal, fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "Rubik" }}>PRO</span>}
                    <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{s.l}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik", marginBottom: 4, lineHeight: 1.4 }}>{d.name}</div>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{d.id} · v{d.version} · {d.cat}</div>
                {(() => { const lc = Object.entries(CTRL_DOCS).filter(([_, v]) => v.docs.includes(d.id)).length; return lc > 0 ? <div style={{ fontSize: 9, color: C.accent, fontFamily: "Rubik", marginTop: 3, display: "flex", alignItems: "center", gap: 3 }}><Shield size={8} /> {lc} בקרות מקושרות</div> : null; })()}
                {d.date !== "—" && <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant", marginTop: 2 }}>עודכן: {d.date}</div>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); const r = generateDocPreview(d.id); if (r && onPreviewDoc) onPreviewDoc(r); }}
                style={{ marginTop: 8, width: "100%", background: C.accentGrad, color: "white", border: "none", padding: "6px 0", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <FileOutput size={10} /> {d.status === "missing" ? "צפה בתבנית" : "צפה במסמך"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TASK MANAGER
// ═══════════════════════════════════════════════
function TaskManager({ onOpenDetail, tasks, updateTaskStatus, liveControls }) {
  const [filterSt, setFilterSt] = useState("all");
  const [expandedTask, setExpandedTask] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const theTasks = tasks || ALL_TASKS;
  const filtered = filterSt === "all" ? theTasks : theTasks.filter(t => t.status === filterSt);
  const stats = { overdue: theTasks.filter(t => t.status === "overdue").length, active: theTasks.filter(t => t.status === "active").length, pending: theTasks.filter(t => t.status === "pending").length, done: theTasks.filter(t => t.status === "done").length };
  const statusFlow = { overdue: ["active","done"], active: ["done","pending"], pending: ["active","done"], done: [] };
  const statusActions = { active: { l: "התחל עבודה", c: C.warning, Icon: Activity }, done: { l: "סמן כבוצע", c: C.success, Icon: CheckSquare }, pending: { l: "החזר לממתין", c: C.textMuted, Icon: RotateCcw } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}><CheckSquare size={20} color={C.accent} /> ניהול משימות</h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>{theTasks.length} משימות · {stats.overdue} באיחור · {stats.active} בתהליך · {stats.done || 0} הושלמו</p>
        </div>
        <button style={{ background: C.accentGrad, color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><Plus size={13} /> משימה חדשה</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { id: "overdue", l: "באיחור", v: stats.overdue, c: C.danger, bg: C.dangerBg, Icon: AlertTriangle },
          { id: "active", l: "בתהליך", v: stats.active, c: C.warning, bg: C.warningBg, Icon: Activity },
          { id: "pending", l: "ממתין", v: stats.pending, c: C.textMuted, bg: C.borderLight, Icon: Clock },
          { id: "done", l: "הושלמו", v: stats.done, c: C.success, bg: C.successBg, Icon: CheckSquare },
        ].map(s => (
          <div key={s.id} onClick={() => setFilterSt(filterSt === s.id ? "all" : s.id)} style={{ background: filterSt === s.id ? `${s.c}12` : C.surface, border: `1px solid ${filterSt === s.id ? s.c : C.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><s.Icon size={15} color={s.c} /></div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: "Rubik" }}>{s.v}</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {filtered.map((t, i) => {
          const s = t.status === "done" ? { bg: C.successBg, c: C.success, l: "הושלם", Icon: CheckSquare } : (taskStyle[t.status] || taskStyle.pending);
          const isExp = expandedTask === t.id;
          const ctrl = (liveControls || ALL_CONTROLS).find(c => c.reqId === t.reqId);
          return (
            <div key={t.id}>
              <div onClick={() => setExpandedTask(isExp ? null : t.id)} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: isExp ? C.accentLight : i % 2 === 0 ? "white" : "#FAFBFC", transition: "background 0.1s" }}
                onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = "#F8FAFC"; }}
                onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFBFC"; }}>
                {/* Status dot */}
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.c, flexShrink: 0, boxShadow: t.status === "overdue" ? `0 0 6px ${C.danger}` : "none" }} />
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 6 }}>
                    {t.title}
                    {t.type === "training" && <span style={{ fontSize: 8, background: "#EDE9FE", color: "#7C3AED", padding: "1px 5px", borderRadius: 3, fontFamily: "Rubik" }}>הדרכה</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 10, color: C.textMuted, fontFamily: "Assistant", alignItems: "center" }}>
                    <span>{t.owner}</span>
                    <span>·</span>
                    <span style={{ color: t.status === "overdue" ? C.danger : C.textMuted, fontWeight: t.status === "overdue" ? 600 : 400 }}>{t.due}</span>
                    <span style={{ background: C.borderLight, padding: "1px 5px", borderRadius: 3, fontSize: 9, fontFamily: "Rubik" }}>{ALL_MODULES.find(m => m.id === t.module)?.name}</span>
                    {t.notify && <BellRing size={9} color={C.accent} />}
                    {t.schedule && <Calendar size={9} color="#7C6FD0" />}
                  </div>
                </div>
                {/* Status badge */}
                <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: "3px 10px", borderRadius: 5, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}><s.Icon size={9} />{s.l}</span>
                {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
              </div>

              {/* Expanded Panel */}
              {isExp && (
                <div style={{ padding: "14px 20px 16px", background: C.borderLight, borderBottom: `1px solid ${C.border}`, animation: "fadeInUp 0.15s ease-out" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
                    {/* Left: Details */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, fontFamily: "Rubik", marginBottom: 6 }}>פרטי משימה</div>
                      <div style={{ background: "white", borderRadius: 8, padding: 12, border: `1px solid ${C.border}`, fontSize: 11, fontFamily: "Assistant" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: C.textMuted }}>רגולציה:</span><span style={{ color: t.reg.includes("2022") ? "#7C3AED" : "#0369A1", fontWeight: 600, fontFamily: "Rubik", fontSize: 10 }}>§ {t.reg} {t.section}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: C.textMuted }}>אחראי:</span><span style={{ color: C.text, fontWeight: 500 }}>{t.owner}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: C.textMuted }}>אימייל:</span><span style={{ color: C.accent, fontWeight: 500, fontSize: 10, direction: "ltr" }}>{t.email}</span></div>
                        {t.schedule && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: C.textMuted }}>מתוזמן:</span><span style={{ color: "#7C6FD0", fontWeight: 600, fontFamily: "Rubik", fontSize: 10 }}>{t.schedule}</span></div>}
                        {t.notes && <div style={{ marginTop: 6, padding: "6px 8px", background: C.borderLight, borderRadius: 5, fontSize: 10, color: C.textSec }}>{t.notes}</div>}
                      </div>
                      {/* Linked control */}
                      {ctrl && (
                        <div onClick={() => onOpenDetail && onOpenDetail({ type: "control", id: ctrl.id })} style={{ marginTop: 6, background: "white", borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "border-color 0.1s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                          <Shield size={11} color={C.accent} />
                          <span style={{ fontSize: 10, color: C.accent, fontWeight: 600, fontFamily: "Rubik" }}>{ctrl.id}</span>
                          <span style={{ fontSize: 10, color: C.text, fontFamily: "Assistant", flex: 1 }}>{ctrl.name?.substring(0, 40)}...</span>
                          <ChevronLeft size={10} color={C.textMuted} />
                        </div>
                      )}
                    </div>
                    {/* Right: Actions */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, fontFamily: "Rubik", marginBottom: 6 }}>פעולות</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {/* Status Change Buttons */}
                        {(statusFlow[t.status] || []).map(newSt => {
                          const act = statusActions[newSt];
                          return act && (
                            <button key={newSt} onClick={(e) => { e.stopPropagation(); if (updateTaskStatus) updateTaskStatus(t.id, newSt); }} style={{ background: `${act.c}12`, border: `1px solid ${act.c}30`, borderRadius: 8, padding: "8px 14px", fontSize: 11, fontFamily: "Rubik", color: act.c, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.background = `${act.c}20`}
                              onMouseLeave={e => e.currentTarget.style.background = `${act.c}12`}>
                              <act.Icon size={12} /> {act.l}
                            </button>
                          );
                        })}
                        {/* Send Email */}
                        <button onClick={(e) => { e.stopPropagation(); setEmailModal(t); }} style={{ background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 8, padding: "8px 14px", fontSize: 11, fontFamily: "Rubik", color: C.accent, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                          <Mail size={12} /> שלח תזכורת במייל
                        </button>
                        {/* Toggle Notification */}
                        <button onClick={(e) => { e.stopPropagation(); /* toggle notify */ }} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 11, fontFamily: "Rubik", color: t.notify ? C.accent : C.textMuted, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                          <BellRing size={12} /> {t.notify ? "התראות פעילות ✓" : "הפעל התראות"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email Modal */}
      {emailModal && (
        <>
          <div onClick={() => setEmailModal(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 420, background: C.surface, borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.15)", zIndex: 401, direction: "rtl", animation: "fadeInUp 0.2s ease-out", overflow: "hidden" }}>
            <div style={{ background: C.accentGrad, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <Mail size={18} color="white" />
              <span style={{ color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Rubik" }}>שליחת תזכורת</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setEmailModal(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} color="white" /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: "Rubik", display: "block", marginBottom: 4 }}>נמען</label>
                <input defaultValue={emailModal.email} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "Assistant", direction: "ltr", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: "Rubik", display: "block", marginBottom: 4 }}>נושא</label>
                <input defaultValue={`תזכורת: ${emailModal.title} — עד ${emailModal.due}`} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "Assistant", direction: "rtl", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: "Rubik", display: "block", marginBottom: 4 }}>הודעה</label>
                <textarea defaultValue={`שלום ${emailModal.owner},\n\nתזכורת לביצוע המשימה "${emailModal.title}".\nתאריך יעד: ${emailModal.due}\nרגולציה: חוזר ${emailModal.reg} § ${emailModal.section}\n\nבברכה,\nRiskGuard`} rows={5} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "Assistant", direction: "rtl", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}>
                <button onClick={() => setEmailModal(null)} style={{ background: C.accentGrad, color: "white", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><Send size={12} style={{ transform: "scaleX(-1)" }} /> שלח</button>
                <button onClick={() => setEmailModal(null)} style={{ background: C.borderLight, color: C.textSec, border: `1px solid ${C.border}`, padding: "9px 20px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "Rubik" }}>ביטול</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// SETTINGS SCREEN
// ═══════════════════════════════════════════════
function SettingsScreen() {
  const [tab, setTab] = useState("org"); // org | billing | ntl
  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}><Settings size={20} color={C.accent} /> הגדרות</h1>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[{ id: "org", l: "ארגון וצוות", Icon: Building2 }, { id: "billing", l: "חבילות ומחירים", Icon: Receipt }, { id: "ntl", l: "NTL Management", Icon: Sparkles }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.accent : C.surface, color: tab === t.id ? "white" : C.textSec, border: `1px solid ${tab === t.id ? C.accent : C.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 11, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><t.Icon size={12} />{t.l}</button>
        ))}
      </div>

      {tab === "org" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Building2 size={14} color={C.accent} /> פרטי ארגון</h3>
            {[{ l: "שם חברה", v: COMPANY.name }, { l: "ח.פ.", v: "51-543210-8" }, { l: "סוג רישיון", v: "רישיון אשראי מורחב" }, { l: "כתובת", v: "רח׳ הברזל 22, תל אביב" }, { l: "טלפון", v: "03-7654321" }, { l: "מספר עובדים", v: "35" }].map((f,i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant" }}>{f.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{f.v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Users size={14} color={C.accent} /> צוות</h3>
            {[{ name: "יוסי לוי", role: "מנהל סיכונים", email: "yossi@credit-finance.co.il" }, { name: "דנה כהן", role: "אחראית סייבר", email: "dana@credit-finance.co.il" }, { name: "אבי שרון", role: "מנכ״ל", email: "avi@credit-finance.co.il" }].map((u,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, fontFamily: "Rubik" }}>{u.name.split(" ").map(n => n[0]).join("")}</div>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{u.name}</div><div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{u.role} · {u.email}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "billing" && <BillingScreen />}

      {tab === "ntl" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Shield size={14} color={C.accent} /> מנוי</h3>
            <div style={{ background: C.accentLight, borderRadius: 10, padding: 16, textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant", marginBottom: 4 }}>חבילה נוכחית</div>
              <div style={{ fontSize: 20, fontWeight: 800, background: C.accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "Rubik" }}>PRO</div>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, fontFamily: "Rubik" }}>₪5,000 / חודש</div>
            </div>
            <div style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant" }}>חוזה שנתי · חידוש: 01/01/2027 · 10 משתמשים</div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#7C3AED" /> NTL Management
            </h3>
            <div style={{ background: "linear-gradient(135deg, #7B61FF, #BD34FE, #FF6B9D)", borderRadius: 10, padding: 16, color: "white", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "Rubik", marginBottom: 6 }}>היועץ שלכם</div>
              <div style={{ fontSize: 11, fontFamily: "Assistant", opacity: 0.9, lineHeight: 1.6 }}>ליווי מקצועי לאורך כל הדרך — הדרכות, סקירות עמידה, ביקורת פנימית, הכנה לביקורת רגולטור</div>
            </div>
            {[{ l: "הזמן הדרכה בזום", Icon: ExternalLink }, { l: "בקש סקירת עמידה", Icon: CheckSquare }, { l: "צפה בתוכנית ליווי", Icon: FileText }].map((a, i) => (
              <button key={i} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontFamily: "Rubik", color: C.textSec, display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontWeight: 500 }}><a.Icon size={12} color="#7C3AED" />{a.l}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// GLOBAL DETAIL DRAWER — 360° Clickable
// ═══════════════════════════════════════════════
function GlobalDetailDrawer({ detail, onClose, onOpen, onNav, risks, updateEff, onPreviewDoc }) {
  if (!detail) return null;
  const { type, id } = detail;
  const liveControls = risks ? getAllControls(risks) : ALL_CONTROLS;

  if (type === "control") {
    const ctrl = liveControls.find(c => c.id === id);
    if (!ctrl) return null;
    const docs = getCtrlLinkedDocs(ctrl.id);
    const evidence = getCtrlEvidence(ctrl.id);
    const risk = (risks || RISK_BANK).find(r => r.id === ctrl.riskId);

    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: 420, height: "100vh", background: C.surface, zIndex: 300, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", borderRight: `1px solid ${C.border}`, overflowY: "auto", direction: "rtl", animation: "fadeInUp 0.2s ease-out" }}>
        <div style={{ position: "sticky", top: 0, background: C.surface, zIndex: 2, borderBottom: `1px solid ${C.border}`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={14} color="white" /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: "Rubik" }}>בקרה</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{ctrl.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.borderLight, border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} color={C.textSec} /></button>
        </div>

        <div style={{ padding: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 10, lineHeight: 1.5 }}>{ctrl.name}</h3>

          {/* Traceability */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ background: ctrl.reg === "2022-10-9" ? "#EDE9FE" : "#E0F2FE", color: ctrl.reg === "2022-10-9" ? "#7C3AED" : "#0369A1", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>חוזר {ctrl.reg} § {ctrl.section}</span>
            <span style={{ background: C.borderLight, color: C.textSec, fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{ctrl.reqId}</span>
            <span style={{ background: C.borderLight, color: C.textSec, fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{ctrl.cat}</span>
          </div>

          {/* Editable Effectiveness */}
          <div style={{ background: C.borderLight, borderRadius: 12, padding: 16, marginBottom: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <Target size={10} /> אפקטיביות בקרה
              {updateEff && <span style={{ fontSize: 8, color: C.accent, marginRight: 4 }}>(לחץ לעדכון)</span>}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[1,2,3,4,5].map(n => {
                const ce = CTRL_EFF[n];
                const isActive = ctrl.effectiveness === n;
                return (
                  <button key={n} onClick={() => { if (updateEff && ctrl.riskId) updateEff(ctrl.riskId, ctrl.id, n); }}
                    title={ce.label}
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: isActive ? ce.color : "white",
                      color: isActive ? "white" : ce.color,
                      border: isActive ? `2px solid ${ce.color}` : `2px solid ${ce.color}40`,
                      fontSize: 16, fontWeight: 800, fontFamily: "Rubik",
                      cursor: updateEff ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      boxShadow: isActive ? `0 3px 12px ${ce.color}40` : "none",
                    }}
                    onMouseEnter={e => { if (!isActive && updateEff) { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = ce.color; }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = `${ce.color}40`; }}}
                  >{n}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: CTRL_EFF[ctrl.effectiveness].color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: CTRL_EFF[ctrl.effectiveness].color, fontFamily: "Assistant" }}>{CTRL_EFF[ctrl.effectiveness].label}</span>
            </div>
          </div>

          {/* Linked Risk */}
          {risk && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={11} color={C.warning} /> סיכון מקושר</div>
              <div onClick={() => onOpen({ type: "risk", id: risk.id })} style={{ background: C.borderLight, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.border}`, cursor: "pointer", transition: "border-color 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{risk.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{risk.id}</span>
                  <RiskBadge level={risk.inherent} size="sm" />
                  <span style={{ color: C.textMuted, fontSize: 8 }}>→</span>
                  <RiskBadge level={calcResidual(risk.inherent, risk.controls)} size="sm" />
                </div>
              </div>
            </div>
          )}

          {/* Linked Docs */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><FileText size={11} color={C.accent} /> מסמכים נדרשים ({docs.length})</div>
            {docs.length === 0 && <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant", padding: "8px 0" }}>אין מסמכים מקושרים</div>}
            {docs.map(d => {
              const s = DOC_STATUS[d.status];
              return (
                <div key={d.id} onClick={() => onOpen({ type: "doc", id: d.id })} style={{ background: C.borderLight, borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.border}`, marginBottom: 4, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{d.name}</div>
                    <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{d.id} · v{d.version}</div>
                  </div>
                  <span style={{ background: s.bg, color: s.c, fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 3, fontFamily: "Rubik" }}>{s.l}</span>
                </div>
              );
            })}
          </div>

          {/* Evidence */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Eye size={11} color={C.success} /> ראיות ביקורת ({evidence.length})</div>
            {evidence.length === 0 && <div style={{ fontSize: 11, color: C.danger, fontFamily: "Assistant", padding: "8px 0", display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={10} /> אין ראיות — נדרש להשלים</div>}
            {evidence.map(ev => {
              const es = EVIDENCE_STATUS[ev.status];
              return (
                <div key={ev.id} style={{ background: "white", borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.border}`, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.text, fontFamily: "Assistant", lineHeight: 1.5 }}>{ev.desc}</div>
                    {ev.date !== "—" && <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik", marginTop: 2 }}>{ev.date}</div>}
                  </div>
                  <span style={{ background: es.bg, color: es.c, fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 3, fontFamily: "Rubik", whiteSpace: "nowrap", marginRight: 6 }}>{es.l}</span>
                </div>
              );
            })}
          </div>

          {/* Navigate to module */}
          <button onClick={() => { onClose(); onNav(ctrl.module); }} style={{ width: "100%", padding: "10px", background: C.accentGrad, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <ChevronRight size={13} /> עבור למודול {ALL_MODULES.find(m => m.id === ctrl.module)?.name}
          </button>
        </div>
      </div>
    );
  }

  if (type === "doc") {
    const doc = DOC_TEMPLATES.find(d => d.id === id);
    if (!doc) return null;
    const s = DOC_STATUS[doc.status];
    const linkedCtrls = Object.entries(CTRL_DOCS).filter(([_, v]) => v.docs.includes(id)).map(([cId]) => ALL_CONTROLS.find(c => c.id === cId)).filter(Boolean);

    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: 420, height: "100vh", background: C.surface, zIndex: 300, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", borderRight: `1px solid ${C.border}`, overflowY: "auto", direction: "rtl", animation: "fadeInUp 0.2s ease-out" }}>
        <div style={{ position: "sticky", top: 0, background: C.surface, zIndex: 2, borderBottom: `1px solid ${C.border}`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: doc.tier === "pro" ? "#EDE9FE" : C.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={14} color={doc.tier === "pro" ? "#7C3AED" : C.accent} /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: "Rubik" }}>מסמך</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{doc.id} · v{doc.version}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.borderLight, border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} color={C.textSec} /></button>
        </div>
        <div style={{ padding: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 10, lineHeight: 1.5 }}>{doc.name}</h3>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ background: s.bg, color: s.c, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 5, fontFamily: "Rubik" }}>{s.l}</span>
            <span style={{ background: C.borderLight, color: C.textSec, fontSize: 10, padding: "3px 8px", borderRadius: 5, fontFamily: "Rubik" }}>{doc.cat}</span>
            {doc.tier === "pro" && <span style={{ background: "rgba(91,184,201,0.15)", color: C.accentTeal, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 5, fontFamily: "Rubik" }}>PRO</span>}
          </div>
          {doc.date !== "—" && <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant", marginBottom: 14 }}>עודכן לאחרונה: {doc.date}</div>}

          {/* Linked Controls */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Shield size={11} color={C.accent} /> בקרות הדורשות מסמך זה ({linkedCtrls.length})</div>
            {linkedCtrls.map(ctrl => (
              <div key={ctrl.id} onClick={() => onOpen({ type: "control", id: ctrl.id })} style={{ background: C.borderLight, borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.border}`, marginBottom: 4, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{ctrl.name}</div>
                  <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{ctrl.id} · {ctrl.reqId}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: CTRL_EFF[ctrl.effectiveness].color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700 }}>{ctrl.effectiveness}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { const r = generateDocPreview(doc.id); if (r && onPreviewDoc) onPreviewDoc(r); }} style={{ width: "100%", padding: "10px", background: C.accentGrad, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 6 }}>
            <FileOutput size={13} /> צפה במסמך
          </button>
          <button onClick={() => { onClose(); onNav("docs"); }} style={{ width: "100%", padding: "10px", background: C.surface, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <ChevronRight size={13} /> עבור לספריית מסמכים
          </button>
        </div>
      </div>
    );
  }

  if (type === "risk") {
    const risk = (risks || RISK_BANK).find(r => r.id === id);
    if (!risk) return null;
    const res = calcResidual(risk.inherent, risk.controls);
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: 420, height: "100vh", background: C.surface, zIndex: 300, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", borderRight: `1px solid ${C.border}`, overflowY: "auto", direction: "rtl", animation: "fadeInUp 0.2s ease-out" }}>
        <div style={{ position: "sticky", top: 0, background: C.surface, zIndex: 2, borderBottom: `1px solid ${C.border}`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `${RISK_LEVELS[res].color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={14} color={RISK_LEVELS[res].color} /></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: RISK_LEVELS[res].color, fontFamily: "Rubik" }}>סיכון</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{risk.id} · {risk.cat}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.borderLight, border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} color={C.textSec} /></button>
        </div>
        <div style={{ padding: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 10, lineHeight: 1.5 }}>{risk.name}</h3>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ background: risk.reg === "2022-10-9" ? "#EDE9FE" : "#E0F2FE", color: risk.reg === "2022-10-9" ? "#7C3AED" : "#0369A1", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>חוזר {risk.reg} § {risk.section}</span>
            <span style={{ background: C.borderLight, color: C.textSec, fontSize: 9, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{risk.reqId}</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, background: C.borderLight, borderRadius: 8, padding: 12, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>שורשי</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: RISK_LEVELS[risk.inherent].color, fontFamily: "Rubik" }}>{risk.inherent}</div>
            </div>
            <div style={{ flex: 1, background: C.borderLight, borderRadius: 8, padding: 12, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>שיורי</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: RISK_LEVELS[res].color, fontFamily: "Rubik" }}>{res}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Shield size={11} color={C.accent} /> בקרות ({risk.controls.length})</div>
          {risk.controls.map(ctrl => {
            const evCount = getCtrlEvidence(ctrl.id).length;
            const docCount = getCtrlLinkedDocs(ctrl.id).length;
            return (
              <div key={ctrl.id} onClick={() => onOpen({ type: "control", id: ctrl.id })} style={{ background: C.borderLight, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.border}`, marginBottom: 4, cursor: "pointer", transition: "border-color 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{ctrl.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "Rubik" }}>{ctrl.id}</span>
                      {docCount > 0 && <span style={{ fontSize: 8, color: C.accent, fontFamily: "Rubik" }}>📄 {docCount}</span>}
                      {evCount > 0 && <span style={{ fontSize: 8, color: C.success, fontFamily: "Rubik" }}>✓ {evCount} ראיות</span>}
                    </div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: CTRL_EFF[ctrl.effectiveness].color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700 }}>{ctrl.effectiveness}</div>
                </div>
              </div>
            );
          })}
          <button onClick={() => { onClose(); onNav("riskreg"); }} style={{ width: "100%", padding: "10px", marginTop: 10, background: C.accentGrad, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <ChevronRight size={13} /> עבור למאגר סיכונים ובקרות
          </button>
        </div>
      </div>
    );
  }
  return null;
}

// ═══════════════════════════════════════════════
// CLICKABLE CONTROL BADGE — Used across all screens
// ═══════════════════════════════════════════════
function CtrlBadge({ ctrl, onOpen }) {
  const evCount = getCtrlEvidence(ctrl.id).length;
  const docCount = getCtrlLinkedDocs(ctrl.id).length;
  const verifiedCount = getCtrlEvidence(ctrl.id).filter(e => e.status === "verified").length;
  return (
    <div onClick={() => onOpen({ type: "control", id: ctrl.id })} style={{ background: C.borderLight, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.12s", marginBottom: 3 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentLight; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.borderLight; }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: "Assistant", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ctrl.name}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
          <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "Rubik" }}>{ctrl.id}</span>
          {docCount > 0 && <span style={{ fontSize: 8, background: C.accentLight, color: C.accent, padding: "0 4px", borderRadius: 2, fontFamily: "Rubik" }}>📄{docCount}</span>}
          {evCount > 0 && <span style={{ fontSize: 8, background: verifiedCount === evCount ? C.successBg : C.warningBg, color: verifiedCount === evCount ? C.success : C.warning, padding: "0 4px", borderRadius: 2, fontFamily: "Rubik" }}>✓{verifiedCount}/{evCount}</span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, background: CTRL_EFF[ctrl.effectiveness].color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 700 }}>{ctrl.effectiveness}</div>
        <ChevronLeft size={10} color={C.textMuted} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CREDIT RISK MODULE (PRO)
// ═══════════════════════════════════════════════
const CREDIT_PORTFOLIO = [
  { id: "SEG01", segment: "הלוואות לעסקים קטנים", exposure: 12500000, count: 340, pd: 4.2, lgd: 45, ecl: 236250, status: "watch" },
  { id: "SEG02", segment: "אשראי צרכני", exposure: 28000000, count: 4200, pd: 2.8, lgd: 35, ecl: 274400, status: "normal" },
  { id: "SEG03", segment: "משכנתאות", exposure: 45000000, count: 620, pd: 1.2, lgd: 25, ecl: 135000, status: "normal" },
  { id: "SEG04", segment: "אשראי לרכב", exposure: 18000000, count: 1800, pd: 3.5, lgd: 40, ecl: 252000, status: "normal" },
  { id: "SEG05", segment: "הלוואות מיקרו", exposure: 5000000, count: 2100, pd: 6.8, lgd: 55, ecl: 187000, status: "alert" },
  { id: "SEG06", segment: "ערבויות ומסגרות", exposure: 8000000, count: 150, pd: 2.1, lgd: 30, ecl: 50400, status: "normal" },
];
const CONCENTRATION = [
  { name: "Top 10 לווים", pct: 22, limit: 25, status: "ok" },
  { name: "סקטור נדל״ן", pct: 31, limit: 30, status: "breach" },
  { name: "אזור מרכז", pct: 45, limit: 50, status: "ok" },
  { name: "מטבע חוץ", pct: 8, limit: 15, status: "ok" },
  { name: "סקטור טכנולוגיה", pct: 18, limit: 20, status: "warning" },
];
const VINTAGE = [
  { year: "2022", amount: 15, default_rate: 5.2, ecl_rate: 3.8 },
  { year: "2023", amount: 28, default_rate: 3.8, ecl_rate: 2.9 },
  { year: "H1/2024", amount: 22, default_rate: 2.1, ecl_rate: 1.8 },
  { year: "H2/2024", amount: 18, default_rate: 1.4, ecl_rate: 1.2 },
  { year: "H1/2025", amount: 25, default_rate: 0.8, ecl_rate: 0.9 },
  { year: "H2/2025", amount: 12, default_rate: 0.2, ecl_rate: 0.5 },
];
const SEG_STATUS = { normal: { l: "תקין", c: C.success, bg: C.successBg }, watch: { l: "במעקב", c: C.warning, bg: C.warningBg }, alert: { l: "חריג", c: C.danger, bg: C.dangerBg } };

function CreditRiskModule() {
  const totalExposure = CREDIT_PORTFOLIO.reduce((a, s) => a + s.exposure, 0);
  const totalECL = CREDIT_PORTFOLIO.reduce((a, s) => a + s.ecl, 0);
  const weightedPD = (CREDIT_PORTFOLIO.reduce((a, s) => a + s.pd * s.exposure, 0) / totalExposure).toFixed(2);
  const eclRatio = ((totalECL / totalExposure) * 100).toFixed(2);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={20} color={C.accent} /> סיכון אשראי
            <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>PRO</span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>ניהול תיק אשראי, ריכוזיות, הפרשות ECL, ניתוח Vintage</p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "חשיפה כוללת", value: `₪${(totalExposure / 1e6).toFixed(0)}M`, c: C.accent },
          { label: "הפרשות ECL", value: `₪${(totalECL / 1e3).toFixed(0)}K`, c: C.warning },
          { label: "ECL / חשיפה", value: `${eclRatio}%`, c: parseFloat(eclRatio) > 1.5 ? C.danger : C.success },
          { label: "PD משוקלל", value: `${weightedPD}%`, c: parseFloat(weightedPD) > 3 ? C.warning : C.success },
          { label: "לווים פעילים", value: CREDIT_PORTFOLIO.reduce((a, s) => a + s.count, 0).toLocaleString(), c: C.text },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: kpi.c, fontFamily: "Rubik" }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Portfolio Segments Table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
            <CreditCard size={13} color={C.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>פילוח תיק אשראי</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "Assistant" }}>
            <thead><tr style={{ background: C.borderLight }}>
              {["סגמנט", "חשיפה", "לווים", "PD%", "LGD%", "ECL", "סטטוס"].map(h => <th key={h} style={{ textAlign: "right", padding: "8px 10px", fontWeight: 600, fontSize: 10, color: C.textSec, fontFamily: "Rubik" }}>{h}</th>)}
            </tr></thead>
            <tbody>{CREDIT_PORTFOLIO.map((seg, i) => {
              const s = SEG_STATUS[seg.status];
              return (
                <tr key={seg.id} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "white" : "#FAFBFC" }}>
                  <td style={{ padding: "10px", fontWeight: 500, color: C.text }}>{seg.segment}</td>
                  <td style={{ padding: "10px", fontFamily: "Rubik", fontWeight: 600 }}>₪{(seg.exposure / 1e6).toFixed(1)}M</td>
                  <td style={{ padding: "10px", fontFamily: "Rubik" }}>{seg.count.toLocaleString()}</td>
                  <td style={{ padding: "10px", color: seg.pd > 5 ? C.danger : seg.pd > 3 ? C.warning : C.success, fontWeight: 600, fontFamily: "Rubik" }}>{seg.pd}%</td>
                  <td style={{ padding: "10px", fontFamily: "Rubik" }}>{seg.lgd}%</td>
                  <td style={{ padding: "10px", fontFamily: "Rubik", fontWeight: 600 }}>₪{(seg.ecl / 1e3).toFixed(0)}K</td>
                  <td style={{ padding: "10px" }}><span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{s.l}</span></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>

        {/* Concentration Risk */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Target size={13} color={C.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>ריכוזיות</span>
          </div>
          {CONCENTRATION.map((c, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: C.text, fontFamily: "Assistant", fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 10, fontFamily: "Rubik", fontWeight: 600, color: c.status === "breach" ? C.danger : c.status === "warning" ? C.warning : C.textSec }}>{c.pct}% / {c.limit}%</span>
              </div>
              <div style={{ background: C.borderLight, borderRadius: 4, height: 6, position: "relative", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(c.pct / c.limit * 100, 100)}%`, height: "100%", borderRadius: 4, background: c.status === "breach" ? C.danger : c.status === "warning" ? C.warning : C.success, transition: "width 0.3s" }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: 2, height: "100%", background: C.textMuted, opacity: 0.3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vintage Analysis */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <TrendingDown size={13} color={C.accent} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>ניתוח Vintage — ביצועי אשראי לפי תקופת מתן</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={VINTAGE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gdR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.danger} stopOpacity={0.3} /><stop offset="100%" stopColor={C.danger} stopOpacity={0.02} /></linearGradient>
              <linearGradient id="gdA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="100%" stopColor={C.accent} stopOpacity={0.02} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
            <XAxis dataKey="year" fontSize={10} fontFamily="Rubik" tick={{ fill: C.textMuted }} />
            <YAxis fontSize={10} tick={{ fill: C.textMuted }} unit="%" />
            <Tooltip />
            <Area type="monotone" dataKey="default_rate" name="שיעור כשל" stroke={C.danger} fill="url(#gdR)" strokeWidth={2} dot={{ r: 3 }} />
            <Area type="monotone" dataKey="ecl_rate" name="ECL Rate" stroke={C.accent} fill="url(#gdA)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// KRI MODULE (PRO)
// ═══════════════════════════════════════════════
const KRI_DATA = [
  { id: "KRI-01", name: "יחס כשל אשראי (NPL Ratio)", value: 3.8, unit: "%", threshold: { green: 3, yellow: 5, red: 7 }, trend: [3.1, 3.3, 3.5, 3.6, 3.9, 3.8], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "אשראי", icon: CreditCard },
  { id: "KRI-02", name: "יחס הון מינימלי", value: 14.2, unit: "%", threshold: { green: 12, yellow: 10, red: 9 }, trend: [15.1, 14.8, 14.5, 14.3, 14.1, 14.2], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "הון", reverse: true, icon: Shield },
  { id: "KRI-03", name: "זמן השבתה (שעות/חודש)", value: 2.5, unit: "h", threshold: { green: 4, yellow: 8, red: 12 }, trend: [1.2, 0.8, 3.1, 1.5, 4.2, 2.5], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "תפעולי", icon: Activity },
  { id: "KRI-04", name: "אירועי אבטחה חודשיים", value: 12, unit: "", threshold: { green: 10, yellow: 20, red: 30 }, trend: [8, 6, 15, 11, 18, 12], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "סייבר", icon: ShieldAlert },
  { id: "KRI-05", name: "הלוואות באיחור 60+", value: 2.1, unit: "%", threshold: { green: 2, yellow: 4, red: 6 }, trend: [1.8, 1.9, 2.0, 2.2, 2.4, 2.1], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "אשראי", icon: Clock },
  { id: "KRI-06", name: "יחס ECL / חשיפה", value: 0.96, unit: "%", threshold: { green: 1, yellow: 2, red: 3 }, trend: [0.82, 0.85, 0.88, 0.91, 0.94, 0.96], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "אשראי", icon: TrendingDown },
  { id: "KRI-07", name: "שיעור שימור לקוחות", value: 91, unit: "%", threshold: { green: 90, yellow: 85, red: 80 }, trend: [93, 92, 91.5, 91, 90.5, 91], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "עסקי", reverse: true, icon: Users },
  { id: "KRI-08", name: "תלונות לקוחות (חודשי)", value: 28, unit: "", threshold: { green: 20, yellow: 35, red: 50 }, trend: [18, 22, 25, 30, 32, 28], trendLabels: ["ספט","אוק","נוב","דצמ","ינו","פבר"], cat: "עסקי", icon: MessageCircle },
];
const getKriStatus = (kri) => { const v = kri.value; const t = kri.threshold; if (kri.reverse) return v >= t.green ? "green" : v >= t.yellow ? "yellow" : "red"; return v <= t.green ? "green" : v <= t.yellow ? "yellow" : "red"; };
const kriColors = { green: C.success, yellow: C.warning, red: C.danger };
const kriLabels = { green: "תקין", yellow: "אזהרה", red: "חריג" };

function KRIGauge({ value, max, color, size = 80 }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct * 0.75); // 270° arc
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(135deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.borderLight} strokeWidth={6} strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${circ * 0.75 * pct} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

function KRIModule() {
  const cats = [...new Set(KRI_DATA.map(k => k.cat))];
  const [filterCat, setFilterCat] = useState("הכל");
  const filtered = filterCat === "הכל" ? KRI_DATA : KRI_DATA.filter(k => k.cat === filterCat);
  const greenCount = KRI_DATA.filter(k => getKriStatus(k) === "green").length;
  const yellowCount = KRI_DATA.filter(k => getKriStatus(k) === "yellow").length;
  const redCount = KRI_DATA.filter(k => getKriStatus(k) === "red").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Gauge size={20} color={C.accent} /> מדדי סיכון מפתח (KRI)
            <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>PRO</span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>ניטור רציף של מדדי סיכון ביחס לספים מותרים</p>
        </div>
      </div>

      {/* Summary Strip */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { label: "תקין", count: greenCount, color: C.success, bg: C.successBg },
          { label: "אזהרה", count: yellowCount, color: C.warning, bg: C.warningBg },
          { label: "חריג", count: redCount, color: C.danger, bg: C.dangerBg },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.bg, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "Rubik" }}>{s.count}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "Rubik" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>מתוך {KRI_DATA.length} מדדים</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {["הכל", ...cats].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? C.accent : C.surface, color: filterCat === c ? "white" : C.textSec, border: `1px solid ${filterCat === c ? C.accent : C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: filterCat === c ? 600 : 400, cursor: "pointer", fontFamily: "Rubik" }}>{c}</button>
        ))}
      </div>

      {/* KRI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {filtered.map(kri => {
          const status = getKriStatus(kri);
          const sc = kriColors[status];
          const Ic = kri.icon;
          const gaugeMax = kri.reverse ? kri.threshold.green * 1.3 : kri.threshold.red;
          const trendMin = Math.min(...kri.trend); const trendMax = Math.max(...kri.trend);
          const trendRange = trendMax - trendMin || 1;
          const prevVal = kri.trend[kri.trend.length - 2];
          const delta = kri.value - prevVal;
          const isGoodDelta = kri.reverse ? delta > 0 : delta < 0;

          return (
            <div key={kri.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", transition: "box-shadow 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${sc}15`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              {/* Status ribbon */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${sc}, ${sc}80)` }} />

              <div style={{ padding: "16px 18px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${sc}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ic size={16} color={sc} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik", lineHeight: 1.3 }}>{kri.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                        <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{kri.id}</span>
                        <span style={{ background: C.borderLight, color: C.textSec, fontSize: 8, padding: "1px 5px", borderRadius: 3, fontFamily: "Rubik" }}>{kri.cat}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ background: `${sc}15`, color: sc, fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 6, fontFamily: "Rubik", whiteSpace: "nowrap" }}>{kriLabels[status]}</span>
                </div>

                {/* Value + Gauge row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                    <KRIGauge value={kri.value} max={gaugeMax} color={sc} size={80} />
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -40%)", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: sc, fontFamily: "Rubik", lineHeight: 1 }}>{kri.value}</div>
                      <div style={{ fontSize: 8, color: C.textMuted, fontFamily: "Rubik" }}>{kri.unit}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {/* Threshold markers */}
                    {[
                      { l: "ירוק", v: kri.threshold.green, c: C.success },
                      { l: "צהוב", v: kri.threshold.yellow, c: C.warning },
                      { l: "אדום", v: kri.threshold.red, c: C.danger },
                    ].map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.c, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: C.textSec, fontFamily: "Assistant", flex: 1 }}>{t.l}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{kri.reverse ? "≥" : "≤"} {t.v}{kri.unit === "%" ? "%" : ""}</span>
                      </div>
                    ))}
                    {/* Delta */}
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      {isGoodDelta ? <ArrowDownRight size={11} color={C.success} /> : <ArrowUpRight size={11} color={C.danger} />}
                      <span style={{ fontSize: 10, fontWeight: 600, color: isGoodDelta ? C.success : C.danger, fontFamily: "Rubik" }}>{delta > 0 ? "+" : ""}{delta.toFixed(1)} מהחודש הקודם</span>
                    </div>
                  </div>
                </div>

                {/* Sparkline area chart */}
                <div style={{ background: C.borderLight, borderRadius: 8, padding: "8px 6px 4px", marginTop: 4 }}>
                  <ResponsiveContainer width="100%" height={48}>
                    <AreaChart data={kri.trend.map((v, i) => ({ month: kri.trendLabels[i], value: v }))} margin={{ top: 2, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`krig-${kri.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={sc} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={sc} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke={sc} strokeWidth={2} fill={`url(#krig-${kri.id})`} dot={{ r: 2.5, fill: sc, stroke: "white", strokeWidth: 1.5 }} />
                      <XAxis dataKey="month" hide />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
                    {kri.trendLabels.map((l, i) => <span key={i} style={{ fontSize: 7, color: C.textMuted, fontFamily: "Rubik" }}>{l}</span>)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// EVENT REPORTING MODULE (PRO)
// ═══════════════════════════════════════════════
const LOSS_EVENTS = [
  { id: "EV01", date: "12/02/2026", title: "כשל מערכת תשלומים — עיכוב 4 שעות", cat: "תפעולי", severity: "medium", lossAmount: 15000, status: "closed", rootCause: "עדכון שרת ללא בדיקת תאימות", reported: true },
  { id: "EV02", date: "28/01/2026", title: "הונאת זהות — אישור הלוואה על סמך מסמך מזויף", cat: "הונאה", severity: "high", lossAmount: 85000, status: "investigating", rootCause: "חולשה בתהליך זיהוי", reported: true },
  { id: "EV03", date: "15/01/2026", title: "שליחת דוח ללקוח שגוי (דליפת מידע)", cat: "ציות", severity: "low", lossAmount: 0, status: "closed", rootCause: "טעות אנוש בשדה email", reported: false },
  { id: "EV04", date: "03/01/2026", title: "Phishing Attack — 2 עובדים לחצו", cat: "סייבר", severity: "medium", lossAmount: 0, status: "closed", rootCause: "מיייל מזויף שעבר SPF", reported: true },
  { id: "EV05", date: "20/12/2025", title: "ספק שירות IT — השבתה לא מתוכננת", cat: "ספק", severity: "medium", lossAmount: 8000, status: "closed", rootCause: "כשל בשרת ספק ענן", reported: false },
  { id: "EV06", date: "05/12/2025", title: "כמעט-אירוע: נסיון גישה לא מורשית", cat: "סייבר", severity: "low", lossAmount: 0, status: "closed", rootCause: "ניסיון Brute Force — נחסם", reported: false },
  { id: "EV07", date: "—", title: "כמעט-אירוע: חשד להונאה פנימית", cat: "הונאה", severity: "high", lossAmount: 0, status: "open", rootCause: "—", reported: false },
];
const SEV_MAP = { low: { l: "נמוך", c: C.success, bg: C.successBg }, medium: { l: "בינוני", c: C.warning, bg: C.warningBg }, high: { l: "גבוה", c: C.danger, bg: C.dangerBg } };
const EVT_STATUS_MAP = { closed: { l: "סגור", c: C.textMuted }, investigating: { l: "בחקירה", c: C.warning }, open: { l: "פתוח", c: C.danger } };

function EventReportingModule() {
  const [filterCat, setFilterCat] = useState("הכל");
  const evtCats = ["הכל", ...new Set(LOSS_EVENTS.map(e => e.cat))];
  const filtered = filterCat === "הכל" ? LOSS_EVENTS : LOSS_EVENTS.filter(e => e.cat === filterCat);
  const totalLoss = LOSS_EVENTS.reduce((a, e) => a + e.lossAmount, 0);
  const openCount = LOSS_EVENTS.filter(e => e.status !== "closed").length;
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <FileWarning size={20} color={C.accent} /> דיווח אירועים
            <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>PRO</span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>אירועי הפסד, כמעט-אירועים, דיווח לרגולטור</p>
        </div>
        <button style={{ background: C.accentGrad, color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><Plus size={13} /> דווח אירוע חדש</button>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "סה״כ אירועים", value: LOSS_EVENTS.length, c: C.accent },
          { label: "פתוחים / בחקירה", value: openCount, c: openCount > 0 ? C.danger : C.success },
          { label: "הפסד מצטבר", value: `₪${(totalLoss / 1e3).toFixed(0)}K`, c: C.warning },
          { label: "דווחו לרגולטור", value: LOSS_EVENTS.filter(e => e.reported).length, c: C.accent },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: "Rubik" }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {evtCats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? C.accent : C.surface, color: filterCat === c ? "white" : C.textSec, border: `1px solid ${filterCat === c ? C.accent : C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: filterCat === c ? 600 : 400, cursor: "pointer", fontFamily: "Rubik" }}>{c}</button>
        ))}
      </div>

      {/* Events List */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {filtered.map((evt, i) => {
          const sev = SEV_MAP[evt.severity];
          const st = EVT_STATUS_MAP[evt.status];
          const isExp = expanded === evt.id;
          return (
            <div key={evt.id}>
              <div onClick={() => setExpanded(isExp ? null : evt.id)} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: isExp ? C.accentLight : i % 2 === 0 ? "white" : "#FAFBFC", transition: "background 0.1s" }}
                onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = "#F8FAFC"; }}
                onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFBFC"; }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: sev.c, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{evt.title}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{evt.id}</span>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{evt.date}</span>
                    <span style={{ background: C.borderLight, color: C.textSec, fontSize: 8, padding: "1px 5px", borderRadius: 3, fontFamily: "Rubik" }}>{evt.cat}</span>
                  </div>
                </div>
                <span style={{ background: sev.bg, color: sev.c, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{sev.l}</span>
                <span style={{ color: st.c, fontSize: 9, fontWeight: 600, fontFamily: "Rubik" }}>{st.l}</span>
                {evt.lossAmount > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: C.danger, fontFamily: "Rubik" }}>₪{evt.lossAmount.toLocaleString()}</span>}
                {evt.reported && <span style={{ fontSize: 8, background: C.accentLight, color: C.accent, padding: "1px 5px", borderRadius: 3, fontFamily: "Rubik" }}>דווח</span>}
                {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
              </div>
              {isExp && (
                <div style={{ padding: "12px 16px 16px 36px", background: C.borderLight, borderBottom: `1px solid ${C.border}`, animation: "fadeInUp 0.15s ease-out" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11, fontFamily: "Assistant" }}>
                    <div><span style={{ color: C.textMuted, fontWeight: 600 }}>סיבת שורש: </span><span style={{ color: C.text }}>{evt.rootCause}</span></div>
                    <div><span style={{ color: C.textMuted, fontWeight: 600 }}>הפסד: </span><span style={{ color: evt.lossAmount > 0 ? C.danger : C.textSec, fontWeight: 600 }}>{evt.lossAmount > 0 ? `₪${evt.lossAmount.toLocaleString()}` : "אין הפסד ישיר"}</span></div>
                    <div><span style={{ color: C.textMuted, fontWeight: 600 }}>דווח לרגולטור: </span><span style={{ color: evt.reported ? C.success : C.textSec }}>{evt.reported ? "כן" : "לא"}</span></div>
                    <div><span style={{ color: C.textMuted, fontWeight: 600 }}>סטטוס: </span><span style={{ color: st.c, fontWeight: 600 }}>{st.l}</span></div>
                  </div>
                  {evt.status !== "closed" && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                      <button style={{ background: C.accent, color: "white", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>עדכן סטטוס</button>
                      {!evt.reported && <button style={{ background: C.danger, color: "white", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>דווח לרגולטור</button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// BILLING MODULE
// ═══════════════════════════════════════════════
const PLANS = [
  { id: "starter", name: "Starter", price: "3,500", desc: "רישיון אשראי מורחב", color: C.accentTeal, features: [
    "ממשל ניהול סיכונים", "סיכון תפעולי + הונאה", "ניהול מיקור חוץ", "המשכיות עסקית", "14 תבניות מסמכים בעברית",
    "נווט רגולציה (2024-10-2)", "מאגר 30 סיכונים + בקרות", "דשבורד ציות בזמן אמת", "עד 3 משתמשים", "ליווי NTL בסיסי",
  ], missing: ["ממשל סייבר", "הגנת סייבר", "אירועי סייבר", "סיכון אשראי", "KRI", "דיווח אירועים", "NuTeLa AI", "דוח דירקטוריון אוטומטי"] },
  { id: "pro", name: "Pro", price: "5,000", desc: "כל סוגי הרישיונות", color: C.accent, current: true, features: [
    "הכל ב-Starter +", "ממשל סייבר (2022-10-9)", "הגנת סייבר", "אירועי סייבר + דיווח ISA", "סיכון אשראי (PD/LGD/ECL)",
    "מדדי סיכון מפתח (KRI)", "דיווח אירועים + Loss Events", "NuTeLa AI יועצת", "36 תבניות מסמכים", "דוח דירקטוריון אוטומטי",
    "עד 10 משתמשים", "ליווי NTL מקיף",
  ], missing: ["API Access", "אינטגרציות מותאמות", "משתמשים ללא הגבלה"] },
  { id: "enterprise", name: "Enterprise", price: "8,000+", desc: "מוסדות מורכבים", color: "#7C6FD0", features: [
    "הכל ב-Pro +", "API Access מלא", "אינטגרציות Core Banking", "תבניות מותאמות אישית", "מנהל לקוח ייעודי",
    "עדיפות בתמיכה", "משתמשים ללא הגבלה", "הדרכות On-Site", "ביקורת פנימית שנתית", "SLA 99.9%",
  ], missing: [] },
];
const ADDON_ITEMS = [
  { name: "תבנית מסמך בודדת", price: "250", desc: "רכישה חד-פעמית של תבנית PRO" },
  { name: "הדרכה פרטנית (שעה)", price: "450", desc: "הדרכה אישית עם יועץ NTL" },
  { name: "סקירת עמידה מקיפה", price: "2,500", desc: "סקירה מקצועית + דוח ממצאים" },
  { name: "הכנה לביקורת רגולטור", price: "3,500", desc: "סימולציה + הכנת תיק ראיות" },
];

function BillingScreen() {
  const [tab, setTab] = useState("plans"); // plans | addons | invoices

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Receipt size={20} color={C.accent} /> חבילות ומחירים
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>נהל את המנוי, שדרג חבילה, או רכוש תוספות</p>
        </div>
        <div style={{ background: C.accentLight, borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <Crown size={14} color={C.accent} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "Rubik" }}>חבילה נוכחית: Pro</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {[{ id: "plans", l: "חבילות" }, { id: "addons", l: "תוספות ורכישות" }, { id: "invoices", l: "חשבוניות" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.accent : C.surface, color: tab === t.id ? "white" : C.textSec, border: `1px solid ${tab === t.id ? C.accent : C.border}`, borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", fontFamily: "Rubik" }}>{t.l}</button>
        ))}
      </div>

      {tab === "plans" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: C.surface, border: plan.current ? `2px solid ${plan.color}` : `1px solid ${C.border}`, borderRadius: 14, padding: 24, position: "relative", transition: "all 0.2s", transform: plan.current ? "scale(1.02)" : "none", boxShadow: plan.current ? `0 4px 24px ${plan.color}20` : "none" }}>
              {plan.current && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 14px", borderRadius: 10, fontFamily: "Rubik" }}>⭐ החבילה שלך</div>}
              <div style={{ textAlign: "center", marginBottom: 16, paddingTop: plan.current ? 8 : 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: plan.color, fontFamily: "Rubik" }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant", marginBottom: 8 }}>{plan.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: plan.color, fontFamily: "Rubik" }}>₪{plan.price}</span>
                  <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant" }}>/ חודש</span>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 14 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 11, color: C.text, fontFamily: "Assistant" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: `${plan.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckSquare size={8} color={plan.color} />
                    </div>
                    {f}
                  </div>
                ))}
                {plan.missing.map((f, i) => (
                  <div key={`m${i}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 11, color: C.textMuted, fontFamily: "Assistant", opacity: 0.5 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.borderLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <X size={8} color={C.textMuted} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button style={{ width: "100%", marginTop: 16, padding: "10px", background: plan.current ? C.borderLight : `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`, color: plan.current ? C.textSec : "white", border: plan.current ? `1px solid ${C.border}` : "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: plan.current ? "default" : "pointer", fontFamily: "Rubik" }}>
                {plan.current ? "חבילה נוכחית" : plan.id === "starter" ? "שנמך חבילה" : "שדרג עכשיו"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "addons" && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={15} color={C.accent} /> רכישות בודדות</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {ADDON_ITEMS.map((item, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik", marginBottom: 3 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>{item.desc}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, fontFamily: "Rubik" }}>₪{item.price}</div>
                  <button style={{ background: C.accentGrad, color: "white", border: "none", padding: "5px 14px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", marginTop: 4 }}>רכוש</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Assistant" }}>
            <thead><tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
              {["מספר", "תאריך", "תיאור", "סכום", "סטטוס", ""].map(h => <th key={h} style={{ textAlign: "right", padding: "9px 12px", fontWeight: 600, fontSize: 10, color: C.textSec, fontFamily: "Rubik" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                { num: "INV-2026-02", date: "01/02/2026", desc: "Pro — פברואר 2026", amount: "5,000", status: "שולם" },
                { num: "INV-2026-01", date: "01/01/2026", desc: "Pro — ינואר 2026", amount: "5,000", status: "שולם" },
                { num: "INV-2025-12", date: "01/12/2025", desc: "Pro — דצמבר 2025 + הדרכה", amount: "5,450", status: "שולם" },
                { num: "INV-2025-11", date: "01/11/2025", desc: "Pro — נובמבר 2025", amount: "5,000", status: "שולם" },
              ].map((inv, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "white" : "#FAFBFC" }}>
                  <td style={{ padding: "10px 12px", fontFamily: "Rubik", fontWeight: 600, color: C.accent }}>{inv.num}</td>
                  <td style={{ padding: "10px 12px" }}>{inv.date}</td>
                  <td style={{ padding: "10px 12px" }}>{inv.desc}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "Rubik", fontWeight: 600 }}>₪{inv.amount}</td>
                  <td style={{ padding: "10px 12px" }}><span style={{ background: C.successBg, color: C.success, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, fontFamily: "Rubik" }}>{inv.status}</span></td>
                  <td style={{ padding: "10px 12px" }}><button style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "Rubik", color: C.textSec }}>הורד PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// BOARD OF DIRECTORS CYCLE (PRO)
// ═══════════════════════════════════════════════
const BOARD_MEETINGS = [
  { id: "BM01", date: "15/01/2026", quarter: "Q4/2025", type: "ועדת סיכונים", status: "completed", decisions: 3, followups: 2, attendees: ["אבי שרון","רונית גולד","משה דוד","יוסי לוי"], chair: "רונית גולד",
    agenda: ["סקירת מפת סיכונים Q4", "אישור תקציב הגנת סייבר 2026", "דיווח ריכוזיות אשראי"],
    decisions_list: [
      { id: "D01", text: "אושרה מדיניות ניהול סיכונים 2026", owner: "יוסי לוי", due: "28/02/2026", status: "done" },
      { id: "D02", text: "תקציב סייבר ₪280K — אושר", owner: "דנה כהן", due: "—", status: "done" },
      { id: "D03", text: "נדרש לצמצם ריכוזיות נדל״ן ל-30%", owner: "יוסי לוי", due: "30/06/2026", status: "active" },
    ]},
  { id: "BM02", date: "20/03/2026", quarter: "Q1/2026", type: "דירקטוריון — סיכונים", status: "scheduled", decisions: 0, followups: 0, attendees: ["אבי שרון","רונית גולד","משה דוד","יוסי לוי","דנה כהן"], chair: "אבי שרון",
    agenda: ["דוח ציות Q1", "סקירת KRI", "עדכון BCP", "מעקב החלטות Q4"],
    decisions_list: [] },
  { id: "BM03", date: "15/06/2026", quarter: "Q2/2026", type: "ועדת סיכונים", status: "planned", decisions: 0, followups: 0, attendees: [], chair: "רונית גולד",
    agenda: ["סקירת מפת סיכונים H1", "דוח ביקורת פנימית", "סקירת ספקים קריטיים"],
    decisions_list: [] },
  { id: "BM04", date: "20/09/2026", quarter: "Q3/2026", type: "דירקטוריון — סיכונים", status: "planned", decisions: 0, followups: 0, attendees: [], chair: "אבי שרון",
    agenda: ["דוח חצי-שנתי", "אישור תכנית עבודה 2027", "סקירת סייבר שנתית"],
    decisions_list: [] },
];
const BOARD_REPORTS = [
  { id: "BR01", name: "דוח ציות רבעוני Q4/2025", type: "quarterly", status: "delivered", date: "15/01/2026", pages: 24, meeting: "BM01" },
  { id: "BR02", name: "מצגת מפת סיכונים Q4", type: "presentation", status: "delivered", date: "15/01/2026", pages: 16, meeting: "BM01" },
  { id: "BR03", name: "דוח KRI רבעוני Q4/2025", type: "kri", status: "delivered", date: "15/01/2026", pages: 8, meeting: "BM01" },
  { id: "BR04", name: "דוח ציות רבעוני Q1/2026", type: "quarterly", status: "drafting", date: "—", pages: 0, meeting: "BM02" },
  { id: "BR05", name: "דוח KRI רבעוני Q1/2026", type: "kri", status: "drafting", date: "—", pages: 0, meeting: "BM02" },
  { id: "BR06", name: "סקירת BCP + המלצות", type: "special", status: "not_started", date: "—", pages: 0, meeting: "BM02" },
  { id: "BR07", name: "דוח חצי-שנתי H1/2026", type: "annual", status: "not_started", date: "—", pages: 0, meeting: "BM03" },
];
const ANNUAL_PLAN = [
  { q: "Q1", tasks: ["דוח ציות רבעוני", "סקירת KRI", "מעקב החלטות Q4", "עדכון BCP"], done: 1, total: 4 },
  { q: "Q2", tasks: ["סקירת מפת סיכונים H1", "ביקורת פנימית", "סקירת ספקים", "דוח ציות"], done: 0, total: 4 },
  { q: "Q3", tasks: ["דוח חצי-שנתי", "תכנית עבודה 2027", "סקירת סייבר", "דוח ציות"], done: 0, total: 4 },
  { q: "Q4", tasks: ["סיכום שנתי", "תקציב סיכונים", "בחינת מדיניות", "דוח ציות"], done: 0, total: 4 },
];
const BR_STATUS = { delivered: { l: "נמסר", c: C.success, bg: C.successBg }, drafting: { l: "בהכנה", c: C.warning, bg: C.warningBg }, not_started: { l: "טרם החל", c: C.textMuted, bg: C.borderLight } };
const BM_STATUS = { completed: { l: "בוצע", c: C.success, bg: C.successBg }, scheduled: { l: "מתוכנן", c: C.accent, bg: C.accentLight }, planned: { l: "מתוכנן", c: C.textMuted, bg: C.borderLight } };
const D_STATUS = { done: { l: "בוצע", c: C.success }, active: { l: "פעיל", c: C.warning }, overdue: { l: "באיחור", c: C.danger } };

function BoardCycleModule({ onPreviewReport }) {
  const [tab, setTab] = useState("timeline"); // timeline | reports | decisions | plan
  const [expandedMeeting, setExpandedMeeting] = useState("BM01");
  const [approvalModal, setApprovalModal] = useState(null);
  const [agendaSent, setAgendaSent] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  const handleGenerate = (id) => { const r = generateWordReport(id); if (r) onPreviewReport(r); };
  const totalDecisions = BOARD_MEETINGS.reduce((a, m) => a + m.decisions_list.length, 0);
  const openDecisions = BOARD_MEETINGS.flatMap(m => m.decisions_list).filter(d => d.status !== "done").length;
  const nextMeeting = BOARD_MEETINGS.find(m => m.status === "scheduled");

  const DIRECTORS = [
    { name: "רונית גולד", role: "יו״ר דירקטוריון", email: "ronit@finance.co.il" },
    { name: "אבי שרון", role: "דירקטור", email: "avi@finance.co.il" },
    { name: "משה דוד", role: "דירקטור חיצוני", email: "moshe@finance.co.il" },
    { name: "דנה כהן", role: "דירקטור בלתי תלוי", email: "dana@finance.co.il" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Briefcase size={20} color={C.accent} /> ממשל תאגידי — דירקטוריון
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>ישיבות, סדרי יום, פרוטוקולים, החלטות ואישורים</p>
        </div>
        {nextMeeting && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setAgendaSent(p => ({ ...p, [nextMeeting.id]: true })); }} style={{ background: agendaSent[nextMeeting?.id] ? C.successBg : C.accentGrad, color: agendaSent[nextMeeting?.id] ? C.success : "white", border: agendaSent[nextMeeting?.id] ? `1px solid ${C.success}` : "none", borderRadius: 10, padding: "10px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}>
              <Send size={12} /> {agendaSent[nextMeeting?.id] ? "סדר יום נשלח ✓" : "שלח סדר יום לדירקטורים"}
            </button>
            <div style={{ background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={16} color={C.accent} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: "Rubik" }}>ישיבה הבאה: {nextMeeting.date}</div>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{nextMeeting.type}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "ישיבות השנה", value: BOARD_MEETINGS.length, c: C.accent, icon: Calendar },
          { label: "בוצעו", value: BOARD_MEETINGS.filter(m => m.status === "completed").length, c: C.success, icon: CheckSquare },
          { label: "דוחות", value: BOARD_REPORTS.length, c: C.accent, icon: FileText },
          { label: "החלטות", value: totalDecisions, c: C.text, icon: ClipboardList },
          { label: "החלטות פתוחות", value: openDecisions, c: openDecisions > 0 ? C.warning : C.success, icon: Clock },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${kpi.c}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <kpi.icon size={16} color={kpi.c} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: kpi.c, fontFamily: "Rubik" }}>{kpi.value}</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[{ id: "timeline", l: "ציר זמן", Icon: Calendar }, { id: "reports", l: "דוחות", Icon: FileText }, { id: "decisions", l: "החלטות", Icon: ClipboardList }, { id: "plan", l: "תוכנית שנתית", Icon: Target }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.accent : C.surface, color: tab === t.id ? "white" : C.textSec, border: `1px solid ${tab === t.id ? C.accent : C.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 11, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><t.Icon size={12} />{t.l}</button>
        ))}
      </div>

      {/* Timeline Tab */}
      {tab === "timeline" && (
        <div style={{ position: "relative", paddingRight: 28 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", top: 0, right: 12, bottom: 0, width: 2, background: C.borderLight, borderRadius: 1 }} />

          {BOARD_MEETINGS.map((mtg, i) => {
            const ms = BM_STATUS[mtg.status];
            const isExp = expandedMeeting === mtg.id;
            return (
              <div key={mtg.id} style={{ position: "relative", marginBottom: 16 }}>
                {/* Dot on timeline */}
                <div style={{ position: "absolute", right: -28, top: 18, width: 26, height: 26, borderRadius: "50%", background: ms.bg, border: `3px solid ${ms.c}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                  {mtg.status === "completed" ? <CheckSquare size={10} color={ms.c} /> : <Calendar size={10} color={ms.c} />}
                </div>

                <div onClick={() => setExpandedMeeting(isExp ? null : mtg.id)} style={{ background: C.surface, border: `1px solid ${isExp ? C.accent : C.border}`, borderRadius: 12, cursor: "pointer", overflow: "hidden", transition: "all 0.15s", boxShadow: isExp ? `0 2px 12px ${C.accent}10` : "none" }}>
                  {/* Header */}
                  <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{mtg.type}</span>
                        <span style={{ background: ms.bg, color: ms.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>{ms.l}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Calendar size={10} /> {mtg.date}</span>
                        <span>{mtg.quarter}</span>
                        <span>יו״ר: {mtg.chair}</span>
                        {mtg.decisions > 0 && <span style={{ color: C.accent, fontWeight: 600 }}>{mtg.decisions} החלטות</span>}
                      </div>
                    </div>
                    {isExp ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
                  </div>

                  {/* Expanded content */}
                  {isExp && (
                    <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: "16px 18px", animation: "fadeInUp 0.15s ease-out" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {/* Agenda */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><ClipboardList size={11} color={C.accent} /> סדר יום</div>
                          {mtg.agenda.map((item, j) => (
                            <div key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "4px 0", fontSize: 11, color: C.textSec, fontFamily: "Assistant" }}>
                              <div style={{ width: 18, height: 18, borderRadius: 4, background: C.borderLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.textMuted, fontFamily: "Rubik", flexShrink: 0 }}>{j + 1}</div>
                              {item}
                            </div>
                          ))}
                        </div>

                        {/* Attendees */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><Users size={11} color={C.accent} /> משתתפים ({mtg.attendees.length})</div>
                          {mtg.attendees.length > 0 ? mtg.attendees.map((a, j) => (
                            <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8, fontWeight: 700, fontFamily: "Rubik" }}>{a.split(" ").map(n => n[0]).join("")}</div>
                              <span style={{ fontSize: 11, color: C.text, fontFamily: "Assistant" }}>{a}{a === mtg.chair ? " (יו״ר)" : ""}</span>
                            </div>
                          )) : <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>טרם אושרו</div>}
                        </div>
                      </div>

                      {/* Decisions */}
                      {mtg.decisions_list.length > 0 && (
                        <div style={{ marginTop: 14, borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><CheckSquare size={11} color={C.success} /> החלטות</div>
                          {mtg.decisions_list.map(d => {
                            const ds = D_STATUS[d.status];
                            return (
                              <div key={d.id} style={{ background: C.borderLight, borderRadius: 8, padding: "10px 12px", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center", borderRight: `3px solid ${ds.c}` }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{d.text}</div>
                                  <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>
                                    <span>אחראי: {d.owner}</span>
                                    {d.due !== "—" && <span>עד: {d.due}</span>}
                                  </div>
                                </div>
                                <span style={{ background: `${ds.c}15`, color: ds.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>{ds.l}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Linked reports */}
                      {(() => {
                        const linkedReports = BOARD_REPORTS.filter(r => r.meeting === mtg.id);
                        return linkedReports.length > 0 && (
                          <div style={{ marginTop: 14, borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><FileText size={11} color={C.accent} /> דוחות מקושרים</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {linkedReports.map(r => {
                                const rs = BR_STATUS[r.status];
                                return (
                                  <div key={r.id} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                                    <FileText size={12} color={C.accent} />
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{r.name}</div>
                                      <span style={{ fontSize: 8, color: rs.c, fontWeight: 600, fontFamily: "Rubik" }}>{rs.l}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Send & Approval Actions */}
                      {mtg.status === "completed" && (
                        <div style={{ marginTop: 14, borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} color={C.accent} /> שליחה ואישור פרוטוקול</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { setAgendaSent(p => ({ ...p, [`sum-${mtg.id}`]: true })); }}
                              style={{ flex: 1, background: agendaSent[`sum-${mtg.id}`] ? C.successBg : C.accentGrad, color: agendaSent[`sum-${mtg.id}`] ? C.success : "white", border: agendaSent[`sum-${mtg.id}`] ? `1px solid ${C.success}` : "none", borderRadius: 8, padding: "10px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                              <Send size={11} /> {agendaSent[`sum-${mtg.id}`] ? "סיכום נשלח לדירקטורים ✓" : "שלח סיכום לדירקטורים"}
                            </button>
                            <button onClick={() => setApprovalModal(mtg)}
                              style={{ flex: 1, background: "white", color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, padding: "10px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                              <Vote size={11} /> סטטוס אישור פרוטוקול
                            </button>
                          </div>
                          {/* Director approval status */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                            {DIRECTORS.map((dir, di) => {
                              const status = approvalStatus[`${mtg.id}-${di}`] || "pending";
                              const sc = { approved: { l: "אישר ✓", c: C.success, bg: C.successBg }, pending: { l: "ממתין", c: C.warning, bg: C.warningBg }, commented: { l: "הערות", c: C.accent, bg: C.accentLight } }[status];
                              return (
                                <div key={di} style={{ background: sc.bg, borderRadius: 6, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <div style={{ fontSize: 10, color: C.text, fontFamily: "Rubik", fontWeight: 500 }}>{dir.name}</div>
                                  <span style={{ fontSize: 8, color: sc.c, fontWeight: 700, fontFamily: "Rubik" }}>{sc.l}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Assistant" }}>
            <thead><tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
              {["דוח", "סוג", "ישיבה", "תאריך", "עמודים", "סטטוס", ""].map(h => <th key={h} style={{ textAlign: "right", padding: "9px 12px", fontWeight: 600, fontSize: 10, color: C.textSec, fontFamily: "Rubik" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {BOARD_REPORTS.map((r, i) => {
                const rs = BR_STATUS[r.status];
                const rtLabels = { quarterly: "רבעוני", presentation: "מצגת", kri: "KRI", special: "מיוחד", annual: "שנתי" };
                const mtg = BOARD_MEETINGS.find(m => m.id === r.meeting);
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "white" : "#FAFBFC" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500, color: C.text }}>{r.name}</td>
                    <td style={{ padding: "10px 12px" }}><span style={{ background: C.borderLight, padding: "2px 6px", borderRadius: 3, fontSize: 9, fontFamily: "Rubik", color: C.textSec }}>{rtLabels[r.type]}</span></td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: C.textSec }}>{mtg?.quarter}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "Rubik", fontSize: 11 }}>{r.date}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "Rubik", fontSize: 11 }}>{r.pages || "—"}</td>
                    <td style={{ padding: "10px 12px" }}><span style={{ background: rs.bg, color: rs.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: "Rubik" }}>{rs.l}</span></td>
                    <td style={{ padding: "10px 12px" }}>
                      {r.status === "delivered" && <button onClick={() => handleGenerate("board")} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "Rubik", color: C.textSec, display: "flex", alignItems: "center", gap: 3 }}><FileOutput size={9} />הורד</button>}
                      {r.status === "drafting" && <button onClick={() => handleGenerate(r.type === "kri" ? "RPT-02" : "RPT-01")} style={{ background: C.accentGrad, border: "none", borderRadius: 5, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "Rubik", color: "white", fontWeight: 600 }}>צור דוח</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Decisions Tab */}
      {tab === "decisions" && (
        <div>
          {BOARD_MEETINGS.filter(m => m.decisions_list.length > 0).map(mtg => (
            <div key={mtg.id} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={12} color={C.accent} /> {mtg.type} — {mtg.date} ({mtg.quarter})
              </div>
              {mtg.decisions_list.map(d => {
                const ds = D_STATUS[d.status];
                return (
                  <div key={d.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", borderRight: `4px solid ${ds.c}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: "Assistant", lineHeight: 1.4 }}>{d.text}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 10, color: C.textMuted, fontFamily: "Rubik" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={9} /> {d.owner}</span>
                        {d.due !== "—" && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={9} /> {d.due}</span>}
                        <span>{d.id}</span>
                      </div>
                    </div>
                    <span style={{ background: `${ds.c}15`, color: ds.c, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 6, fontFamily: "Rubik" }}>{ds.l}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Annual Plan Tab */}
      {tab === "plan" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {ANNUAL_PLAN.map((qp, i) => {
              const pct = qp.total ? Math.round((qp.done / qp.total) * 100) : 0;
              const isCurrent = i === 0;
              return (
                <div key={qp.q} style={{ background: C.surface, border: `1px solid ${isCurrent ? C.accent : C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: isCurrent ? `0 2px 12px ${C.accent}15` : "none" }}>
                  {/* Quarter header */}
                  <div style={{ background: isCurrent ? C.accentGrad : C.borderLight, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: isCurrent ? "white" : C.text, fontFamily: "Rubik" }}>{qp.q}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? "rgba(255,255,255,0.8)" : C.textMuted, fontFamily: "Rubik" }}>{pct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: C.borderLight }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: isCurrent ? C.accent : C.success, transition: "width 0.3s" }} />
                  </div>
                  {/* Tasks */}
                  <div style={{ padding: 14 }}>
                    {qp.tasks.map((task, j) => {
                      const isDone = j < qp.done;
                      return (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: j < qp.tasks.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: isDone ? C.success : C.borderLight, border: isDone ? "none" : `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isDone && <CheckSquare size={10} color="white" />}
                          </div>
                          <span style={{ fontSize: 11, color: isDone ? C.textMuted : C.text, fontFamily: "Assistant", textDecoration: isDone ? "line-through" : "none" }}>{task}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 8, fontSize: 10, color: C.textMuted, fontFamily: "Assistant", textAlign: "center" }}>
                      {qp.done} / {qp.total} הושלמו
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Protocol Approval Modal ═══ */}
      {approvalModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.7)", direction: "rtl" }}>
          <div style={{ width: 600, maxHeight: "85vh", background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "fadeInUp 0.3s ease-out", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ background: C.accentGrad, padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Vote size={20} color="white" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Rubik" }}>אישור פרוטוקול — {approvalModal.type}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Assistant" }}>{approvalModal.date} · {approvalModal.quarter}</div>
              </div>
              <button onClick={() => setApprovalModal(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="white" /></button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {/* Meeting Summary */}
              <div style={{ background: C.borderLight, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 10 }}>סיכום ישיבה</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik", marginBottom: 6 }}>סדר יום:</div>
                {approvalModal.agenda?.map((a, i) => (
                  <div key={i} style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant", padding: "2px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: C.accent }}>{i + 1}.</span> {a}
                  </div>
                ))}
                {approvalModal.decisions_list?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik", marginBottom: 6 }}>החלטות שנתקבלו:</div>
                    {approvalModal.decisions_list.map(d => (
                      <div key={d.id} style={{ background: "white", borderRadius: 8, padding: "8px 12px", marginBottom: 4, border: `1px solid ${C.border}`, borderRight: `3px solid ${C.accent}` }}>
                        <div style={{ fontSize: 11, color: C.text, fontFamily: "Assistant" }}>{d.text}</div>
                        <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik", marginTop: 2 }}>אחראי: {d.owner} {d.due !== "—" ? `· עד ${d.due}` : ""}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Director Approval Section */}
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 10 }}>סטטוס אישור דירקטורים</div>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant", marginBottom: 12 }}>כל דירקטור מקבל לינק אישור למייל. ניתן לאשר, לדחות, או להוסיף הערות (Track Changes).</div>
              <div style={{ display: "grid", gap: 8 }}>
                {DIRECTORS.map((dir, i) => {
                  const key = `${approvalModal.id}-${i}`;
                  const status = approvalStatus[key] || "pending";
                  return (
                    <div key={i} style={{ background: C.borderLight, borderRadius: 10, padding: "12px 16px", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{dir.name}</div>
                          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{dir.role} · {dir.email}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {["approved","commented","pending"].map(s => {
                            const styles = { approved: { l: "אישר ✓", c: C.success, bg: C.successBg }, commented: { l: "הערות", c: C.accent, bg: C.accentLight }, pending: { l: "ממתין", c: C.warning, bg: C.warningBg } }[s];
                            return (
                              <button key={s} onClick={() => setApprovalStatus(p => ({ ...p, [key]: s }))} style={{ background: status === s ? styles.bg : "white", color: status === s ? styles.c : C.textMuted, border: `1px solid ${status === s ? styles.c : C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>{styles.l}</button>
                            );
                          })}
                        </div>
                      </div>
                      {status === "commented" && (
                        <div style={{ background: "white", borderRadius: 8, border: `1px solid ${C.accent}30`, padding: "8px 12px", marginTop: 6 }}>
                          <div style={{ fontSize: 9, color: C.accent, fontWeight: 600, fontFamily: "Rubik", marginBottom: 4 }}>📝 הערות Track Changes:</div>
                          <div style={{ fontSize: 11, color: C.text, fontFamily: "Assistant", lineHeight: 1.6 }}>
                            <span style={{ background: "#FEF3C7", padding: "1px 3px", borderRadius: 2, textDecoration: "line-through", color: C.textMuted }}>החברה תצמצם ריכוזיות</span>{" "}
                            <span style={{ background: "#D1FAE5", padding: "1px 3px", borderRadius: 2, color: C.success }}>החברה תצמצם ריכוזיות ענפית עד Q2/2026</span>
                            <div style={{ marginTop: 4, fontSize: 10, color: C.textMuted }}>— {dir.name}, {new Date().toLocaleDateString("he-IL")}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>
                {DIRECTORS.filter((_, i) => approvalStatus[`${approvalModal.id}-${i}`] === "approved").length}/{DIRECTORS.length} אישרו
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { DIRECTORS.forEach((_, i) => { if (!approvalStatus[`${approvalModal.id}-${i}`] || approvalStatus[`${approvalModal.id}-${i}`] === "pending") { setAgendaSent(p => ({ ...p, [`remind-${approvalModal.id}-${i}`]: true })); } }); }}
                  style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 18px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", color: C.textSec, display: "flex", alignItems: "center", gap: 4 }}>
                  <BellRing size={11} /> שלח תזכורת לממתינים
                </button>
                <button onClick={() => setApprovalModal(null)}
                  style={{ background: C.accentGrad, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik" }}>
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════
const REPORT_TEMPLATES = [
  { id: "RPT-01", name: "דוח ציות רבעוני", desc: "סקירת עמידה בדרישות רגולטוריות — חוזר 2024-10-2 וחוזר 2022-10-9", type: "quarterly", frequency: "רבעוני", pages: 24, sections: ["סיכום מנהלים", "סטטוס עמידה", "מפת סיכונים", "KRI", "המלצות"], lastGenerated: "15/01/2026", icon: Shield },
  { id: "RPT-02", name: "דוח KRI רבעוני", desc: "ניתוח מדדי סיכון מפתח, מגמות, חריגות מספים", type: "kri", frequency: "רבעוני", pages: 8, sections: ["סיכום KRI", "מגמות 6 חודשים", "חריגות", "המלצות"], lastGenerated: "15/01/2026", icon: Gauge },
  { id: "RPT-03", name: "דוח סיכונים לדירקטוריון", desc: "מצגת סיכונים מקיפה לישיבת דירקטוריון", type: "board", frequency: "רבעוני", pages: 16, sections: ["מפת חום", "סיכונים עיקריים", "בקרות", "תוכנית פעולה", "נספחים"], lastGenerated: "15/01/2026", icon: Briefcase },
  { id: "RPT-04", name: "דוח סייבר חצי-שנתי", desc: "סקירת מצב הגנת סייבר — איומים, בקרות, אירועים", type: "cyber", frequency: "חצי-שנתי", pages: 20, sections: ["נוף איומים", "סטטוס בקרות", "אירועי סייבר", "פגיעויות", "תוכנית שיפור"], lastGenerated: "15/07/2025", icon: ShieldAlert },
  { id: "RPT-05", name: "דוח המשכיות עסקית", desc: "סקירת תוכנית BCP/DR — תרגילים, ממצאים, שחזור", type: "bcp", frequency: "שנתי", pages: 14, sections: ["BIA", "תרגילים", "זמני שחזור", "ספקים קריטיים", "המלצות"], lastGenerated: "01/09/2025", icon: ShieldCheck },
  { id: "RPT-06", name: "דוח ספקים ומיקור חוץ", desc: "סקירת ספקים קריטיים — הערכות סיכון, SLA, ממצאים", type: "vendor", frequency: "חצי-שנתי", pages: 12, sections: ["רשימת ספקים", "הערכות סיכון", "SLA", "ממצאים", "תוכנית פעולה"], lastGenerated: "01/10/2025", icon: Handshake },
  { id: "RPT-07", name: "דוח אירועי הפסד", desc: "ריכוז אירועי הפסד ו-near-miss — ניתוח, מגמות, שורש בעיה", type: "events", frequency: "רבעוני", pages: 10, sections: ["סיכום אירועים", "ניתוח שורש", "מגמות", "דיווח לרגולטור"], lastGenerated: "15/01/2026", icon: FileWarning },
  { id: "RPT-08", name: "דוח סיכון אשראי", desc: "ניתוח תיק אשראי — PD/LGD, ריכוזיות, vintage, הפרשות", type: "credit", frequency: "רבעוני", pages: 18, sections: ["תמונת תיק", "PD/LGD", "ריכוזיות", "Vintage", "הפרשות ECL"], lastGenerated: "15/01/2026", icon: CreditCard },
  { id: "RPT-09", name: "דוח שנתי מקיף", desc: "סקירה שנתית כוללת — כל תחומי הסיכון, ביצועים, תוכנית עבודה", type: "annual", frequency: "שנתי", pages: 42, sections: ["סיכום מנהלים", "ניהול סיכונים", "סייבר", "BCP", "אשראי", "ספקים", "תוכנית 2027"], lastGenerated: "01/01/2026", icon: FileText },
];
const GENERATED_REPORTS = [
  { id: "GR-01", templateId: "RPT-01", name: "דוח ציות Q4/2025", date: "15/01/2026", status: "final", pages: 24, generatedBy: "RiskGuard AI", recipient: "דירקטוריון" },
  { id: "GR-02", templateId: "RPT-02", name: "דוח KRI Q4/2025", date: "15/01/2026", status: "final", pages: 8, generatedBy: "RiskGuard AI", recipient: "ועדת סיכונים" },
  { id: "GR-03", templateId: "RPT-03", name: "מצגת סיכונים Q4 — דירקטוריון", date: "15/01/2026", status: "final", pages: 16, generatedBy: "יוסי לוי", recipient: "דירקטוריון" },
  { id: "GR-04", templateId: "RPT-01", name: "דוח ציות Q1/2026 (טיוטה)", date: "—", status: "draft", pages: 0, generatedBy: "—", recipient: "דירקטוריון" },
  { id: "GR-05", templateId: "RPT-07", name: "דוח אירועי הפסד Q4/2025", date: "15/01/2026", status: "final", pages: 10, generatedBy: "RiskGuard AI", recipient: "מנכ״ל" },
];
const GR_STATUS = { final: { l: "סופי", c: C.success, bg: C.successBg }, draft: { l: "טיוטה", c: C.warning, bg: C.warningBg }, generating: { l: "בהפקה", c: C.accent, bg: C.accentLight } };

// ═══════════════════════════════════════════════
// WORD REPORT GENERATOR (HTML→DOC)
// ═══════════════════════════════════════════════
const RPT_COMPANY = "אשראי פייננס בע״מ";
const RPT_OFFICER = "יוסי לוי — מנהל סיכונים";
const RPT_DATE = "פברואר 2026";
const RPT_Q = "Q4/2025";
const RPT_MODULES = [
  { name: "ממשל סיכונים", score: 78, reqs: 14, met: 11, reg: "2024-10-2" },
  { name: "סיכון תפעולי", score: 65, reqs: 18, met: 12, reg: "2024-10-2" },
  { name: "מיקור חוץ", score: 70, reqs: 10, met: 7, reg: "2024-10-2" },
  { name: "המשכיות עסקית", score: 45, reqs: 12, met: 5, reg: "2024-10-2" },
  { name: "ממשל סייבר", score: 55, reqs: 16, met: 9, reg: "2022-10-9" },
  { name: "הגנת סייבר", score: 40, reqs: 22, met: 9, reg: "2022-10-9" },
  { name: "אירועי סייבר", score: 80, reqs: 8, met: 6, reg: "2022-10-9" },
];
const RPT_KRI = [
  { name: "יחס הון עצמי", value: "14.2%", q3: "13.8%", threshold: "12%", ok: true, trend: "יציב" },
  { name: "NPL Ratio", value: "3.8%", q3: "4.1%", threshold: "5%", ok: true, trend: "שיפור" },
  { name: "ריכוזיות ענפית", value: "34%", q3: "31%", threshold: "30%", ok: false, trend: "החמרה" },
  { name: "יחס נזילות", value: "128%", q3: "125%", threshold: "100%", ok: true, trend: "יציב" },
  { name: "כשלי IT", value: "4", q3: "2", threshold: "3", ok: false, trend: "החמרה" },
  { name: "זמן שחזור DR", value: "6 שעות", q3: "7 שעות", threshold: "8 שעות", ok: true, trend: "שיפור" },
  { name: "הפרשה ל-ECL", value: "2.1%", q3: "2.3%", threshold: "3%", ok: true, trend: "יציב" },
  { name: "אירועי הפסד", value: "2", q3: "3", threshold: "5", ok: true, trend: "שיפור" },
];
const RPT_RISKS = [
  { name: "כשל במערכות IT קריטיות", p: 4, i: 4, score: 16, trend: "עולה", controls: "גיבוי יומי, DR, ניטור 24/7", gap: "תרגיל DR לא בוצע" },
  { name: "ריכוזיות אשראי ענפית", p: 3, i: 4, score: 12, trend: "עולה", controls: "מדיניות ריכוזיות, דיווח רבעוני", gap: "חריגה מסף 30%" },
  { name: "מתקפת סייבר — כופרה", p: 3, i: 5, score: 15, trend: "יציב", controls: "EDR, הגנה רב-שכבתית", gap: "סריקות לא סדירות" },
  { name: "כשל ספק מהותי", p: 3, i: 3, score: 9, trend: "יציב", controls: "SLA, ביקורות, חלופות", gap: "2 ספקים ללא חלופה" },
  { name: "הונאה פנימית", p: 2, i: 4, score: 8, trend: "יורד", controls: "הפרדת תפקידים, ביקורות", gap: "—" },
];
const RPT_DECISIONS = [
  { id: "D01", text: "אושרה מדיניות ניהול סיכונים 2026", owner: "יוסי לוי", due: "28/02/2026", status: "בוצע" },
  { id: "D02", text: "תקציב סייבר ₪280K — אושר", owner: "דנה כהן", due: "—", status: "בוצע" },
  { id: "D03", text: "צמצום ריכוזיות נדל״ן ל-30%", owner: "יוסי לוי", due: "30/06/2026", status: "פעיל" },
];
const RPT_ACTIONS = [
  { n: 1, text: "ביצוע תרגיל DR + עדכון BIA", owner: "יוסי לוי", target: "31/03/2026", prio: "גבוהה", status: "בתכנון" },
  { n: 2, text: "סריקת חולשות חודשית", owner: "דנה כהן", target: "28/02/2026", prio: "גבוהה", status: "בביצוע" },
  { n: 3, text: "הדרכת פישינג Q1", owner: "דנה כהן", target: "15/03/2026", prio: "בינונית", status: "בתכנון" },
  { n: 4, text: "תוכנית צמצום ריכוזיות", owner: "יוסי לוי", target: "30/06/2026", prio: "גבוהה", status: "בתכנון" },
  { n: 5, text: "עדכון מדיניות BCP", owner: "יוסי לוי", target: "31/03/2026", prio: "גבוהה", status: "בביצוע" },
  { n: 6, text: "סקירת ספקים קריטיים", owner: "רונית גולד", target: "30/04/2026", prio: "בינונית", status: "לא החל" },
];

function generateWordReport(templateId) {
  const sc = s => s >= 80 ? "#27AE60" : s >= 50 ? "#D4A017" : "#C0392B";
  const totalReqs = RPT_MODULES.reduce((a, m) => a + m.reqs, 0);
  const metReqs = RPT_MODULES.reduce((a, m) => a + m.met, 0);
  const overallPct = Math.round((metReqs / totalReqs) * 100);
  const now = new Date().toLocaleDateString("he-IL");

  const css = `
    @page{size:A4;margin:2cm}
    body{font-family:Arial,sans-serif;direction:rtl;color:#333;line-height:1.7;font-size:11pt}
    h1{color:#1F3A5F;font-size:20pt;border-bottom:3px solid #4A8EC2;padding-bottom:8px;margin:20pt 0 12pt}
    h2{color:#4A8EC2;font-size:15pt;margin:16pt 0 8pt}
    h3{color:#1F3A5F;font-size:12pt;margin:12pt 0 6pt}
    table{border-collapse:collapse;width:100%;margin:8pt 0 12pt;font-size:10pt}
    th{background:#1F3A5F;color:white;padding:7px 10px;text-align:right;font-weight:bold;font-size:9pt}
    td{padding:6px 10px;border:1px solid #ddd;vertical-align:top}
    tr:nth-child(even){background:#F8FAFB}
    .cover{text-align:center;padding-top:120px;page-break-after:always}
    .cover h1{border:none;color:#4A8EC2;font-size:32pt;margin-bottom:4px}
    .cover .subtitle{font-size:14pt;color:#7F8C8D;margin-bottom:40px}
    .cover .brand{font-size:24pt;color:#4A8EC2;font-weight:bold;margin-bottom:6px}
    .cover .meta{text-align:center;margin-top:30px;font-size:10pt;color:#7F8C8D}
    .cover .meta td{border:none;padding:3px 12px}
    .ok{color:#27AE60;font-weight:bold}.bad{color:#C0392B;font-weight:bold}.warn{color:#D4A017;font-weight:bold}
    .tag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:8pt;font-weight:bold}
    .tag-g{background:#E8F5E9;color:#27AE60}.tag-r{background:#FDEDEE;color:#C0392B}.tag-y{background:#FFF8E1;color:#D4A017}
    ul{margin:6pt 20pt 12pt 0;padding-right:16pt}
    li{margin-bottom:4pt}
    .footer{font-size:8pt;color:#999;text-align:center;border-top:1px solid #ddd;padding-top:6px;margin-top:30px}
    .red-text{color:#C0392B;font-weight:bold}
    .header{font-size:8pt;color:#999;border-bottom:1px solid #4A8EC2;padding-bottom:4px;margin-bottom:12pt}
    .pb{page-break-before:always}
  `;

  function cover(title, subtitle) {
    return `<div class="cover">
      <div class="brand">RiskGuard</div>
      <div style="font-size:10pt;color:#999">מופעל על ידי NTL Management</div>
      <hr style="border:none;border-top:2px solid #4A8EC2;margin:30px auto;width:60%">
      <h1>${title}</h1>
      <div class="subtitle">${subtitle}</div>
      <hr style="border:none;border-top:1px solid #ddd;margin:30px auto;width:40%">
      <table class="meta" style="width:auto;margin:20px auto;border:none"><tr><td><b>מוסד:</b></td><td>${RPT_COMPANY}</td></tr><tr><td><b>תאריך:</b></td><td>${RPT_DATE}</td></tr><tr><td><b>הוכן ע״י:</b></td><td>${RPT_OFFICER}</td></tr><tr><td><b>סיווג:</b></td><td class="red-text">סודי</td></tr></table>
    </div>`;
  }

  function header(title) {
    return `<div class="header">RiskGuard | ${title} | ${RPT_COMPANY}</div>`;
  }
  function footer() { return `<div class="footer">סודי — ${RPT_COMPANY} | ${RPT_DATE} | הופק ע״י RiskGuard</div>`; }

  let body = "";
  let filename = "";

  // ═══ COMPLIANCE REPORT ═══
  if (templateId === "RPT-01" || templateId === "compliance") {
    filename = `דוח-ציות-רבעוני-${RPT_Q}`;
    body = cover("דוח ציות רגולטורי רבעוני", `${RPT_Q} | חוזר 2024-10-2 וחוזר 2022-10-9`);
    body += header("דוח ציות רבעוני");
    body += `<h1>סיכום מנהלים</h1>
      <p>דוח זה מציג את מצב העמידה הרגולטורית של ${RPT_COMPANY} נכון לסוף ${RPT_Q}, אל מול דרישות חוזר ניהול סיכונים (2024-10-2) וחוזר ניהול סיכוני סייבר (2022-10-9).</p>
      <p><b>ציון עמידה כולל: ${overallPct}%</b> (${metReqs} מתוך ${totalReqs} דרישות מקוימות)</p>
      <h3>ממצאים עיקריים:</h3>
      <ul>
        <li>ממשל סיכונים — 78% עמידה. מדיניות ונהלים מעודכנים. נדרש תיעוד מיפוי סיכונים שנתי.</li>
        <li>המשכיות עסקית — 45% בלבד. תחום בעדיפות גבוהה. תרגיל DR טרם בוצע ב-2026.</li>
        <li>הגנת סייבר — 40%. חסרים: סקירת חולשות חודשית, הדרכת פישינג.</li>
        <li>אירועי סייבר — 80%. תהליך דיווח תקין.</li>
        <li>ריכוזיות ענפית — חריגה מהסף (34% מול סף 30%).</li>
      </ul>
      <h3>המלצות:</h3>
      <ul>
        <li>תעדוף מיידי: המשכיות עסקית — ביצוע תרגיל DR ועדכון BIA עד Q2/2026.</li>
        <li>הגנת סייבר — השלמת סריקות חולשות חודשיות והדרכת עובדים.</li>
        <li>ריכוזיות — תוכנית לצמצום חשיפה לענף הנדל״ן בתוך 6 חודשים.</li>
        <li>דיווח רבעוני למנכ״ל על התקדמות בפערי ציות.</li>
      </ul>`;

    body += `<h1 class="pb">סטטוס עמידה לפי מודול</h1>
      <table><tr><th>מודול</th><th>ציון</th><th>דרישות</th><th>מקוימות</th><th>פער</th><th>חוזר</th></tr>
      ${RPT_MODULES.map(m => `<tr><td><b>${m.name}</b></td><td style="color:${sc(m.score)};font-weight:bold;text-align:center">${m.score}%</td><td style="text-align:center">${m.reqs}</td><td style="text-align:center">${m.met}</td><td style="text-align:center;color:${m.reqs - m.met > 3 ? '#C0392B' : '#999'}">${m.reqs - m.met}</td><td style="text-align:center">${m.reg}</td></tr>`).join("")}
      <tr style="background:#E8EFF5;font-weight:bold"><td>סה״כ</td><td style="color:${sc(overallPct)};text-align:center">${overallPct}%</td><td style="text-align:center">${totalReqs}</td><td style="text-align:center">${metReqs}</td><td style="text-align:center;color:#C0392B">${totalReqs - metReqs}</td><td style="text-align:center">—</td></tr></table>`;

    body += `<h1 class="pb">מדדי סיכון מפתח (KRI)</h1>
      <table><tr><th>מדד</th><th>ערך</th><th>סף</th><th>סטטוס</th><th>מגמה</th><th>פעולה</th></tr>
      ${RPT_KRI.map(k => `<tr><td><b>${k.name}</b></td><td style="text-align:center;font-weight:bold">${k.value}</td><td style="text-align:center">${k.threshold}</td><td class="${k.ok ? 'ok' : 'bad'}" style="text-align:center">${k.ok ? "תקין" : "חריגה"}</td><td style="text-align:center;color:${k.trend === "שיפור" ? "#27AE60" : k.trend === "החמרה" ? "#C0392B" : "#999"}">${k.trend}</td><td style="text-align:center;color:${k.ok ? '#999' : '#C0392B'}">${k.ok ? "—" : "נדרשת"}</td></tr>`).join("")}</table>
      <h3 class="red-text">חריגות:</h3>
      <ul><li>ריכוזיות ענפית (34% מול סף 30%) — נדרשת תוכנית צמצום תוך Q2/2026.</li>
      <li>כשלי IT (4 מול סף 3) — נובע מתקלות שרת ב-Q4. בוצע שדרוג תשתיות.</li></ul>`;

    body += `<h1 class="pb">תוכנית פעולה</h1>
      <table><tr><th>#</th><th>פעולה</th><th>אחראי</th><th>יעד</th><th>עדיפות</th><th>סטטוס</th></tr>
      ${RPT_ACTIONS.map(a => `<tr><td style="text-align:center">${a.n}</td><td>${a.text}</td><td>${a.owner}</td><td style="text-align:center">${a.target}</td><td style="text-align:center;color:${a.prio === "גבוהה" ? "#C0392B" : "#D4A017"}">${a.prio}</td><td style="text-align:center">${a.status}</td></tr>`).join("")}</table>`;
    body += footer();
  }

  // ═══ BOARD REPORT ═══
  if (templateId === "RPT-03" || templateId === "board") {
    filename = `דוח-סיכונים-דירקטוריון-${RPT_Q}`;
    body = cover("דוח סיכונים לדירקטוריון", `${RPT_Q} | ישיבת דירקטוריון — סיכונים`);
    body += header("דוח דירקטוריון");
    body += `<h1>סיכום מנהלים</h1>
      <p>דוח זה מוגש לדירקטוריון ${RPT_COMPANY} ומציג תמונת סיכון מקיפה לסוף ${RPT_Q}.</p>
      <h3>תמצית:</h3>
      <ul>
        <li>ציון עמידה כולל: ${overallPct}% — עלייה של 4% מהרבעון הקודם.</li>
        <li>5 סיכונים עיקריים מנוטרים, מתוכם 2 עם מגמת החמרה.</li>
        <li>8 מדדי סיכון (KRI) מנוטרים — 2 חריגות מספים.</li>
        <li>3 החלטות מישיבה קודמת — 2 בוצעו, 1 בטיפול.</li>
        <li>נדרשים: תרגיל DR, צמצום ריכוזיות, השלמת סקירות סייבר.</li>
      </ul>`;

    body += `<h1 class="pb">סיכונים עיקריים</h1>
      <p>5 הסיכונים המרכזיים, מדורגים לפי ציון סיכון (סבירות × השפעה):</p>
      <table><tr><th>#</th><th>סיכון</th><th>סבירות</th><th>השפעה</th><th>ציון</th><th>מגמה</th><th>בקרות</th><th>פער</th></tr>
      ${RPT_RISKS.map((r, i) => `<tr><td style="text-align:center;font-weight:bold">${i+1}</td><td><b>${r.name}</b></td><td style="text-align:center">${r.p}</td><td style="text-align:center">${r.i}</td><td style="text-align:center;font-weight:bold;color:${r.score >= 12 ? "#C0392B" : r.score >= 6 ? "#D4A017" : "#27AE60"}">${r.score}</td><td style="text-align:center;color:${r.trend === "עולה" ? "#C0392B" : r.trend === "יורד" ? "#27AE60" : "#999"}">${r.trend}</td><td>${r.controls}</td><td style="color:${r.gap === "—" ? "#999" : "#C0392B"}">${r.gap}</td></tr>`).join("")}</table>`;

    body += `<h1 class="pb">מעקב החלטות דירקטוריון</h1>
      <p>סטטוס ביצוע החלטות מישיבת ועדת הסיכונים מ-15/01/2026:</p>
      <table><tr><th>מס׳</th><th>החלטה</th><th>אחראי</th><th>יעד</th><th>סטטוס</th></tr>
      ${RPT_DECISIONS.map(d => `<tr><td style="text-align:center">${d.id}</td><td>${d.text}</td><td>${d.owner}</td><td style="text-align:center">${d.due}</td><td style="text-align:center;font-weight:bold;color:${d.status === "בוצע" ? "#27AE60" : "#D4A017"}">${d.status}</td></tr>`).join("")}</table>`;

    body += `<h1 class="pb">מדדי סיכון מפתח (KRI)</h1>
      <table><tr><th>מדד</th><th>ערך</th><th>סף</th><th>סטטוס</th><th>מגמה</th></tr>
      ${RPT_KRI.map(k => `<tr><td><b>${k.name}</b></td><td style="text-align:center;font-weight:bold">${k.value}</td><td style="text-align:center">${k.threshold}</td><td class="${k.ok ? 'ok' : 'bad'}" style="text-align:center">${k.ok ? "תקין" : "חריגה"}</td><td style="text-align:center;color:${k.trend === "שיפור" ? "#27AE60" : k.trend === "החמרה" ? "#C0392B" : "#999"}">${k.trend}</td></tr>`).join("")}</table>`;

    body += `<h1 class="pb">נושאים לדיון ואישור</h1>
      <h3 style="color:#1F3A5F">1. אישור תוכנית עבודה לסגירת פערים — Q1/2026</h3>
      <p>כולל: תרגיל DR, הדרכת סייבר, סקירת ספקים, צמצום ריכוזיות.</p>
      <h3 style="color:#1F3A5F">2. אישור מדיניות ניהול סיכונים — מעודכנת 2026</h3>
      <p>עודכנו סעיפי סיכון אשראי, סייבר, ו-BCP בהתאם לחוזרים.</p>
      <h3 style="color:#1F3A5F">3. מינוי יועץ חיצוני לסקירת BCP</h3>
      <p>המלצה למנות יועץ חיצוני לסקירת ותיקוף תוכנית ההמשכיות העסקית.</p>
      <h3 style="color:#1F3A5F">4. דיווח על חריגת KRI — ריכוזיות</h3>
      <p>ריכוזיות ענפית חורגת מהסף (34% מול 30%). נדרש אישור תוכנית צמצום.</p>`;
    body += footer();
  }

  // ═══ KRI REPORT ═══
  if (templateId === "RPT-02" || templateId === "kri") {
    filename = `דוח-KRI-${RPT_Q}`;
    body = cover("דוח מדדי סיכון מפתח (KRI)", `${RPT_Q} | ניתוח מגמות וחריגות`);
    body += header("דוח KRI רבעוני");
    body += `<h1>סיכום מנהלים</h1>
      <p>דוח KRI רבעוני מציג את מצב 8 מדדי הסיכון המרכזיים של ${RPT_COMPANY} נכון לסוף ${RPT_Q}, כולל השוואה לרבעון הקודם ולספי התראה.</p>
      <h3>ממצאים עיקריים:</h3>
      <ul>
        <li>6 מדדים מתוך 8 בתחום הנורמה (תקין).</li>
        <li>2 חריגות: ריכוזיות ענפית (34%) וכשלי IT (4).</li>
        <li>מגמת שיפור: NPL, אירועי הפסד, זמן שחזור.</li>
        <li>מגמת החמרה: ריכוזיות ענפית, כשלי IT.</li>
      </ul>`;

    body += `<h1 class="pb">סיכום מדדים — השוואת רבעונים</h1>
      <table><tr><th>מדד</th><th>Q3</th><th>Q4</th><th>סף</th><th>סטטוס</th><th>מגמה</th><th>הערה</th></tr>
      ${RPT_KRI.map(k => {
        const notes = { "ריכוזיות ענפית": "חריגה! נדרש צמצום", "כשלי IT": "עלייה — שדרוג שרתים", "NPL Ratio": "ירידה בסיכון אשראי", "יחס הון עצמי": "שיפור ברבעון", "הפרשה ל-ECL": "ירידה קלה", "אירועי הפסד": "מגמת שיפור", "זמן שחזור DR": "בתחום הסף", "יחס נזילות": "יציב" };
        return `<tr><td><b>${k.name}</b></td><td style="text-align:center">${k.q3}</td><td style="text-align:center;font-weight:bold">${k.value}</td><td style="text-align:center">${k.threshold}</td><td class="${k.ok ? 'ok' : 'bad'}" style="text-align:center">${k.ok ? "●" : "●"}</td><td style="text-align:center;color:${k.trend === "שיפור" ? "#27AE60" : k.trend === "החמרה" ? "#C0392B" : "#999"}">${k.trend}</td><td style="color:${k.ok ? '#999' : '#C0392B'}">${notes[k.name] || ""}</td></tr>`;
      }).join("")}</table>`;

    body += `<h1 class="pb">המלצות</h1>
      <ul>
        <li><b>ריכוזיות ענפית</b> — הגדרת תוכנית צמצום חשיפה לנדל״ן. יעד: 30% תוך Q2/2026.</li>
        <li><b>כשלי IT</b> — סיום שדרוג תשתיות שרתים. ניטור יומי עד להתייצבות.</li>
        <li><b>NPL ו-ECL</b> — מגמה חיובית, יש לוודא שנמשכת.</li>
        <li><b>מדד חדש</b> — הוספת ״זמן תגובה לאירוע סייבר״ — יתווסף ב-Q1/2026.</li>
      </ul>
      <p style="color:#999">הדוח הבא ייערך בסוף Q1/2026.</p>`;
    body += footer();
  }

  // ═══ CYBER REPORT ═══
  if (templateId === "RPT-04") {
    filename = `דוח-סייבר-חצי-שנתי-H2-2025`;
    const cyberMods = RPT_MODULES.filter(m => m.reg === "2022-10-9");
    const cyberPct = Math.round((cyberMods.reduce((a, m) => a + m.met, 0) / cyberMods.reduce((a, m) => a + m.reqs, 0)) * 100);
    body = cover("דוח סייבר חצי-שנתי", `H2/2025 | חוזר 2022-10-9`);
    body += header("דוח סייבר");
    body += `<h1>סיכום מנהלים</h1>
      <p>סקירת מצב הגנת הסייבר של ${RPT_COMPANY} לחצי השני של 2025. ציון עמידה כולל: ${cyberPct}%.</p>
      <h3>ממצאים:</h3>
      <ul><li>ממשל סייבר (55%) — מדיניות קיימת, נדרש עדכון נוהל ניהול אירועים.</li><li>הגנת סייבר (40%) — נקודת החולשה. חסרות סריקות חולשות סדירות.</li><li>אירועי סייבר (80%) — תיעוד ודיווח תקינים. נוהל עודכן ב-Q3.</li></ul>
      <h1 class="pb">סטטוס מודולים</h1>
      <table><tr><th>מודול</th><th>ציון</th><th>דרישות</th><th>מקוימות</th><th>פער</th></tr>
      ${cyberMods.map(m => `<tr><td><b>${m.name}</b></td><td style="text-align:center;font-weight:bold;color:${sc(m.score)}">${m.score}%</td><td style="text-align:center">${m.reqs}</td><td style="text-align:center">${m.met}</td><td style="text-align:center;color:${m.reqs - m.met > 3 ? '#C0392B' : '#999'}">${m.reqs - m.met}</td></tr>`).join("")}</table>
      <h1 class="pb">תוכנית שיפור</h1>
      <table><tr><th>#</th><th>פעולה</th><th>אחראי</th><th>יעד</th></tr>
      <tr><td>1</td><td>סריקת חולשות חודשית קבועה</td><td>דנה כהן</td><td>28/02/2026</td></tr>
      <tr><td>2</td><td>הדרכת פישינג רבעונית</td><td>דנה כהן</td><td>15/03/2026</td></tr>
      <tr><td>3</td><td>עדכון נוהל תגובה לאירוע</td><td>יוסי לוי</td><td>31/03/2026</td></tr>
      <tr><td>4</td><td>תרגיל סייבר שנתי</td><td>דנה כהן</td><td>30/06/2026</td></tr></table>`;
    body += footer();
  }

  // ═══ BCP REPORT ═══
  if (templateId === "RPT-05") {
    filename = `דוח-המשכיות-עסקית-2025`;
    body = cover("דוח המשכיות עסקית", `שנתי 2025 | BCP/DR`);
    body += header("דוח BCP");
    body += `<h1>סיכום מנהלים</h1>
      <p>סקירת מצב תוכנית ההמשכיות העסקית של ${RPT_COMPANY}. ציון עמידה: 45% — מתחת ליעד.</p>
      <h3>ממצאים:</h3>
      <ul><li>BIA (Business Impact Analysis) — בוצע ב-2024, נדרש עדכון.</li><li>תרגיל DR — אחרון בוצע 09/2024. לא בוצע ב-2025.</li><li>זמן שחזור — 6 שעות (בתחום הסף של 8 שעות).</li><li>ספקים קריטיים — 4 ספקים מזוהים, 2 ללא חלופה.</li></ul>
      <h1 class="pb">ניתוח BIA</h1>
      <table><tr><th>תהליך</th><th>קריטיות</th><th>RTO</th><th>RPO</th><th>חלופה</th></tr>
      <tr><td><b>מערכת אשראי</b></td><td class="bad" style="text-align:center">קריטי</td><td style="text-align:center">4 שעות</td><td style="text-align:center">1 שעה</td><td class="ok">קיימת</td></tr>
      <tr><td><b>מערכת גבייה</b></td><td class="warn" style="text-align:center">גבוה</td><td style="text-align:center">8 שעות</td><td style="text-align:center">4 שעות</td><td class="ok">קיימת</td></tr>
      <tr><td><b>CRM</b></td><td style="text-align:center">בינוני</td><td style="text-align:center">24 שעות</td><td style="text-align:center">12 שעות</td><td class="bad">חסרה</td></tr>
      <tr><td><b>אתר אינטרנט</b></td><td style="text-align:center">בינוני</td><td style="text-align:center">12 שעות</td><td style="text-align:center">4 שעות</td><td class="ok">קיימת</td></tr></table>
      <h1 class="pb">תוכנית פעולה</h1>
      <table><tr><th>#</th><th>פעולה</th><th>אחראי</th><th>יעד</th></tr>
      <tr><td>1</td><td>עדכון BIA</td><td>יוסי לוי</td><td>28/02/2026</td></tr>
      <tr><td>2</td><td>תרגיל DR</td><td>יוסי לוי</td><td>31/03/2026</td></tr>
      <tr><td>3</td><td>הגדרת חלופה ל-CRM</td><td>רונית גולד</td><td>30/04/2026</td></tr>
      <tr><td>4</td><td>סקירת SLA ספקים קריטיים</td><td>רונית גולד</td><td>30/04/2026</td></tr></table>`;
    body += footer();
  }

  // ═══ VENDORS REPORT ═══
  if (templateId === "RPT-06") {
    filename = `דוח-ספקים-מיקור-חוץ-H2-2025`;
    body = cover("דוח ספקים ומיקור חוץ", `H2/2025 | סקירת ספקים קריטיים`);
    body += header("דוח ספקים");
    body += `<h1>סיכום מנהלים</h1>
      <p>סקירת ספקים קריטיים של ${RPT_COMPANY}. ציון עמידה במודול מיקור חוץ: 70%.</p>
      <h1 class="pb">רשימת ספקים קריטיים</h1>
      <table><tr><th>ספק</th><th>שירות</th><th>קריטיות</th><th>SLA</th><th>הערכת סיכון</th><th>חלופה</th></tr>
      <tr><td><b>קלאוד-טק</b></td><td>שרתים + תשתית</td><td class="bad">קריטי</td><td class="ok">99.9%</td><td class="warn">בינוני</td><td class="ok">קיימת</td></tr>
      <tr><td><b>פיננס-סופט</b></td><td>מערכת אשראי</td><td class="bad">קריטי</td><td class="warn">99.5%</td><td class="bad">גבוה</td><td class="bad">חסרה</td></tr>
      <tr><td><b>סייבר-שילד</b></td><td>הגנת סייבר</td><td class="warn">גבוה</td><td class="ok">99.8%</td><td class="ok">נמוך</td><td class="ok">קיימת</td></tr>
      <tr><td><b>דאטה-בק</b></td><td>גיבוי ושחזור</td><td class="warn">גבוה</td><td class="ok">99.9%</td><td class="ok">נמוך</td><td class="bad">חסרה</td></tr></table>
      <h3 class="red-text">ממצאים הדורשים טיפול:</h3>
      <ul><li>פיננס-סופט — ספק קריטי ללא חלופה. נדרש איתור חלופה.</li><li>דאטה-בק — ללא חלופה לגיבוי. נדרש מו״מ עם ספק נוסף.</li></ul>`;
    body += footer();
  }

  // ═══ EVENTS REPORT ═══
  if (templateId === "RPT-07") {
    filename = `דוח-אירועי-הפסד-${RPT_Q}`;
    body = cover("דוח אירועי הפסד", `${RPT_Q} | ריכוז אירועים ו-Near Miss`);
    body += header("דוח אירועים");
    body += `<h1>סיכום מנהלים</h1>
      <p>ב-${RPT_Q} דווחו 2 אירועי הפסד ו-3 near-miss. ירידה ביחס ל-Q3 (3 אירועים).</p>
      <h1 class="pb">ריכוז אירועים</h1>
      <table><tr><th>מס׳</th><th>תאריך</th><th>סוג</th><th>תיאור</th><th>השפעה</th><th>סטטוס</th></tr>
      <tr><td>EVT-041</td><td>15/10/2025</td><td>תפעולי</td><td>תקלת מערכת גבייה — עיכוב 6 שעות</td><td class="warn">₪12K</td><td class="ok">סגור</td></tr>
      <tr><td>EVT-042</td><td>22/11/2025</td><td>סייבר</td><td>ניסיון פישינג — נחסם</td><td style="text-align:center">₪0</td><td class="ok">סגור</td></tr>
      <tr><td>NM-018</td><td>03/12/2025</td><td>Near Miss</td><td>כמעט-דליפת נתוני לקוחות</td><td style="text-align:center">₪0</td><td class="ok">סגור</td></tr>
      <tr><td>NM-019</td><td>15/12/2025</td><td>Near Miss</td><td>שגיאה בחישוב ריבית — נתפסה בביקורת</td><td style="text-align:center">₪0</td><td class="ok">סגור</td></tr>
      <tr><td>NM-020</td><td>28/12/2025</td><td>Near Miss</td><td>כשל גיבוי לילי — שוחזר בבוקר</td><td style="text-align:center">₪0</td><td class="ok">סגור</td></tr></table>
      <h3>ניתוח שורשי:</h3>
      <ul><li>EVT-041: שורש — תקלת חומרה בשרת גבייה. פעולה: שדרוג בוצע.</li><li>EVT-042: שורש — מייל פישינג ממוקד. פעולה: הדרכה מתוכננת Q1.</li></ul>`;
    body += footer();
  }

  // ═══ CREDIT REPORT ═══
  if (templateId === "RPT-08") {
    filename = `דוח-סיכון-אשראי-${RPT_Q}`;
    body = cover("דוח סיכון אשראי", `${RPT_Q} | ניתוח תיק אשראי`);
    body += header("דוח אשראי");
    body += `<h1>סיכום מנהלים</h1>
      <p>ניתוח תיק האשראי של ${RPT_COMPANY} לסוף ${RPT_Q}. סה״כ תיק: ₪245M.</p>
      <h3>מדדים עיקריים:</h3>
      <ul><li>NPL Ratio: 3.8% (שיפור מ-4.1%)</li><li>הפרשה ECL: 2.1%</li><li>ריכוזיות ענפית: 34% (חריגה מ-30%)</li><li>יחס הון: 14.2%</li></ul>
      <h1 class="pb">התפלגות תיק</h1>
      <table><tr><th>ענף</th><th>סכום (₪M)</th><th>שיעור</th><th>NPL</th><th>הפרשה</th></tr>
      <tr><td><b>נדל״ן</b></td><td style="text-align:center">83.3</td><td style="text-align:center" class="bad">34%</td><td style="text-align:center">4.2%</td><td style="text-align:center">2.5%</td></tr>
      <tr><td><b>מסחר</b></td><td style="text-align:center">53.9</td><td style="text-align:center">22%</td><td style="text-align:center">3.1%</td><td style="text-align:center">1.8%</td></tr>
      <tr><td><b>שירותים</b></td><td style="text-align:center">44.1</td><td style="text-align:center">18%</td><td style="text-align:center">2.8%</td><td style="text-align:center">1.6%</td></tr>
      <tr><td><b>תעשייה</b></td><td style="text-align:center">36.75</td><td style="text-align:center">15%</td><td style="text-align:center">5.1%</td><td style="text-align:center">3.2%</td></tr>
      <tr><td><b>אחר</b></td><td style="text-align:center">26.95</td><td style="text-align:center">11%</td><td style="text-align:center">2.2%</td><td style="text-align:center">1.3%</td></tr>
      <tr style="background:#E8EFF5;font-weight:bold"><td>סה״כ</td><td style="text-align:center">245.0</td><td style="text-align:center">100%</td><td style="text-align:center">3.8%</td><td style="text-align:center">2.1%</td></tr></table>
      <h3 class="red-text">חריגת ריכוזיות:</h3>
      <p>ענף הנדל״ן ב-34% מהתיק — חריגה מסף 30%. נדרשת תוכנית צמצום מאושרת.</p>`;
    body += footer();
  }

  // ═══ ANNUAL REPORT ═══
  if (templateId === "RPT-09") {
    filename = `דוח-שנתי-מקיף-2025`;
    body = cover("דוח שנתי מקיף", `2025 | סקירת כל תחומי הסיכון`);
    body += header("דוח שנתי");
    body += `<h1>סיכום מנהלים</h1>
      <p>דוח שנתי מקיף של ${RPT_COMPANY} לשנת 2025. הדוח מסכם את כלל פעילויות ניהול הסיכונים.</p>
      <h3>הישגים עיקריים:</h3>
      <ul><li>שיפור ציון עמידה מ-54% ל-62% (+8%).</li><li>אישור מדיניות ניהול סיכונים 2026.</li><li>הטמעת מערכת RiskGuard — 11 מודולים פעילים.</li><li>הפחתת NPL מ-5.2% ל-3.8%.</li></ul>
      <h3>אתגרים:</h3>
      <ul><li>המשכיות עסקית — 45% בלבד, נדרש שיפור משמעותי.</li><li>הגנת סייבר — 40%, תחום בעדיפות ל-2026.</li><li>ריכוזיות אשראי — חריגה מהסף.</li></ul>
      <h1 class="pb">סיכום מודולים — 2025</h1>
      <table><tr><th>מודול</th><th>ציון Q1</th><th>ציון Q4</th><th>שינוי</th><th>סטטוס</th></tr>
      ${RPT_MODULES.map(m => { const q1 = m.score - Math.floor(Math.random() * 12 + 3); return `<tr><td><b>${m.name}</b></td><td style="text-align:center">${q1}%</td><td style="text-align:center;font-weight:bold;color:${sc(m.score)}">${m.score}%</td><td style="text-align:center;color:#27AE60">+${m.score - q1}%</td><td style="text-align:center">${m.score >= 70 ? "✓" : "⚠"}</td></tr>`; }).join("")}</table>
      <h1 class="pb">תוכנית 2026</h1>
      <table><tr><th>רבעון</th><th>יעדים עיקריים</th></tr>
      <tr><td><b>Q1</b></td><td>תרגיל DR, הדרכת סייבר, דוח ציות רבעוני</td></tr>
      <tr><td><b>Q2</b></td><td>סקירת ספקים, צמצום ריכוזיות, ביקורת פנימית</td></tr>
      <tr><td><b>Q3</b></td><td>דוח חצי-שנתי, תכנית 2027, סקירת סייבר</td></tr>
      <tr><td><b>Q4</b></td><td>סיכום שנתי, תקציב סיכונים, בחינת מדיניות</td></tr></table>`;
    body += footer();
  }

  // Fallback for any template not specifically handled
  if (!body) {
    const tpl = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    filename = `דוח-${tpl.name.replace(/ /g, "-")}`;
    body = cover(tpl.name, tpl.desc);
    body += header(tpl.name);
    body += `<h1>סיכום מנהלים</h1><p>${tpl.desc}</p>
      <h3>סעיפי הדוח:</h3><ul>${tpl.sections.map(s => `<li>${s}</li>`).join("")}</ul>
      <p style="color:#999;margin-top:20px">דוח זה הופק אוטומטית על ידי RiskGuard ב-${now}.</p>`;
    body += footer();
  }

  // Return HTML for preview
  return { html: `<style>${css}</style>${body}`, filename };
}

function ReportsModule({ onPreviewReport }) {
  const [tab, setTab] = useState("templates"); // templates | generated | schedule
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const handleGenerate = (id) => { const r = generateWordReport(id); if (r) onPreviewReport(r); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 8 }}>
            <FileOutput size={20} color={C.accent} /> מרכז דוחות
            <span style={{ background: "rgba(91,184,201,0.2)", color: C.accentTeal, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, fontFamily: "Rubik" }}>PRO</span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>הפקת דוחות רגולטוריים, דוחות דירקטוריון, ודוחות תקופתיים</p>
        </div>
        <button onClick={() => setTab("templates")} style={{ background: C.accentGrad, color: "white", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={13} /> הפק דוח חדש</button>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "תבניות דוח", value: REPORT_TEMPLATES.length, c: C.accent, icon: FileOutput },
          { label: "דוחות שהופקו", value: GENERATED_REPORTS.filter(r => r.status === "final").length, c: C.success, icon: CheckSquare },
          { label: "טיוטות", value: GENERATED_REPORTS.filter(r => r.status === "draft").length, c: C.warning, icon: Clock },
          { label: "נמענים", value: 3, c: "#7C3AED", icon: Users },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${kpi.c}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <kpi.icon size={16} color={kpi.c} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: kpi.c, fontFamily: "Rubik" }}>{kpi.value}</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[{ id: "templates", l: "תבניות", Icon: FileOutput }, { id: "generated", l: "דוחות שהופקו", Icon: FileText }, { id: "schedule", l: "לוח זמנים", Icon: Calendar }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.accent : C.surface, color: tab === t.id ? "white" : C.textSec, border: `1px solid ${tab === t.id ? C.accent : C.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 11, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}><t.Icon size={12} />{t.l}</button>
        ))}
      </div>

      {/* Templates Tab */}
      {tab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {REPORT_TEMPLATES.map(rpt => {
            const Ic = rpt.icon;
            const isSelected = selectedTemplate === rpt.id;
            return (
              <div key={rpt.id} onClick={() => setSelectedTemplate(isSelected ? null : rpt.id)}
                style={{ background: C.surface, border: `1px solid ${isSelected ? C.accent : C.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.15s", boxShadow: isSelected ? `0 4px 16px ${C.accent}15` : "none" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}>
                {/* Header */}
                <div style={{ background: C.borderLight, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic size={18} color={C.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik", lineHeight: 1.3 }}>{rpt.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 8, background: C.accentLight, color: C.accent, padding: "1px 5px", borderRadius: 3, fontFamily: "Rubik", fontWeight: 600 }}>{rpt.frequency}</span>
                      <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "Rubik" }}>{rpt.pages} עמ׳</span>
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant", lineHeight: 1.6, marginBottom: 10 }}>{rpt.desc}</div>
                  {/* Sections */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                    {rpt.sections.map((s, i) => (
                      <span key={i} style={{ fontSize: 8, background: C.borderLight, color: C.textSec, padding: "2px 6px", borderRadius: 3, fontFamily: "Rubik" }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>הופק לאחרונה: {rpt.lastGenerated}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleGenerate(rpt.id); }} style={{ background: C.accentGrad, color: "white", border: "none", padding: "5px 14px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
                      <Sparkles size={10} /> הפק
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generated Reports Tab */}
      {tab === "generated" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Assistant" }}>
            <thead><tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
              {["דוח", "תאריך", "עמודים", "הופק ע״י", "נמען", "סטטוס", ""].map(h => <th key={h} style={{ textAlign: "right", padding: "9px 12px", fontWeight: 600, fontSize: 10, color: C.textSec, fontFamily: "Rubik" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {GENERATED_REPORTS.map((r, i) => {
                const rs = GR_STATUS[r.status];
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "white" : "#FAFBFC" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{r.name}</div>
                      <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{r.id}</div>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "Rubik", fontSize: 11 }}>{r.date}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "Rubik", fontSize: 11 }}>{r.pages || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: r.generatedBy === "RiskGuard AI" ? C.accent : C.textSec }}>
                      {r.generatedBy === "RiskGuard AI" ? <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Sparkles size={9} color={C.accent} />AI</span> : r.generatedBy}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: C.textSec }}>{r.recipient}</td>
                    <td style={{ padding: "10px 12px" }}><span style={{ background: rs.bg, color: rs.c, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: "Rubik" }}>{rs.l}</span></td>
                    <td style={{ padding: "10px 12px", display: "flex", gap: 4 }}>
                      {r.status === "final" && <button onClick={() => handleGenerate(r.templateId)} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "Rubik", color: C.textSec, display: "flex", alignItems: "center", gap: 3 }}><FileOutput size={9} />הורד</button>}
                      {r.status === "final" && <button style={{ background: "white", border: `1px solid ${C.accent}40`, borderRadius: 5, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "Rubik", color: C.accent }}><Mail size={9} /> שלח</button>}
                      {r.status === "draft" && <button onClick={() => handleGenerate(r.templateId)} style={{ background: C.accentGrad, border: "none", borderRadius: 5, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontFamily: "Rubik", color: "white", fontWeight: 600 }}>הפק</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Tab */}
      {tab === "schedule" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {["Q1", "Q2", "Q3", "Q4"].map((q, qi) => {
              const isCurrent = qi === 0;
              const qReports = REPORT_TEMPLATES.filter(r => r.frequency === "רבעוני" || (r.frequency === "חצי-שנתי" && (qi === 1 || qi === 3)) || (r.frequency === "שנתי" && qi === 3));
              return (
                <div key={q} style={{ background: C.surface, border: `1px solid ${isCurrent ? C.accent : C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: isCurrent ? `0 2px 12px ${C.accent}15` : "none" }}>
                  <div style={{ background: isCurrent ? C.accentGrad : C.borderLight, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: isCurrent ? "white" : C.text, fontFamily: "Rubik" }}>{q}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isCurrent ? "rgba(255,255,255,0.8)" : C.textMuted, fontFamily: "Rubik" }}>{qReports.length} דוחות</span>
                  </div>
                  <div style={{ padding: 14 }}>
                    {qReports.map((r, i) => {
                      const Ic = r.icon;
                      const isDone = isCurrent && i < 3;
                      return (
                        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < qReports.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: isDone ? C.success : C.borderLight, border: isDone ? "none" : `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isDone ? <CheckSquare size={10} color="white" /> : <Ic size={9} color={C.textMuted} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 10, color: isDone ? C.textMuted : C.text, fontFamily: "Assistant", textDecoration: isDone ? "line-through" : "none" }}>{r.name}</span>
                          </div>
                          <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "Rubik" }}>{r.frequency}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AGENT HUB — Risk Manager + AI Agents
// ═══════════════════════════════════════════════
const AGENTS = [
  { id: "mgr", name: "יוסי לוי", role: "מנהל סיכונים ראשי", type: "manager", color: "#7B61FF",
    avatar: "יל", status: "online", bio: "מנהל יחידת ניהול סיכונים, אחראי על תיאום הצוות ומעקב ביצוע" },
  { id: "agent-risk", name: "סוכן ניהול סיכונים", role: "חוזר 2024-10-2", type: "agent", color: "#00D4FF",
    avatar: "🛡️", status: "active", regulation: "risk",
    capabilities: ["מעקב עמידה בדרישות", "תזמון משימות", "דוחות ציות", "ניטור בקרות"],
    modules: ["ממשל סיכונים", "סיכון תפעולי", "מיקור חוץ", "המשכיות עסקית"] },
  { id: "agent-cyber", name: "סוכן סייבר", role: "חוזר 2022-10-9", type: "agent", color: "#FF6B9D",
    avatar: "🔐", status: "active", regulation: "cyber",
    capabilities: ["מעקב עמידה בדרישות", "ניטור אירועים", "סקירת בקרות", "התראות חריגה"],
    modules: ["ממשל סייבר", "הגנת סייבר", "אירועי סייבר"] },
];

const AGENT_TASKS = [
  { id: "at1", agent: "agent-risk", title: "סקירת אפקטיביות בקרות ממשל סיכונים", due: "2026-02-20", status: "active", priority: "high" },
  { id: "at2", agent: "agent-risk", title: "עדכון מסמך מדיניות ניהול סיכונים", due: "2026-02-22", status: "pending", priority: "med" },
  { id: "at3", agent: "agent-risk", title: "הכנת דוח רבעוני המשכיות עסקית", due: "2026-03-01", status: "active", priority: "high" },
  { id: "at4", agent: "agent-risk", title: "בדיקת ספקי מיקור חוץ — חידוש חוזים", due: "2026-03-10", status: "pending", priority: "low" },
  { id: "at5", agent: "agent-cyber", title: "סריקת חולשות — סקירה חודשית", due: "2026-02-19", status: "active", priority: "high" },
  { id: "at6", agent: "agent-cyber", title: "עדכון נוהל תגובה לאירוע סייבר", due: "2026-02-25", status: "pending", priority: "med" },
  { id: "at7", agent: "agent-cyber", title: "דיווח אירוע למערך הסייבר (ISA)", due: "2026-02-28", status: "done", priority: "high" },
  { id: "at8", agent: "agent-cyber", title: "הדרכת עובדים — פישינג Q1", due: "2026-03-05", status: "pending", priority: "med" },
];

function AgentHub() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatAgent, setChatAgent] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [agentTasks, setAgentTasks] = useState(AGENT_TASKS);
  const [taskFilter, setTaskFilter] = useState("all");

  const sendMessage = (agentId) => {
    if (!chatInput.trim()) return;
    const prev = chatMessages[agentId] || [];
    const userMsg = { from: "user", text: chatInput, time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) };
    const agent = AGENTS.find(a => a.id === agentId);
    const replies = {
      "agent-risk": [
        "בודק את סטטוס העמידה מול חוזר 2024-10-2...",
        "נכון להיום, 66% מהדרישות מקוימות. ממשל סיכונים הכי חזק (78%).",
        "המשכיות עסקית דורשת תשומת לב — רק 45%. אני ממליץ לתעדף.",
        "עדכנתי את לוח המשימות. יש 2 משימות דחופות השבוע.",
        "המסמכים מוכנים לסקירה. צריך אישור מנהל לפני העלאה.",
      ],
      "agent-cyber": [
        "מנטר את מצב ההגנה מול חוזר 2022-10-9...",
        "הגנת סייבר ב-40% — הנקודה הכי חלשה. נדרשת פעולה.",
        "אירועי סייבר ב-80% — הסטטוס הכי טוב בתחום.",
        "הסריקה החודשית מתוזמנת ל-19 בפברואר. אכין דוח אוטומטי.",
        "עדכנתי את ה-timeline של אירועי סייבר. הכל מתועד.",
      ],
    };
    const agentReplies = replies[agentId] || ["מבין. אטפל בזה."];
    const botMsg = { from: "agent", text: agentReplies[prev.length % agentReplies.length], time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages(p => ({ ...p, [agentId]: [...prev, userMsg, botMsg] }));
    setChatInput("");
  };

  const toggleTaskStatus = (taskId) => {
    setAgentTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === "done" ? "active" : "done" } : t));
  };

  const statusColors = { active: { bg: "rgba(0,212,255,0.1)", c: "#00D4FF", l: "פעיל" }, pending: { bg: "rgba(200,146,42,0.1)", c: "#DAA520", l: "ממתין" }, done: { bg: "rgba(46,139,87,0.1)", c: "#2E8B57", l: "הושלם" } };
  const prioColors = { high: "#E74C3C", med: "#DAA520", low: "#2E8B57" };

  const viewAgent = selectedAgent ? AGENTS.find(a => a.id === selectedAgent) : null;
  const viewTasks = selectedAgent ? agentTasks.filter(t => t.agent === selectedAgent) : [];
  const filteredViewTasks = taskFilter === "all" ? viewTasks : viewTasks.filter(t => t.status === taskFilter);
  const msgs = chatAgent ? (chatMessages[chatAgent] || []) : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 2px" }}>מרכז סוכנים</h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>מנהל סיכונים + סוכני AI — מעקב, תזמון, והתכתבות</p>
        </div>
      </div>

      {/* Agent Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {AGENTS.map(agent => {
          const isSelected = selectedAgent === agent.id;
          const tasks = agentTasks.filter(t => t.agent === agent.id);
          const doneTasks = tasks.filter(t => t.status === "done").length;
          const activeTasks = tasks.filter(t => t.status === "active").length;
          return (
            <div key={agent.id} onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
              style={{ background: C.surface, border: `1.5px solid ${isSelected ? agent.color : C.border}`, borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", boxShadow: isSelected ? `0 4px 24px ${agent.color}22` : "none", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = agent.color + "60"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}
            >
              {/* Glow accent */}
              <div style={{ position: "absolute", top: -30, left: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${agent.color}10, transparent)`, pointerEvents: "none" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative" }}>
                <div style={{ width: 48, height: 48, borderRadius: agent.type === "manager" ? 12 : "50%", background: agent.type === "manager" ? C.accentGrad : `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: agent.type === "manager" ? 16 : 22, fontWeight: 800, color: "white", fontFamily: "Rubik", position: "relative" }}>
                  {agent.type === "manager" ? agent.avatar : agent.avatar}
                  {/* Status dot */}
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: agent.status === "online" || agent.status === "active" ? "#2E8B57" : "#64748B", border: `2px solid ${C.surface}` }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: agent.color, fontFamily: "Rubik", fontWeight: 600 }}>{agent.role}</div>
                </div>
                {agent.type === "agent" && (
                  <button onClick={(e) => { e.stopPropagation(); setChatAgent(agent.id); }}
                    style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, fontFamily: "Rubik", color: agent.color, transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${agent.color}25`}
                    onMouseLeave={e => e.currentTarget.style.background = `${agent.color}15`}
                  ><MessageSquare size={11} />צ׳אט</button>
                )}
              </div>

              {agent.type === "manager" ? (
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant", marginBottom: 10 }}>{agent.bio}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1, background: C.borderLight, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, fontFamily: "Rubik" }}>2</div>
                      <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>סוכנים פעילים</div>
                    </div>
                    <div style={{ flex: 1, background: C.borderLight, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#DAA520", fontFamily: "Rubik" }}>{agentTasks.filter(t => t.status !== "done").length}</div>
                      <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>משימות פתוחות</div>
                    </div>
                    <div style={{ flex: 1, background: C.borderLight, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#2E8B57", fontFamily: "Rubik" }}>{agentTasks.filter(t => t.status === "done").length}</div>
                      <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>הושלמו</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Capabilities */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {agent.capabilities.map((cap, i) => (
                      <span key={i} style={{ fontSize: 9, fontFamily: "Rubik", background: `${agent.color}10`, color: agent.color, padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>{cap}</span>
                    ))}
                  </div>
                  {/* Modules */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {agent.modules.map((m, i) => (
                      <span key={i} style={{ fontSize: 9, fontFamily: "Assistant", background: C.borderLight, color: C.textSec, padding: "2px 7px", borderRadius: 4 }}>{m}</span>
                    ))}
                  </div>
                  {/* Task progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, background: C.borderLight, borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${tasks.length ? (doneTasks / tasks.length) * 100 : 0}%`, height: "100%", borderRadius: 4, background: agent.color, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "Rubik", whiteSpace: "nowrap" }}>{doneTasks}/{tasks.length}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Agent Detail — Task Board */}
      {viewAgent && viewAgent.type === "agent" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20, animation: "fadeInUp 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${viewAgent.color}, ${viewAgent.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{viewAgent.avatar}</div>
              <div><span style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>משימות — {viewAgent.name}</span><div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}>{viewAgent.role}</div></div>
            </div>
            <div style={{ display: "flex", background: C.borderLight, borderRadius: 8, padding: 2 }}>
              {[{ id: "all", l: "הכל" }, { id: "active", l: "פעיל" }, { id: "pending", l: "ממתין" }, { id: "done", l: "הושלם" }].map(f => (
                <button key={f.id} onClick={() => setTaskFilter(f.id)} style={{ background: taskFilter === f.id ? "white" : "transparent", border: "none", cursor: "pointer", color: taskFilter === f.id ? C.text : C.textMuted, padding: "5px 12px", borderRadius: 6, fontSize: 10, fontWeight: taskFilter === f.id ? 600 : 400, fontFamily: "Rubik", transition: "all 0.15s" }}>{f.l}</button>
              ))}
            </div>
          </div>

          {/* Timeline / Schedule view */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Task list */}
            <div>
              {filteredViewTasks.map((task, i) => {
                const s = statusColors[task.status];
                const daysLeft = Math.ceil((new Date(task.due) - new Date()) / 86400000);
                const isOverdue = daysLeft < 0 && task.status !== "done";
                return (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 6, background: isOverdue ? "rgba(231,76,60,0.04)" : "white", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = viewAgent.color + "40"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.borderLight}
                  >
                    <button onClick={() => toggleTaskStatus(task.id)} style={{ width: 22, height: 22, borderRadius: 6, border: task.status === "done" ? "none" : `2px solid ${C.border}`, background: task.status === "done" ? C.success : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                      {task.status === "done" && <CheckSquare size={12} color="white" />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: task.status === "done" ? C.textMuted : C.text, fontFamily: "Assistant", textDecoration: task.status === "done" ? "line-through" : "none" }}>{task.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: isOverdue ? C.danger : C.textMuted, fontFamily: "Rubik" }}><Calendar size={9} style={{ display: "inline", verticalAlign: "middle", marginLeft: 2 }} /> {new Date(task.due).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}</span>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: prioColors[task.priority] }} />
                        {isOverdue && <span style={{ fontSize: 9, fontWeight: 600, color: C.danger, fontFamily: "Rubik" }}>באיחור</span>}
                      </div>
                    </div>
                    <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 5, fontFamily: "Rubik" }}>{s.l}</span>
                  </div>
                );
              })}
              {filteredViewTasks.length === 0 && <div style={{ textAlign: "center", padding: 30, color: C.textMuted, fontSize: 12, fontFamily: "Assistant" }}>אין משימות בסינון זה</div>}
            </div>

            {/* Schedule / Calendar Strip */}
            <div>
              <div style={{ background: C.borderLight, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={13} color={viewAgent.color} />לו״ז קרוב</div>
                {viewTasks.filter(t => t.status !== "done").sort((a,b) => new Date(a.due) - new Date(b.due)).map((task, i) => {
                  const d = new Date(task.due);
                  const daysLeft = Math.ceil((d - new Date()) / 86400000);
                  const dayLabel = daysLeft === 0 ? "היום" : daysLeft === 1 ? "מחר" : daysLeft < 0 ? `לפני ${Math.abs(daysLeft)} ימים` : `בעוד ${daysLeft} ימים`;
                  return (
                    <div key={task.id} style={{ display: "flex", gap: 10, marginBottom: i < viewTasks.length - 1 ? 10 : 0, position: "relative", paddingRight: 20 }}>
                      {/* Timeline dot & line */}
                      <div style={{ position: "absolute", right: 0, top: 4, width: 10, height: 10, borderRadius: "50%", background: daysLeft < 0 ? C.danger : viewAgent.color, border: `2px solid ${C.surface}`, zIndex: 1 }} />
                      {i < viewTasks.filter(t => t.status !== "done").length - 1 && <div style={{ position: "absolute", right: 4, top: 14, width: 2, height: "calc(100% + 2px)", background: C.border }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: "Assistant" }}>{task.title}</div>
                        <div style={{ fontSize: 10, color: daysLeft < 0 ? C.danger : C.textMuted, fontFamily: "Rubik", marginTop: 2 }}>
                          {d.toLocaleDateString("he-IL", { day: "numeric", month: "short" })} · {dayLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                <div style={{ background: C.borderLight, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: viewAgent.color, fontFamily: "Rubik" }}>
                    {Math.round((viewTasks.filter(t => t.status === "done").length / Math.max(viewTasks.length, 1)) * 100)}%
                  </div>
                  <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>השלמה</div>
                </div>
                <div style={{ background: C.borderLight, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: viewTasks.some(t => { const d = Math.ceil((new Date(t.due) - new Date()) / 86400000); return d < 0 && t.status !== "done"; }) ? C.danger : "#2E8B57", fontFamily: "Rubik" }}>
                    {viewTasks.filter(t => { const d = Math.ceil((new Date(t.due) - new Date()) / 86400000); return d < 0 && t.status !== "done"; }).length}
                  </div>
                  <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Assistant" }}>באיחור</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Detail */}
      {viewAgent && viewAgent.type === "manager" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20, animation: "fadeInUp 0.3s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <UserCog size={16} color={C.accent} />סקירת מנהל — כל הסוכנים
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {AGENTS.filter(a => a.type === "agent").map(agent => {
              const tasks = agentTasks.filter(t => t.agent === agent.id);
              const done = tasks.filter(t => t.status === "done").length;
              const active = tasks.filter(t => t.status === "active").length;
              const overdue = tasks.filter(t => { const d = Math.ceil((new Date(t.due) - new Date()) / 86400000); return d < 0 && t.status !== "done"; }).length;
              return (
                <div key={agent.id} style={{ background: C.borderLight, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{agent.avatar}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{agent.name}</div><div style={{ fontSize: 10, color: agent.color, fontFamily: "Rubik" }}>{agent.role}</div></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 800, color: "#00D4FF", fontFamily: "Rubik" }}>{active}</div><div style={{ fontSize: 9, color: C.textMuted }}>פעיל</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 800, color: "#2E8B57", fontFamily: "Rubik" }}>{done}</div><div style={{ fontSize: 9, color: C.textMuted }}>הושלם</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 800, color: overdue > 0 ? C.danger : C.textMuted, fontFamily: "Rubik" }}>{overdue}</div><div style={{ fontSize: 9, color: C.textMuted }}>באיחור</div></div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {tasks.map(t => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[t.status].c }} />
                        <span style={{ fontSize: 10, color: t.status === "done" ? C.textMuted : C.text, fontFamily: "Assistant", flex: 1, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                        <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik" }}>{new Date(t.due).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {chatAgent && (() => {
        const agent = AGENTS.find(a => a.id === chatAgent);
        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={() => setChatAgent(null)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)" }} />
            <div style={{ position: "relative", width: 440, maxHeight: "80vh", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeInUp 0.3s ease", zIndex: 301 }}>
              {/* Chat header */}
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: `linear-gradient(135deg, ${agent.color}08, ${agent.color}03)` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{agent.avatar}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{agent.name}</div><div style={{ fontSize: 10, color: "#2E8B57", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E8B57" }} />מחובר</div></div>
                <button onClick={() => setChatAgent(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}><X size={18} /></button>
              </div>
              {/* Messages */}
              <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto", minHeight: 300, maxHeight: 400, display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Welcome */}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{agent.avatar}</div>
                  <div style={{ background: C.borderLight, borderRadius: "4px 12px 12px 12px", padding: "8px 12px", maxWidth: "80%" }}>
                    <div style={{ fontSize: 12, color: C.text, fontFamily: "Assistant", lineHeight: 1.6 }}>שלום! אני {agent.name}. אני מנטר את {agent.role} ויכול לעזור עם מעקב משימות, סטטוס עמידה, והמלצות. מה תרצה לבדוק?</div>
                    <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "Rubik", marginTop: 3 }}>{new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
                    {m.from === "agent" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{agent.avatar}</div>}
                    <div style={{ background: m.from === "user" ? C.accentGrad : C.borderLight, borderRadius: m.from === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px", padding: "8px 12px", maxWidth: "80%" }}>
                      <div style={{ fontSize: 12, color: m.from === "user" ? "white" : C.text, fontFamily: "Assistant", lineHeight: 1.6 }}>{m.text}</div>
                      <div style={{ fontSize: 9, color: m.from === "user" ? "rgba(255,255,255,0.6)" : C.textMuted, fontFamily: "Rubik", marginTop: 3 }}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "center" }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(chatAgent); }}
                  placeholder="שלח הודעה..." style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "Assistant", outline: "none", direction: "rtl" }}
                />
                <button onClick={() => sendMessage(chatAgent)} style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${agent.color}, ${agent.color}CC)`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                ><Send size={15} color="white" style={{ transform: "scaleX(-1)" }} /></button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════
// ONBOARDING WIZARD + AGENT PUSH SYSTEM
// ═══════════════════════════════════════════════
const CITIES_IL = ["תל אביב","ירושלים","חיפה","באר שבע","רמת גן","הרצליה","פתח תקווה","ראשון לציון","נתניה","חולון","אשדוד","רחובות","כפר סבא","רעננה","מודיעין","בת ים"];
const LICENSE_TYPES = [
  { id: "extended", name: "רישיון אשראי מורחב", desc: "ניהול סיכונים + סייבר + תפעולי", regs: ["2024-10-2","2022-10-9"], modules: 7, reqs: 100 },
  { id: "basic", name: "רישיון אשראי בסיסי", desc: "ניהול סיכונים + תפעולי", regs: ["2024-10-2"], modules: 4, reqs: 54 },
  { id: "service", name: "רישיון מתן שירות", desc: "ממשל סיכונים בסיסי", regs: ["2024-10-2"], modules: 3, reqs: 32 },
];
const ROLE_OPTIONS = ["מנהל סיכונים","מנהל הגנת סייבר","קצין ציות","CFO","מנכ״ל","סמנכ״ל תפעול"];

function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    companyName: "", companyId: "", city: "תל אביב", address: "", license: "extended",
    employees: "5-10", logoUrl: "", hasLogo: false,
    // Regulatory assessment
    portfolioSize: "", clientCount: "", clientTypes: [],
    // Risk officer
    riskOfficer: "", riskOfficerEmail: "", riskRoles: ["מנהל סיכונים"], reportLine: "שניהם",
    appointDate: "2025-09-01", isMe: true,
    // Directors
    directors: [{ name: "", email: "", phone: "", role: "דירקטור" }],
    // Team
    team: [{ name: "", email: "", role: "צופה" }],
  });
  const u = (k, v) => setData(p => ({ ...p, [k]: v }));
  const [animDir, setAnimDir] = useState("next");
  const TOTAL_STEPS = 9;
  const goNext = () => { setAnimDir("next"); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const goBack = () => { setAnimDir("back"); setStep(s => Math.max(s - 1, 0)); };

  const lic = LICENSE_TYPES.find(l => l.id === data.license);
  const inp = { background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 14, fontFamily: "Assistant", outline: "none", direction: "rtl", width: "100%" };
  const label = (t, sub) => (<div style={{ marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{t}</div>{sub && <div style={{ fontSize: 11, color: C.textMuted }}>{sub}</div>}</div>);
  const CLIENT_TYPES = ["אשראי צרכני","אשראי עסקי","אשראי רכב","אשראי נדל״ן","הלוואות P2P","אשראי חקלאי","ליסינג","פקטורינג"];
  const TEAM_ROLES = ["מנהל","צופה","מבקר","סמנכ״ל","ביקורת פנימית"];

  const STEPS = [
    { title: "ברוך הבא", icon: "👋" },
    { title: "פרטי חברה", icon: "🏢" },
    { title: "לוגו", icon: "🎨" },
    { title: "פרופיל רגולטורי", icon: "📋" },
    { title: "הערכה רגולטורית", icon: "🎯" },
    { title: "מנהל סיכונים", icon: "👤" },
    { title: "דירקטוריון", icon: "👔" },
    { title: "צוות", icon: "👥" },
    { title: "סיכום והשקה", icon: "🚀" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(135deg, #F0F4F8 0%, #E2E8F0 50%, #EDE9FE 100%)", display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl", overflow: "auto" }}>
      <style>{`@keyframes wizSlide{from{opacity:0;transform:translateX(${animDir === "next" ? "-30px" : "30px"})}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ position: "absolute", top: 30, right: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "white", fontFamily: "Rubik" }}>R</div>
        <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Rubik", color: C.navBg }}>RiskGuard</span>
      </div>

      <div style={{ width: 680, maxHeight: "92vh", background: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Progress Bar */}
        {step > 0 && step < TOTAL_STEPS && (
          <div style={{ padding: "18px 24px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
            {STEPS.slice(1, TOTAL_STEPS).map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <React.Fragment key={i}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? C.success : active ? C.accentGrad : C.borderLight, color: done || active ? "white" : C.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: done ? 12 : 10, fontWeight: 700, fontFamily: "Rubik", transition: "all 0.3s", border: active ? "none" : `2px solid ${done ? C.success : C.border}` }}>
                      {done ? "✓" : idx}
                    </div>
                    <div style={{ fontSize: 7, color: active ? C.accent : C.textMuted, fontFamily: "Rubik", fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>{s.title}</div>
                  </div>
                  {i < TOTAL_STEPS - 2 && <div style={{ flex: 1, height: 2, background: done ? C.success : C.borderLight, margin: "0 2px", marginBottom: 14, transition: "all 0.3s" }} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Step Content */}
        <div key={step} style={{ padding: "24px 36px 20px", flex: 1, overflow: "auto", animation: "wizSlide 0.3s ease-out" }}>

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: C.accentGrad, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 8px 30px ${C.accent}40` }}>🛡️</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 8 }}>ברוך הבא ל-RiskGuard!</h1>
              <p style={{ fontSize: 16, color: C.textSec, fontFamily: "Assistant", marginBottom: 30, lineHeight: 1.7 }}>בעוד 5 דקות המערכת תהיה מוכנה בשבילך.<br />נאסוף כמה פרטים על הארגון כדי להתאים את התבניות, הדוחות והמערכת.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 30 }}>
                {[{ icon: "📄", text: "21 תבניות מוכנות" }, { icon: "📊", text: "9 דוחות אוטומטיים" }, { icon: "✅", text: "עמידה מלאה ברגולציה" }].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.text, fontFamily: "Assistant" }}>
                    <span style={{ fontSize: 18 }}>{b.icon}</span>{b.text}
                  </div>
                ))}
              </div>
              <button onClick={goNext} style={{ background: C.accentGrad, color: "white", border: "none", padding: "14px 48px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik", boxShadow: `0 4px 16px ${C.accent}40` }}>בוא נתחיל ←</button>
            </div>
          )}

          {/* STEP 1: Company Details */}
          {step === 1 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>🏢 פרטי חברה</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>הפרטים ימלאו אוטומטית את כל התבניות, הדוחות והמסמכים.</p>
            <div style={{ display: "grid", gap: 14 }}>
              <div>{label("שם חברה *", "כפי שיופיע בכל המסמכים")}<input value={data.companyName} onChange={e => u("companyName", e.target.value)} placeholder="למשל: אשראי פייננס בע״מ" style={inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{label("מספר ח.פ. / ח.צ.")}<input value={data.companyId} onChange={e => u("companyId", e.target.value)} placeholder="123456789" style={inp} /></div>
                <div>{label("עיר")}<select value={data.city} onChange={e => u("city", e.target.value)} style={{ ...inp, cursor: "pointer" }}>{CITIES_IL.map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div>{label("כתובת")}<input value={data.address} onChange={e => u("address", e.target.value)} placeholder="רחוב, מספר" style={inp} /></div>
              <div>{label("מספר עובדים")}<div style={{ display: "flex", gap: 8 }}>
                {["1-5","5-10","10-20","20-50","50+"].map(n => (
                  <button key={n} onClick={() => u("employees", n)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `2px solid ${data.employees === n ? C.accent : C.border}`, background: data.employees === n ? `${C.accent}10` : "white", color: data.employees === n ? C.accent : C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>{n}</button>
                ))}
              </div></div>
            </div>
          </div>)}

          {/* STEP 2: Logo */}
          {step === 2 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>🎨 לוגו חברה</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>הלוגו יופיע בסרגל הצד ויוטמע אוטומטית בכל המסמכים, הדוחות וה-PDF שיופקו.</p>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div onClick={() => u("hasLogo", true)} style={{ width: "100%", height: 180, border: `2px dashed ${data.hasLogo ? C.accent : C.border}`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: data.hasLogo ? `${C.accent}05` : "#FAFBFC", transition: "all 0.2s" }}>
                  {data.hasLogo ? (
                    <>
                      <div style={{ width: 80, height: 80, borderRadius: 14, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "white", fontFamily: "Rubik", marginBottom: 8 }}>{(data.companyName || "R").charAt(0)}</div>
                      <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, fontFamily: "Rubik" }}>לוגו הועלה ✓</div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>לחץ להחלפה</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>גרור לוגו או לחץ להעלאה</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>PNG / SVG / JPG · עד 2MB</div>
                    </>
                  )}
                </div>
                <button onClick={() => u("hasLogo", !data.hasLogo)} style={{ marginTop: 10, width: "100%", background: data.hasLogo ? C.borderLight : C.accentGrad, color: data.hasLogo ? C.textSec : "white", border: `1px solid ${data.hasLogo ? C.border : "transparent"}`, borderRadius: 10, padding: "10px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>
                  {data.hasLogo ? "הסר לוגו" : "העלה לוגו (סימולציה)"}
                </button>
              </div>
              <div style={{ width: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: "Rubik", marginBottom: 8 }}>תצוגה מקדימה</div>
                <div style={{ background: C.navBg, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    {data.hasLogo ? (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{(data.companyName || "R").charAt(0)}</div>
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, color: "#64748B" }}>LOGO</span></div>
                    )}
                    <span style={{ color: "white", fontSize: 11, fontWeight: 600, fontFamily: "Rubik" }}>{data.companyName || "שם חברה"}</span>
                  </div>
                  <div style={{ fontSize: 8, color: "#64748B", fontFamily: "Rubik" }}>→ דשבורד<br />→ סיכונים<br />→ מסמכים</div>
                </div>
                <div style={{ background: "white", borderRadius: 10, border: `1px solid ${C.border}`, padding: 10, fontSize: 8, color: C.textMuted, fontFamily: "Assistant" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                    {data.hasLogo && <div style={{ width: 16, height: 16, borderRadius: 3, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "white", fontWeight: 800 }}>{(data.companyName || "R").charAt(0)}</div>}
                    <span style={{ fontWeight: 600 }}>{data.companyName || "שם חברה"}</span>
                  </div>
                  דוח רבעוני · סודי · PDF
                </div>
              </div>
            </div>
          </div>)}

          {/* STEP 3: Regulatory Profile */}
          {step === 3 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>📋 פרופיל רגולטורי</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>סוג הרישיון קובע אילו מודולים ודרישות חלים עליך.</p>
            <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              {LICENSE_TYPES.map(l => (
                <div key={l.id} onClick={() => u("license", l.id)} style={{ background: data.license === l.id ? `${C.accent}08` : "white", border: `2px solid ${data.license === l.id ? C.accent : C.border}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: data.license === l.id ? C.accentGrad : C.borderLight, display: "flex", alignItems: "center", justifyContent: "center", color: data.license === l.id ? "white" : C.textMuted, fontSize: 16, fontWeight: 800, fontFamily: "Rubik" }}>
                    {data.license === l.id ? "✓" : l.id === "extended" ? "🔷" : l.id === "basic" ? "🔶" : "🔸"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{l.desc}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: data.license === l.id ? C.accent : C.textMuted, fontFamily: "Rubik" }}>{l.modules}</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>מודולים</div>
                  </div>
                </div>
              ))}
            </div>
            {lic && (
              <div style={{ background: C.borderLight, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: "Rubik", marginBottom: 4 }}>נבחר: {lic.name}</div>
                <div style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant" }}>חוזרים: {lic.regs.join(", ")} · {lic.reqs} דרישות · {lic.modules} מודולים</div>
              </div>
            )}
          </div>)}

          {/* STEP 4: Regulatory Assessment */}
          {step === 4 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>🎯 הערכה רגולטורית ראשונית</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>פרטים על פעילות האשראי — ישפיעו על רמת הסיכון ועל מודולים מותאמים.</p>
            <div style={{ display: "grid", gap: 16 }}>
              <div>{label("גודל תיק אשראי *", "סך כל האשראי שהועמד")}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["עד ₪10M","₪10-50M","₪50-200M","₪200-500M","מעל ₪500M"].map(v => (
                  <button key={v} onClick={() => u("portfolioSize", v)} style={{ flex: "1 1 auto", padding: "10px 14px", borderRadius: 8, border: `2px solid ${data.portfolioSize === v ? C.accent : C.border}`, background: data.portfolioSize === v ? `${C.accent}10` : "white", color: data.portfolioSize === v ? C.accent : C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>{v}</button>
                ))}
              </div></div>
              <div>{label("מספר לקוחות פעילים")}<div style={{ display: "flex", gap: 8 }}>
                {["עד 100","100-500","500-2,000","2,000-10,000","10,000+"].map(v => (
                  <button key={v} onClick={() => u("clientCount", v)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `2px solid ${data.clientCount === v ? C.accent : C.border}`, background: data.clientCount === v ? `${C.accent}10` : "white", color: data.clientCount === v ? C.accent : C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>{v}</button>
                ))}
              </div></div>
              <div>{label("סוגי לקוחות / פעילות *", "בחר את כל סוגי האשראי הרלוונטיים")}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CLIENT_TYPES.map(t => (
                  <button key={t} onClick={() => u("clientTypes", data.clientTypes.includes(t) ? data.clientTypes.filter(x => x !== t) : [...data.clientTypes, t])} style={{ padding: "8px 16px", borderRadius: 20, border: `2px solid ${data.clientTypes.includes(t) ? C.accent : C.border}`, background: data.clientTypes.includes(t) ? `${C.accent}10` : "white", color: data.clientTypes.includes(t) ? C.accent : C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>{data.clientTypes.includes(t) ? "✓ " : ""}{t}</button>
                ))}
              </div></div>
            </div>
            {data.portfolioSize && (
              <div style={{ marginTop: 16, background: `${C.accent}08`, borderRadius: 10, padding: 14, border: `1px solid ${C.accent}20` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: "Rubik" }}>💡 על בסיס הנתונים:</div>
                <div style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant", marginTop: 4 }}>
                  תיק בגודל {data.portfolioSize} מחייב ניטור ריכוזיות ענפית, דיווח רבעוני לרגולטור, ובקרת אשראי מוגברת.
                </div>
              </div>
            )}
          </div>)}

          {/* STEP 5: Risk Officer */}
          {step === 5 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>👤 מנהל סיכונים</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>פרטי מנהל הסיכונים הממונה (חובה לפי חוזר 2024-10-2).</p>
            <div onClick={() => u("isMe", !data.isMe)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: data.isMe ? `${C.accent}08` : "white", border: `2px solid ${data.isMe ? C.accent : C.border}`, borderRadius: 10, cursor: "pointer", marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${data.isMe ? C.accent : C.border}`, background: data.isMe ? C.accent : "white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>{data.isMe && "✓"}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>אני מנהל הסיכונים</span>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{label("שם מלא *")}<input value={data.riskOfficer} onChange={e => u("riskOfficer", e.target.value)} placeholder="יוסי לוי" style={inp} /></div>
                <div>{label("אימייל *")}<input value={data.riskOfficerEmail} onChange={e => u("riskOfficerEmail", e.target.value)} placeholder="yossi@company.co.il" style={inp} /></div>
              </div>
              <div>{label("תפקידים", "מנהל סיכונים לרוב נושא כמה כובעים")}<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ROLE_OPTIONS.map(r => (
                  <button key={r} onClick={() => u("riskRoles", data.riskRoles.includes(r) ? data.riskRoles.filter(x => x !== r) : [...data.riskRoles, r])} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${data.riskRoles.includes(r) ? C.accent : C.border}`, background: data.riskRoles.includes(r) ? `${C.accent}10` : "white", color: data.riskRoles.includes(r) ? C.accent : C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>{r}</button>
                ))}
              </div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{label("קו דיווח")}<select value={data.reportLine} onChange={e => u("reportLine", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  <option>ישירות למנכ״ל</option><option>ישירות לדירקטוריון</option><option>שניהם</option>
                </select></div>
                <div>{label("תאריך מינוי")}<input type="date" value={data.appointDate} onChange={e => u("appointDate", e.target.value)} style={inp} /></div>
              </div>
            </div>
          </div>)}

          {/* STEP 6: Directors */}
          {step === 6 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>👔 חברי דירקטוריון</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>פרטי הדירקטורים ישמשו לשליחת סדרי יום, פרוטוקולים ובקשות אישור.</p>
            <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
              {data.directors.map((d, i) => (
                <div key={i} style={{ background: C.borderLight, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "Rubik" }}>דירקטור {i + 1}</span>
                    {data.directors.length > 1 && <button onClick={() => u("directors", data.directors.filter((_, j) => j !== i))} style={{ background: C.dangerBg, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: C.danger, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <input value={d.name} onChange={e => { const nd = [...data.directors]; nd[i] = { ...nd[i], name: e.target.value }; u("directors", nd); }} placeholder="שם מלא" style={{ ...inp, padding: "10px 14px", fontSize: 13 }} />
                    <select value={d.role} onChange={e => { const nd = [...data.directors]; nd[i] = { ...nd[i], role: e.target.value }; u("directors", nd); }} style={{ ...inp, padding: "10px 14px", fontSize: 13, cursor: "pointer" }}>
                      <option>דירקטור</option><option>יו״ר דירקטוריון</option><option>דירקטור חיצוני</option><option>דירקטור בלתי תלוי</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input value={d.email} onChange={e => { const nd = [...data.directors]; nd[i] = { ...nd[i], email: e.target.value }; u("directors", nd); }} placeholder="email@company.co.il" style={{ ...inp, padding: "10px 14px", fontSize: 13 }} />
                    <input value={d.phone} onChange={e => { const nd = [...data.directors]; nd[i] = { ...nd[i], phone: e.target.value }; u("directors", nd); }} placeholder="050-XXX-XXXX" style={{ ...inp, padding: "10px 14px", fontSize: 13 }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => u("directors", [...data.directors, { name: "", email: "", phone: "", role: "דירקטור" }])} style={{ background: "white", border: `2px dashed ${C.border}`, borderRadius: 10, padding: "12px 0", width: "100%", fontSize: 12, color: C.accent, cursor: "pointer", fontFamily: "Rubik", fontWeight: 600 }}>+ הוסף דירקטור</button>
            <div style={{ marginTop: 12, background: `${C.accent}08`, borderRadius: 10, padding: 12, border: `1px solid ${C.accent}20` }}>
              <div style={{ fontSize: 10, color: C.accent, fontFamily: "Rubik", fontWeight: 600 }}>💡 הדירקטורים יקבלו:</div>
              <div style={{ fontSize: 10, color: C.textSec, fontFamily: "Assistant", marginTop: 2 }}>סדרי יום לפני ישיבות · פרוטוקולים לאישור · דוחות רבעוניים · לינק לממשק אישור ייעודי</div>
            </div>
          </div>)}

          {/* STEP 7: Team */}
          {step === 7 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>👥 הזמנת צוות</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>הזמן משתמשים נוספים — כל אחד יקבל לינק כניסה למערכת.</p>
            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              {data.team.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={t.name} onChange={e => { const nt = [...data.team]; nt[i] = { ...nt[i], name: e.target.value }; u("team", nt); }} placeholder="שם מלא" style={{ ...inp, flex: 1 }} />
                  <input value={t.email} onChange={e => { const nt = [...data.team]; nt[i] = { ...nt[i], email: e.target.value }; u("team", nt); }} placeholder="email@company.co.il" style={{ ...inp, flex: 1 }} />
                  <select value={t.role} onChange={e => { const nt = [...data.team]; nt[i] = { ...nt[i], role: e.target.value }; u("team", nt); }} style={{ ...inp, width: 120, cursor: "pointer" }}>
                    {TEAM_ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  {data.team.length > 1 && <button onClick={() => u("team", data.team.filter((_, j) => j !== i))} style={{ background: C.dangerBg, border: "none", borderRadius: 8, width: 38, height: 38, cursor: "pointer", color: C.danger, fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                </div>
              ))}
            </div>
            <button onClick={() => u("team", [...data.team, { name: "", email: "", role: "צופה" }])} style={{ background: "white", border: `2px dashed ${C.border}`, borderRadius: 10, padding: "12px 0", width: "100%", fontSize: 12, color: C.accent, cursor: "pointer", fontFamily: "Rubik", fontWeight: 600 }}>+ הוסף חבר צוות</button>
          </div>)}

          {/* STEP 8: Summary */}
          {step === 8 && (<div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 4 }}>🚀 סיכום והשקה</h2>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>הכל מוכן! בדוק את הפרטים לפני ההפעלה.</p>
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              {[
                { title: "חברה", icon: "🏢", items: [data.companyName || "לא הוזן", `ח.פ. ${data.companyId || "—"}`, `${data.city} · ${data.employees} עובדים`, data.hasLogo ? "✓ לוגו הועלה" : "✗ ללא לוגו"] },
                { title: "רגולציה", icon: "📋", items: [lic?.name, `${lic?.modules} מודולים · ${lic?.reqs} דרישות`, data.portfolioSize ? `תיק: ${data.portfolioSize}` : "—", data.clientTypes.length > 0 ? data.clientTypes.join(", ") : "—"] },
                { title: "מנהל סיכונים", icon: "👤", items: [data.riskOfficer || "לא הוזן", data.riskRoles.join(", "), `דיווח: ${data.reportLine}`] },
                { title: "דירקטוריון", icon: "👔", items: [`${data.directors.filter(d => d.name).length} דירקטורים`, ...data.directors.filter(d => d.name).map(d => `${d.name} (${d.role})`).slice(0, 3)] },
                { title: "צוות", icon: "👥", items: [`${data.team.filter(t => t.name).length} חברי צוות`, ...data.team.filter(t => t.name).map(t => `${t.name} — ${t.role}`).slice(0, 2)] },
              ].map((card, i) => (
                <div key={i} style={{ background: C.borderLight, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20 }}>{card.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 2 }}>{card.title}</div>
                    {card.items.map((it, j) => <div key={j} style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant" }}>{it}</div>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: `${C.accent}08`, borderRadius: 10, padding: 14, border: `1px solid ${C.accent}20` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "Rubik", marginBottom: 4 }}>מה יקרה עכשיו?</div>
              <div style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant", lineHeight: 1.8 }}>
                ✓ {lic?.modules} מודולים יופעלו · ✓ לוגו יוטמע בכל המסמכים · ✓ משימות ראשונות ייווצרו<br />
                ✓ סוכני AI יתחילו לנתח · ✓ הזמנות ישלחו לצוות ולדירקטורים
              </div>
            </div>
          </div>)}

          {/* STEP 9: Launch */}
          {step === 9 && (<div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: C.accentGrad, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, animation: "nutelaFloat 2s ease-in-out infinite", boxShadow: `0 8px 30px ${C.accent}40` }}>🚀</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.navBg, fontFamily: "Rubik", marginBottom: 8 }}>המערכת מוכנה!</h2>
            <p style={{ fontSize: 14, color: C.textSec, fontFamily: "Assistant", marginBottom: 24, lineHeight: 1.7 }}>
              {data.companyName || "החברה שלך"} מחוברת ל-RiskGuard.<br />הסוכנים שלנו כבר ניתחו את מצב העמידה ומחכים לך עם משימות.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
              {[{ icon: "🛡️", label: "סוכן ניהול סיכונים", status: "3 משימות מחכות" }, { icon: "🔐", label: "סוכן סייבר", status: "2 משימות מחכות" }].map((a, i) => (
                <div key={i} style={{ background: C.borderLight, borderRadius: 12, padding: "12px 20px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{a.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: "Rubik" }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: C.accent, fontFamily: "Rubik" }}>{a.status}</div>
                </div>
              ))}
            </div>
            <button onClick={() => onComplete(data)} style={{ background: C.accentGrad, color: "white", border: "none", padding: "14px 48px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik", boxShadow: `0 4px 16px ${C.accent}40` }}>כניסה לדשבורד ←</button>
          </div>)}
        </div>

        {/* Navigation */}
        {step > 0 && step < TOTAL_STEPS && (
          <div style={{ padding: "14px 36px 18px", borderTop: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={goBack} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", color: C.textSec }}>→ הקודם</button>
            <div style={{ display: "flex", gap: 8 }}>
              {step < TOTAL_STEPS - 1 && <button onClick={goNext} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 20px", fontSize: 12, cursor: "pointer", fontFamily: "Rubik", color: C.textMuted }}>דלג</button>}
              <button onClick={goNext} style={{ background: C.accentGrad, color: "white", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik", boxShadow: `0 2px 8px ${C.accent}30` }}>
                {step === TOTAL_STEPS - 1 ? "סיים והתחל ←" : "המשך ←"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// AGENT PUSH QUEUE — Smart questionnaires
// ═══════════════════════════════════════════════
const AGENT_PUSH_QUEUE = [
  { id: "APQ-01", agent: "🛡️", agentName: "סוכן ניהול סיכונים", color: "#00D4FF", priority: "high", title: "עדכון מפת סיכונים — רבעוני",
    desc: "הגיע הזמן לעדכן את מפת הסיכונים. ענה על 5 שאלות מהירות.",
    questions: [
      { q: "האם זוהו סיכונים חדשים ברבעון האחרון?", type: "choice", options: ["כן — אפרט", "לא — ללא שינוי"], k: "newRisks" },
      { q: "האם חל שינוי ברמת הסיכון של נדל״ן?", type: "choice", options: ["עלייה", "ללא שינוי", "ירידה"], k: "realEstate" },
      { q: "כמה אירועי הפסד היו ברבעון?", type: "choice", options: ["0","1-2","3-5","5+"], k: "lossEvents" },
      { q: "האם כל הבקרות שנקבעו בוצעו?", type: "choice", options: ["כולן", "רובן", "חלקן", "מעטות"], k: "controlsDone" },
      { q: "האם נדרש דיון בדירקטוריון על סיכון חדש?", type: "choice", options: ["כן", "לא"], k: "boardNeeded" },
    ]},
  { id: "APQ-02", agent: "🔐", agentName: "סוכן סייבר", color: "#FF6B9D", priority: "high", title: "שאלון סריקת חולשות חודשי",
    desc: "דיווח חודשי על סטטוס סריקות וממצאים.",
    questions: [
      { q: "האם בוצעה סריקת חולשות החודש?", type: "choice", options: ["כן — הושלמה", "בתהליך", "לא בוצעה"], k: "scanDone" },
      { q: "כמה ממצאים קריטיים נמצאו?", type: "choice", options: ["0","1-2","3+"], k: "critFindings" },
      { q: "האם כל ממצאי החודש הקודם טופלו?", type: "choice", options: ["כולם", "רובם", "חלקם"], k: "prevFixed" },
      { q: "האם בוצעה הדרכת פישינג?", type: "choice", options: ["כן", "מתוכננת", "לא"], k: "phishing" },
    ]},
  { id: "APQ-03", agent: "🛡️", agentName: "סוכן ניהול סיכונים", color: "#00D4FF", priority: "med", title: "אישור דוח רבעוני לדירקטוריון",
    desc: "הדוח הרבעוני מוכן. בדוק ואשר לפני שליחה.",
    questions: [
      { q: "סקרת את ציון העמידה (62%)?", type: "choice", options: ["כן — מתאים", "נדרש עדכון"], k: "scoreOk" },
      { q: "ההמלצות רלוונטיות?", type: "choice", options: ["כן", "נדרש שינוי"], k: "recsOk" },
      { q: "תוכנית הפעולה מעודכנת?", type: "choice", options: ["כן", "לעדכן תאריכים", "לעדכן אחראים"], k: "planOk" },
      { q: "אשר שליחה לדירקטוריון", type: "choice", options: ["אושר לשליחה ✓", "נדרשים תיקונים"], k: "approved" },
    ]},
  { id: "APQ-04", agent: "🛡️", agentName: "סוכן ניהול סיכונים", color: "#00D4FF", priority: "med", title: "סקירת ספקים — רבעונית",
    desc: "בדוק את סטטוס הספקים הקריטיים.",
    questions: [
      { q: "האם כל ה-SLA עומדים ביעד?", type: "choice", options: ["כולם", "רובם", "יש חריגות"], k: "slaOk" },
      { q: "האם חודש חוזה ספק כלשהו?", type: "choice", options: ["כן", "לא", "בתהליך"], k: "contractRenew" },
      { q: "האם זוהה ספק ללא חלופה?", type: "choice", options: ["כן — נדרש טיפול", "לא"], k: "noBackup" },
    ]},
  { id: "APQ-05", agent: "🔐", agentName: "סוכן סייבר", color: "#FF6B9D", priority: "low", title: "דיווח אירוע סייבר",
    desc: "דווח על אירוע סייבר שהתרחש.",
    questions: [
      { q: "סוג האירוע", type: "choice", options: ["פישינג","כופרה","דלף מידע","DDoS","אחר"], k: "eventType" },
      { q: "חומרת האירוע", type: "choice", options: ["קריטי","גבוה","בינוני","נמוך"], k: "severity" },
      { q: "האם נחשפו נתוני לקוחות?", type: "choice", options: ["כן","לא","לא ידוע"], k: "dataExposed" },
      { q: "האם האירוע נבלם?", type: "choice", options: ["כן — נבלם","בטיפול","לא"], k: "contained" },
      { q: "נדרש דיווח לרגולטור?", type: "choice", options: ["כן — מיידי","כן — תוך 24 שעות","לא"], k: "regReport" },
    ]},
];

function AgentPushCard({ item, onOpen }) {
  const prioColors = { high: { c: C.danger, bg: C.dangerBg, l: "דחוף" }, med: { c: C.warning, bg: C.warningBg, l: "רגיל" }, low: { c: C.textMuted, bg: C.borderLight, l: "נמוך" } };
  const p = prioColors[item.priority];
  return (
    <div onClick={onOpen} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", transition: "all 0.15s", borderRight: `4px solid ${item.color}` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}20`; e.currentTarget.style.borderColor = item.color; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.agent}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>{item.title}</span>
            <span style={{ background: p.bg, color: p.c, fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, fontFamily: "Rubik" }}>{p.l}</span>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>{item.agentName} · {item.questions.length} שאלות · ~1 דקה</div>
        </div>
        <ChevronRight size={16} color={C.textMuted} style={{ transform: "scaleX(-1)" }} />
      </div>
    </div>
  );
}

function AgentQuestionnaire({ item, onClose, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const q = item.questions[currentQ];
  const progress = ((currentQ + (completed ? 1 : 0)) / item.questions.length) * 100;

  const selectAnswer = (val) => {
    const newAns = { ...answers, [q.k]: val };
    setAnswers(newAns);
    setTimeout(() => {
      if (currentQ < item.questions.length - 1) setCurrentQ(currentQ + 1);
      else setCompleted(true);
    }, 300);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.7)", direction: "rtl" }}>
      <div style={{ width: 520, background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "fadeInUp 0.3s ease-out" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{item.agent}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Rubik" }}>{item.title}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Assistant" }}>{item.agentName}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="white" /></button>
        </div>
        {/* Progress */}
        <div style={{ height: 4, background: C.borderLight }}><div style={{ height: "100%", background: item.color, width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 2 }} /></div>

        {/* Content */}
        <div style={{ padding: "28px 32px 24px", minHeight: 250 }}>
          {!completed ? (
            <div key={currentQ} style={{ animation: "fadeInUp 0.25s ease-out" }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "Rubik", marginBottom: 12 }}>שאלה {currentQ + 1} מתוך {item.questions.length}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 24, lineHeight: 1.5 }}>{q.q}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(opt)} style={{ textAlign: "right", padding: "14px 20px", borderRadius: 12, border: `2px solid ${answers[q.k] === opt ? item.color : C.border}`, background: answers[q.k] === opt ? `${item.color}10` : "white", color: answers[q.k] === opt ? item.color : C.text, fontSize: 14, fontWeight: answers[q.k] === opt ? 700 : 500, cursor: "pointer", fontFamily: "Assistant", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${answers[q.k] === opt ? item.color : C.border}`, background: answers[q.k] === opt ? item.color : "white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, flexShrink: 0 }}>{answers[q.k] === opt && "✓"}</div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", animation: "fadeInUp 0.3s ease-out" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.successBg, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✅</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "Rubik", marginBottom: 6 }}>הושלם!</h3>
              <p style={{ fontSize: 13, color: C.textSec, fontFamily: "Assistant", marginBottom: 20 }}>{item.agentName} קיבל את התשובות ומעדכן את המערכת.</p>
              <div style={{ background: C.borderLight, borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "right" }}>
                {Object.entries(answers).map(([k, v], i) => {
                  const origQ = item.questions.find(x => x.k === k);
                  return <div key={i} style={{ fontSize: 11, color: C.textSec, fontFamily: "Assistant", padding: "3px 0", display: "flex", justifyContent: "space-between" }}><span>{origQ?.q}</span><span style={{ fontWeight: 600, color: C.text }}>{v}</span></div>;
                })}
              </div>
              <button onClick={() => { onComplete(item.id, answers); }} style={{ background: C.accentGrad, color: "white", border: "none", padding: "12px 36px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik" }}>סגור ←</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function RiskGuardV11() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activePush, setActivePush] = useState(null);
  const [completedPush, setCompletedPush] = useState([]);
  const pushQueue = AGENT_PUSH_QUEUE.filter(p => !completedPush.includes(p.id));
  const [nav, setNav] = useState("dash");
  const [dashFilter, setDashFilter] = useState("all");
  const [nutelaOpen, setNutelaOpen] = useState(false);
  const [nutelaCtrl, setNutelaCtrl] = useState(null);
  const [reportPreview, setReportPreview] = useState(null);
  const [detail, setDetail] = useState(null);
  const [risks, setRisks] = useState(RISK_BANK.map(r => ({ ...r, controls: r.controls.map(c => ({ ...c })) })));
  const [tasks, setTasks] = useState(ALL_TASKS.map(t => ({ ...t })));
  const globalUpdateEff = (riskId, ctrlId, eff) => {
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, controls: r.controls.map(c => c.id === ctrlId ? { ...c, effectiveness: eff } : c) } : r));
  };
  const updateTaskStatus = (taskId, newStatus) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  const liveControls = getAllControls(risks);
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = l => setExpandedGroups(p => {
    const isOpen = p[l];
    // Accordion: close all others, toggle clicked
    const next = {};
    NAV_GROUPS.forEach(g => { if (g.label) next[g.label] = false; });
    if (!isOpen) next[l] = true;
    return next;
  });
  const allNavItems = NAV_GROUPS.flatMap(g => g.items);
  const modules = dashFilter === "all" ? ALL_MODULES : ALL_MODULES.filter(m => m.reg === dashFilter);
  const trend = TREND_DATA[dashFilter]; const radar = RADAR_DATA[dashFilter];
  const overallScore = SCORES[dashFilter]; const benchmarkScore = BENCHMARKS[dashFilter];
  const totalReqs = modules.reduce((a,m) => a+m.reqs, 0); const metReqs = modules.reduce((a,m) => a+m.met, 0);
  const compliancePct = totalReqs ? Math.round((metReqs/totalReqs)*100) : 0;
  const filteredTasks = dashFilter === "all" ? TASKS : TASKS.filter(t => t.reg === dashFilter);
  const overdueCount = tasks.filter(t => t.status === "overdue").length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Assistant, Rubik, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Assistant:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{margin:0;}
@keyframes nutelaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes nutelaPulse{0%,100%{opacity:0.5;transform:scale(0.95)}50%{opacity:1;transform:scale(1.05)}}
@keyframes nutelaSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes nutelaGlow{0%,100%{box-shadow:0 4px 20px rgba(123,97,255,0.3)}50%{box-shadow:0 4px 35px rgba(189,52,254,0.5)}}
@keyframes nutelaWink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.1)}}
@keyframes nutelaWave{0%,70%,100%{transform:rotate(0deg)}75%{transform:rotate(15deg)}80%{transform:rotate(-10deg)}85%{transform:rotate(12deg)}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes typingDot{0%,60%,100%{opacity:0.3}30%{opacity:1}}
`}</style>

      {/* TOP NAV */}
      <div style={{ background: C.navBg, position: "sticky", top: 0, zIndex: 100, direction: "rtl" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "white", fontFamily: "Rubik" }}>R</div>
            <span style={{ color: "white", fontSize: 17, fontWeight: 700, fontFamily: "Rubik" }}>RiskGuard</span>
            <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>|</span>
            <Building2 size={14} color={C.textMuted} />
            <span style={{ color: C.textMuted, fontSize: 13, fontFamily: "Assistant" }}>{COMPANY.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: C.accentGrad, color: "white", padding: "3px 12px", borderRadius: 10, fontFamily: "Rubik" }}>PRO</span>
            <div style={{ position: "relative", cursor: "pointer" }}><Bell size={18} color="#CBD5E1" />{overdueCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: C.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white" }}>{overdueCount}</div>}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, fontFamily: "Rubik" }}>יל</div>
              <div><div style={{ color: "#E2E8F0", fontSize: 12, fontWeight: 600, fontFamily: "Rubik", lineHeight: 1.2 }}>{COMPANY.officer}</div><div style={{ color: "#64748B", fontSize: 10, fontFamily: "Assistant", lineHeight: 1.2 }}>מנהל סיכונים</div></div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "0 28px", height: 44, position: "relative" }}>
          {NAV_GROUPS.map((group, gi) => {
            const hasActive = group.items.some(it => it.id === nav);
            const isOpen = expandedGroups[group.label];
            return (
            <div key={gi} style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {gi > 0 && <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />}
              {group.label ? (
                <button onClick={() => toggleGroup(group.label)} style={{ background: group.label === "PRO" ? (isOpen || hasActive ? "rgba(124,111,208,0.15)" : "rgba(124,111,208,0.08)") : isOpen || hasActive ? "rgba(74,142,194,0.1)" : "none", border: "none", cursor: "pointer", color: group.label === "PRO" ? (isOpen || hasActive ? "#B0A4E8" : "#8B7FD0") : (isOpen || hasActive ? "#8CC8E8" : "#5A7080"), fontSize: 11, fontWeight: 800, fontFamily: "Rubik", padding: "4px 8px 4px 4px", borderRadius: 5, display: "flex", alignItems: "center", gap: 3, letterSpacing: 0.3, transition: "all 0.15s" }}>{group.label === "PRO" && <Crown size={10} />}{group.label}{isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}</button>
              ) : (
                group.items.map(item => {
                  const active = nav === item.id; const Ic = item.Icon;
                  return (<button key={item.id} onClick={() => setNav(item.id)} style={{ background: active ? "rgba(74,142,194,0.15)" : "transparent", border: "none", cursor: "pointer", color: active ? "#8CC8E8" : "#7B8FA0", padding: "7px 9px", borderRadius: 8, fontSize: 11, fontWeight: active ? 600 : 400, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4, transition: "all 0.12s", whiteSpace: "nowrap", borderBottom: active ? `2px solid ${C.accentTeal}` : "2px solid transparent", marginBottom: -1 }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#A0B8C8"; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#7B8FA0"; }}}
                  ><Ic size={12} strokeWidth={active ? 2.2 : 1.8} />{item.label}</button>);
                })
              )}
              {/* Dropdown panel */}
              {group.label && isOpen && (<>
                <div onClick={() => toggleGroup(group.label)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 199 }} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200, background: C.navBg, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: 8, minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", animation: "fadeInUp 0.2s ease" }}>
                  {group.sub && <div style={{ fontSize: 9, color: "#475569", fontFamily: "Rubik", padding: "4px 10px 6px", letterSpacing: 0.5 }}>חוזר {group.sub}</div>}
                  {group.items.map(item => {
                    const active = nav === item.id; const Ic = item.Icon;
                    const mod = ALL_MODULES.find(m => m.id === item.id);
                    const scoreColor = mod ? (mod.score >= 80 ? C.success : mod.score >= 50 ? C.warning : C.danger) : null;
                    return (<button key={item.id} onClick={() => { setNav(item.id); toggleGroup(group.label); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: active ? "rgba(74,142,194,0.15)" : "transparent", border: "none", cursor: "pointer", color: active ? "#8CC8E8" : "#94A3B8", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: "Rubik", transition: "all 0.12s", textAlign: "right" }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      <Ic size={14} strokeWidth={active ? 2.2 : 1.8} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {mod && <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor, fontFamily: "Rubik" }}>{mod.score}%</span>}
                    </button>);
                  })}
                </div>
              </>)}
            </div>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", direction: "rtl" }}>

        {nav === "dash" && (
          <>
            {overdueCount > 0 && (<div style={{ background: C.dangerBg, border: `1px solid #F5C6C0`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}><AlertTriangle size={15} color={C.danger} /><span style={{ fontSize: 13, color: C.danger, fontWeight: 600, fontFamily: "Assistant", flex: 1 }}>{overdueCount} פריטים באיחור</span><button onClick={() => setNav("tasks")} style={{ background: C.danger, color: "white", border: "none", padding: "5px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik" }}>צפה</button></div>)}

            {/* ═══ Agent Push Queue ═══ */}
            {pushQueue.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, rgba(123,97,255,0.06), rgba(0,212,255,0.06))", border: `1px solid rgba(123,97,255,0.15)`, borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #7B61FF, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", animation: "nutelaPulse 3s ease-in-out infinite" }}>
                      <Zap size={14} color="white" />
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>הסוכנים מחכים לך</span>
                      <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant", marginRight: 6 }}> · {pushQueue.length} פריטים דורשים תשומת לב</span>
                    </div>
                  </div>
                  <span style={{ background: "linear-gradient(135deg, #7B61FF, #00D4FF)", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, fontFamily: "Rubik" }}>{pushQueue.filter(p => p.priority === "high").length} דחופים</span>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {pushQueue.slice(0, 3).map(item => (
                    <AgentPushCard key={item.id} item={item} onOpen={() => setActivePush(item)} />
                  ))}
                  {pushQueue.length > 3 && (
                    <div style={{ textAlign: "center", fontSize: 11, color: C.accent, fontFamily: "Rubik", padding: "4px 0", cursor: "pointer", fontWeight: 600 }}
                      onClick={() => setNav("agents")}>
                      +{pushQueue.length - 3} פריטים נוספים ←
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div><h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Rubik", margin: "0 0 2px" }}>דשבורד</h1><p style={{ fontSize: 12, color: C.textMuted, fontFamily: "Assistant", margin: 0 }}>{COMPANY.name} · {new Date().toLocaleDateString("he-IL", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p></div>
              <div style={{ display: "flex", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 3 }}>
                {[{ id: "all", label: "הכל", Icon: Layers },{ id: "risk", label: "ניהול סיכונים", Icon: Shield },{ id: "cyber", label: "סיכוני סייבר", Icon: Lock }].map(f => (
                  <button key={f.id} onClick={() => setDashFilter(f.id)} style={{ background: dashFilter === f.id ? C.accentGrad : "transparent", border: "none", cursor: "pointer", color: dashFilter === f.id ? "white" : C.textSec, padding: "8px 16px", borderRadius: 8, fontFamily: "Rubik", fontSize: 12, fontWeight: dashFilter === f.id ? 600 : 400, display: "flex", alignItems: "center", gap: 5 }}><f.Icon size={13} />{f.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 18 }}>
                <ScoreRing score={overallScore} size={110} label="ציון עמידה" />
                <div><div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "Rubik", marginBottom: 8 }}>{dashFilter === "all" ? "ציון כולל" : dashFilter === "risk" ? "ניהול סיכונים" : "סיכוני סייבר"}</div><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>{overallScore >= benchmarkScore ? <ArrowUpRight size={14} color={C.success} /> : <ArrowDownRight size={14} color={C.danger} />}<span style={{ fontSize: 12, color: overallScore >= benchmarkScore ? C.success : C.danger, fontWeight: 600, fontFamily: "Rubik" }}>{overallScore >= benchmarkScore ? "+" : ""}{overallScore - benchmarkScore}% מהשוק</span></div><div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>ממוצע שוק: {benchmarkScore}%</div></div>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}><Target size={13} color={C.accent} /><span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "Rubik" }}>עמידה בדרישות</span></div><div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}><span style={{ fontSize: 32, fontWeight: 800, color: C.accent, fontFamily: "Rubik" }}>{metReqs}</span><span style={{ fontSize: 15, color: C.textMuted, fontFamily: "Rubik" }}>/ {totalReqs}</span></div><div style={{ background: C.borderLight, borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 4 }}><div style={{ width: `${compliancePct}%`, height: "100%", borderRadius: 6, background: C.accentGrad }} /></div><div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Assistant" }}>{compliancePct}% מולאו</div></div>
              <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10 }}>{[{ v: "12", l: "סיכונים פתוחים", c: C.danger, Icon: AlertTriangle, bg: C.dangerBg },{ v: "6", l: "ספקים פעילים", c: C.accent, Icon: Users, bg: C.accentLight }].map((s,i) => (<div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><s.Icon size={16} color={s.c} /></div><div><div style={{ fontSize: 20, fontWeight: 700, color: s.c, fontFamily: "Rubik" }}>{s.v}</div><div style={{ fontSize: 10, color: C.textSec, fontFamily: "Assistant" }}>{s.l}</div></div></div>))}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
              <ChartCard title="מגמת עמידה מול ממוצע שוק" Icon={TrendingUp}><div style={{ display: "flex", gap: 14, marginBottom: 8, justifyContent: "flex-end" }}><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "Assistant", color: C.accent }}><div style={{ width: 16, height: 3, borderRadius: 2, background: C.accent }} />אתם</span><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "Assistant", color: C.textMuted }}><div style={{ width: 16, height: 0, borderTop: "2px dashed #8896A6" }} />ממוצע שוק</span></div><ResponsiveContainer width="100%" height={190}><AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><defs><linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="100%" stopColor={C.accent} stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} /><XAxis dataKey="month" fontSize={10} fontFamily="Assistant" tick={{ fill: C.textMuted }} /><YAxis domain={[0,100]} fontSize={10} tick={{ fill: C.textMuted }} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="score" name="אתם" stroke={C.accent} strokeWidth={2.5} fill="url(#gS)" dot={{ r: 3, fill: C.accent }} /><Line type="monotone" dataKey="benchmark" name="ממוצע שוק" stroke={C.textMuted} strokeWidth={1.5} strokeDasharray="6 3" dot={false} /></AreaChart></ResponsiveContainer></ChartCard>
              <ChartCard title="בנצ'מארק מול שוק" Icon={Target}><ResponsiveContainer width="100%" height={210}><RadarChart data={radar} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}><PolarGrid stroke={C.borderLight} /><PolarAngleAxis dataKey="subject" fontSize={9} fontFamily="Assistant" tick={{ fill: C.textSec }} /><PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} /><Radar name="אתם" dataKey="you" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} /><Radar name="שוק" dataKey="market" stroke={C.textMuted} fill={C.textMuted} fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="4 3" /></RadarChart></ResponsiveContainer></ChartCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
              <ChartCard title="מודולים" Icon={Layers}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{modules.map(m => { const color = m.score >= 80 ? C.success : m.score >= 50 ? C.warning : C.danger; const Ic = m.Icon; return (<div key={m.id} onClick={() => setNav(m.id)} style={{ background: C.borderLight, borderRadius: 8, padding: 12, border: `1px solid ${C.border}`, cursor: "pointer", transition: "all 0.1s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><div style={{ width: 26, height: 26, borderRadius: 6, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={13} color={C.accent} /></div><span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "Rubik", flex: 1 }}>{m.name}</span><span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "Rubik" }}>{m.score}%</span></div><div style={{ background: "white", borderRadius: 3, height: 5, overflow: "hidden", marginBottom: 4 }}><div style={{ width: `${m.score}%`, height: "100%", borderRadius: 3, background: color }} /></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, fontFamily: "Assistant" }}><span>{m.met}/{m.reqs} דרישות</span>{m.tasks > 0 && <span>{m.tasks} משימות</span>}</div></div>); })}</div></ChartCard>
              <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 14 }}>
                <ChartCard title="התפלגות סיכונים" Icon={BarChart3}><ResponsiveContainer width="100%" height={100}><RPieChart><Pie data={RISK_DIST} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value">{RISK_DIST.map((e,i) => <Cell key={i} fill={e.color} />)}</Pie></RPieChart></ResponsiveContainer><div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>{RISK_DIST.map((e,i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: C.textSec, fontFamily: "Assistant" }}><div style={{ width: 7, height: 7, borderRadius: 2, background: e.color }} />{e.name} ({e.value})</span>)}</div></ChartCard>
                <ChartCard title="סטטוס קומפליאנס" Icon={CheckSquare}><ResponsiveContainer width="100%" height={100}><RPieChart><Pie data={COMPLIANCE_DIST} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value">{COMPLIANCE_DIST.map((e,i) => <Cell key={i} fill={e.color} />)}</Pie></RPieChart></ResponsiveContainer><div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>{COMPLIANCE_DIST.map((e,i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: C.textSec, fontFamily: "Assistant" }}><div style={{ width: 7, height: 7, borderRadius: 2, background: e.color }} />{e.name} ({e.value})</span>)}</div></ChartCard>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <ChartCard title="מועדים קרובים" Icon={Clock}>{filteredTasks.map((t,i) => { const s = taskStyle[t.status]; return (<div key={i} style={{ padding: "9px 0", borderBottom: i < filteredTasks.length-1 ? `1px solid ${C.borderLight}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "Assistant" }}>{t.title}</div><div style={{ fontSize: 10, color: C.textMuted }}>{t.mod} · {t.due}</div></div><span style={{ background: s.bg, color: s.c, fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 5, fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}><s.Icon size={9} />{s.l}</span></div>); })}</ChartCard>
              <ChartCard title="פעילות אחרונה" Icon={Activity}>{ACTIVITIES.map((a,i) => (<div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: i < ACTIVITIES.length-1 ? `1px solid ${C.borderLight}` : "none" }}><div style={{ width: 26, height: 26, borderRadius: 7, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><a.Icon size={12} color={C.accent} /></div><div><div style={{ fontSize: 12, color: C.text, fontFamily: "Assistant" }}><b>{a.user}</b> {a.action}</div><div style={{ fontSize: 10, color: C.textMuted }}>{a.detail} · {a.time}</div></div></div>))}</ChartCard>
            </div>
          </>
        )}

        {nav === "riskreg" && <RiskRegister onAskNutela={(ctrl) => { setNutelaCtrl(ctrl); setNutelaOpen(true); }} onOpenDetail={setDetail} risks={risks} setRisks={setRisks} />}

        {nav === "reg" && <RegulationNavigator onNav={setNav} />}

        {nav === "docs" && <DocumentLibrary onOpenDetail={setDetail} onPreviewDoc={setReportPreview} />}

        {nav === "tasks" && <TaskManager onOpenDetail={setDetail} tasks={tasks} updateTaskStatus={updateTaskStatus} liveControls={liveControls} />}

        {nav === "settings" && <SettingsScreen />}

        {nav === "credit" && <CreditRiskModule />}

        {nav === "kri" && <KRIModule />}

        {nav === "events" && <EventReportingModule />}

        {nav === "board" && <BoardCycleModule onPreviewReport={setReportPreview} />}

        {nav === "reports" && <ReportsModule onPreviewReport={setReportPreview} />}

        {nav === "agents" && <AgentHub />}

        {["gov","ops","out","bcp","cgov","cpro","cinc"].includes(nav) && <ModuleScreen moduleId={nav} onNav={setNav} onOpenDetail={setDetail} onPreviewDoc={setReportPreview} />}
      </div>

      {/* Global Detail Drawer — 360° */}
      {detail && <div onClick={() => setDetail(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.2)", zIndex: 250, cursor: "pointer" }} />}
      {detail && <GlobalDetailDrawer detail={detail} onClose={() => setDetail(null)} onOpen={setDetail} onNav={(id) => { setDetail(null); setNav(id); }} risks={risks} updateEff={globalUpdateEff} onPreviewDoc={setReportPreview} />}

      {/* Report Preview Overlay */}
      {reportPreview && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 400, display: "flex", flexDirection: "column", background: "rgba(15,23,42,0.85)" }}>
          {/* Toolbar */}
          <div style={{ background: "#1E293B", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, direction: "rtl" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={16} color="white" />
              </div>
              <div>
                <div style={{ color: "white", fontSize: 14, fontWeight: 700, fontFamily: "Rubik" }}>{reportPreview.filename}</div>
                <div style={{ color: "#64748B", fontSize: 10, fontFamily: "Assistant" }}>הופק על ידי RiskGuard · {new Date().toLocaleDateString("he-IL")}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => {
                const frame = document.getElementById("rg-print-frame");
                if (frame) { frame.contentWindow.focus(); frame.contentWindow.print(); }
              }} style={{ background: C.accentGrad, color: "white", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 5 }}>
                <FileOutput size={13} /> הדפס / שמור PDF
              </button>
              <button onClick={() => setReportPreview(null)} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "Rubik", display: "flex", alignItems: "center", gap: 4 }}>
                <X size={14} /> סגור
              </button>
            </div>
          </div>
          {/* Report Content in iframe */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <iframe id="rg-print-frame" srcDoc={`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><style>body{margin:0;padding:40px 60px;font-family:Arial,sans-serif;}</style></head><body>${reportPreview.html}</body></html>`}
              style={{ width: 820, minHeight: 600, background: "white", border: "none", borderRadius: 8, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}
            />
          </div>
        </div>
      )}

      {/* NuTeLa Floating Button */}
      <div onClick={() => { setNutelaCtrl(null); setNutelaOpen(!nutelaOpen); }} style={{
        position: "fixed", bottom: 24, left: 24, zIndex: 150, cursor: "pointer",
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #7B61FF, #BD34FE, #FF6B9D)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "nutelaGlow 3s ease-in-out infinite",
        transition: "transform 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <NuTelaAvatar size={42} animate={!nutelaOpen} />
      </div>
      {!nutelaOpen && (
        <div style={{ position: "fixed", bottom: 28, left: 86, zIndex: 150, pointerEvents: "none" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 11, fontWeight: 600, fontFamily: "Rubik", color: C.text, whiteSpace: "nowrap" }}>
            <span style={{ color: "#7B61FF" }}>N</span><span style={{ color: "#BD34FE" }}>u</span><span style={{ color: "#7B61FF" }}>T</span><span style={{ color: "#BD34FE" }}>e</span><span style={{ color: "#7B61FF" }}>L</span><span style={{ color: "#FF6B9D" }}>a</span> <span style={{ fontSize: 9, color: C.textMuted }}>AI</span>
          </div>
        </div>
      )}
      {nutelaOpen && <NuTelaPanel ctrl={nutelaCtrl} onClose={() => setNutelaOpen(false)} />}

      {/* Onboarding Wizard */}
      {showOnboarding && <OnboardingWizard onComplete={(d) => setShowOnboarding(false)} />}

      {/* Agent Questionnaire Modal */}
      {activePush && <AgentQuestionnaire item={activePush} onClose={() => setActivePush(null)} onComplete={(id) => { setCompletedPush(p => [...p, id]); setActivePush(null); }} />}
    </div>
  );
}
