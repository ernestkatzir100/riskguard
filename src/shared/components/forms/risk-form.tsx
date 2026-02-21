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

type RiskFormData = {
  title: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  status: string;
  regulationCode: string;
  sectionRef: string;
  reqCode: string;
};

type RiskFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<RiskFormData>;
  onSubmit: (data: RiskFormData) => Promise<void>;
  onCancel: () => void;
};

const categoryOptions = [
  { value: 'operational', label: 'תפעולי' },
  { value: 'fraud', label: 'הונאה' },
  { value: 'outsourcing', label: 'מיקור חוץ' },
  { value: 'cyber', label: 'סייבר' },
  { value: 'bcp', label: 'המשכיות עסקית' },
  { value: 'credit', label: 'אשראי' },
  { value: 'governance', label: 'ממשל תאגידי' },
];

const statusOptions = [
  { value: 'open', label: 'פתוח' },
  { value: 'mitigated', label: 'מטופל' },
  { value: 'accepted', label: 'מקובל' },
  { value: 'closed', label: 'סגור' },
];

export function RiskForm({ mode, initialData, onSubmit, onCancel }: RiskFormProps) {
  const [form, setForm] = useState<RiskFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    category: initialData?.category ?? 'operational',
    probability: initialData?.probability ?? 3,
    impact: initialData?.impact ?? 3,
    status: initialData?.status ?? 'open',
    regulationCode: initialData?.regulationCode ?? '',
    sectionRef: initialData?.sectionRef ?? '',
    reqCode: initialData?.reqCode ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RiskFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const riskScore = form.probability * form.impact;

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'כותרת הסיכון נדרשת';
    if (!form.category) e.category = 'יש לבחור קטגוריה';
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

  const set = <K extends keyof RiskFormData>(k: K, v: RiskFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const riskColor = riskScore >= 15 ? C.danger : riskScore >= 8 ? C.warning : C.success;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* title */}
      <div style={fieldStyle}>
        <label style={labelStyle}>כותרת *</label>
        <input style={{ ...inputStyle, ...(errors.title ? { borderColor: C.danger } : {}) }} value={form.title} onChange={e => set('title', e.target.value)} placeholder="שם הסיכון" />
        {errors.title && <div style={errorStyle}>{errors.title}</div>}
      </div>

      {/* description */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תיאור</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="תיאור הסיכון" />
      </div>

      {/* category */}
      <div style={fieldStyle}>
        <label style={labelStyle}>קטגוריה *</label>
        <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
          {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {errors.category && <div style={errorStyle}>{errors.category}</div>}
      </div>

      {/* probability + impact row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>הסתברות *</label>
          <select style={selectStyle} value={form.probability} onChange={e => set('probability', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>השפעה *</label>
          <select style={selectStyle} value={form.impact} onChange={e => set('impact', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* computed risk score */}
      <div style={{ ...fieldStyle, padding: '8px 12px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>ציון סיכון: </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: riskColor, fontFamily: 'var(--font-rubik)' }}>{riskScore}</span>
        <span style={{ fontSize: 11, color: C.textMuted, marginRight: 6 }}>(הסתברות x השפעה)</span>
      </div>

      {/* status */}
      <div style={fieldStyle}>
        <label style={labelStyle}>סטטוס</label>
        <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* regulation fields row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>קוד רגולציה</label>
          <input style={inputStyle} value={form.regulationCode} onChange={e => set('regulationCode', e.target.value)} placeholder='לדוגמה: 2024-10-2' />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סעיף</label>
          <input style={inputStyle} value={form.sectionRef} onChange={e => set('sectionRef', e.target.value)} placeholder='לדוגמה: 2(ב)(4)' />
        </div>
      </div>

      {/* reqCode */}
      <div style={fieldStyle}>
        <label style={labelStyle}>קוד דרישה</label>
        <input style={inputStyle} value={form.reqCode} onChange={e => set('reqCode', e.target.value)} placeholder='לדוגמה: GOV-01' />
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף סיכון' : 'עדכן סיכון'}
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
