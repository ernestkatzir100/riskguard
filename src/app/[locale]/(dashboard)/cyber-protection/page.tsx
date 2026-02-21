'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert, Shield, Bug, Crosshair, CheckCircle2, AlertTriangle,
  Clock, Search, BookOpen, XCircle, ExternalLink,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { getControls } from '@/app/actions/controls';
import { getPenTests, getVulnScans } from '@/app/actions/cyber';

/* ═══ Controls Data ═══ */
type ControlStatus = 'active' | 'partial' | 'inactive';

interface Control {
  id: string;
  name: string;
  status: ControlStatus;
  effectiveness: number;
  lastCheck: string;
}

const CONTROLS: Control[] = [
  { id: 'CPR-01', name: 'בקרת גישה (Access Control)', status: 'active', effectiveness: 85, lastCheck: '01/2026' },
  { id: 'CPR-02', name: 'הצפנת נתונים', status: 'active', effectiveness: 90, lastCheck: '12/2025' },
  { id: 'CPR-03', name: 'גיבוי יומי', status: 'active', effectiveness: 95, lastCheck: '02/2026' },
  { id: 'CPR-04', name: 'עדכוני אבטחה (Patching)', status: 'active', effectiveness: 70, lastCheck: '01/2026' },
  { id: 'CPR-05', name: 'אבטחת רשת', status: 'active', effectiveness: 80, lastCheck: '12/2025' },
  { id: 'CPR-06', name: 'הגנת נקודות קצה (EDR)', status: 'active', effectiveness: 88, lastCheck: '02/2026' },
  { id: 'CPR-07', name: 'ניטור לוגים (SIEM)', status: 'active', effectiveness: 75, lastCheck: '01/2026' },
  { id: 'CPR-08', name: 'אימות דו-שלבי (MFA)', status: 'active', effectiveness: 92, lastCheck: '02/2026' },
  { id: 'CPR-09', name: 'סריקת פגיעויות', status: 'partial', effectiveness: 60, lastCheck: '11/2025' },
  { id: 'CPR-10', name: 'ניהול הרשאות', status: 'partial', effectiveness: 55, lastCheck: '10/2025' },
  { id: 'CPR-11', name: 'הגנה מפני DDoS', status: 'active', effectiveness: 78, lastCheck: '12/2025' },
  { id: 'CPR-12', name: 'סינון דוא"ל', status: 'active', effectiveness: 85, lastCheck: '01/2026' },
  { id: 'CPR-13', name: 'הדרכת מודעות', status: 'partial', effectiveness: 50, lastCheck: '09/2025' },
  { id: 'CPR-14', name: 'ניהול תצורה', status: 'active', effectiveness: 72, lastCheck: '11/2025' },
  { id: 'CPR-15', name: 'בקרת שינויים', status: 'active', effectiveness: 80, lastCheck: '12/2025' },
  { id: 'CPR-16', name: 'הגנה על Wi-Fi', status: 'active' as ControlStatus, effectiveness: 82, lastCheck: '01/2026' },
  { id: 'CPR-17', name: 'ניטור DNS', status: 'active' as ControlStatus, effectiveness: 76, lastCheck: '12/2025' },
  { id: 'CPR-18', name: 'Web Application Firewall (WAF)', status: 'active' as ControlStatus, effectiveness: 88, lastCheck: '02/2026' },
  { id: 'CPR-19', name: 'DLP — מניעת דליפת מידע', status: 'partial' as ControlStatus, effectiveness: 58, lastCheck: '11/2025' },
  { id: 'CPR-20', name: 'ניהול פאצ\'ים (Patch Mgmt)', status: 'active' as ControlStatus, effectiveness: 70, lastCheck: '01/2026' },
  { id: 'CPR-21', name: 'בידוד רשתות (Segmentation)', status: 'active' as ControlStatus, effectiveness: 85, lastCheck: '02/2026' },
  { id: 'CPR-22', name: 'גיבוי מוצפן', status: 'active' as ControlStatus, effectiveness: 92, lastCheck: '02/2026' },
  { id: 'CPR-23', name: 'הגנה על API', status: 'partial' as ControlStatus, effectiveness: 55, lastCheck: '10/2025' },
  { id: 'CPR-24', name: 'סריקת קוד (SAST)', status: 'partial' as ControlStatus, effectiveness: 45, lastCheck: '09/2025' },
  { id: 'CPR-25', name: 'ניטור פעילות משתמשים (UEBA)', status: 'active' as ControlStatus, effectiveness: 72, lastCheck: '01/2026' },
  { id: 'CPR-26', name: 'Threat Intelligence', status: 'active' as ControlStatus, effectiveness: 68, lastCheck: '12/2025' },
  { id: 'CPR-27', name: 'Incident Response Automation', status: 'partial' as ControlStatus, effectiveness: 50, lastCheck: '11/2025' },
  { id: 'CPR-28', name: 'Physical Security', status: 'active' as ControlStatus, effectiveness: 80, lastCheck: '01/2026' },
  { id: 'CPR-29', name: 'Secure Development Lifecycle', status: 'partial' as ControlStatus, effectiveness: 42, lastCheck: '10/2025' },
  { id: 'CPR-30', name: 'Third-Party Risk Monitoring', status: 'active' as ControlStatus, effectiveness: 65, lastCheck: '12/2025' },
];

const STATUS_MAP: Record<ControlStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'פעיל', color: C.success, bg: C.successBg },
  partial: { label: 'חלקי', color: C.warning, bg: C.warningBg },
  inactive: { label: 'לא פעיל', color: C.danger, bg: C.dangerBg },
};

/* ═══ Vulnerability Data ═══ */
interface Vulnerability {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  discovered: string;
  owner: string;
}

const VULNERABILITIES: Vulnerability[] = [
  { id: 'VUL-001', title: 'חולשת SQL Injection באפליקציה פנימית', severity: 'high', discovered: '01/02/2026', owner: 'דנה כהן' },
  { id: 'VUL-002', title: 'תעודת SSL פגת תוקף', severity: 'medium', discovered: '15/01/2026', owner: 'IT' },
  { id: 'VUL-003', title: 'גרסת Apache לא מעודכנת', severity: 'low', discovered: '20/01/2026', owner: 'IT' },
];

const SEVERITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'גבוה', color: C.danger, bg: C.dangerBg },
  medium: { label: 'בינוני', color: C.warning, bg: C.warningBg },
  low: { label: 'נמוך', color: C.accent, bg: C.accentLight },
};

/* ═══ Pen Test Data ═══ */
interface PenTestFinding {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'closed';
}

const PENTEST_FINDINGS: PenTestFinding[] = [
  { id: 'PT-01', title: 'הרשאות יתר במערכת Core Banking', severity: 'high', status: 'open' },
  { id: 'PT-02', title: 'חוסר הצפנה בתעבורה פנימית', severity: 'medium', status: 'closed' },
  { id: 'PT-03', title: 'חולשת XSS בפורטל לקוחות', severity: 'medium', status: 'closed' },
];

/* ═══ Traceability ═══ */
const TRACEABILITY = [
  { regulation: '2022-10-9', section: '§5', control: 'CPR-01', description: 'בקרת גישה — חוזר 2022-10-9 §5' },
  { regulation: '2022-10-9', section: '§6', control: 'CPR-03', description: 'גיבוי יומי — חוזר 2022-10-9 §6' },
];

/* ═══ Helpers ═══ */
function effectivenessColor(pct: number): string {
  if (pct >= 80) return C.success;
  if (pct >= 60) return C.warning;
  return C.danger;
}

function effectivenessBg(pct: number): string {
  if (pct >= 80) return C.successBg;
  if (pct >= 60) return C.warningBg;
  return C.dangerBg;
}

/* ═══ Page ═══ */
type TabId = 'controls' | 'vulnerabilities' | 'pentest';

export default function CyberProtectionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('controls');

  useEffect(() => {
    async function loadData() {
      try {
        const [controlsRes, penTestRes, vulnRes] = await Promise.all([
          getControls(),
          getPenTests(),
          getVulnScans(),
        ]);
        if (controlsRes?.length) console.log('[CyberProtection] DB data loaded', { controls: controlsRes.length, penTests: penTestRes?.length, vulns: vulnRes?.length });
      } catch { /* demo fallback */ }
    }
    loadData();
  }, []);

  const activeControls = CONTROLS.filter(c => c.status === 'active').length;
  const totalControls = 30;
  const openVulns = VULNERABILITIES.length;
  const complianceScore = 68;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)',
            margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ShieldAlert size={20} color={C.accent} /> הגנת סייבר
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            Cyber Protection · בקרות · פגיעויות · מבחני חדירה
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#EDE9FE', color: '#7C3AED', fontSize: 11, fontWeight: 600,
            padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <BookOpen size={12} /> חוזר 2022-10-9 §5-6
          </div>
        </div>
      </div>

      {/* ═══ KPI Row ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'ציון עמידה', value: `${complianceScore}%`, c: C.warning },
          { label: 'בקרות פעילות', value: `${activeControls}/${totalControls}`, c: C.accent },
          { label: 'פגיעויות פתוחות', value: openVulns, c: openVulns > 0 ? C.danger : C.success },
          { label: 'מבחן חדירה אחרון', value: 'מרץ 2025', c: C.textSec },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '14px 16px', textAlign: 'center', borderTop: `3px solid ${kpi.c}`,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Tabs ═══ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          { id: 'controls' as const, l: 'בקרות', Icon: Shield },
          { id: 'vulnerabilities' as const, l: 'פגיעויות', Icon: Bug },
          { id: 'pentest' as const, l: 'מבחני חדירה', Icon: Crosshair },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? C.accent : C.surface,
            color: activeTab === t.id ? 'white' : C.textSec,
            border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
            borderRadius: 8, padding: '7px 16px', fontSize: 11, fontWeight: activeTab === t.id ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <t.Icon size={12} />{t.l}
          </button>
        ))}
      </div>

      {/* ═══ Controls Tab ═══ */}
      {activeTab === 'controls' && (
        <div>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} color={C.accent} /> בקרות סייבר ({CONTROLS.length}/{totalControls})
              </span>
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                מציג 30 מתוך 30 בקרות
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
              <thead>
                <tr style={{ background: C.borderLight }}>
                  {['מזהה', 'שם בקרה', 'סטטוס', 'אפקטיביות %', 'בדיקה אחרונה'].map(h => (
                    <th key={h} style={{
                      textAlign: 'right', padding: '9px 10px', fontWeight: 600,
                      fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTROLS.map((ctrl, i) => {
                  const s = STATUS_MAP[ctrl.status];
                  const ec = effectivenessColor(ctrl.effectiveness);
                  const eb = effectivenessBg(ctrl.effectiveness);
                  return (
                    <tr key={ctrl.id} style={{
                      borderBottom: `1px solid ${C.borderLight}`,
                      background: i % 2 === 0 ? 'white' : '#FAFBFC',
                    }}>
                      <td style={{
                        padding: '10px', fontWeight: 600, color: C.accent,
                        fontFamily: 'var(--font-rubik)', fontSize: 11,
                      }}>{ctrl.id}</td>
                      <td style={{ padding: '10px', fontWeight: 500, color: C.text }}>
                        {ctrl.name}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: s.bg, color: s.color, fontSize: 9, fontWeight: 600,
                          padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
                        }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: eb, color: ec, fontSize: 10, fontWeight: 700,
                          padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
                        }}>{ctrl.effectiveness}%</span>
                      </td>
                      <td style={{
                        padding: '10px', fontFamily: 'var(--font-rubik)',
                        fontSize: 11, color: C.textSec,
                      }}>{ctrl.lastCheck}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Traceability */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '16px 18px', marginTop: 14,
          }}>
            <h3 style={{
              fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)',
              margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <ExternalLink size={14} color={C.accent} /> עקיבות רגולטורית
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {TRACEABILITY.map((t, i) => (
                <div key={i} style={{
                  background: '#EDE9FE', border: '1px solid #D8C9FE', borderRadius: 8,
                  padding: '8px 14px', fontSize: 11, fontFamily: 'var(--font-assistant)', color: '#5B21B6',
                }}>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                    ({t.regulation}, {t.section}, {t.control})
                  </span>
                  <span style={{ marginRight: 6, color: C.textSec }}>{t.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Vulnerabilities Tab ═══ */}
      {activeTab === 'vulnerabilities' && (
        <div>
          {/* Scan info banner */}
          <div style={{
            background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 10,
            padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                סריקה אחרונה: <strong style={{ color: C.text, fontFamily: 'var(--font-rubik)' }}>06/02/2026</strong> (לפני שבועיים)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} color={C.textMuted} />
              <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                סריקה הבאה: 06/03/2026
              </span>
            </div>
          </div>

          {/* Vulnerability cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {VULNERABILITIES.map(vuln => {
              const sev = SEVERITY_MAP[vuln.severity];
              return (
                <div key={vuln.id} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: '16px 18px', borderRight: `4px solid ${sev.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: C.accent,
                        fontFamily: 'var(--font-rubik)',
                      }}>{vuln.id}</span>
                      <h4 style={{
                        fontSize: 13, fontWeight: 600, color: C.text,
                        fontFamily: 'var(--font-assistant)', margin: 0,
                      }}>{vuln.title}</h4>
                    </div>
                    <span style={{
                      background: sev.bg, color: sev.color, fontSize: 9, fontWeight: 600,
                      padding: '3px 10px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
                      whiteSpace: 'nowrap',
                    }}>
                      חומרה: {sev.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> תאריך גילוי: <strong style={{ color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{vuln.discovered}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={11} /> אחראי: <strong style={{ color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{vuln.owner}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Pen Test Tab ═══ */}
      {activeTab === 'pentest' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Test Summary */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '16px 18px',
          }}>
            <h3 style={{
              fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)',
              margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Crosshair size={14} color={C.accent} /> פרטי מבחן חדירה
            </h3>
            {[
              { l: 'מבחן אחרון', v: 'מרץ 2025', c: C.text },
              { l: 'ספק', v: 'CyberShield Ltd', c: C.accent },
              { l: 'סה״כ ממצאים', v: '3', c: C.text },
              { l: 'ממצאים סגורים', v: '2', c: C.success },
              { l: 'ממצאים פתוחים', v: '1', c: C.danger },
              { l: 'מבחן הבא', v: 'ספטמבר 2026', c: C.accent },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: `1px solid ${C.borderLight}`,
              }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{item.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: item.c, fontFamily: 'var(--font-rubik)' }}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* Findings */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '16px 18px',
          }}>
            <h3 style={{
              fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)',
              margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <AlertTriangle size={14} color={C.danger} /> ממצאים ({PENTEST_FINDINGS.length})
            </h3>
            {PENTEST_FINDINGS.map((f, i) => {
              const sev = SEVERITY_MAP[f.severity];
              const isOpen = f.status === 'open';
              return (
                <div key={f.id} style={{
                  padding: '12px 0',
                  borderBottom: i < PENTEST_FINDINGS.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: C.accent,
                        fontFamily: 'var(--font-rubik)',
                      }}>{f.id}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: 'var(--font-assistant)' }}>
                        {f.title}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{
                      background: sev.bg, color: sev.color, fontSize: 9, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
                    }}>
                      {sev.label}
                    </span>
                    <span style={{
                      background: isOpen ? C.dangerBg : C.successBg,
                      color: isOpen ? C.danger : C.success,
                      fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      {isOpen ? <XCircle size={9} /> : <CheckCircle2 size={9} />}
                      {isOpen ? 'פתוח' : 'סגור'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Open finding highlight */}
          <div style={{
            gridColumn: '1 / -1',
            background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: 12,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertTriangle size={18} color={C.danger} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, fontFamily: 'var(--font-rubik)' }}>
                ממצא פתוח: הרשאות יתר במערכת Core Banking
              </div>
              <div style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', marginTop: 2 }}>
                חומרה גבוהה — נדרש טיפול עד למבחן הבא (ספטמבר 2026)
              </div>
            </div>
            <span style={{
              background: `${C.danger}18`, color: C.danger, fontSize: 9, fontWeight: 700,
              padding: '3px 10px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
            }}>HIGH</span>
          </div>
        </div>
      )}
    </div>
  );
}
