/**
 * Shared report data structures for Word + PDF generation.
 */

export type ReportKPI = { label: string; value: string };

export type ReportSection = {
  title: string;
  type: 'table' | 'kpis' | 'text';
  /** Table headers (Hebrew) */
  headers?: string[];
  /** Table rows */
  rows?: string[][];
  /** KPI cards */
  kpis?: ReportKPI[];
  /** Free text paragraph */
  text?: string;
};

export type ReportData = {
  title: string;
  subtitle?: string;
  generatedAt: string;
  tenantName: string;
  sections: ReportSection[];
};
