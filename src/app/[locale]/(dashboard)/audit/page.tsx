'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Download, Filter, FileText, FileSpreadsheet } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

type AuditEntry = {
  id: number;
  userId: string | null;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  timestamp: Date;
};

const ENTITY_LABELS: Record<string, string> = {
  risk: 'סיכון',
  control: 'בקרה',
  vendor: 'ספק',
  task: 'משימה',
  document: 'מסמך',
  cyber_incident: 'אירוע סייבר',
  board_meeting: 'ישיבת דירקטוריון',
  board_decision: 'החלטת דירקטוריון',
  kri: 'מדד סיכון',
  bcp_plan: 'תוכנית BCP',
  bcp_test: 'תרגיל BCP',
  vendor_assessment: 'הערכת ספק',
  report: 'דוח',
  tenant: 'ארגון',
  user: 'משתמש',
  risk_officer: 'קצין סיכונים',
};

const ACTION_LABELS: Record<string, string> = {
  created: 'נוצר',
  updated: 'עודכן',
  deleted: 'נמחק',
  completed: 'הושלם',
  linked: 'קושר',
  unlinked: 'הופרד',
  generated: 'הופק',
  status_updated: 'עדכון סטטוס',
  file_uploaded: 'הועלה קובץ',
  invited: 'הוזמן',
  onboarding_completed: 'הושלמה הגדרה',
  role_changed: 'תפקיד שונה',
  removed: 'הוסר',
  imported: 'יובא',
};

function formatAction(action: string): string {
  const parts = action.split('.');
  const verb = parts[parts.length - 1];
  return ACTION_LABELS[verb] || verb;
}

function getEntityName(entry: AuditEntry): string {
  if (!entry.details) return '—';
  const d = entry.details;
  return String(d.title || d.name || d.companyName || d.email || d.type || entry.entityId || '—');
}

// Demo data fallback
const DEMO_AUDIT: AuditEntry[] = [
  { id: 1, userId: null, userName: 'דוד כהן', action: 'risk.created', entityType: 'risk', entityId: '1', details: { title: 'סיכון אשראי צרכני' }, timestamp: new Date('2025-01-15T10:30:00') },
  { id: 2, userId: null, userName: 'דוד כהן', action: 'control.created', entityType: 'control', entityId: '1', details: { title: 'בקרת אימות לווה' }, timestamp: new Date('2025-01-15T10:35:00') },
  { id: 3, userId: null, userName: 'יוסי לוי', action: 'vendor.created', entityType: 'vendor', entityId: '1', details: { name: 'CloudSec Ltd' }, timestamp: new Date('2025-01-14T14:20:00') },
  { id: 4, userId: null, userName: 'דנה כהן', action: 'task.completed', entityType: 'task', entityId: '1', details: { title: 'עדכון מדיניות סיכונים' }, timestamp: new Date('2025-01-14T09:15:00') },
  { id: 5, userId: null, userName: 'דוד כהן', action: 'document.status_updated', entityType: 'document', entityId: '1', details: { status: 'approved', title: 'מדיניות אשראי' }, timestamp: new Date('2025-01-13T16:45:00') },
  { id: 6, userId: null, userName: 'יוסי לוי', action: 'cyber_incident.created', entityType: 'cyber_incident', entityId: '1', details: { title: 'ניסיון פישינג' }, timestamp: new Date('2025-01-13T08:00:00') },
  { id: 7, userId: null, userName: 'דוד כהן', action: 'kri.updated', entityType: 'kri', entityId: '1', details: { name: 'שיעור NPL', currentValue: '2.3%' }, timestamp: new Date('2025-01-12T11:30:00') },
  { id: 8, userId: null, userName: 'דנה כהן', action: 'board_meeting.created', entityType: 'board_meeting', entityId: '1', details: { title: 'ישיבת דירקטוריון רבעונית' }, timestamp: new Date('2025-01-12T10:00:00') },
  { id: 9, userId: null, userName: 'דוד כהן', action: 'report.generated', entityType: 'report', entityId: null, details: { type: 'board_quarterly' }, timestamp: new Date('2025-01-11T15:00:00') },
  { id: 10, userId: null, userName: 'יוסי לוי', action: 'vendor_assessment.created', entityType: 'vendor_assessment', entityId: '1', details: { name: 'הערכת CloudSec' }, timestamp: new Date('2025-01-10T12:00:00') },
];

const PAGE_SIZE = 20;

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>(DEMO_AUDIT);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const { getRecentActivity } = await import('@/app/actions/dashboard');
      const data = await getRecentActivity();
      if (data && data.length > 0) setEntries(data as unknown as AuditEntry[]);
    } catch {
      // Use demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAudit(); }, [loadAudit]);

  const filtered = entries.filter((e) => {
    if (entityFilter && e.entityType !== entityFilter) return false;
    if (actionFilter && !e.action.includes(actionFilter)) return false;
    if (userFilter && (e.userName || '') !== userFilter) return false;
    if (dateFrom) {
      const d = new Date(e.timestamp);
      if (d < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const d = new Date(e.timestamp);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    const header = 'זמן,משתמש,פעולה,סוג ישות,שם ישות,פרטים';
    const rows = filtered.map((e) =>
      `${new Date(e.timestamp).toLocaleString('he-IL')},${e.userName || '—'},${formatAction(e.action)},${ENTITY_LABELS[e.entityType] || e.entityType},${getEntityName(e)},"${JSON.stringify(e.details || {})}"`
    );
    const csv = BOM + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const { generateDocxBuffer } = await import('@/shared/lib/generate-docx');
    const reportData = {
      title: 'יומן ביקורת',
      subtitle: 'כל הפעולות במערכת',
      generatedAt: new Date().toLocaleDateString('he-IL'),
      tenantName: 'RiskGuard',
      sections: [{
        title: 'רשומות ביקורת',
        type: 'table' as const,
        headers: ['זמן', 'משתמש', 'פעולה', 'סוג ישות', 'שם ישות'],
        rows: filtered.map((e) => [
          new Date(e.timestamp).toLocaleString('he-IL'),
          e.userName || '—',
          formatAction(e.action),
          ENTITY_LABELS[e.entityType] || e.entityType,
          getEntityName(e),
        ]),
      }],
    };
    const base64 = await generateDocxBuffer(reportData);
    const a = document.createElement('a');
    a.href = base64;
    a.download = 'audit_log.docx';
    a.click();
  };

  const handleExportPDF = async () => {
    const { downloadPdf } = await import('@/shared/lib/generate-pdf-client');
    const reportData = {
      title: 'יומן ביקורת',
      subtitle: 'כל הפעולות במערכת',
      generatedAt: new Date().toLocaleDateString('he-IL'),
      tenantName: 'RiskGuard',
      sections: [{
        title: 'רשומות ביקורת',
        type: 'table' as const,
        headers: ['זמן', 'משתמש', 'פעולה', 'סוג ישות', 'שם ישות'],
        rows: filtered.map((e) => [
          new Date(e.timestamp).toLocaleString('he-IL'),
          e.userName || '—',
          formatAction(e.action),
          ENTITY_LABELS[e.entityType] || e.entityType,
          getEntityName(e),
        ]),
      }],
    };
    await downloadPdf(reportData, 'audit_log.pdf');
  };

  const entityTypes = [...new Set(entries.map((e) => e.entityType))];
  const userNames = [...new Set(entries.map((e) => e.userName).filter(Boolean))];

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 3px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ClipboardList size={20} color={C.accent} /> יומן ביקורת
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            מעקב אחר כל הפעולות במערכת
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', color: C.textSec }}>
            <FileSpreadsheet size={13} /> CSV
          </button>
          <button onClick={handleExportWord} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', color: C.textSec }}>
            <FileText size={13} /> Word
          </button>
          <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', color: C.textSec }}>
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={14} color={C.textMuted} />
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          style={{ padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-assistant)', background: C.surface, cursor: 'pointer', outline: 'none' }}>
          <option value="">כל הישויות</option>
          {entityTypes.map((t) => (<option key={t} value={t}>{ENTITY_LABELS[t] || t}</option>))}
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          style={{ padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-assistant)', background: C.surface, cursor: 'pointer', outline: 'none' }}>
          <option value="">כל הפעולות</option>
          <option value="created">יצירה</option>
          <option value="updated">עדכון</option>
          <option value="deleted">מחיקה</option>
          <option value="completed">השלמה</option>
          <option value="generated">הפקה</option>
        </select>
        <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
          style={{ padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-assistant)', background: C.surface, cursor: 'pointer', outline: 'none' }}>
          <option value="">כל המשתמשים</option>
          {userNames.map((n) => (<option key={n} value={n!}>{n}</option>))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          style={{ padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-assistant)', background: C.surface, outline: 'none' }}
          title="מתאריך" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          style={{ padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-assistant)', background: C.surface, outline: 'none' }}
          title="עד תאריך" />
        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
          {filtered.length} רשומות
        </span>
      </div>

      {/* Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['זמן', 'משתמש', 'פעולה', 'סוג ישות', 'שם ישות', 'פרטים'].map((h) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 700,
                  color: C.textSec, fontFamily: 'var(--font-rubik)', borderBottom: `1px solid ${C.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>טוען...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>אין רשומות</td></tr>
            ) : paged.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                <td style={{ padding: '10px 14px', fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', whiteSpace: 'nowrap' }}>
                  {new Date(entry.timestamp).toLocaleString('he-IL')}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: C.text, fontFamily: 'var(--font-rubik)', fontWeight: 500 }}>
                  {entry.userName || '—'}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                    background: entry.action.includes('created') ? C.successBg
                      : entry.action.includes('deleted') ? C.dangerBg
                      : entry.action.includes('completed') ? C.successBg
                      : C.accentLight,
                    color: entry.action.includes('created') ? C.success
                      : entry.action.includes('deleted') ? C.danger
                      : entry.action.includes('completed') ? C.success
                      : C.accent,
                  }}>
                    {formatAction(entry.action)}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: C.text, fontFamily: 'var(--font-assistant)' }}>
                  {ENTITY_LABELS[entry.entityType] || entry.entityType}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: C.text, fontFamily: 'var(--font-rubik)', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getEntityName(entry)}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.details
                    ? Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-rubik)', cursor: page === 1 ? 'not-allowed' : 'pointer', border: `1px solid ${C.border}`, background: C.surface, color: page === 1 ? C.textMuted : C.accent }}>
            הקודם
          </button>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-rubik)', color: C.textSec }}>
            עמוד {page} מתוך {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-rubik)', cursor: page === totalPages ? 'not-allowed' : 'pointer', border: `1px solid ${C.border}`, background: C.surface, color: page === totalPages ? C.textMuted : C.accent }}>
            הבא
          </button>
        </div>
      )}
    </div>
  );
}
