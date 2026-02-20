'use client';

import {
  CreditCard, TrendingUp, AlertTriangle,
  BarChart3, Target, PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

import { C } from '@/shared/lib/design-tokens';

/* ═══════════════════════════════════════════════
   Credit Portfolio Data
   ═══════════════════════════════════════════════ */
const CREDIT_PORTFOLIO = [
  { id: 'SEG01', segment: 'הלוואות לעסקים קטנים', exposure: 12500000, count: 340, pd: 4.2, lgd: 45, ecl: 236250, status: 'watch' },
  { id: 'SEG02', segment: 'אשראי צרכני', exposure: 28000000, count: 4200, pd: 2.8, lgd: 35, ecl: 274400, status: 'normal' },
  { id: 'SEG03', segment: 'משכנתאות', exposure: 45000000, count: 620, pd: 1.2, lgd: 25, ecl: 135000, status: 'normal' },
  { id: 'SEG04', segment: 'אשראי לרכב', exposure: 18000000, count: 1800, pd: 3.5, lgd: 40, ecl: 252000, status: 'normal' },
  { id: 'SEG05', segment: 'הלוואות מיקרו', exposure: 5000000, count: 2100, pd: 6.8, lgd: 55, ecl: 187000, status: 'alert' },
  { id: 'SEG06', segment: 'ערבויות ומסגרות', exposure: 8000000, count: 150, pd: 2.1, lgd: 30, ecl: 50400, status: 'normal' },
];

const CONCENTRATION = [
  { name: 'Top 10 לווים', pct: 22, limit: 25, status: 'ok' },
  { name: 'סקטור נדל״ן', pct: 31, limit: 30, status: 'breach' },
  { name: 'אזור מרכז', pct: 45, limit: 50, status: 'ok' },
  { name: 'מטבע חוץ', pct: 8, limit: 15, status: 'ok' },
  { name: 'סקטור טכנולוגיה', pct: 18, limit: 20, status: 'warning' },
];

const VINTAGE = [
  { year: '2022', amount: 15, default_rate: 5.2, ecl_rate: 3.8 },
  { year: '2023', amount: 28, default_rate: 3.8, ecl_rate: 2.9 },
  { year: 'H1/2024', amount: 22, default_rate: 2.1, ecl_rate: 1.8 },
  { year: 'H2/2024', amount: 18, default_rate: 1.4, ecl_rate: 1.2 },
  { year: 'H1/2025', amount: 25, default_rate: 0.8, ecl_rate: 0.9 },
  { year: 'H2/2025', amount: 12, default_rate: 0.2, ecl_rate: 0.5 },
];

/* ═══════════════════════════════════════════════
   Computed KPIs
   ═══════════════════════════════════════════════ */
const totalExposure = CREDIT_PORTFOLIO.reduce((s, p) => s + p.exposure, 0);
const totalECL = CREDIT_PORTFOLIO.reduce((s, p) => s + p.ecl, 0);
const totalCount = CREDIT_PORTFOLIO.reduce((s, p) => s + p.count, 0);
const eclRatio = (totalECL / totalExposure) * 100;
const weightedPD = CREDIT_PORTFOLIO.reduce((s, p) => s + p.pd * p.exposure, 0) / totalExposure;

const PIE_COLORS = ['#4A8EC2', '#5BB8C9', '#2E8B57', '#C8922A', '#C0392B', '#7B61FF'];
const pieData = CREDIT_PORTFOLIO.map((p) => ({
  name: p.segment,
  value: p.exposure,
}));

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */
const fmt = (n: number): string => {
  if (n >= 1_000_000) return `₪${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `₪${(n / 1_000).toFixed(0)}K`;
  return `₪${n.toLocaleString()}`;
};

const fmtK = (n: number): string => {
  if (n >= 1_000_000) return `₪${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₪${Math.round(n / 1_000).toLocaleString()}K`;
  return `₪${n.toLocaleString()}`;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: 'תקין', color: C.success, bg: C.successBg },
  watch: { label: 'במעקב', color: C.warning, bg: C.warningBg },
  alert: { label: 'חריג', color: C.danger, bg: C.dangerBg },
};

const CONC_COLOR: Record<string, string> = {
  ok: C.success,
  warning: C.warning,
  breach: C.danger,
};

/* ═══════════════════════════════════════════════
   Credit Risk Page
   ═══════════════════════════════════════════════ */
export default function CreditRiskPage() {
  return (
    <div style={{ direction: 'rtl' }}>

      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 3px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CreditCard size={20} color={C.accent} /> סיכון אשראי
            <span style={{
              background: 'rgba(91,184,201,0.2)', color: '#5BB8C9',
              fontSize: 9, fontWeight: 700, padding: '3px 10px',
              borderRadius: 4, fontFamily: 'var(--font-rubik)',
              marginRight: 4,
            }}>
              PRO
            </span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            ניהול תיק אשראי, ריכוזיות, הפרשות ECL, ניתוח Vintage
          </p>
        </div>
      </div>

      {/* ═══ KPI Row ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'חשיפה כוללת', value: fmt(totalExposure), c: C.accent },
          { label: 'הפרשות ECL', value: fmtK(totalECL), c: C.warning },
          { label: 'ECL / חשיפה', value: `${eclRatio.toFixed(2)}%`, c: eclRatio < 1.5 ? C.success : C.danger },
          { label: 'PD משוקלל', value: `${weightedPD.toFixed(2)}%`, c: weightedPD < 3 ? C.success : C.danger },
          { label: 'לווים פעילים', value: totalCount.toLocaleString(), c: C.text },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '14px 16px', textAlign: 'center',
            borderTop: `3px solid ${kpi.c}`,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, color: kpi.c,
              fontFamily: 'var(--font-rubik)',
            }}>
              {kpi.value}
            </div>
            <div style={{
              fontSize: 11, color: C.textMuted,
              fontFamily: 'var(--font-assistant)',
            }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Portfolio Table + Concentration ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 16 }}>

        {/* Portfolio Segments Table */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <BarChart3 size={14} color={C.accent} />
            <span style={{
              fontSize: 13, fontWeight: 700, color: C.text,
              fontFamily: 'var(--font-rubik)',
            }}>
              סגמנטים בתיק ({CREDIT_PORTFOLIO.length})
            </span>
          </div>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 12, fontFamily: 'var(--font-assistant)',
          }}>
            <thead>
              <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                {['סגמנט', 'חשיפה', 'לווים', 'PD%', 'LGD%', 'ECL', 'סטטוס'].map(h => (
                  <th key={h} style={{
                    textAlign: 'right', padding: '9px 10px',
                    fontWeight: 600, fontSize: 11, color: C.textSec,
                    fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CREDIT_PORTFOLIO.map((seg, i) => {
                const st = STATUS_MAP[seg.status] || STATUS_MAP.normal;
                return (
                  <tr key={seg.id} style={{
                    borderBottom: `1px solid ${C.borderLight}`,
                    background: i % 2 === 0 ? 'white' : '#FAFBFC',
                  }}>
                    <td style={{
                      padding: '10px', fontWeight: 500, color: C.text,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: PIE_COLORS[i] || C.accent,
                          flexShrink: 0,
                        }} />
                        {seg.segment}
                      </div>
                    </td>
                    <td style={{
                      padding: '10px', fontFamily: 'var(--font-rubik)',
                      fontWeight: 600, color: C.text, direction: 'ltr' as const,
                      textAlign: 'right',
                    }}>
                      {fmt(seg.exposure)}
                    </td>
                    <td style={{
                      padding: '10px', fontFamily: 'var(--font-rubik)',
                      color: C.textSec,
                    }}>
                      {seg.count.toLocaleString()}
                    </td>
                    <td style={{
                      padding: '10px', fontFamily: 'var(--font-rubik)',
                      fontWeight: 600,
                      color: seg.pd > 5 ? C.danger : seg.pd > 3 ? C.warning : C.text,
                    }}>
                      {seg.pd.toFixed(1)}%
                    </td>
                    <td style={{
                      padding: '10px', fontFamily: 'var(--font-rubik)',
                      color: C.textSec,
                    }}>
                      {seg.lgd}%
                    </td>
                    <td style={{
                      padding: '10px', fontFamily: 'var(--font-rubik)',
                      fontWeight: 600, color: C.text, direction: 'ltr' as const,
                      textAlign: 'right',
                    }}>
                      {fmtK(seg.ecl)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        background: st.bg, color: st.color,
                        fontSize: 9, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 4,
                        fontFamily: 'var(--font-rubik)',
                      }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Concentration Risk */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '16px 18px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 14px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Target size={14} color={C.accent} /> ריכוזיות אשראי
          </h3>

          {CONCENTRATION.map((c, i) => {
            const color = CONC_COLOR[c.status] || C.success;
            const pctOfLimit = Math.min((c.pct / c.limit) * 100, 100);
            return (
              <div key={i} style={{ marginBottom: i < CONCENTRATION.length - 1 ? 16 : 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 5,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 500, color: C.text,
                    fontFamily: 'var(--font-assistant)',
                  }}>
                    {c.name}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color,
                    fontFamily: 'var(--font-rubik)',
                  }}>
                    {c.pct}% / {c.limit}%
                  </span>
                </div>
                <div style={{
                  width: '100%', height: 8, borderRadius: 4,
                  background: C.borderLight, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pctOfLimit}%`, height: '100%',
                    borderRadius: 4, background: color,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                {c.status === 'breach' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    marginTop: 4,
                  }}>
                    <AlertTriangle size={10} color={C.danger} />
                    <span style={{
                      fontSize: 9, color: C.danger,
                      fontFamily: 'var(--font-assistant)',
                    }}>
                      חריגה מהמגבלה
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Vintage Analysis ═══ */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '16px 18px', marginBottom: 16,
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: C.text,
          fontFamily: 'var(--font-rubik)', margin: '0 0 14px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <TrendingUp size={14} color={C.accent} /> ניתוח Vintage
        </h3>

        <div style={{ width: '100%', height: 260, direction: 'ltr' as const }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={VINTAGE} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDefault" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.danger} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradECL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: C.textMuted, fontFamily: 'var(--font-rubik)' }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: C.textMuted, fontFamily: 'var(--font-rubik)' }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-rubik)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="default_rate"
                name="שיעור כשל"
                stroke={C.danger}
                strokeWidth={2}
                fill="url(#gradDefault)"
              />
              <Area
                type="monotone"
                dataKey="ecl_rate"
                name="ECL Rate"
                stroke={C.accent}
                strokeWidth={2}
                fill="url(#gradECL)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: C.danger }} />
            <span style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
              שיעור כשל
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: C.accent }} />
            <span style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
              ECL Rate
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Pie Chart — Portfolio Breakdown ═══ */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '16px 18px',
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: C.text,
          fontFamily: 'var(--font-rubik)', margin: '0 0 14px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <PieChartIcon size={14} color={C.accent} /> פילוח תיק לפי סגמנט
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 220, height: 220, direction: 'ltr' as const }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-rubik)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1 }}>
            {CREDIT_PORTFOLIO.map((seg, i) => {
              const pct = ((seg.exposure / totalExposure) * 100).toFixed(1);
              return (
                <div key={seg.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0',
                  borderBottom: i < CREDIT_PORTFOLIO.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 3,
                    background: PIE_COLORS[i % PIE_COLORS.length],
                    flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, fontSize: 12, color: C.text,
                    fontFamily: 'var(--font-assistant)',
                  }}>
                    {seg.segment}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: C.textSec,
                    fontFamily: 'var(--font-rubik)', minWidth: 50,
                    textAlign: 'left',
                  }}>
                    {pct}%
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: C.text,
                    fontFamily: 'var(--font-rubik)', minWidth: 60,
                    textAlign: 'left',
                  }}>
                    {fmt(seg.exposure)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
