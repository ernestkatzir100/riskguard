'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'שגיאה בהתחברות. נסה שנית.');
        return;
      }

      router.push('/he');
      router.refresh();
    } catch {
      setError('שגיאה בהתחברות. נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        background: C.surface,
        borderRadius: 20,
        padding: '40px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
          RiskGuard
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
          התחברות למערכת ניהול סיכונים
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: C.dangerBg, color: C.danger, fontSize: 13,
          padding: '10px 14px', borderRadius: 10, marginBottom: 16,
          fontFamily: 'var(--font-assistant)', textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 12, fontWeight: 600, color: C.textSec,
            fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 6,
          }}>
            אימייל
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color={C.textMuted} style={{ position: 'absolute', right: 12, top: 12 }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              dir="ltr"
              style={{
                width: '100%', padding: '10px 40px 10px 12px',
                border: `1px solid ${C.border}`, borderRadius: 10,
                fontSize: 14, fontFamily: 'var(--font-assistant)',
                outline: 'none', background: C.bg,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{
            fontSize: 12, fontWeight: 600, color: C.textSec,
            fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 6,
          }}>
            סיסמה
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color={C.textMuted} style={{ position: 'absolute', right: 12, top: 12 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              dir="ltr"
              style={{
                width: '100%', padding: '10px 40px',
                border: `1px solid ${C.border}`, borderRadius: 10,
                fontSize: 14, fontFamily: 'var(--font-assistant)',
                outline: 'none', background: C.bg,
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              style={{
                position: 'absolute', left: 12, top: 10,
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={16} color={C.textMuted} /> : <Eye size={16} color={C.textMuted} />}
            </button>
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
            fontFamily: 'var(--font-rubik)',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'מתחבר...' : 'התחברות'}
        </button>
      </form>

      {/* Signup link */}
      <p style={{
        textAlign: 'center', marginTop: 20, fontSize: 13,
        color: C.textMuted, fontFamily: 'var(--font-assistant)',
      }}>
        אין לך חשבון?{' '}
        <Link href="/he/signup" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
          הירשם
        </Link>
      </p>
    </div>
  );
}
