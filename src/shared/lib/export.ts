export function exportToCSV(data: Record<string, unknown>[], filename: string, headers: { key: string; label: string }[]) {
  // BOM for Hebrew Excel compatibility
  const BOM = '\uFEFF';
  const headerRow = headers.map(h => h.label).join(',');
  const rows = data.map(row =>
    headers.map(h => {
      const val = String(row[h.key] ?? '');
      // Escape commas and quotes
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  const csv = BOM + [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
