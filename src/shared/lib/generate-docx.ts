'use server';

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel,
  ShadingType,
} from 'docx';
import type { ReportData, ReportSection } from './report-types';

const ACCENT = '1D6FAB';
const ACCENT_LIGHT = 'E0F2FE';
const TEXT_SEC = '475569';
const BORDER_COLOR = 'CBD5E1';

function headerParagraph(text: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2) {
  return new Paragraph({
    heading: level,
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    children: [new TextRun({ text, font: 'Rubik', bold: true, color: ACCENT, size: level === HeadingLevel.HEADING_1 ? 32 : 24 })],
    spacing: { after: 120 },
  });
}

function textParagraph(text: string, opts?: { bold?: boolean; color?: string; size?: number }) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    children: [new TextRun({
      text,
      font: 'Assistant',
      bold: opts?.bold,
      color: opts?.color ?? '0F172A',
      size: opts?.size ?? 20,
    })],
    spacing: { after: 80 },
  });
}

function cellBorder() {
  const b = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
  return { top: b, bottom: b, left: b, right: b };
}

function buildTable(section: ReportSection): Table {
  const headers = section.headers ?? [];
  const rows = section.rows ?? [];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders: cellBorder(),
      shading: { type: ShadingType.SOLID, color: ACCENT, fill: ACCENT },
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        children: [new TextRun({ text: h, font: 'Rubik', bold: true, color: 'FFFFFF', size: 18 })],
      })],
    })),
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map(cell => new TableCell({
      borders: cellBorder(),
      shading: ri % 2 === 1 ? { type: ShadingType.SOLID, color: ACCENT_LIGHT, fill: ACCENT_LIGHT } : undefined,
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        children: [new TextRun({ text: cell, font: 'Assistant', size: 18, color: '0F172A' })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function buildKPIs(section: ReportSection): Paragraph[] {
  return (section.kpis ?? []).map(kpi =>
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${kpi.label}: `, font: 'Rubik', bold: true, color: TEXT_SEC, size: 20 }),
        new TextRun({ text: kpi.value, font: 'Rubik', bold: true, color: ACCENT, size: 22 }),
      ],
    }),
  );
}

export async function generateDocxBuffer(data: ReportData): Promise<string> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(headerParagraph(data.title, HeadingLevel.HEADING_1));
  if (data.subtitle) children.push(textParagraph(data.subtitle, { color: TEXT_SEC }));
  children.push(textParagraph(`${data.tenantName} | ${data.generatedAt}`, { color: TEXT_SEC, size: 18 }));
  children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));

  // Sections
  for (const section of data.sections) {
    children.push(headerParagraph(section.title, HeadingLevel.HEADING_2));

    if (section.type === 'table' && section.headers) {
      children.push(buildTable(section));
    } else if (section.type === 'kpis') {
      children.push(...buildKPIs(section));
    } else if (section.type === 'text' && section.text) {
      children.push(textParagraph(section.text));
    }

    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // Footer
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'מסמך חסוי — RiskGuard © 2026', font: 'Assistant', size: 16, color: TEXT_SEC, italics: true })],
  }));

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer).toString('base64');
}
