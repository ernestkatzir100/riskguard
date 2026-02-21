'use client';

import { useState, useEffect } from 'react';
import {
  Zap, BookOpen, X, AlertTriangle, CheckCircle,
  Shield, FileText, User, Activity,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { ScoreRing } from '@/shared/components/score-ring';
import { getCyberIncidents, createCyberIncident } from '@/app/actions/cyber';
import { FormModal } from '@/shared/components/form-modal';
import { IncidentForm } from '@/shared/components/forms/incident-form';

/* ═══ Incident Data ═══ */
type TimelineStep = { label: string; date: string; done: boolean; note?: string };
type Incident = {
  id: string; type: string; date: string; severity: 'גבוה' | 'בינוני' | 'נמוך';
  status: 'סגור' | 'פתוח'; owner: string; description: string;
  timeline: TimelineStep[]; resolution?: string;
};

const INCIDENTS: Incident[] = [
  {
    id: 'INC-001', type: 'פישינג', date: '15/01/2026', severity: 'נמוך',
    status: 'סגור', owner: 'דנה כהן',
    description: 'התקבלה הודעת פישינג למספר עובדים. ההודעה זוהתה ע"י מערכת הסינון וכל ההודעות נחסמו. בוצע תדריך עובדים.',
    timeline: [
      { label: 'זיהוי', date: '15/01/2026 08:30', done: true, note: 'זוהה ע"י מערכת סינון דוא"ל' },
      { label: 'הכלה', date: '15/01/2026 08:45', done: true, note: 'חסימת כתובות שולח + דומיין' },
      { label: 'חקירה', date: '15/01/2026 10:00', done: true, note: 'אומת שאין עובדים שנפגעו' },
      { label: 'סגירה', date: '15/01/2026 14:00', done: true, note: 'תדריך עובדים + עדכון כללי סינון' },
    ],
    resolution: 'האירוע טופל במלואו. עודכנו כללי סינון דוא"ל ובוצע תדריך פישינג לכלל העובדים.',
  },
  {
    id: 'INC-002', type: 'ניסיון גישה בלתי מורשה', date: '20/11/2025', severity: 'בינוני',
    status: 'סגור', owner: 'דנה כהן',
    description: 'זוהו ניסיונות כניסה חוזרים ממיקום חשוד למערכת הניהול. הגישה נחסמה אוטומטית ע"י מנגנון הגנה.',
    timeline: [
      { label: 'זיהוי', date: '20/11/2025 22:15', done: true, note: 'התראת SIEM על ניסיונות כניסה חוזרים' },
      { label: 'הכלה', date: '20/11/2025 22:20', done: true, note: 'חסימת IP אוטומטית + נעילת חשבון' },
      { label: 'חקירה', date: '21/11/2025 09:00', done: true, note: 'לא נמצאה חדירה; brute force מבחוץ' },
      { label: 'סגירה', date: '21/11/2025 16:00', done: true, note: 'חיזוק מדיניות סיסמאות + הוספת GeoBlock' },
    ],
    resolution: 'ניסיון brute force מכתובת IP חיצונית. לא הייתה חדירה בפועל. חוזקה מדיניות סיסמאות והופעל חסימת מיקום גיאוגרפי.',
  },
  {
    id: 'INC-003', type: 'תקלת זמינות', date: '05/09/2025', severity: 'נמוך',
    status: 'סגור', owner: 'IT',
    description: 'מערכת ה-CRM לא הייתה זמינה למשך 3 שעות עקב תקלה בשרת הספק.',
    timeline: [
      { label: 'זיהוי', date: '05/09/2025 10:00', done: true, note: 'דיווח עובדים על חוסר גישה' },
      { label: 'הכלה', date: '05/09/2025 10:15', done: true, note: 'הפניה לספק + עדכון משתמשים' },
      { label: 'חקירה', date: '05/09/2025 11:00', done: true, note: 'תקלת חומרה בשרת הספק' },
      { label: 'סגירה', date: '05/09/2025 13:00', done: true, note: 'שירות שוחזר; בוצע בדיקת תקינות נתונים' },
    ],
    resolution: 'תקלת חומרה בצד הספק. השירות שוחזר תוך 3 שעות. נבדקה שלמות הנתונים ואושרה.',
  },
  {
    id: 'INC-004', type: 'חשד לדליפת מידע', date: '10/02/2026', severity: 'גבוה',
    status: 'פתוח', owner: 'דנה כהן',
    description: 'התקבלה התראה על העברת קובץ גדול לשירות ענן חיצוני לא מורשה. בבדיקה ראשונית נמצא שהקובץ מכיל נתוני לקוחות.',
    timeline: [
      { label: 'זיהוי', date: '10/02/2026 14:30', done: true, note: 'התראת DLP על העברת קובץ חשוד' },
      { label: 'הכלה', date: '10/02/2026 14:45', done: true, note: 'חסימת גישה לשירות הענן + נעילת חשבון העובד' },
      { label: 'חקירה', date: '10/02/2026 16:00', done: false, note: 'בבדיקה — ניתוח היקף הדליפה' },
      { label: 'סגירה', date: '', done: false },
    ],
  },
];

const SEVERITY_STYLE: Record<string, { color: string; bg: string }> = {
  'גבוה': { color: C.danger, bg: C.dangerBg },
  'בינוני': { color: C.warning, bg: C.warningBg },
  'נמוך': { color: C.accent, bg: C.accentLight },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  'סגור': { color: C.success, bg: C.successBg },
  'פתוח': { color: C.danger, bg: C.dangerBg },
};

/* ═══ Procedure Data ═══ */
const PROCEDURE_STEPS = [
  'קבלת התראה / דיווח על אירוע חשוד',
  'סיווג ראשוני — קביעת חומרה ודחיפות',
  'הכלה מיידית — בידוד מערכות/חשבונות מושפעים',
  'חקירה וניתוח — איתור מקור, היקף והשפעה',
  'דיווח לממונה על הגנת הפרטיות ולרגולטור (אם נדרש)',
  'סגירה — תיעוד, הפקת לקחים ועדכון בקרות',
];

export default function CyberIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showAddIncident, setShowAddIncident] = useState(false);

  async function loadData() {
    try {
      const result = await getCyberIncidents();
      if (result && Array.isArray(result) && result.length > 0) {
        const mapped: Incident[] = result.map((inc: Record<string, unknown>) => ({
          id: String(inc.id ?? ''),
          type: String(inc.type ?? ''),
          date: String(inc.date ?? ''),
          severity: (inc.severity as Incident['severity']) ?? 'נמוך',
          status: (inc.status as Incident['status']) ?? 'פתוח',
          owner: String(inc.owner ?? ''),
          description: String(inc.description ?? ''),
          timeline: Array.isArray(inc.timeline) ? inc.timeline : [],
          resolution: inc.resolution ? String(inc.resolution) : undefined,
        }));
        setIncidents(mapped);
      }
    } catch { /* fallback to demo */ }
  }
  useEffect(() => { loadData(); }, []);

  const selected = selectedIncident ? incidents.find(inc => inc.id === selectedIncident) : null;
  const complianceScore = 80;
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(inc => inc.status === 'פתוח').length;
  const avgResponseHours = 2.5;

  return (
    <>
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={20} color={C.accent} /> אירועי סייבר
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            ניהול אירועים · תגובה · דיווח · הפקת לקחים
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowAddIncident(true)} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5 }}>
            + דווח אירוע
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ScoreRing score={80} size={60} label="ציון ציות" />
          </div>
          <div style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> חוזר 2022-10-9 §7-8
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'ציון עמידה', value: `${complianceScore}%`, c: C.success },
          { label: 'אירועים סה"כ', value: totalIncidents, c: C.accent },
          { label: 'פתוחים', value: openIncidents, c: openIncidents > 0 ? C.danger : C.success },
          { label: 'זמן תגובה ממוצע', value: `${avgResponseHours} שעות`, c: C.accent },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center', borderTop: `3px solid ${kpi.c}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Detail Panel — slides in from left */}
        {selected && (
          <div style={{
            width: 400, background: C.surface, borderInlineEnd: `1px solid ${C.border}`,
            borderRadius: '0 12px 12px 0', padding: 20, overflowY: 'auto',
            boxShadow: '4px 0 20px rgba(0,0,0,0.05)', maxHeight: 'calc(100vh - 200px)',
          }}>
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>#{selected.id}</span>
              <button onClick={() => setSelectedIncident(null)} style={{ background: C.borderLight, border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color={C.textSec} />
              </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 4px' }}>{selected.type}</h3>

            {/* Severity + Status badges */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <span style={{ background: SEVERITY_STYLE[selected.severity].bg, color: SEVERITY_STYLE[selected.severity].color, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                {selected.severity}
              </span>
              <span style={{ background: STATUS_STYLE[selected.status].bg, color: STATUS_STYLE[selected.status].color, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                {selected.status}
              </span>
            </div>

            {/* Incident Info */}
            <div style={{ background: C.borderLight, borderRadius: 10, padding: 14, marginBottom: 14 }}>
              {[
                { l: 'תאריך', v: selected.date },
                { l: 'בעלים', v: selected.owner },
                { l: 'סוג', v: selected.type },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{f.l}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{f.v}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)', lineHeight: 1.7, marginBottom: 16 }}>
              {selected.description}
            </p>

            {/* Timeline */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Activity size={12} color={C.accent} /> ציר זמן טיפול
              </h4>
              <div style={{ position: 'relative', paddingInlineStart: 20 }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', insetInlineStart: 7, top: 4, bottom: 4, width: 2, background: C.borderLight }} />
                {selected.timeline.map((step, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i < selected.timeline.length - 1 ? 16 : 0 }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', insetInlineStart: -17, top: 2,
                      width: 12, height: 12, borderRadius: '50%',
                      background: step.done ? C.success : C.borderLight,
                      border: `2px solid ${step.done ? C.success : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {step.done && <CheckCircle size={8} color="white" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: step.done ? C.text : C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                          {step.label}
                        </span>
                        {step.date && (
                          <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{step.date}</span>
                        )}
                      </div>
                      {step.note && (
                        <div style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', marginTop: 2 }}>
                          {step.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Notes */}
            {selected.resolution && (
              <div style={{ background: C.successBg, border: `1px solid ${C.success}30`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: C.success, fontFamily: 'var(--font-rubik)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={12} /> סיכום וסגירה
                </h4>
                <p style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', margin: 0, lineHeight: 1.7 }}>
                  {selected.resolution}
                </p>
              </div>
            )}

            {!selected.resolution && selected.status === 'פתוח' && (
              <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: C.danger, fontFamily: 'var(--font-rubik)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertTriangle size={12} /> אירוע פתוח — ממתין לסגירה
                </h4>
                <p style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', margin: 0, lineHeight: 1.7 }}>
                  האירוע עדיין בטיפול. יש להשלים חקירה ולעדכן סיכום לפני סגירה.
                </p>
              </div>
            )}

            {/* ISA Report Button */}
            <button style={{
              width: '100%', background: C.accent, color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <FileText size={14} /> הפקת דוח ISA
            </button>

            {/* Traceability */}
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                (2022-10-9, §7, CIN-01)
              </span>
              <span style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                (§8, CIN-03)
              </span>
            </div>
          </div>
        )}

        {/* Incident Table */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: selected ? '12px 0 0 12px' : 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} color={C.accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>יומן אירועים ({incidents.length})</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
              <thead>
                <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                  {['מספר', 'סוג', 'תאריך', 'חומרה', 'סטטוס', 'בעלים'].map(h => (
                    <th key={h} style={{ textAlign: 'right', padding: '9px 10px', fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc, i) => {
                  const isSel = selectedIncident === inc.id;
                  const sevStyle = SEVERITY_STYLE[inc.severity];
                  const statStyle = STATUS_STYLE[inc.status];
                  return (
                    <tr key={inc.id} onClick={() => setSelectedIncident(isSel ? null : inc.id)} style={{
                      borderBottom: `1px solid ${C.borderLight}`, cursor: 'pointer',
                      background: isSel ? C.accentLight : i % 2 === 0 ? 'white' : '#FAFBFC',
                      borderInlineStart: isSel ? `3px solid ${C.accent}` : '3px solid transparent',
                      transition: 'background 0.15s',
                    }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: C.accent, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>
                        #{inc.id}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 500, color: C.text }}>{inc.type}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-rubik)', color: C.textSec, fontSize: 11 }}>{inc.date}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: sevStyle.bg, color: sevStyle.color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: statStyle.bg, color: statStyle.color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                          {inc.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: C.textSec, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={12} color={C.textMuted} /> {inc.owner}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Row: Response Procedure + Traceability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Response Procedure Card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} color={C.accent} /> נוהל תגובה לאירועי סייבר
                </h3>
                <span style={{ background: C.successBg, color: C.success, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                  מאושר
                </span>
              </div>

              {/* Procedure metadata */}
              <div style={{ background: C.borderLight, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                {[
                  { l: 'סטטוס', v: 'מאושר', c: C.success },
                  { l: 'סקירה אחרונה', v: 'יוני 2025 (לפני 8 חודשים)', c: C.textSec },
                  { l: 'סקירה הבאה', v: 'יוני 2026', c: C.text },
                  { l: 'בעלים', v: 'דנה כהן', c: C.text },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{item.l}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: item.c, fontFamily: 'var(--font-rubik)' }}>{item.v}</span>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <div>
                {PROCEDURE_STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < PROCEDURE_STEPS.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: C.accentLight,
                      color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-rubik)', flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', lineHeight: 1.6 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traceability Card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={14} color='#7C3AED' /> עקיבות רגולטורית
              </h3>

              <div style={{ background: '#EDE9FE', borderRadius: 10, padding: 14, marginBottom: 12, border: '1px solid #DDD6FE' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', fontFamily: 'var(--font-rubik)', marginBottom: 8 }}>
                  חוזר 2022-10-9 — ניהול סיכוני סייבר
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { section: '§7', reqId: 'CIN-01', title: 'נוהל תגובה לאירועי סייבר', desc: 'הגדרת תהליך זיהוי, הכלה, חקירה ודיווח לאירועי סייבר' },
                    { section: '§8', reqId: 'CIN-03', title: 'דיווח אירועים לרגולטור', desc: 'חובת דיווח על אירועי סייבר מהותיים למפקח בתוך 24 שעות' },
                  ].map((req, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 8, padding: '10px 12px', border: '1px solid #DDD6FE' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ background: '#7C3AED', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-rubik)' }}>
                          {req.section}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#7C3AED', fontFamily: 'var(--font-rubik)' }}>{req.reqId}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>{req.title}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', lineHeight: 1.5 }}>{req.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance mapping summary */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'נוהל תגובה', status: 'מאושר', c: C.success, bg: C.successBg },
                  { label: 'יומן אירועים', status: 'פעיל', c: C.success, bg: C.successBg },
                  { label: 'דיווח ISA', status: 'מוכן', c: C.accent, bg: C.accentLight },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.bg, border: `1px solid ${item.c}30`, borderRadius: 6, padding: '6px 10px', flex: '1 1 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: item.c, fontFamily: 'var(--font-rubik)' }}>{item.status}</div>
                    <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 1 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <FormModal
      open={showAddIncident}
      onClose={() => setShowAddIncident(false)}
      title="דווח אירוע סייבר חדש"
      onSubmit={() => {}}
    >
      <IncidentForm
        mode="create"
        onSubmit={async (data) => {
          await createCyberIncident(data);
          setShowAddIncident(false);
          await loadData();
        }}
        onCancel={() => setShowAddIncident(false)}
      />
    </FormModal>
    </>
  );
}
