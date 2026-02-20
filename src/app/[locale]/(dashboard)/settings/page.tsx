'use client';

import { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Receipt,
  Sparkles,
  Shield,
  CheckSquare,
  ExternalLink,
  FileText,
  X,
  DollarSign,
} from 'lucide-react';

/* ═══ Color palette (V11) ═══ */
const C = {
  accent: '#4A8EC2',
  accentTeal: '#5BB8C9',
  accentLight: '#E8F4FA',
  success: '#2E8B57',
  successBg: '#EFF8F2',
  warning: '#C8922A',
  warningBg: '#FDF8ED',
  danger: '#C0392B',
  surface: '#FFFFFF',
  border: '#E1E8EF',
  borderLight: '#F0F3F7',
  text: '#1A2332',
  textSec: '#4A5568',
  textMuted: '#8896A6',
};

/* ═══ Demo Company ═══ */
const COMPANY = { name: 'קרדיט-פיננס בע״מ' };

/* ═══ Plans Data (V11) ═══ */
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '3,500',
    desc: 'רישיון אשראי מורחב',
    color: C.accentTeal,
    features: [
      'ממשל ניהול סיכונים',
      'סיכון תפעולי + הונאה',
      'ניהול מיקור חוץ',
      'המשכיות עסקית',
      '14 תבניות מסמכים בעברית',
      'נווט רגולציה (2024-10-2)',
      'מאגר 30 סיכונים + בקרות',
      'דשבורד ציות בזמן אמת',
      'עד 3 משתמשים',
      'ליווי NTL בסיסי',
    ],
    missing: [
      'ממשל סייבר',
      'הגנת סייבר',
      'אירועי סייבר',
      'סיכון אשראי',
      'KRI',
      'דיווח אירועים',
      'NuTeLa AI',
      'דוח דירקטוריון אוטומטי',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '5,000',
    desc: 'כל סוגי הרישיונות',
    color: C.accent,
    current: true,
    features: [
      'הכל ב-Starter +',
      'ממשל סייבר (2022-10-9)',
      'הגנת סייבר',
      'אירועי סייבר + דיווח ISA',
      'סיכון אשראי (PD/LGD/ECL)',
      'מדדי סיכון מפתח (KRI)',
      'דיווח אירועים + Loss Events',
      'NuTeLa AI יועצת',
      '36 תבניות מסמכים',
      'דוח דירקטוריון אוטומטי',
      'עד 10 משתמשים',
      'ליווי NTL מקיף',
    ],
    missing: ['API Access', 'אינטגרציות מותאמות', 'משתמשים ללא הגבלה'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '8,000+',
    desc: 'מוסדות מורכבים',
    color: '#7C6FD0',
    features: [
      'הכל ב-Pro +',
      'API Access מלא',
      'אינטגרציות Core Banking',
      'תבניות מותאמות אישית',
      'מנהל לקוח ייעודי',
      'עדיפות בתמיכה',
      'משתמשים ללא הגבלה',
      'הדרכות On-Site',
      'ביקורת פנימית שנתית',
      'SLA 99.9%',
    ],
    missing: [],
  },
];

/* ═══ Addon Items (V11) ═══ */
const ADDON_ITEMS = [
  { name: 'תבנית מסמך בודדת', price: '250', desc: 'רכישה חד-פעמית של תבנית PRO' },
  { name: 'הדרכה פרטנית (שעה)', price: '450', desc: 'הדרכה אישית עם יועץ NTL' },
  { name: 'סקירת עמידה מקיפה', price: '2,500', desc: 'סקירה מקצועית + דוח ממצאים' },
  { name: 'הכנה לביקורת רגולטור', price: '3,500', desc: 'סימולציה + הכנת תיק ראיות' },
];

/* ═══ Invoices (V11) ═══ */
const INVOICES = [
  { num: 'INV-2026-02', date: '01/02/2026', desc: 'Pro — פברואר 2026', amount: '5,000', status: 'שולם' },
  { num: 'INV-2026-01', date: '01/01/2026', desc: 'Pro — ינואר 2026', amount: '5,000', status: 'שולם' },
  { num: 'INV-2025-12', date: '01/12/2025', desc: 'Pro — דצמבר 2025 + הדרכה', amount: '5,450', status: 'שולם' },
  { num: 'INV-2025-11', date: '01/11/2025', desc: 'Pro — נובמבר 2025', amount: '5,000', status: 'שולם' },
];

/* ═══ Team Members ═══ */
const TEAM = [
  { name: 'יוסי לוי', role: 'מנהל סיכונים', email: 'yossi@credit-finance.co.il' },
  { name: 'דנה כהן', role: 'אחראית סייבר', email: 'dana@credit-finance.co.il' },
  { name: 'אבי שרון', role: 'מנכ״ל', email: 'avi@credit-finance.co.il' },
];

/* ═══ Org Details ═══ */
const ORG_FIELDS = [
  { l: 'שם חברה', v: COMPANY.name },
  { l: 'ח.פ.', v: '51-543210-8' },
  { l: 'סוג רישיון', v: 'רישיון אשראי מורחב' },
  { l: 'כתובת', v: 'רח׳ הברזל 22, תל אביב' },
  { l: 'טלפון', v: '03-7654321' },
  { l: 'מספר עובדים', v: '35' },
];

/* ═══ Billing Screen — Inline Sub-component (V11) ═══ */
function BillingScreen() {
  const [billingTab, setBillingTab] = useState('plans');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              fontFamily: 'var(--font-rubik)',
              margin: '0 0 3px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Receipt size={20} color={C.accent} /> חבילות ומחירים
          </h2>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            נהל את המנוי, שדרג חבילה, או רכוש תוספות
          </p>
        </div>
        <div
          style={{
            background: C.accentLight,
            borderRadius: 8,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Shield size={14} color={C.accent} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-rubik)' }}>
            חבילה נוכחית: Pro
          </span>
        </div>
      </div>

      {/* Billing sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {[
          { id: 'plans', l: 'חבילות' },
          { id: 'addons', l: 'תוספות ורכישות' },
          { id: 'invoices', l: 'חשבוניות' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setBillingTab(t.id)}
            style={{
              background: billingTab === t.id ? C.accent : C.surface,
              color: billingTab === t.id ? 'white' : C.textSec,
              border: `1px solid ${billingTab === t.id ? C.accent : C.border}`,
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: billingTab === t.id ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-rubik)',
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {billingTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: C.surface,
                border: plan.current ? `2px solid ${plan.color}` : `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 24,
                position: 'relative',
                transition: 'all 0.2s',
                transform: plan.current ? 'scale(1.02)' : 'none',
                boxShadow: plan.current ? `0 4px 24px ${plan.color}20` : 'none',
              }}
            >
              {plan.current && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: plan.color,
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 14px',
                    borderRadius: 10,
                    fontFamily: 'var(--font-rubik)',
                  }}
                >
                  ⭐ החבילה שלך
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: plan.current ? 8 : 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: plan.color, fontFamily: 'var(--font-rubik)' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 8 }}>
                  {plan.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: plan.color, fontFamily: 'var(--font-rubik)' }}>
                    ₪{plan.price}
                  </span>
                  <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>/ חודש</span>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 14 }}>
                {plan.features.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 0',
                      fontSize: 11,
                      color: C.text,
                      fontFamily: 'var(--font-assistant)',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: `${plan.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckSquare size={8} color={plan.color} />
                    </div>
                    {f}
                  </div>
                ))}
                {plan.missing.map((f, i) => (
                  <div
                    key={`m${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 0',
                      fontSize: 11,
                      color: C.textMuted,
                      fontFamily: 'var(--font-assistant)',
                      opacity: 0.5,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: C.borderLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <X size={8} color={C.textMuted} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '10px',
                  background: plan.current
                    ? C.borderLight
                    : `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`,
                  color: plan.current ? C.textSec : 'white',
                  border: plan.current ? `1px solid ${C.border}` : 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: plan.current ? 'default' : 'pointer',
                  fontFamily: 'var(--font-rubik)',
                }}
              >
                {plan.current ? 'חבילה נוכחית' : plan.id === 'starter' ? 'שנמך חבילה' : 'שדרג עכשיו'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Addons */}
      {billingTab === 'addons' && (
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              fontFamily: 'var(--font-rubik)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <DollarSign size={15} color={C.accent} /> רכישות בודדות
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {ADDON_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 3 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{item.desc}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, fontFamily: 'var(--font-rubik)' }}>
                    ₪{item.price}
                  </div>
                  <button
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.accent}CC)`,
                      color: 'white',
                      border: 'none',
                      padding: '5px 14px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-rubik)',
                      marginTop: 4,
                    }}
                  >
                    רכוש
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      {billingTab === 'invoices' && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
            <thead>
              <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                {['מספר', 'תאריך', 'תיאור', 'סכום', 'סטטוס', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'right',
                      padding: '9px 12px',
                      fontWeight: 600,
                      fontSize: 10,
                      color: C.textSec,
                      fontFamily: 'var(--font-rubik)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: `1px solid ${C.borderLight}`,
                    background: i % 2 === 0 ? 'white' : '#FAFBFC',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.accent }}>
                    {inv.num}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{inv.date}</td>
                  <td style={{ padding: '10px 12px' }}>{inv.desc}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-rubik)', fontWeight: 600 }}>₪{inv.amount}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        background: C.successBg,
                        color: C.success,
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-rubik)',
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      style={{
                        background: C.borderLight,
                        border: `1px solid ${C.border}`,
                        borderRadius: 5,
                        padding: '3px 10px',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-rubik)',
                        color: C.textSec,
                      }}
                    >
                      הורד PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══ Settings Page — Main Component ═══ */
export default function SettingsPage() {
  const [tab, setTab] = useState('org');

  const TABS = [
    { id: 'org', l: 'ארגון וצוות', Icon: Building2 },
    { id: 'billing', l: 'חבילות ומחירים', Icon: Receipt },
    { id: 'ntl', l: 'NTL Management', Icon: Sparkles },
  ];

  return (
    <div>
      {/* Page Header */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          fontFamily: 'var(--font-rubik)',
          margin: '0 0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Settings size={20} color={C.accent} /> הגדרות
      </h1>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? C.accent : C.surface,
              color: tab === t.id ? 'white' : C.textSec,
              border: `1px solid ${tab === t.id ? C.accent : C.border}`,
              borderRadius: 8,
              padding: '7px 16px',
              fontSize: 11,
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-rubik)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <t.Icon size={12} />
            {t.l}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Org & Team ═══ */}
      {tab === 'org' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Org Details */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
                fontFamily: 'var(--font-rubik)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Building2 size={14} color={C.accent} /> פרטי ארגון
            </h3>
            {ORG_FIELDS.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: `1px solid ${C.borderLight}`,
                }}
              >
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{f.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{f.v}</span>
              </div>
            ))}
          </div>

          {/* Team */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
                fontFamily: 'var(--font-rubik)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Users size={14} color={C.accent} /> צוות
            </h3>
            {TEAM.map((u, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: `1px solid ${C.borderLight}`,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accent}CC)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-rubik)',
                  }}
                >
                  {u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                    {u.role} · {u.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Tab: Billing ═══ */}
      {tab === 'billing' && <BillingScreen />}

      {/* ═══ Tab: NTL Management ═══ */}
      {tab === 'ntl' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Subscription */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
                fontFamily: 'var(--font-rubik)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Shield size={14} color={C.accent} /> מנוי
            </h3>
            <div
              style={{
                background: C.accentLight,
                borderRadius: 10,
                padding: 16,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 4 }}>
                חבילה נוכחית
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accent}CC)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-rubik)',
                }}
              >
                PRO
              </div>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, fontFamily: 'var(--font-rubik)' }}>
                ₪5,000 / חודש
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
              חוזה שנתי · חידוש: 01/01/2027 · 10 משתמשים
            </div>
          </div>

          {/* NTL Services */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
                fontFamily: 'var(--font-rubik)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={14} color="#7C3AED" /> NTL Management
            </h3>
            <div
              style={{
                background: 'linear-gradient(135deg, #7B61FF, #BD34FE, #FF6B9D)',
                borderRadius: 10,
                padding: 16,
                color: 'white',
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-rubik)', marginBottom: 6 }}>
                היועץ שלכם
              </div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-assistant)', opacity: 0.9, lineHeight: 1.6 }}>
                ליווי מקצועי לאורך כל הדרך — הדרכות, סקירות עמידה, ביקורת פנימית, הכנה לביקורת רגולטור
              </div>
            </div>
            {[
              { l: 'הזמן הדרכה בזום', Icon: ExternalLink },
              { l: 'בקש סקירת עמידה', Icon: CheckSquare },
              { l: 'צפה בתוכנית ליווי', Icon: FileText },
            ].map((a, i) => (
              <button
                key={i}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'var(--font-rubik)',
                  color: C.textSec,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 4,
                  fontWeight: 500,
                }}
              >
                <a.Icon size={12} color="#7C3AED" />
                {a.l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
