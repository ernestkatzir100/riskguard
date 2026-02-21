'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

type FormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  hideFooter?: boolean;
};

export function FormModal({ open, onClose, title, children, onSubmit, loading, submitLabel = 'שמור', hideFooter }: FormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, direction: 'rtl',
      }}
    >
      <div style={{
        background: C.surface, borderRadius: 16, width: '100%', maxWidth: 520,
        maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} color={C.textMuted} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'flex-start',
          padding: '16px 24px', borderTop: `1px solid ${C.border}`,
        }}>
          <button
            onClick={onSubmit}
            disabled={loading}
            style={{
              padding: '8px 24px', background: loading ? C.textMuted : C.accent,
              color: 'white', border: 'none', borderRadius: 8, fontSize: 13,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-rubik)',
            }}
          >
            {loading ? 'שומר...' : submitLabel}
          </button>
          <button
            onClick={onClose}
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
        )}
      </div>
    </div>
  );
}
