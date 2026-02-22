'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, Building2, X, AlertTriangle,
  CheckCircle2, Clock, FileText, Download,
} from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import { getMonitorData, getTenantModuleBreakdown, type MonitorTenant, type ModuleBreakdown } from '@/app/actions/monitor';
import { generateDocxBuffer } from '@/shared/lib/generate-docx';
import { downloadPdf } from '@/shared/lib/generate-pdf-client';
import type { ReportData } from '@/shared/lib/report-types';

const MODULE_LABELS: Record<string, string> = {
  governance: 'ממשל סיכונים',
  operational: 'סיכון תפעולי',
  outsourcing: 'מיקור חוץ',
  bcp: 'המשכיות עסקית',
  cyber_governance: 'ממשל סייבר',
  cyber_protection: 'הגנת סייבר',
  cyber_incidents: 'אירועי סייבר',
  credit: 'סיכון אשראי',
  board: 'דירקטוריון',
};

function scoreColor(score: number) {
  if (score >= 80) return C.success;
  if (score >= 50) return C.warning;
  return C.danger;
}

function scoreBg(score: number) {
  if (score >= 80) return C.successBg;
  if (score >= 50) return C.warningBg;
  return C.dangerBg;
}

export default function MonitorPage() {
  const [tenantList, setTenantList] = useState<MonitorTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [drill, setDrill] = useState<{ tenant: MonitorTenant; modules: ModuleBreakdown[] } | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [exporting, setExporting] = useState<'word' | 'pdf' | null>(null);

  useEffect(() => {
    getMonitorData()
      .then(setTenantList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function openDrill(tenant: MonitorTenant) {
    setDrillLoading(true);
    try {
      const modules = await getTenantModuleBreakdown(tenant.id);
      setDrill({ tenant, modules });
    } catch { /* silent */ }
    setDrillLoading(false);
  }

  function buildReportData(): ReportData {
    return {
      title: 'דוח ציות כלל-לקוחות',
      subtitle: 'מוניטור ציות — NTL Admin',
      generatedAt: new Date().toLocaleDateString('he-IL'),
      tenantName: 'NTL Admin',
      sections: [
        {
          title: 'סיכום לקוחות',
          type: 'kpis',
          kpis: [
            { label: 'סה״כ לקוחות', value: String(tenantList.length) },
            { label: 'ציון ממוצע', value: `${tenantList.length > 0 ? Math.round(tenantList.reduce((s, t) => s + t.complianceScore, 0) / tenantList.length) : 0}%` },
            { label: 'בסיכון (<50%)', value: String(tenantList.filter(t => t.complianceScore < 50).length) },
          ],
        },
        {
          title: 'פירוט לקוחות',
          type: 'table',
          headers: ['לקוח', 'תוכנית', 'ציון ציות', 'דרישות', 'עומד', 'לא עומד'],
          rows: tenantList.map(t => [
            t.name,
            t.plan,
            `${t.complianceScore}%`,
            String(t.totalReqs),
            String(t.compliantReqs),
            String(t.nonCompliantReqs),
          ]),
        },
      ],
    };
  }

  async function handleExportWord() {
    setExporting('word');
    try {
      const data = buildReportData();
      const base64 = await generateDocxBuffer(data);
      const blob = new Blob(
        [Uint8Array.from(atob(base64), c => c.charCodeAt(0))],
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compliance-monitor.docx';
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setExporting(null);
  }

  async function handleExportPdf() {
    setExporting('pdf');
    try {
      const data = buildReportData();
      await downloadPdf(data, 'compliance-monitor');
    } catch { /* silent */ }
    setExporting(null);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>טוען...</div>
      </div>
    );
  }

  const atRiskCount = tenantList.filter(t => t.complianceScore < 50).length;
  const avgScore = tenantList.length > 0
    ? Math.round(tenantList.reduce((s, t) => s + t.complianceScore, 0) / tenantList.length) : 0;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color={C.accent} />
            מוניטור ציות
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontFamily: 'var(--font-assistant)' }}>
            כל הלקוחות לפי ציון ציות (הנמוכים ביותר תחילה)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExportWord}
            disabled={exporting !== null}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: exporting ? 'wait' : 'pointer',
              fontFamily: 'var(--font-rubik)', color: C.textSec,
            }}
          >
            <FileText size={13} />
            {exporting === 'word' ? 'מייצא...' : 'Word'}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting !== null}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: exporting ? 'wait' : 'pointer',
              fontFamily: 'var(--font-rubik)', color: C.textSec,
            }}
          >
            <Download size={13} />
            {exporting === 'pdf' ? 'מייצא...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20,
      }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} color={C.accent} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{tenantList.length}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>סה״כ לקוחות</div>
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: scoreBg(avgScore), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color={scoreColor(avgScore)} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(avgScore), fontFamily: 'var(--font-rubik)' }}>{avgScore}%</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>ציון ממוצע</div>
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: C.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} color={C.danger} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.danger, fontFamily: 'var(--font-rubik)' }}>{atRiskCount}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>בסיכון (&lt;50%)</div>
          </div>
        </div>
      </div>

      {/* Tenant cards sorted by compliance */}
      <div style={{ display: 'grid', gap: 8 }}>
        {tenantList.length === 0 ? (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 40, textAlign: 'center', color: C.textMuted, fontFamily: 'var(--font-assistant)',
          }}>
            אין לקוחות במערכת
          </div>
        ) : tenantList.map(t => {
          const sc = scoreColor(t.complianceScore);
          const sb = scoreBg(t.complianceScore);
          return (
            <div
              key={t.id}
              onClick={() => openDrill(t)}
              style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '14px 18px', cursor: 'pointer', transition: 'all 0.1s',
                display: 'flex', alignItems: 'center', gap: 16,
                borderRight: `4px solid ${sc}`,
              }}
            >
              {/* Score badge */}
              <div style={{
                width: 52, height: 52, borderRadius: 12, background: sb,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: sc, fontFamily: 'var(--font-rubik)' }}>
                  {t.complianceScore}%
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
                  {t.name}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={11} color={C.success} /> {t.compliantReqs} עומד
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} color={C.warning} /> {t.inProgressReqs} בתהליך
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <AlertTriangle size={11} color={C.danger} /> {t.nonCompliantReqs} לא עומד
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: 120, flexShrink: 0 }}>
                <div style={{ height: 8, borderRadius: 4, background: C.borderLight, overflow: 'hidden' }}>
                  <div style={{ width: `${t.complianceScore}%`, height: '100%', borderRadius: 4, background: sc }} />
                </div>
                <div style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', marginTop: 2 }}>
                  {t.compliantReqs}/{t.totalReqs} דרישות
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill-down modal */}
      {(drill || drillLoading) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, direction: 'rtl',
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setDrill(null); }}
        >
          <div style={{
            background: C.surface, borderRadius: 16, width: '100%', maxWidth: 520,
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {drillLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: C.textMuted }}>טוען...</div>
            ) : drill && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={18} color={C.accent} />
                    {drill.tenant.name}
                  </h3>
                  <button onClick={() => setDrill(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <X size={16} color={C.textMuted} />
                  </button>
                </div>

                <div style={{
                  background: scoreBg(drill.tenant.complianceScore),
                  borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(drill.tenant.complianceScore), fontFamily: 'var(--font-rubik)' }}>
                    {drill.tenant.complianceScore}%
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec }}>ציון ציות כולל</div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 10 }}>
                  פירוט מודולים
                </div>

                {drill.modules.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>
                    אין נתוני ציות למודולים
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {drill.modules.sort((a, b) => a.score - b.score).map((m, i) => {
                      const mc = scoreColor(m.score);
                      return (
                        <div key={i} style={{
                          background: C.bg, borderRadius: 8, padding: '8px 12px',
                          display: 'flex', alignItems: 'center', gap: 10,
                          borderRight: `3px solid ${mc}`,
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: 'var(--font-assistant)', flex: 1 }}>
                            {MODULE_LABELS[m.module] ?? m.module}
                          </span>
                          <div style={{ width: 60, height: 5, borderRadius: 3, background: C.borderLight, overflow: 'hidden' }}>
                            <div style={{ width: `${m.score}%`, height: '100%', borderRadius: 3, background: mc }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: mc, fontFamily: 'var(--font-rubik)', minWidth: 32, textAlign: 'left' }}>
                            {m.score}%
                          </span>
                          <span style={{ fontSize: 10, color: C.textMuted }}>
                            {m.compliant}/{m.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
