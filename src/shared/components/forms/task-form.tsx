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

type TaskFormData = {
  title: string;
  description: string;
  module: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
};

type TaskFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
};

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

const priorityOptions = [
  { value: 'high', label: 'גבוהה' },
  { value: 'medium', label: 'בינונית' },
  { value: 'low', label: 'נמוכה' },
];

export function TaskForm({ mode, initialData, onSubmit, onCancel }: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    module: initialData?.module ?? 'governance',
    priority: initialData?.priority ?? 'medium',
    dueDate: initialData?.dueDate ?? '',
    assignedTo: initialData?.assignedTo ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'כותרת המשימה נדרשת';
    if (!form.module) e.module = 'יש לבחור מודול';
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

  const set = <K extends keyof TaskFormData>(k: K, v: TaskFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* title */}
      <div style={fieldStyle}>
        <label style={labelStyle}>כותרת *</label>
        <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="שם המשימה" />
        {errors.title && <div style={errorStyle}>{errors.title}</div>}
      </div>

      {/* description */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תיאור</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="תיאור המשימה" />
      </div>

      {/* module */}
      <div style={fieldStyle}>
        <label style={labelStyle}>מודול *</label>
        <select style={selectStyle} value={form.module} onChange={e => set('module', e.target.value)}>
          {moduleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {errors.module && <div style={errorStyle}>{errors.module}</div>}
      </div>

      {/* priority + dueDate row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>עדיפות</label>
          <select style={selectStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
            {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>תאריך יעד</label>
          <input style={inputStyle} type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
      </div>

      {/* assignedTo */}
      <div style={fieldStyle}>
        <label style={labelStyle}>מוקצה ל</label>
        <input style={inputStyle} value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} placeholder="מזהה משתמש (אופציונלי)" />
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף משימה' : 'עדכן משימה'}
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
