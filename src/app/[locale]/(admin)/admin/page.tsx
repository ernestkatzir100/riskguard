'use client';

import { useState, useEffect } from 'react';
import {
  Users, TrendingUp, DollarSign, AlertTriangle,
  Building2, X, Shield, CheckCircle2,
  ListTodo, ArrowUpRight,
} from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import { getAdminDashboardData, getTenantDrilldown } from '@/app/actions/admin';

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_COLORS: Record<string, { c: string; bg: string }> = {
  starter: { c: C.textSec, bg: C.borderLight },
  pro: { c: C.pro, bg: C.proBg },
  enterprise: { c: C.accent, bg: C.accentLight },
};
const STATUS_LABELS: Record<string, { label: string; c: string; bg: string }> = {
  active: { label: 'פעיל', c: C.success, bg: C.successBg },
  trial: { label: 'ניסיון', c: C.warning, bg: C.warningBg },
  suspended: { label: 'מושעה', c: C.danger, bg: C.dangerBg },
};

type DrillData = Awaited<ReturnType<typeof getTenantDrilldown>>;

export default function AdminDashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [drill, setDrill] = useState<DrillData | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  useEffect(() => {
    getAdminDashboardData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function openDrill(tenantId: string) {
    setDrillLoading(true);
    try {
      const d = await getTenantDrilldown(tenantId);
      setDrill(d);
    } catch { /* silent */ }
    setDrillLoading(false);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>טוען...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
        לא ניתן לטעון נתונים
      </div>
    );
  }

  const { tenants: tenantList, kpis, planBreakdown } = data;

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 4px' }}>
          דשבורד ניהול
        </h1>
        <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontFamily: 'var(--font-assistant)' }}>
          סקירה כללית של כל לקוחות RiskGuard
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {([
          { label: 'סה״כ לקוחות', value: kpis.totalCustomers, Icon: Building2, c: C.accent, bg: C.accentLight },
          { label: 'ציון ציות ממוצע', value: `${kpis.avgCompliance}%`, Icon: TrendingUp, c: C.success, bg: C.successBg },
          { label: 'MRR', value: `${kpis.mrr.toLocaleString()} ₪`, Icon: DollarSign, c: C.pro, bg: C.proBg },
          { label: 'לקוחות בסיכון', value: kpis.atRiskCount, Icon: AlertTriangle, c: C.danger, bg: C.dangerBg },
        ] as const).map((kpi, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: kpi.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <kpi.Icon size={20} color={kpi.c} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
          חלוקה לפי תוכנית:
        </span>
        {(['starter', 'pro', 'enterprise'] as const).map(plan => (
          <span key={plan} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            fontFamily: 'var(--font-assistant)', color: C.textSec,
          }}>
            <span style={{
              background: PLAN_COLORS[plan].bg, color: PLAN_COLORS[plan].c,
              padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--font-rubik)',
            }}>
              {PLAN_LABELS[plan]}
            </span>
            {planBreakdown[plan]}
          </span>
        ))}
      </div>

      {/* Tenant Table */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-assistant)' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['שם לקוח', 'תוכנית', 'ציון ציות', 'משתמשים פעילים', 'כניסה אחרונה', 'סטטוס', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600,
                  color: C.textMuted, fontFamily: 'var(--font-rubik)', borderBottom: `1px solid ${C.border}`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenantList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>
                  אין לקוחות במערכת
                </td>
              </tr>
            ) : tenantList.map(t => {
              const plan = PLAN_COLORS[t.plan] ?? PLAN_COLORS.starter;
              const status = STATUS_LABELS[t.status] ?? STATUS_LABELS.active;
              const scoreColor = t.complianceScore >= 80 ? C.success : t.complianceScore >= 50 ? C.warning : C.danger;
              return (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: 'pointer' }}
                  onClick={() => openDrill(t.id)}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: C.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={14} color={C.accent} />
                      {t.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: plan.bg, color: plan.c, padding: '2px 8px',
                      borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                    }}>
                      {PLAN_LABELS[t.plan] ?? t.plan}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 60, height: 6, borderRadius: 3, background: C.borderLight, overflow: 'hidden',
                      }}>
                        <div style={{ width: `${t.complianceScore}%`, height: '100%', borderRadius: 3, background: scoreColor }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor, fontFamily: 'var(--font-rubik)' }}>
                        {t.complianceScore}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: C.textSec }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} color={C.textMuted} />
                      {t.activeUsers}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: C.textMuted }}>
                    {t.lastLogin ? new Date(t.lastLogin).toLocaleDateString('he-IL') : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: status.bg, color: status.c, padding: '2px 8px',
                      borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                    }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <ArrowUpRight size={14} color={C.textMuted} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drilldown Modal */}
      {(drill || drillLoading) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, direction: 'rtl',
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setDrill(null); }}
        >
          <div style={{
            background: C.surface, borderRadius: 16, width: '100%', maxWidth: 640,
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto',
          }}>
            {drillLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: C.textMuted }}>טוען נתוני לקוח...</div>
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

                {/* Tenant info */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16,
                  fontSize: 12, fontFamily: 'var(--font-assistant)',
                }}>
                  <div style={{ background: C.bg, borderRadius: 8, padding: 12 }}>
                    <div style={{ color: C.textMuted, fontSize: 10, marginBottom: 4 }}>תוכנית</div>
                    <div style={{ fontWeight: 600, color: C.text }}>{PLAN_LABELS[drill.tenant.subscriptionTier]}</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: 12 }}>
                    <div style={{ color: C.textMuted, fontSize: 10, marginBottom: 4 }}>ח.פ.</div>
                    <div style={{ fontWeight: 600, color: C.text }}>{drill.tenant.companyId || '—'}</div>
                  </div>
                </div>

                {/* Compliance summary */}
                <div style={{
                  background: C.bg, borderRadius: 10, padding: 14, marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Shield size={14} color={C.accent} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>ציות</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {([
                      { label: 'סה״כ', value: drill.compliance.total, c: C.text },
                      { label: 'עומד', value: drill.compliance.compliant, c: C.success },
                      { label: 'בתהליך', value: drill.compliance.inProgress, c: C.warning },
                      { label: 'לא עומד', value: drill.compliance.nonCompliant, c: C.danger },
                    ] as const).map((s, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.c, fontFamily: 'var(--font-rubik)' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users list */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Users size={14} color={C.accent} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      משתמשים ({drill.users.length})
                    </span>
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    {drill.users.slice(0, 5).map(u => (
                      <div key={u.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: C.bg, borderRadius: 6, padding: '6px 10px', fontSize: 12,
                      }}>
                        <span style={{ fontWeight: 500, color: C.text }}>{u.fullName}</span>
                        <span style={{ fontSize: 10, color: C.textMuted }}>{u.role} · {u.email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks + Tasks summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: C.bg, borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <AlertTriangle size={12} color={C.danger} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>סיכונים</span>
                    </div>
                    {drill.risks.length === 0 ? (
                      <div style={{ fontSize: 11, color: C.textMuted }}>אין סיכונים</div>
                    ) : drill.risks.map((r, i) => (
                      <div key={i} style={{ fontSize: 11, color: C.textSec, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{r.status}</span>
                        <span style={{ fontWeight: 600 }}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <ListTodo size={12} color={C.accent} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>משימות</span>
                    </div>
                    {drill.tasks.length === 0 ? (
                      <div style={{ fontSize: 11, color: C.textMuted }}>אין משימות</div>
                    ) : drill.tasks.map((t, i) => (
                      <div key={i} style={{ fontSize: 11, color: C.textSec, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t.status}</span>
                        <span style={{ fontWeight: 600 }}>{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent NuTeLa pushes */}
                {drill.pushes.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <CheckCircle2 size={14} color={C.accentTeal} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                        שליחות NuTeLa אחרונות
                      </span>
                    </div>
                    {drill.pushes.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: `1px solid ${C.borderLight}`, fontSize: 11,
                      }}>
                        <span style={{ color: C.text, fontWeight: 500 }}>{p.title}</span>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 600,
                          background: p.status === 'answered' ? C.successBg : p.status === 'overdue' ? C.dangerBg : C.warningBg,
                          color: p.status === 'answered' ? C.success : p.status === 'overdue' ? C.danger : C.warning,
                        }}>
                          {p.status}
                        </span>
                      </div>
                    ))}
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
