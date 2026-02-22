'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
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
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][]; base64: string; filename: string } | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      // Parse for preview using XLSX on client
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
      if (data.length < 2) {
        setResult({ inserted: 0, errors: ['הקובץ ריק או ללא נתונים'] });
        return;
      }
      const headers = data[0].map(h => String(h || ''));
      const rows = data.slice(1, 11).map(r => headers.map((_, i) => String(r[i] ?? '')));
      setPreview({ headers, rows, base64, filename: file.name });
    } catch (err) {
      setResult({ inserted: 0, errors: [err instanceof Error ? err.message : 'שגיאה בקריאת הקובץ'] });
    }
    if (ref.current) ref.current.value = '';
  }

  async function handleConfirm() {
    if (!preview) return;
    setLoading(true);
    try {
      const res = await importAction(preview.base64, preview.filename);
      setResult(res);
    } catch (err) {
      setResult({ inserted: 0, errors: [err instanceof Error ? err.message : 'שגיאה בייבוא'] });
    }
    setLoading(false);
    setPreview(null);
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

      {/* Preview Modal */}
      {preview && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, direction: 'rtl',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setPreview(null); }}
        >
          <div style={{
            background: C.surface, borderRadius: 16, width: '100%', maxWidth: 700,
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={15} color={C.accent} /> תצוגה מקדימה — {preview.filename}
              </h3>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={16} color={C.textMuted} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: '0 0 12px' }}>
              מציג עד 10 שורות ראשונות. לחץ &quot;אשר ייבוא&quot; להמשך.
            </p>
            <div style={{ overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-assistant)' }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.textSec, fontFamily: 'var(--font-rubik)', borderBottom: `1px solid ${C.border}` }}>#</th>
                    {preview.headers.map((h, i) => (
                      <th key={i} style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.textSec, fontFamily: 'var(--font-rubik)', borderBottom: `1px solid ${C.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: '6px 10px', color: C.textMuted, fontSize: 10 }}>{ri + 1}</td>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: '6px 10px', color: C.text, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-start' }}>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  background: loading ? C.textMuted : C.accentGrad, color: 'white', border: 'none',
                  borderRadius: 8, padding: '8px 24px', fontSize: 12, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-rubik)',
                }}
              >
                {loading ? 'מייבא...' : 'אשר ייבוא'}
              </button>
              <button
                onClick={() => setPreview(null)}
                style={{
                  background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '8px 20px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-rubik)', color: C.textSec,
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
