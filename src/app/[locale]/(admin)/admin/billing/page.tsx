'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, Building2,
  CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import { getBillingData, updateTenantPlan } from '@/app/actions/billing';

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_COLORS: Record<string, { c: string; bg: string }> = {
  starter: { c: C.textSec, bg: C.borderLight },
  pro: { c: C.pro, bg: C.proBg },
  enterprise: { c: C.accent, bg: C.accentLight },
};
const PAYMENT_STATUS: Record<string, { label: string; c: string; bg: string; Icon: typeof CheckCircle2 }> = {
  paid: { label: 'שולם', c: C.success, bg: C.successBg, Icon: CheckCircle2 },
  pending: { label: 'ממתין', c: C.warning, bg: C.warningBg, Icon: Clock },
  overdue: { label: 'באיחור', c: C.danger, bg: C.dangerBg, Icon: AlertTriangle },
};

type BillingData = Awaited<ReturnType<typeof getBillingData>>;

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    getBillingData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handlePlanChange(tenantId: string, newPlan: 'starter' | 'pro' | 'enterprise') {
    setChangingPlan(tenantId);
    try {
      await updateTenantPlan(tenantId, newPlan);
      const refreshed = await getBillingData();
      setData(refreshed);
    } catch { /* silent */ }
    setChangingPlan(null);
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

  const { tenants: tenantList, revenue } = data;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={22} color={C.accent} />
          חיוב ומנויים
        </h1>
        <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontFamily: 'var(--font-assistant)' }}>
          מעקב הכנסות ותוכניות לקוחות
        </p>
      </div>

      {/* Revenue KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: C.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} color={C.success} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.success, fontFamily: 'var(--font-rubik)' }}>
              {revenue.mrr.toLocaleString()} ₪
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>MRR (הכנסה חודשית)</div>
          </div>
        </div>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color={C.accent} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-rubik)' }}>
              {revenue.arr.toLocaleString()} ₪
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>ARR (הכנסה שנתית)</div>
          </div>
        </div>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 10 }}>
            חלוקה לפי תוכנית
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {(['starter', 'pro', 'enterprise'] as const).map(plan => {
              const p = revenue.byPlan[plan];
              const pc = PLAN_COLORS[plan];
              return (
                <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{
                    background: pc.bg, color: pc.c, padding: '1px 6px',
                    borderRadius: 3, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                  }}>
                    {PLAN_LABELS[plan]}
                  </span>
                  <span style={{ color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                    {p.count} לקוחות · {p.revenue.toLocaleString()} ₪
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tenant Billing Table */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-assistant)' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['לקוח', 'תוכנית', 'מחיר חודשי', 'תאריך חיוב', 'סטטוס תשלום', 'שינוי תוכנית'].map((h, i) => (
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
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>
                  אין לקוחות
                </td>
              </tr>
            ) : tenantList.map(t => {
              const pc = PLAN_COLORS[t.plan] ?? PLAN_COLORS.starter;
              const ps = PAYMENT_STATUS[t.paymentStatus] ?? PAYMENT_STATUS.paid;
              const StatusIcon = ps.Icon;
              return (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: C.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={14} color={C.accent} />
                      {t.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: pc.bg, color: pc.c, padding: '2px 8px',
                      borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                    }}>
                      {PLAN_LABELS[t.plan] ?? t.plan}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                    {t.price.toLocaleString()} ₪
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: C.textMuted }}>
                    1 לכל חודש
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: ps.bg, color: ps.c, padding: '2px 8px',
                      borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                    }}>
                      <StatusIcon size={10} />
                      {ps.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <select
                      value={t.plan}
                      disabled={changingPlan === t.id}
                      onChange={e => handlePlanChange(t.id, e.target.value as 'starter' | 'pro' | 'enterprise')}
                      style={{
                        padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 6,
                        fontSize: 11, fontFamily: 'var(--font-rubik)', background: 'white',
                        color: C.text, cursor: changingPlan === t.id ? 'wait' : 'pointer',
                      }}
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
