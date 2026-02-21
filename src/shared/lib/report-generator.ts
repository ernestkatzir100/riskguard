import { C } from '@/shared/lib/design-tokens';

type ReportSection = {
  title: string;
  content: string; // HTML content
};

type ReportData = {
  title: string;
  subtitle?: string;
  tenant: { name: string; logoUrl?: string };
  date: string;
  sections: ReportSection[];
  confidential?: boolean;
};

export function generateReportHTML(data: ReportData): string {
  const sections = data.sections.map((s) => `
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 700; color: ${C.text}; font-family: Rubik, sans-serif; border-bottom: 2px solid ${C.accent}; padding-bottom: 8px; margin-bottom: 12px;">
        ${s.title}
      </h2>
      <div style="font-size: 14px; line-height: 1.8; color: ${C.textSec}; font-family: Assistant, sans-serif;">
        ${s.content}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Rubik:wght@400;600;700;800&display=swap&subset=hebrew" rel="stylesheet">
  <style>
    @page { margin: 2cm; size: A4; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    body { font-family: Assistant, sans-serif; color: ${C.text}; direction: rtl; margin: 0; padding: 40px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid ${C.border}; padding: 8px 12px; text-align: right; font-size: 13px; }
    th { background: ${C.bg}; font-weight: 600; font-family: Rubik, sans-serif; }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; border-bottom: 3px solid ${C.accent}; padding-bottom: 16px;">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: ${C.text}; font-family: Rubik, sans-serif; margin: 0 0 4px;">${data.title}</h1>
      ${data.subtitle ? `<p style="font-size: 14px; color: ${C.textMuted}; margin: 0;">${data.subtitle}</p>` : ''}
    </div>
    <div style="text-align: left;">
      <div style="font-size: 14px; font-weight: 600; color: ${C.text}; font-family: Rubik, sans-serif;">${data.tenant.name}</div>
      <div style="font-size: 12px; color: ${C.textMuted};">\u05EA\u05D0\u05E8\u05D9\u05DA \u05D4\u05E4\u05E7\u05D4: ${data.date}</div>
    </div>
  </div>

  ${data.confidential ? `<div style="background: ${C.warningBg}; color: ${C.warning}; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; margin-bottom: 24px; text-align: center;">\u05E1\u05D5\u05D3\u05D9 \u2014 \u05DC\u05E9\u05D9\u05DE\u05D5\u05E9 \u05E4\u05E0\u05D9\u05DE\u05D9 \u05D1\u05DC\u05D1\u05D3</div>` : ''}

  ${sections}

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid ${C.border}; display: flex; justify-content: space-between; font-size: 11px; color: ${C.textMuted};">
    <span>\u05D4\u05D5\u05E4\u05E7 \u05E2\u05DC \u05D9\u05D3\u05D9 RiskGuard</span>
    <span>${data.date}</span>
  </div>
</body>
</html>`;
}

export function generateTableHTML(headers: string[], rows: string[][]): string {
  const ths = headers.map(h => `<th>${h}</th>`).join('');
  const trs = rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}
