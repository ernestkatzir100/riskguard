'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

type Props = {
  /** Server action: receives (base64, filename), returns { inserted, errors } */
  importAction: (base64: string, filename: string) => Promise<{ inserted: number; errors: string[] }>;
  label?: string;
  accept?: string;
};

export function ImportButton({ importAction, label = 'ייבוא', accept = '.xlsx,.xls,.csv' }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res = await importAction(base64, file.name);
      setResult(res);
    } catch (err) {
      setResult({ inserted: 0, errors: [err instanceof Error ? err.message : 'שגיאה בייבוא'] });
    }
    setLoading(false);
    if (ref.current) ref.current.value = '';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input ref={ref} type="file" accept={accept} onChange={handleFile} style={{ display: 'none' }} />
      <button
        onClick={() => ref.current?.click()}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600,
          fontFamily: 'var(--font-rubik)', cursor: loading ? 'not-allowed' : 'pointer',
          border: `1px solid ${C.border}`, background: loading ? C.borderLight : C.surface,
          color: loading ? C.textMuted : C.accent, transition: 'all 0.15s',
        }}
      >
        <Upload size={13} />
        {loading ? 'מייבא...' : label}
      </button>
      {result && (
        <span style={{
          fontSize: 10, fontFamily: 'var(--font-rubik)', fontWeight: 600,
          color: result.errors.length > 0 ? C.warning : C.success,
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          {result.errors.length > 0 ? <AlertCircle size={11} /> : <CheckCircle size={11} />}
          {result.inserted} יובאו{result.errors.length > 0 ? ` · ${result.errors.length} שגיאות` : ''}
        </span>
      )}
    </div>
  );
}
