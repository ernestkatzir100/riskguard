'use client';

import type { ReportData } from './report-types';

/**
 * Client-side PDF generation using jsPDF + jspdf-autotable.
 * Uses browser's font rendering for full Hebrew support.
 */
export async function downloadPdf(data: ReportData, filename: string) {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Helper: add text RTL (right-aligned)
  const addText = (text: string, size: number, opts?: { bold?: boolean; color?: [number, number, number] }) => {
    doc.setFontSize(size);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(15, 23, 42);
    doc.text(text, pageWidth - 10, y, { align: 'right' });
    y += size * 0.5;
  };

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 15;
    }
  };

  // Title
  addText(data.title, 18, { bold: true, color: [29, 111, 171] });
  y += 2;
  if (data.subtitle) {
    addText(data.subtitle, 10, { color: [71, 85, 105] });
  }
  addText(`${data.tenantName} | ${data.generatedAt}`, 9, { color: [100, 116, 139] });
  y += 4;

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(10, y, pageWidth - 10, y);
  y += 8;

  // Sections
  for (const section of data.sections) {
    checkPage(20);
    addText(section.title, 14, { bold: true, color: [29, 111, 171] });
    y += 3;

    if (section.type === 'table' && section.headers && section.rows) {
      checkPage(30);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: y,
        head: [section.headers],
        body: section.rows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          halign: 'right',
          cellPadding: 2,
          textColor: [15, 23, 42],
          lineColor: [203, 213, 225],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [29, 111, 171],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'right',
        },
        alternateRowStyles: { fillColor: [224, 242, 254] },
        margin: { right: 10, left: 10 },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 8;
    } else if (section.type === 'kpis' && section.kpis) {
      for (const kpi of section.kpis) {
        checkPage(8);
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`${kpi.value}  :${kpi.label}`, pageWidth - 10, y, { align: 'right' });
        y += 6;
      }
      y += 4;
    } else if (section.type === 'text' && section.text) {
      checkPage(10);
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(section.text, pageWidth - 20);
      doc.text(lines, pageWidth - 10, y, { align: 'right' });
      y += lines.length * 5 + 4;
    }
  }

  // Footer
  checkPage(15);
  y = 280;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RiskGuard © 2026 — מסמך חסוי', pageWidth / 2, y, { align: 'center' });

  doc.save(filename);
}
