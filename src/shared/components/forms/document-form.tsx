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

type DocumentFormData = {
  title: string;
  type: string;
  module: string;
  version: string;
  status: string;
  expiresAt: string;
};

type DocumentFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<DocumentFormData>;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
};

const typeOptions = [
  { value: 'policy', label: 'מדיניות' },
  { value: 'procedure', label: 'נוהל' },
  { value: 'report', label: 'דוח' },
  { value: 'assessment', label: 'הערכה' },
  { value: 'template', label: 'תבנית' },
  { value: 'evidence', label: 'ראייה' },
];

const moduleOptions = [
  { value: 'governance', label: 'ממשל תאגידי' },
  { value: 'operational', label: 'סיכון תפעולי' },
  { value: 'outsourcing', label: 'מיקור חוץ' },
  { value: 'bcp', label: 'המשכיות עסקית' },
  { value: 'cyber_governance', label: 'ממשל סייבר' },
  { value: 'cyber_protection', label: 'הגנת סייבר' },
  { value: 'cyber_incidents', label: 'אירועי סייבר' },
  { value: 'credit', label: 'סיכון אשראי' },
  { value: 'board', label: 'דירקטוריון' },
];

const statusOptions = [
  { value: 'draft', label: 'טיוטה' },
  { value: 'pending_approval', label: 'ממתין לאישור' },
  { value: 'approved', label: 'מאושר' },
  { value: 'expired', label: 'פג תוקף' },
];

export function DocumentForm({ mode, initialData, onSubmit, onCancel }: DocumentFormProps) {
  const [form, setForm] = useState<DocumentFormData>({
    title: initialData?.title ?? '',
    type: initialData?.type ?? 'policy',
    module: initialData?.module ?? 'governance',
    version: initialData?.version ?? '1.0',
    status: initialData?.status ?? 'draft',
    expiresAt: initialData?.expiresAt ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'כותרת המסמך נדרשת';
    if (!form.type) e.type = 'יש לבחור סוג מסמך';
    if (!form.version.trim()) e.version = 'מספר גרסה נדרש';
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

  const set = <K extends keyof DocumentFormData>(k: K, v: DocumentFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* title */}
      <div style={fieldStyle}>
        <label style={labelStyle}>כותרת *</label>
        <input style={{ ...inputStyle, ...(errors.title ? { borderColor: C.danger } : {}) }} value={form.title} onChange={e => set('title', e.target.value)} placeholder="שם המסמך" />
        {errors.title && <div style={errorStyle}>{errors.title}</div>}
      </div>

      {/* type + module row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סוג *</label>
          <select style={selectStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.type && <div style={errorStyle}>{errors.type}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>מודול</label>
          <select style={selectStyle} value={form.module} onChange={e => set('module', e.target.value)}>
            {moduleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* version + status row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>גרסה *</label>
          <input style={{ ...inputStyle, ...(errors.version ? { borderColor: C.danger } : {}) }} value={form.version} onChange={e => set('version', e.target.value)} placeholder="1.0" />
          {errors.version && <div style={errorStyle}>{errors.version}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סטטוס</label>
          <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* expiresAt */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תאריך תפוגה</label>
        <input style={inputStyle} type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
      </div>

      {/* note about file upload */}
      <div style={{ ...fieldStyle, padding: '8px 12px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
          העלאת קובץ תתאפשר לאחר יצירת המסמך
        </span>
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף מסמך' : 'עדכן מסמך'}
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
