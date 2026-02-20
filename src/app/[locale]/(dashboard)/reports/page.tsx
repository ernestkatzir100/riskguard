'use client';

import { useState } from 'react';
import {
  FileOutput, FileText, CheckSquare, Calendar,
  Plus,
} from 'lucide-react';

const C = {
  accent: '#4A8EC2', accentTeal: '#5BB8C9',
  accentLight: '#E8F4FA', accentGrad: 'linear-gradient(135deg, #4A8EC2, #5BB8C9)',
  success: '#2E8B57', successBg: '#EFF8F2',
  warning: '#C8922A', warningBg: '#FDF8ED',
  danger: '#C0392B', dangerBg: '#FDF0EE',
  surface: '#FFFFFF', text: '#1A2332', textSec: '#4A5568', textMuted: '#8896A6',
  border: '#E1E8EF', borderLight: '#F0F3F7',
};

const DOC_STATUS = {
  approved: { l: 'מאושר', c: C.success, bg: C.successBg },
  draft: { l: 'טיוטה', c: C.warning, bg: C.warningBg },
  review: { l: 'בסקירה', c: C.accent, bg: C.accentLight },
  missing: { l: 'חסר', c: C.danger, bg: C.dangerBg },
} as Record<string, { l: string; c: string; bg: string }>;

/* ═══ Template Data — from V11 ═══ */
type Template = { id: string; name: string; cat: string; module: string; tier: string; status: string; date: string; version: string };

const DOC_TEMPLATES: Template[] = [
  { id: 'T01', name: 'מדיניות ניהול סיכונים', cat: 'ממשל', module: 'gov', tier: 'starter', status: 'approved', date: '10/01/2026', version: '2.0' },
  { id: 'T02', name: 'מסמך תיאור תפקיד מנהל סיכונים', cat: 'ממשל', module: 'gov', tier: 'starter', status: 'approved', date: '15/12/2025', version: '1.2' },
  { id: 'T03', name: 'כתב מינוי מנהל סיכונים', cat: 'ממשל', module: 'gov', tier: 'starter', status: 'approved', date: '01/09/2025', version: '1.0' },
  { id: 'T04', name: 'פרוטוקול ועדת סיכונים', cat: 'ממשל', module: 'gov', tier: 'starter', status: 'approved', date: '20/12/2025', version: 'Q4' },
  { id: 'T05', name: 'דוח רבעוני לדירקטוריון', cat: 'ממשל', module: 'gov', tier: 'starter', status: 'draft', date: '—', version: 'Q1/26' },
  { id: 'T06', name: 'מתודולוגיה להערכת סיכונים', cat: 'תפעולי', module: 'ops', tier: 'starter', status: 'approved', date: '05/01/2026', version: '1.1' },
  { id: 'T07', name: 'נוהל ניהול אירועי כשל תפעולי', cat: 'תפעולי', module: 'ops', tier: 'starter', status: 'approved', date: '10/11/2025', version: '1.0' },
  { id: 'T08', name: 'נוהל מניעת הונאה', cat: 'תפעולי', module: 'ops', tier: 'starter', status: 'draft', date: '—', version: '0.9' },
  { id: 'T09', name: 'מדיניות מיקור חוץ', cat: 'מיקור חוץ', module: 'out', tier: 'starter', status: 'approved', date: '01/10/2025', version: '1.0' },
  { id: 'T10', name: 'תוכנית המשכיות עסקית (BCP)', cat: 'המשכיות', module: 'bcp', tier: 'starter', status: 'review', date: '15/08/2025', version: '1.0' },
  { id: 'T11', name: 'ניתוח השפעה עסקית (BIA)', cat: 'המשכיות', module: 'bcp', tier: 'starter', status: 'missing', date: '—', version: '—' },
  { id: 'T12', name: 'תוכנית Disaster Recovery', cat: 'המשכיות', module: 'bcp', tier: 'starter', status: 'review', date: '20/09/2025', version: '1.0' },
  { id: 'T13', name: 'רשימת ספקים קריטיים', cat: 'מיקור חוץ', module: 'out', tier: 'starter', status: 'approved', date: '01/12/2025', version: '2.0' },
  { id: 'T14', name: 'טופס הערכת סיכוני ספק', cat: 'מיקור חוץ', module: 'out', tier: 'starter', status: 'approved', date: '01/12/2025', version: '1.0' },
  { id: 'T20', name: 'מדיניות אבטחת מידע וסייבר', cat: 'ממשל סייבר', module: 'cgov', tier: 'pro', status: 'draft', date: '—', version: '1.0' },
  { id: 'T21', name: 'תוכנית עבודה שנתית סייבר', cat: 'ממשל סייבר', module: 'cgov', tier: 'pro', status: 'missing', date: '—', version: '—' },
  { id: 'T22', name: 'מרשם נכסי מידע', cat: 'ממשל סייבר', module: 'cgov', tier: 'pro', status: 'draft', date: '—', version: '0.8' },
  { id: 'T23', name: 'נוהל תגובה לאירוע סייבר (IRP)', cat: 'אירועי סייבר', module: 'cinc', tier: 'pro', status: 'approved', date: '15/07/2025', version: '1.1' },
  { id: 'T24', name: 'טופס דיווח אירוע סייבר לרשות', cat: 'אירועי סייבר', module: 'cinc', tier: 'pro', status: 'approved', date: '15/07/2025', version: '1.0' },
  { id: 'T25', name: 'דוח מבחן חדירה', cat: 'הגנת סייבר', module: 'cpro', tier: 'pro', status: 'missing', date: '—', version: '—' },
  { id: 'T26', name: 'דוח סריקת פגיעויות', cat: 'הגנת סייבר', module: 'cpro', tier: 'pro', status: 'review', date: '30/11/2025', version: 'Q4' },
];

/* ═══ Schedule Data ═══ */
const REPORT_SCHEDULES = [
  { name: 'דוח רבעוני לדירקטוריון', frequency: 'רבעוני', nextDue: '31/03/2026', owner: 'יוסי לוי', status: 'active' },
  { name: 'דוח שנתי לרשות שוק ההון', frequency: 'שנתי', nextDue: '31/03/2026', owner: 'יוסי לוי', status: 'active' },
  { name: 'דוח סיכוני אשראי', frequency: 'חודשי', nextDue: '28/02/2026', owner: 'יוסי לוי', status: 'active' },
  { name: 'דוח סקירת ספקים', frequency: 'שנתי', nextDue: '30/06/2026', owner: 'יוסי לוי', status: 'pending' },
  { name: 'דוח סריקת פגיעויות', frequency: 'רבעוני', nextDue: '31/03/2026', owner: 'דנה כהן', status: 'active' },
];

const APPROVAL_WORKFLOWS = [
  { doc: 'דוח רבעוני Q1/2026', step: 1, steps: 3, currentApprover: 'יוסי לוי', status: 'in_progress' },
  { doc: 'מדיניות סייבר v1.0', step: 2, steps: 3, currentApprover: 'דנה כהן', status: 'in_progress' },
  { doc: 'תוכנית BCP v1.1', step: 1, steps: 2, currentApprover: 'יוסי לוי', status: 'pending' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'schedule' | 'approval'>('templates');
  const [filterCat, setFilterCat] = useState('הכל');

  const docCats = ['הכל', ...Array.from(new Set(DOC_TEMPLATES.map(d => d.cat)))];
  const filtered = filterCat === 'הכל' ? DOC_TEMPLATES : DOC_TEMPLATES.filter(d => d.cat === filterCat);
  const stats = {
    approved: DOC_TEMPLATES.filter(d => d.status === 'approved').length,
    draft: DOC_TEMPLATES.filter(d => d.status === 'draft').length,
    missing: DOC_TEMPLATES.filter(d => d.status === 'missing').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileOutput size={20} color={C.accent} /> מרכז דוחות
            <span style={{ background: 'rgba(91,184,201,0.2)', color: C.accentTeal, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-rubik)' }}>PRO</span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            {DOC_TEMPLATES.length} תבניות · {stats.approved} מאושרים · {stats.draft} טיוטות · {stats.missing} חסרים
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'סה״כ תבניות', value: DOC_TEMPLATES.length, c: C.accent },
          { label: 'מאושרים', value: stats.approved, c: C.success },
          { label: 'טיוטות', value: stats.draft, c: C.warning },
          { label: 'חסרים', value: stats.missing, c: C.danger },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          { id: 'templates' as const, l: 'ספריית תבניות', Icon: FileText },
          { id: 'schedule' as const, l: 'תזמון דוחות', Icon: Calendar },
          { id: 'approval' as const, l: 'תהליך אישור', Icon: CheckSquare },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? C.accent : C.surface,
            color: activeTab === t.id ? 'white' : C.textSec,
            border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
            borderRadius: 8, padding: '7px 16px', fontSize: 11, fontWeight: activeTab === t.id ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5,
          }}><t.Icon size={12} />{t.l}</button>
        ))}
      </div>

      {/* Templates Grid */}
      {activeTab === 'templates' && (
        <>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
            {docCats.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? C.accent : C.surface, color: filterCat === c ? 'white' : C.textSec, border: `1px solid ${filterCat === c ? C.accent : C.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: filterCat === c ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>{c}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {filtered.map(d => {
              const s = DOC_STATUS[d.status] || DOC_STATUS.draft;
              return (
                <div key={d.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, transition: 'border-color 0.1s', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: d.tier === 'pro' ? '#EDE9FE' : C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={14} color={d.tier === 'pro' ? '#7C3AED' : C.accent} />
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {d.tier === 'pro' && <span style={{ background: 'rgba(91,184,201,0.15)', color: C.accentTeal, fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-rubik)' }}>PRO</span>}
                      <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{s.l}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4, lineHeight: 1.4 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{d.id} · v{d.version} · {d.cat}</div>
                  {d.date !== '—' && <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 2 }}>עודכן: {d.date}</div>}
                  <button style={{ marginTop: 8, width: '100%', background: C.accentGrad, color: 'white', border: 'none', padding: '6px 0', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <FileOutput size={10} /> {d.status === 'missing' ? 'צפה בתבנית' : 'צפה במסמך'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} color={C.accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>לוח דוחות מתוזמנים</span>
            </div>
            <button style={{ background: C.accentGrad, color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={10} /> הוסף דוח
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
            <thead>
              <tr style={{ background: C.borderLight }}>
                {['דוח', 'תדירות', 'יעד הבא', 'אחראי', 'סטטוס'].map(h => (
                  <th key={h} style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REPORT_SCHEDULES.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                  <td style={{ padding: '12px', fontWeight: 500, color: C.text }}>{r.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: C.borderLight, color: C.textSec, fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{r.frequency}</span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-rubik)', fontWeight: 600 }}>{r.nextDue}</td>
                  <td style={{ padding: '12px', color: C.textSec }}>{r.owner}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: r.status === 'active' ? C.successBg : C.warningBg, color: r.status === 'active' ? C.success : C.warning, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                      {r.status === 'active' ? 'פעיל' : 'ממתין'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval Tab */}
      {activeTab === 'approval' && (
        <div>
          {APPROVAL_WORKFLOWS.map((wf, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{wf.doc}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>ממתין לאישור: {wf.currentApprover}</div>
                </div>
                <span style={{
                  background: wf.status === 'in_progress' ? C.warningBg : C.borderLight,
                  color: wf.status === 'in_progress' ? C.warning : C.textMuted,
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 5, fontFamily: 'var(--font-rubik)',
                }}>{wf.status === 'in_progress' ? 'בתהליך' : 'ממתין'}</span>
              </div>
              {/* Progress steps */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {Array.from({ length: wf.steps }, (_, s) => {
                  const isDone = s < wf.step;
                  const isCurrent = s === wf.step;
                  return (
                    <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: isDone ? C.success : isCurrent ? C.accent : C.borderLight,
                        color: isDone || isCurrent ? 'white' : C.textMuted,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-rubik)',
                        flexShrink: 0,
                      }}>
                        {isDone ? <CheckSquare size={10} /> : s + 1}
                      </div>
                      {s < wf.steps - 1 && <div style={{ flex: 1, height: 2, background: isDone ? C.success : C.borderLight, borderRadius: 1 }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 8 }}>
                שלב {wf.step} מתוך {wf.steps} — {['הכנה', 'סקירה', 'אישור סופי'][wf.step - 1] || 'אישור'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
