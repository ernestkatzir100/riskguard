'use client';

import { useEffect } from 'react';
import { C } from '@/shared/lib/design-tokens';
import { BarChart3, AlertTriangle, Shield, CheckCircle, BookOpen, ExternalLink } from 'lucide-react';
import { getControls } from '@/app/actions/controls';

const risks = [
  { id: 'OPS-R01', name: 'כשל מערכת ליבה', probability: 3, impact: 5, score: 15, status: 'open' as const, owner: 'דנה כהן' },
  { id: 'OPS-R02', name: 'הונאה פנימית', probability: 2, impact: 4, score: 8, status: 'mitigated' as const, owner: 'יוסי לוי' },
  { id: 'OPS-R03', name: 'כשל תהליך אשראי', probability: 3, impact: 3, score: 9, status: 'open' as const, owner: 'רונית גולד' },
  { id: 'OPS-R04', name: 'אובדן נתונים', probability: 2, impact: 5, score: 10, status: 'open' as const, owner: 'דנה כהן' },
  { id: 'OPS-R05', name: 'חוסר ציות רגולטורי', probability: 2, impact: 4, score: 8, status: 'mitigated' as const, owner: 'יוסי לוי' },
];

const lossEvents = [
  { id: 'LE-001', description: 'השבתת מערכת סליקה למשך 4 שעות', date: '12/01/2026', amount: '₪125,000', category: 'כשל מערכת' },
  { id: 'LE-002', description: 'העברה לא מורשית על ידי עובד', date: '03/02/2026', amount: '₪78,000', category: 'הונאה פנימית' },
  { id: 'LE-003', description: 'טעות בחישוב עמלות ללקוחות', date: '15/02/2026', amount: '₪42,000', category: 'כשל תהליך' },
  { id: 'LE-004', description: 'קנס רגולטורי בגין אי דיווח', date: '20/01/2026', amount: '₪150,000', category: 'ציות' },
  { id: 'LE-005', description: 'אובדן נתונים בשרת גיבוי', date: '08/02/2026', amount: '₪0', category: 'כשל מערכת' },
];

const controls = [
  { id: 'CTR-01', name: 'בקרת הרשאות מערכת', status: 'active' },
  { id: 'CTR-02', name: 'ניטור פעולות חריגות', status: 'active' },
  { id: 'CTR-03', name: 'גיבוי יומי אוטומטי', status: 'active' },
  { id: 'CTR-04', name: 'בדיקת תקינות נתונים', status: 'active' },
  { id: 'CTR-05', name: 'הפרדת תפקידים', status: 'active' },
  { id: 'CTR-06', name: 'אימות כפול להעברות', status: 'active' },
  { id: 'CTR-07', name: 'סקירת יומני מערכת', status: 'active' },
  { id: 'CTR-08', name: 'בקרת שינויים בקוד', status: 'active' },
  { id: 'CTR-09', name: 'ניהול סיסמאות', status: 'active' },
  { id: 'CTR-10', name: 'תוכנית המשכיות עסקית', status: 'active' },
  { id: 'CTR-11', name: 'הדרכת עובדים שנתית', status: 'active' },
  { id: 'CTR-12', name: 'ביקורת פנימית רבעונית', status: 'active' },
  { id: 'CTR-13', name: 'ניטור ספקים חיצוניים', status: 'inactive' },
  { id: 'CTR-14', name: 'בדיקות חדירה', status: 'inactive' },
  { id: 'CTR-15', name: 'סקר סיכונים שנתי', status: 'inactive' },
];

function getStatusColor(status: 'open' | 'mitigated') {
  return status === 'open' ? C.danger : C.success;
}

function getStatusBg(status: 'open' | 'mitigated') {
  return status === 'open' ? C.dangerBg : C.successBg;
}

function getStatusLabel(status: 'open' | 'mitigated') {
  return status === 'open' ? 'פתוח' : 'מטופל';
}

function getScoreColor(score: number) {
  if (score >= 15) return C.danger;
  if (score >= 8) return C.warning;
  return C.success;
}

function getScoreBg(score: number) {
  if (score >= 15) return C.dangerBg;
  if (score >= 8) return C.warningBg;
  return C.successBg;
}

export default function OperationalRiskPage() {
  useEffect(() => {
    async function loadData() {
      try {
        const controlsRes = await getControls({ type: 'operational' });
        if (controlsRes?.length) console.log('[OperationalRisk] DB data loaded', { controls: controlsRes.length });
      } catch { /* demo fallback */ }
    }
    loadData();
  }, []);

  const kpis = [
    { label: 'סיכונים פתוחים', value: '5', icon: AlertTriangle, color: C.danger },
    { label: 'אירועי הפסד (שנתי)', value: '3', icon: BarChart3, color: C.warning },
    { label: 'סה"כ הפסדים', value: '₪245K', icon: BarChart3, color: C.danger },
    { label: 'בקרות פעילות', value: '12/15', icon: CheckCircle, color: C.success },
  ];

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-assistant)', color: C.text, padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart3 size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, margin: 0, color: C.text }}>
            סיכון תפעולי
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: C.textSec }}>
            Operational Risk &middot; ניהול אירועי הפסד, הערכות סיכונים ובקרות פנימיות
          </p>
        </div>
      </div>

      {/* Regulation Badge */}
      <div style={{ marginBottom: 24 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 600,
          padding: '4px 12px', borderRadius: 20,
        }}>
          <BookOpen size={14} />
          חוזר 2024-10-2 §5
        </span>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.textSec, fontWeight: 500 }}>{kpi.label}</span>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <span style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, color: C.text }}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Risk Assessment Section */}
      <div style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Shield size={20} color={C.accent} />
          <h2 style={{ fontFamily: 'var(--font-rubik)', fontSize: 20, fontWeight: 600, margin: 0, color: C.text }}>
            הערכת סיכונים תפעוליים
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>מזהה</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>שם הסיכון</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>הסתברות</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>השפעה</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>ציון</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>סטטוס</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>אחראי</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.accent }}>
                    {risk.id}
                  </td>
                  <td style={{ padding: '12px', color: C.text }}>{risk.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.text }}>{risk.probability}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.text }}>{risk.impact}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      fontSize: 13, fontWeight: 700,
                      background: getScoreBg(risk.score), color: getScoreColor(risk.score),
                    }}>
                      {risk.score}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: getStatusBg(risk.status), color: getStatusColor(risk.status),
                    }}>
                      {getStatusLabel(risk.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: C.textSec }}>{risk.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loss Events Log */}
      <div style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <AlertTriangle size={20} color={C.warning} />
          <h2 style={{ fontFamily: 'var(--font-rubik)', fontSize: 20, fontWeight: 600, margin: 0, color: C.text }}>
            יומן אירועי הפסד
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>מזהה</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>תיאור</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>תאריך</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>סכום</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>קטגוריה</th>
              </tr>
            </thead>
            <tbody>
              {lossEvents.map((evt) => (
                <tr key={evt.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.accent }}>
                    {evt.id}
                  </td>
                  <td style={{ padding: '12px', color: C.text }}>{evt.description}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.textSec }}>{evt.date}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.text }}>
                    {evt.amount}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600, background: C.accentLight, color: C.accent,
                    }}>
                      {evt.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Controls Framework */}
      <div style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <CheckCircle size={20} color={C.success} />
          <h2 style={{ fontFamily: 'var(--font-rubik)', fontSize: 20, fontWeight: 600, margin: 0, color: C.text }}>
            מסגרת בקרות פנימיות
          </h2>
          <span style={{
            marginRight: 'auto', fontSize: 13, fontWeight: 600, color: C.success,
            background: C.successBg, padding: '2px 10px', borderRadius: 20,
          }}>
            12/15 פעילות
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {controls.map((ctrl) => (
            <div key={ctrl.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 8, border: `1px solid ${C.borderLight}`,
              background: ctrl.status === 'active' ? C.successBg : C.dangerBg,
            }}>
              <CheckCircle
                size={16}
                color={ctrl.status === 'active' ? C.success : C.danger}
              />
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{ctrl.name}</span>
              <span style={{
                marginRight: 'auto', fontSize: 11, fontWeight: 600,
                color: ctrl.status === 'active' ? C.success : C.danger,
              }}>
                {ctrl.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regulation Traceability Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '16px 0', borderTop: `1px solid ${C.borderLight}`, color: C.textMuted, fontSize: 12,
      }}>
        <BookOpen size={14} />
        <span>עקיבות רגולטורית: חוזר 2024-10-2, §5, OPS-01</span>
        <ExternalLink size={12} />
      </div>
    </div>
  );
}
