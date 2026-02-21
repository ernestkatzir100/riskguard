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

type VendorFormData = {
  name: string;
  serviceDescription: string;
  criticality: string;
  status: string;
  contractStart: string;
  contractEnd: string;
  annualValueNis: string;
  riskRating: number;
  contactName: string;
  contactEmail: string;
};

type VendorFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<VendorFormData>;
  onSubmit: (data: VendorFormData) => Promise<void>;
  onCancel: () => void;
};

const criticalityOptions = [
  { value: 'critical', label: 'קריטי' },
  { value: 'important', label: 'חשוב' },
  { value: 'standard', label: 'רגיל' },
];

const statusOptions = [
  { value: 'active', label: 'פעיל' },
  { value: 'under_review', label: 'בבדיקה' },
  { value: 'terminated', label: 'הופסק' },
];

export function VendorForm({ mode, initialData, onSubmit, onCancel }: VendorFormProps) {
  const [form, setForm] = useState<VendorFormData>({
    name: initialData?.name ?? '',
    serviceDescription: initialData?.serviceDescription ?? '',
    criticality: initialData?.criticality ?? 'standard',
    status: initialData?.status ?? 'active',
    contractStart: initialData?.contractStart ?? '',
    contractEnd: initialData?.contractEnd ?? '',
    annualValueNis: initialData?.annualValueNis ?? '',
    riskRating: initialData?.riskRating ?? 3,
    contactName: initialData?.contactName ?? '',
    contactEmail: initialData?.contactEmail ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VendorFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'שם הספק נדרש';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      e.contactEmail = 'כתובת אימייל לא תקינה';
    }
    if (form.contractStart && form.contractEnd && form.contractEnd < form.contractStart) {
      e.contractEnd = 'תאריך סיום חייב להיות אחרי תאריך התחלה';
    }
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

  const set = <K extends keyof VendorFormData>(k: K, v: VendorFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ direction: 'rtl' }}>
      {/* name */}
      <div style={fieldStyle}>
        <label style={labelStyle}>שם הספק *</label>
        <input style={{ ...inputStyle, ...(errors.name ? { borderColor: C.danger } : {}) }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="שם הספק" />
        {errors.name && <div style={errorStyle}>{errors.name}</div>}
      </div>

      {/* serviceDescription */}
      <div style={fieldStyle}>
        <label style={labelStyle}>תיאור השירות</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.serviceDescription} onChange={e => set('serviceDescription', e.target.value)} placeholder="תיאור השירות המסופק" />
      </div>

      {/* criticality + status row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>קריטיות</label>
          <select style={selectStyle} value={form.criticality} onChange={e => set('criticality', e.target.value)}>
            {criticalityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סטטוס</label>
          <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* contract dates row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>תחילת חוזה</label>
          <input style={inputStyle} type="date" value={form.contractStart} onChange={e => set('contractStart', e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>סיום חוזה</label>
          <input style={{ ...inputStyle, ...(errors.contractEnd ? { borderColor: C.danger } : {}) }} type="date" value={form.contractEnd} onChange={e => set('contractEnd', e.target.value)} />
          {errors.contractEnd && <div style={errorStyle}>{errors.contractEnd}</div>}
        </div>
      </div>

      {/* annualValue + riskRating row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>ערך שנתי (NIS)</label>
          <input style={inputStyle} value={form.annualValueNis} onChange={e => set('annualValueNis', e.target.value)} placeholder="0.00" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>דירוג סיכון</label>
          <select style={selectStyle} value={form.riskRating} onChange={e => set('riskRating', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* contact fields row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>איש קשר</label>
          <input style={inputStyle} value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="שם איש קשר" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>אימייל</label>
          <input style={{ ...inputStyle, ...(errors.contactEmail ? { borderColor: C.danger } : {}) }} type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="email@example.com" dir="ltr" />
          {errors.contactEmail && <div style={errorStyle}>{errors.contactEmail}</div>}
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
          {loading ? 'שומר...' : mode === 'create' ? 'הוסף ספק' : 'עדכן ספק'}
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
