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

type IncidentFormData = {
  title: string;
  description: string;
  severity: string;
  status: string;
  incidentType: string;
  detectedAt: string;
  dataExposed: boolean;
  rootCause: string;
  remediation: string;
};

type IncidentFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<IncidentFormData>;
  onSubmit: (data: IncidentFormData) => Promise<void>;
  onCancel: () => void;
};

const severityOptions = [
  { value: 'critical', label: 'קריטי' },
  { value: 'high', label: 'גבוה' },
  { value: 'medium', label: 'בינוני' },
  { value: 'low', label: 'נמוך' },
];

const statusOptions = [
  { value: 'detected', label: 'זוהה' },
  { value: 'investigating', label: 'בחקירה' },
  { value: 'contained', label: 'הוכל' },
  { value: 'resolved', label: 'נפתר' },
  { value: 'closed', label: 'סגור' },
];

export function IncidentForm({ mode, initialData, onSubmit, onCancel }: IncidentFormProps) {
  const [form, setForm] = useState<IncidentFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    severity: initialData?.severity ?? 'medium',
    status: initialData?.status ?? 'detected',
    incidentType: initialData?.incidentType ?? '',
    detectedAt: initialData?.detectedAt ?? '',
    dataExposed: initialData?.dataExposed ?? false,
    rootCause: initialData?.rootCause ?? '',
    remediation: initialData?.remediation ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IncidentFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'כותרת האירוע נדרשת';
    if (!form.severity) e.severity = 'יש לבחור חומרה';
    if (!form.detectedAt) e.detectedAt = 'זמן זיהוי נדרש';
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

  const set = <K extends keyof IncidentFormData>(k: K, v: IncidentFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* title */}
      <div style={fieldStyle}>
        <label style={labelStyle}>כותרת *</label>
        <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="שם אירוע הסייבר" />
        {errors.title && <div style={errorStyle}>{errors.title}</div>}
      </div>

      {/* description */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תיאור</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="תיאור האירוע" />
      </div>

      {/* severity + status row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>חומרה *</label>
          <select style={selectStyle} value={form.severity} onChange={e => set('severity', e.target.value)}>
            {severityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.severity && <div style={errorStyle}>{errors.severity}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סטטוס</label>
          <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* incidentType + detectedAt row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סוג אירוע</label>
          <input style={inputStyle} value={form.incidentType} onChange={e => set('incidentType', e.target.value)} placeholder='לדוגמה: פישינג, כופרה' />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>זמן זיהוי *</label>
          <input style={inputStyle} type="datetime-local" value={form.detectedAt} onChange={e => set('detectedAt', e.target.value)} />
          {errors.detectedAt && <div style={errorStyle}>{errors.detectedAt}</div>}
        </div>
      </div>

      {/* dataExposed checkbox */}
      <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={form.dataExposed}
          onChange={e => set('dataExposed', e.target.checked)}
          style={{ width: 16, height: 16, accentColor: C.accent, cursor: 'pointer' }}
        />
        <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => set('dataExposed', !form.dataExposed)}>
          חשיפת מידע
        </label>
      </div>

      {/* rootCause */}
      <div style={fieldStyle}>
        <label style={labelStyle}>סיבת שורש</label>
        <textarea style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} value={form.rootCause} onChange={e => set('rootCause', e.target.value)} placeholder="ניתוח סיבת השורש (אופציונלי)" />
      </div>

      {/* remediation */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תיקון</label>
        <textarea style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} value={form.remediation} onChange={e => set('remediation', e.target.value)} placeholder="פעולות תיקון שננקטו (אופציונלי)" />
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף אירוע' : 'עדכן אירוע'}
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
