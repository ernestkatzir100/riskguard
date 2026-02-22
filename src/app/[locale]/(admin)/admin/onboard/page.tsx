'use client';

import { useState } from 'react';
import {
  UserPlus, Building2, Mail, Phone, User,
  CheckCircle2, CreditCard,
} from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import { createCustomer } from '@/app/actions/onboard';

const PLANS = [
  { id: 'starter' as const, label: 'Starter', price: '3,500', desc: 'ניהול סיכונים בסיסי' },
  { id: 'pro' as const, label: 'Pro', price: '5,000', desc: 'כולל KRI, דוחות מתקדמים' },
  { id: 'enterprise' as const, label: 'Enterprise', price: '8,000', desc: 'מלא + API + SLA' },
];

export default function OnboardPage() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('starter');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError('נא למלא את כל שדות החובה');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createCustomer({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        plan,
      });
      setSuccess(true);
    } catch {
      setError('שגיאה ביצירת הלקוח');
    }
    setSaving(false);
  }

  function resetForm() {
    setCompanyName('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setPlan('starter');
    setSuccess(false);
    setError('');
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-assistant)',
    direction: 'rtl' as const, background: 'white', color: C.text,
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600 as const, color: C.textSec,
    fontFamily: 'var(--font-rubik)', marginBottom: 4, display: 'block' as const,
  };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={22} color={C.accent} />
          קליטת לקוח חדש
        </h1>
        <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontFamily: 'var(--font-assistant)' }}>
          צור חשבון חדש, משתמש מנהל, ושלח הזמנה
        </p>
      </div>

      {success ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: 40, textAlign: 'center', maxWidth: 500,
        }}>
          <CheckCircle2 size={48} color={C.success} style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 8px' }}>
            הלקוח נוצר בהצלחה
          </h2>
          <p style={{ fontSize: 13, color: C.textSec, fontFamily: 'var(--font-assistant)', margin: '0 0 20px' }}>
            הזמנה נשלחה ל-{contactEmail}
          </p>
          <button
            onClick={resetForm}
            style={{
              padding: '10px 28px', background: C.accentGrad, color: 'white',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-rubik)',
            }}
          >
            קליטת לקוח נוסף
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: 28, maxWidth: 540,
        }}>
          {error && (
            <div style={{
              background: C.dangerBg, color: C.danger, padding: '8px 14px',
              borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-assistant)',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: 16 }}>
            {/* Company name */}
            <div>
              <label style={labelStyle}>
                <Building2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                שם חברה *
              </label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="לדוגמה: אשראי פייננס בע״מ"
                style={inputStyle}
                required
              />
            </div>

            {/* Contact name */}
            <div>
              <label style={labelStyle}>
                <User size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                איש קשר *
              </label>
              <input
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="שם מלא"
                style={inputStyle}
                required
              />
            </div>

            {/* Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                  אימייל *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="email@company.co.il"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                  טלפון
                </label>
                <input
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="050-0000000"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Plan selection */}
            <div>
              <label style={labelStyle}>
                <CreditCard size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                תוכנית
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {PLANS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    style={{
                      border: `2px solid ${plan === p.id ? C.accent : C.borderLight}`,
                      borderRadius: 10, padding: 12, cursor: 'pointer',
                      background: plan === p.id ? C.accentLight : 'white',
                      transition: 'all 0.15s', textAlign: 'center',
                    }}
                  >
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: plan === p.id ? C.accent : C.text,
                      fontFamily: 'var(--font-rubik)', marginBottom: 2,
                    }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>
                      {p.price} ₪
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                      {p.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 0', background: saving ? C.borderLight : C.accentGrad,
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
                fontFamily: 'var(--font-rubik)', marginTop: 8,
              }}
            >
              <UserPlus size={16} />
              {saving ? 'יוצר חשבון...' : 'צור לקוח ושלח הזמנה'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
