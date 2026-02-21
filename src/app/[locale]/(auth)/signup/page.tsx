'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Building2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/shared/lib/supabase-client';
import { C } from '@/shared/lib/design-tokens';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName, company_name: form.companyName },
        },
      });

      if (authError) {
        console.error('[Signup] Auth error:', authError.message, authError);
        if (authError.message.includes('already registered')) {
          setError('כתובת האימייל כבר רשומה במערכת');
        } else {
          setError(`שגיאה בהרשמה: ${authError.message}`);
        }
        return;
      }

      if (!authData.user) {
        setError('שגיאה ביצירת המשתמש');
        return;
      }

      // 2. Create tenant + user records via server action
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          email: form.email,
          fullName: form.fullName,
          companyName: form.companyName,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('[Signup] API error:', res.status, body);
        setError(`שגיאה ביצירת החשבון: ${body.error ?? res.statusText}`);
        return;
      }

      router.push('/he/onboarding');
      router.refresh();
    } catch (err) {
      console.error('[Signup] Unexpected error:', err);
      setError(`שגיאה בהרשמה: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 40px 10px 12px',
    border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: 14, fontFamily: 'var(--font-assistant)',
    outline: 'none', background: C.bg,
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      style={{
        width: '100%', maxWidth: 420,
        background: C.surface, borderRadius: 20,
        padding: '40px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentTeal})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Shield size={28} color="white" />
        </div>
        <h1 style={{
          fontSize: 24, fontWeight: 800, color: C.text,
          fontFamily: 'var(--font-rubik)', margin: '0 0 4px',
        }}>
          הרשמה ל-RiskGuard
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
          צור חשבון חדש לניהול סיכונים
        </p>
      </div>

      {error && (
        <div style={{
          background: C.dangerBg, color: C.danger, fontSize: 13,
          padding: '10px 14px', borderRadius: 10, marginBottom: 16,
          fontFamily: 'var(--font-assistant)', textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 6 }}>
            שם מלא
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} color={C.textMuted} style={{ position: 'absolute', right: 12, top: 12 }} />
            <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="ישראל ישראלי" required style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 6 }}>
            שם החברה
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={16} color={C.textMuted} style={{ position: 'absolute', right: 12, top: 12 }} />
            <input type="text" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="שם החברה" required style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 6 }}>
            אימייל
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color={C.textMuted} style={{ position: 'absolute', right: 12, top: 12 }} />
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="your@email.com" required dir="ltr" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 6 }}>
            סיסמה
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color={C.textMuted} style={{ position: 'absolute', right: 12, top: 12 }} />
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="לפחות 6 תווים" required dir="ltr" style={inputStyle} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px 0',
            background: loading ? C.textMuted : C.accent,
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-rubik)', transition: 'background 0.15s',
          }}
        >
          {loading ? 'יוצר חשבון...' : 'הרשמה'}
        </button>
      </form>

      <p style={{
        textAlign: 'center', marginTop: 20, fontSize: 13,
        color: C.textMuted, fontFamily: 'var(--font-assistant)',
      }}>
        כבר יש לך חשבון?{' '}
        <Link href="/he/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
          התחבר
        </Link>
      </p>
    </div>
  );
}
