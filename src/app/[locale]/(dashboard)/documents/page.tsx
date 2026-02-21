'use client';

import { C } from '@/shared/lib/design-tokens';
import { EmptyState } from '@/shared/components/empty-state';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-assistant)', color: C.text, padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={24} color="#fff" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, margin: 0, color: C.text }}>
          מסמכים
        </h1>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={FileText}
        title="בקרוב"
        description="מודול המסמכים בפיתוח ויהיה זמין בקרוב."
      />
    </div>
  );
}
