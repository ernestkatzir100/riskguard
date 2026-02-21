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
const errorStyle: React.CSSProperties = { fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' };

type MeetingFormData = {
  meetingType: string;
  date: string;
  quarter: string;
  agenda: string;
  attendees: string;
};

type MeetingFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<MeetingFormData>;
  onSubmit: (data: MeetingFormData) => Promise<void>;
  onCancel: () => void;
};

export function MeetingForm({ mode, initialData, onSubmit, onCancel }: MeetingFormProps) {
  const [form, setForm] = useState<MeetingFormData>({
    meetingType: initialData?.meetingType ?? '',
    date: initialData?.date ?? '',
    quarter: initialData?.quarter ?? '',
    agenda: initialData?.agenda ?? '',
    attendees: initialData?.attendees ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MeetingFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.meetingType.trim()) e.meetingType = 'סוג ישיבה נדרש';
    if (!form.date) e.date = 'תאריך נדרש';
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

  const set = <K extends keyof MeetingFormData>(k: K, v: MeetingFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* meetingType */}
      <div style={fieldStyle}>
        <label style={labelStyle}>סוג ישיבה *</label>
        <input style={inputStyle} value={form.meetingType} onChange={e => set('meetingType', e.target.value)} placeholder='לדוגמה: ישיבת דירקטוריון רבעונית' />
        {errors.meetingType && <div style={errorStyle}>{errors.meetingType}</div>}
      </div>

      {/* date + quarter row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>תאריך *</label>
          <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          {errors.date && <div style={errorStyle}>{errors.date}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>רבעון</label>
          <input style={inputStyle} value={form.quarter} onChange={e => set('quarter', e.target.value)} placeholder='לדוגמה: Q1-2026' />
        </div>
      </div>

      {/* agenda */}
      <div style={fieldStyle}>
        <label style={labelStyle}>סדר יום</label>
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
          value={form.agenda}
          onChange={e => set('agenda', e.target.value)}
          placeholder={'נושא ראשון\nנושא שני\nנושא שלישי'}
        />
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>
          נושא אחד בכל שורה
        </div>
      </div>

      {/* attendees */}
      <div style={fieldStyle}>
        <label style={labelStyle}>משתתפים</label>
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
          value={form.attendees}
          onChange={e => set('attendees', e.target.value)}
          placeholder={'שם משתתף 1\nשם משתתף 2'}
        />
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>
          משתתף אחד בכל שורה
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף ישיבה' : 'עדכן ישיבה'}
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
