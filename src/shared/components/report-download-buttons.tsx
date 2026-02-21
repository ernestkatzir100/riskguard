'use client';

import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import type { ReportData } from '@/shared/lib/report-types';

type Props = {
  /** Server action that returns { docxBase64, reportData } */
  generateAction: () => Promise<{ docxBase64: string; reportData: ReportData }>;
  filenameBase: string;
};

export function ReportDownloadButtons({ generateAction, filenameBase }: Props) {
  const [loading, setLoading] = useState<'docx' | 'pdf' | null>(null);
  const [docxHref, setDocxHref] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  async function handleGenerate(format: 'docx' | 'pdf') {
    setLoading(format);
    try {
      let data = reportData;
      let base64 = docxHref;

      if (!data) {
        const result = await generateAction();
        base64 = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.docxBase64}`;
        data = result.reportData;
        setDocxHref(base64);
        setReportData(data);
      }

      if (format === 'docx' && base64) {
        const link = document.createElement('a');
        link.href = base64;
        link.download = `${filenameBase}.docx`;
        link.click();
      } else if (format === 'pdf' && data) {
        const { downloadPdf } = await import('@/shared/lib/generate-pdf-client');
        await downloadPdf(data, `${filenameBase}.pdf`);
      }
    } catch (err) {
      console.error('Report generation error:', err);
    }
    setLoading(null);
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600,
    fontFamily: 'var(--font-rubik)', cursor: active ? 'not-allowed' : 'pointer',
    border: `1px solid ${C.border}`, background: active ? C.borderLight : C.surface,
    color: active ? C.textMuted : C.accent, transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={() => handleGenerate('docx')} disabled={!!loading} style={btnStyle(loading === 'docx')}>
        <FileText size={13} />
        {loading === 'docx' ? 'יוצר...' : 'Word'}
      </button>
      <button onClick={() => handleGenerate('pdf')} disabled={!!loading} style={btnStyle(loading === 'pdf')}>
        <Download size={13} />
        {loading === 'pdf' ? 'יוצר...' : 'PDF'}
      </button>
    </div>
  );
}
