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

type DecisionFormData = {
  text: string;
  ownerName: string;
  dueDate: string;
  status: string;
};

type DecisionFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<DecisionFormData>;
  onSubmit: (data: DecisionFormData) => Promise<void>;
  onCancel: () => void;
};

const statusOptions = [
  { value: 'pending', label: 'ממתין' },
  { value: 'in_progress', label: 'בביצוע' },
  { value: 'done', label: 'הושלם' },
];

export function DecisionForm({ mode, initialData, onSubmit, onCancel }: DecisionFormProps) {
  const [form, setForm] = useState<DecisionFormData>({
    text: initialData?.text ?? '',
    ownerName: initialData?.ownerName ?? '',
    dueDate: initialData?.dueDate ?? '',
    status: initialData?.status ?? 'pending',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DecisionFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.text.trim()) e.text = 'תוכן ההחלטה נדרש';
    if (!form.ownerName.trim()) e.ownerName = 'שם האחראי נדרש';
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

  const set = <K extends keyof DecisionFormData>(k: K, v: DecisionFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* text */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תוכן ההחלטה *</label>
        <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.text} onChange={e => set('text', e.target.value)} placeholder="תיאור ההחלטה שהתקבלה" />
        {errors.text && <div style={errorStyle}>{errors.text}</div>}
      </div>

      {/* ownerName */}
      <div style={fieldStyle}>
        <label style={labelStyle}>אחראי *</label>
        <input style={inputStyle} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="שם האחראי לביצוע" />
        {errors.ownerName && <div style={errorStyle}>{errors.ownerName}</div>}
      </div>

      {/* dueDate + status row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>תאריך יעד</label>
          <input style={inputStyle} type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סטטוס</label>
          <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף החלטה' : 'עדכן החלטה'}
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
