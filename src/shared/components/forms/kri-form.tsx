'use client';

import { useState } from 'react';
import { C } from '@/shared/lib/design-tokens';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
  borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-assistant)',
  outline: 'none', background: C.bg, boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: C.textSec,
  fontFamily: 'var(--font-rubik)', display: 'block', marginBottom: 4,
};
const fieldStyle: React.CSSProperties = { marginBottom: 14 };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
const errorStyle: React.CSSProperties = { fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' };

type KRIFormData = {
  name: string;
  currentValue: string;
  threshold: string;
  trend: string;
  breached: boolean;
};

type KRIFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<KRIFormData>;
  onSubmit: (data: KRIFormData) => Promise<void>;
  onCancel: () => void;
};

const trendOptions = [
  { value: 'improving', label: 'במגמת שיפור' },
  { value: 'stable', label: 'יציב' },
  { value: 'deteriorating', label: 'במגמת הידרדרות' },
];

export function KRIForm({ mode, initialData, onSubmit, onCancel }: KRIFormProps) {
  const [form, setForm] = useState<KRIFormData>({
    name: initialData?.name ?? '',
    currentValue: initialData?.currentValue ?? '',
    threshold: initialData?.threshold ?? '',
    trend: initialData?.trend ?? 'stable',
    breached: initialData?.breached ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof KRIFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'שם המדד נדרש';
    if (!form.currentValue.trim()) e.currentValue = 'ערך נוכחי נדרש';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  const set = <K extends keyof KRIFormData>(k: K, v: KRIFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* name */}
      <div style={fieldStyle}>
        <label style={labelStyle}>שם המדד *</label>
        <input style={{ ...inputStyle, ...(errors.name ? { borderColor: C.danger } : {}) }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="שם מדד הסיכון המפתח" />
        {errors.name && <div style={errorStyle}>{errors.name}</div>}
      </div>

      {/* currentValue */}
      <div style={fieldStyle}>
        <label style={labelStyle}>ערך נוכחי *</label>
        <input style={{ ...inputStyle, ...(errors.currentValue ? { borderColor: C.danger } : {}) }} value={form.currentValue} onChange={e => set('currentValue', e.target.value)} placeholder='לדוגמה: 4.2' />
        {errors.currentValue && <div style={errorStyle}>{errors.currentValue}</div>}
      </div>

      {/* threshold */}
      <div style={fieldStyle}>
        <label style={labelStyle}>ספים</label>
        <input style={inputStyle} value={form.threshold} onChange={e => set('threshold', e.target.value)} placeholder='לדוגמה: green:5,yellow:7,red:10' dir="ltr" />
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>
          פורמט: green:ערך,yellow:ערך,red:ערך
        </div>
      </div>

      {/* trend */}
      <div style={fieldStyle}>
        <label style={labelStyle}>מגמה</label>
        <select style={selectStyle} value={form.trend} onChange={e => set('trend', e.target.value)}>
          {trendOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* breached checkbox */}
      <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={form.breached}
          onChange={e => set('breached', e.target.checked)}
          style={{ width: 16, height: 16, accentColor: C.danger, cursor: 'pointer' }}
        />
        <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => set('breached', !form.breached)}>
          חריגה
        </label>
        {form.breached && (
          <span style={{ fontSize: 11, color: C.danger, fontFamily: 'var(--font-assistant)' }}>
            -- המדד חורג מהסף שנקבע
          </span>
        )}
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '8px 24px', background: loading ? C.textMuted : C.accent,
            color: 'white', border: 'none', borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-rubik)',
          }}
        >
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף מדד' : 'עדכן מדד'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 20px', background: 'none',
            color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-rubik)',
          }}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
