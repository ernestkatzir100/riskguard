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

type ControlFormData = {
  title: string;
  description: string;
  type: string;
  frequency: string;
  effectiveness: string;
  effectivenessScore: number;
};

type ControlFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<ControlFormData>;
  onSubmit: (data: ControlFormData) => Promise<void>;
  onCancel: () => void;
};

const typeOptions = [
  { value: 'preventive', label: 'מונעת' },
  { value: 'detective', label: 'גלאית' },
  { value: 'corrective', label: 'מתקנת' },
];

const frequencyOptions = [
  { value: 'continuous', label: 'רציפה' },
  { value: 'periodic', label: 'תקופתית' },
  { value: 'ad_hoc', label: 'חד פעמית' },
];

const effectivenessOptions = [
  { value: 'effective', label: 'אפקטיבית' },
  { value: 'partially_effective', label: 'אפקטיבית חלקית' },
  { value: 'ineffective', label: 'לא אפקטיבית' },
  { value: 'untested', label: 'לא נבדקה' },
];

export function ControlForm({ mode, initialData, onSubmit, onCancel }: ControlFormProps) {
  const [form, setForm] = useState<ControlFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    type: initialData?.type ?? 'preventive',
    frequency: initialData?.frequency ?? 'periodic',
    effectiveness: initialData?.effectiveness ?? 'untested',
    effectivenessScore: initialData?.effectivenessScore ?? 3,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ControlFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'שם הבקרה נדרש';
    if (!form.type) e.type = 'יש לבחור סוג בקרה';
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

  const set = <K extends keyof ControlFormData>(k: K, v: ControlFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* title */}
      <div style={fieldStyle}>
        <label style={labelStyle}>שם הבקרה *</label>
        <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="שם הבקרה" />
        {errors.title && <div style={errorStyle}>{errors.title}</div>}
      </div>

      {/* description */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תיאור</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="תיאור הבקרה" />
      </div>

      {/* type */}
      <div style={fieldStyle}>
        <label style={labelStyle}>סוג *</label>
        <select style={selectStyle} value={form.type} onChange={e => set('type', e.target.value)}>
          {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {errors.type && <div style={errorStyle}>{errors.type}</div>}
      </div>

      {/* frequency */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תדירות</label>
        <select style={selectStyle} value={form.frequency} onChange={e => set('frequency', e.target.value)}>
          {frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* effectiveness + score row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 2 }}>
          <label style={labelStyle}>אפקטיביות</label>
          <select style={selectStyle} value={form.effectiveness} onChange={e => set('effectiveness', e.target.value)}>
            {effectivenessOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>ציון אפקטיביות</label>
          <select style={selectStyle} value={form.effectivenessScore} onChange={e => set('effectivenessScore', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף בקרה' : 'עדכן בקרה'}
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
