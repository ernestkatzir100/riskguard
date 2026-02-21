'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, CheckCircle, FilePen, AlertTriangle, X, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import { FormModal } from '@/shared/components/form-modal';
import { DocumentForm } from '@/shared/components/forms/document-form';
import { getDocuments, createDocument, updateDocument, deleteDocument, updateDocumentStatus } from '@/app/actions/documents';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { EmptyState, EMPTY_STATES } from '@/shared/components/empty-state';

/* ═══ Types ═══ */
type DocType = 'policy' | 'procedure' | 'report' | 'protocol';
type DocStatus = 'approved' | 'draft' | 'review' | 'missing';

type Doc = {
  id: string;
  title: string;
  type: DocType;
  module: string;
  status: DocStatus;
  date: string;
  version: string;
  owner: string;
  dbStatus?: string;
  expiresAt?: string;
};

/* ═══ Demo Data ═══ */
const DEMO_DOCS: Doc[] = [
  {
    id: 'DOC-001',
    title: 'מדיניות ניהול סיכונים כוללת',
    type: 'policy',
    module: 'governance',
    status: 'approved',
    date: '2026-01-15',
    version: '3.2',
    owner: 'יוסי כהן',
  },
  {
    id: 'DOC-002',
    title: 'נוהל תגובה לאירועי סייבר',
    type: 'procedure',
    module: 'cyber_incidents',
    status: 'approved',
    date: '2026-02-01',
    version: '2.1',
    owner: 'דנה לוי',
  },
  {
    id: 'DOC-003',
    title: 'דוח הערכת סיכונים תפעוליים Q4',
    type: 'report',
    module: 'operational',
    status: 'review',
    date: '2026-02-10',
    version: '1.0',
    owner: 'שרה ברק',
  },
  {
    id: 'DOC-004',
    title: 'פרוטוקול בדיקות חדירה שנתי',
    type: 'protocol',
    module: 'cyber_protection',
    status: 'draft',
    date: '2026-02-18',
    version: '1.0',
    owner: 'אורי דוד',
  },
  {
    id: 'DOC-005',
    title: 'מדיניות מיקור חוץ ורכש',
    type: 'policy',
    module: 'outsourcing',
    status: 'approved',
    date: '2025-11-20',
    version: '2.5',
    owner: 'רועי שמש',
  },
  {
    id: 'DOC-006',
    title: 'נוהל המשכיות עסקית ושחזור',
    type: 'procedure',
    module: 'bcp',
    status: 'missing',
    date: '',
    version: '—',
    owner: 'מיכל אברהם',
  },
  {
    id: 'DOC-007',
    title: 'דוח סיכוני אשראי חודשי',
    type: 'report',
    module: 'credit',
    status: 'approved',
    date: '2026-02-05',
    version: '1.3',
    owner: 'נועה כהן',
  },
  {
    id: 'DOC-008',
    title: 'פרוטוקול ישיבת דירקטוריון',
    type: 'protocol',
    module: 'board',
    status: 'draft',
    date: '2026-02-15',
    version: '1.0',
    owner: 'גלית לב',
  },
  {
    id: 'DOC-009',
    title: 'מדיניות הגנת סייבר',
    type: 'policy',
    module: 'cyber_governance',
    status: 'review',
    date: '2026-01-28',
    version: '2.0',
    owner: 'דנה לוי',
  },
  {
    id: 'DOC-010',
    title: 'נוהל ניהול סיכוני ספקים',
    type: 'procedure',
    module: 'outsourcing',
    status: 'missing',
    date: '',
    version: '—',
    owner: 'רועי שמש',
  },
];

/* ═══ Labels & Colors ═══ */
const STATUS_MAP: Record<DocStatus, { label: string; color: string; bg: string }> = {
  approved: { label: 'מאושר', color: C.success, bg: C.successBg },
  draft: { label: 'טיוטה', color: C.warning, bg: C.warningBg },
  review: { label: 'בבדיקה', color: C.accent, bg: C.accentLight },
  missing: { label: 'חסר', color: C.danger, bg: C.dangerBg },
};

const TYPE_MAP: Record<DocType, string> = {
  policy: 'מדיניות',
  procedure: 'נוהל',
  report: 'דוח',
  protocol: 'פרוטוקול',
};

const MODULE_MAP: Record<string, string> = {
  governance: 'ממשל תאגידי',
  operational: 'סיכון תפעולי',
  outsourcing: 'מיקור חוץ',
  bcp: 'המשכיות עסקית',
  cyber_governance: 'ממשל סייבר',
  cyber_protection: 'הגנת סייבר',
  cyber_incidents: 'אירועי סייבר',
  credit: 'סיכון אשראי',
  board: 'דירקטוריון',
};

const TYPE_FILTERS = [
  { value: 'all', label: 'כל הסוגים' },
  { value: 'policy', label: 'מדיניות' },
  { value: 'procedure', label: 'נוהל' },
  { value: 'report', label: 'דוח' },
  { value: 'protocol', label: 'פרוטוקול' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'הכל' },
  { value: 'approved', label: 'מאושר' },
  { value: 'draft', label: 'טיוטה' },
  { value: 'review', label: 'בבדיקה' },
  { value: 'missing', label: 'חסר' },
];

const MODULE_FILTERS = [
  { value: 'all', label: 'כל המודולים' },
  ...Object.entries(MODULE_MAP).map(([value, label]) => ({ value, label })),
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(DEMO_DOCS);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doc | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadData = useCallback(async () => {
    try {
      const result = await getDocuments();
      if (result && result.length > 0) {
        const statusMap: Record<string, DocStatus> = {
          draft: 'draft', approved: 'approved', expired: 'missing',
          pending_approval: 'review',
        };
        const mapped: Doc[] = result.map((d: Record<string, unknown>) => ({
          id: String(d.id ?? ''),
          title: String(d.title ?? ''),
          type: (['policy','procedure','report','protocol'].includes(String(d.type)) ? String(d.type) : 'report') as DocType,
          module: String(d.module ?? 'governance'),
          status: statusMap[String(d.status)] ?? 'draft',
          dbStatus: String(d.status ?? 'draft'),
          date: d.updatedAt ? new Date(d.updatedAt as string).toLocaleDateString('he-IL') : '—',
          version: String(d.version ?? '1.0'),
          owner: String(d.createdBy ?? 'מערכת'),
          expiresAt: d.expiresAt ? new Date(d.expiresAt as string).toISOString().split('T')[0] : '',
        }));
        setDocs(mapped);
      }
    } catch {
      /* fallback to demo */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Filtering */
  const filtered = docs.filter(d => {
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (moduleFilter !== 'all' && d.module !== moduleFilter) return false;
    return true;
  });

  /* Stats */
  const totalCount = docs.length;
  const approvedCount = docs.filter(d => d.status === 'approved').length;
  const draftCount = docs.filter(d => d.status === 'draft').length;
  const missingCount = docs.filter(d => d.status === 'missing').length;

  const selected = selectedDoc ? docs.find(d => d.id === selectedDoc) : null;

  /* Actions */
  async function handleCreateDocument(data: Record<string, unknown>) {
    setFormLoading(true);
    try {
      await createDocument(data);
      setShowForm(false);
      await loadData();
      showToast('המסמך נוצר בהצלחה');
    } catch {
      showToast('שגיאה ביצירת המסמך', 'error');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const prev = [...docs];
    setDocs(d => d.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
    setSelectedDoc(null);
    try {
      await deleteDocument(deleteTarget.id);
      showToast('המסמך נמחק בהצלחה');
    } catch {
      setDocs(prev);
      showToast('שגיאה במחיקת המסמך', 'error');
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateDocumentStatus(id, newStatus as 'draft' | 'pending_approval' | 'approved' | 'expired');
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as DocStatus } : d));
    } catch {
      /* fallback: update locally */
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as DocStatus } : d));
    }
  }

  if (loading) return <PageSkeleton />;
  if (docs.length === 0) return <EmptyState {...EMPTY_STATES['documents']} />;

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-assistant)', color: C.text, padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, margin: 0, color: C.text }}>
              מסמכים
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
              ניהול מדיניות, נהלים ודוחות רגולטוריים
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', background: C.accent, color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-rubik)',
          }}
        >
          <Plus size={16} />
          מסמך חדש
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'סה״כ מסמכים', value: totalCount, color: C.accent, icon: FileText },
          { label: 'מאושרים', value: approvedCount, color: C.success, icon: CheckCircle },
          { label: 'טיוטות', value: draftCount, color: C.warning, icon: FilePen },
          { label: 'חסרים', value: missingCount, color: C.danger, icon: AlertTriangle },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{stat.label}</span>
              <stat.icon size={16} color={stat.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-rubik)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        {/* Type filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: typeFilter === f.value ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font-rubik)', transition: 'all 0.15s',
                background: typeFilter === f.value ? C.accent : C.surface,
                color: typeFilter === f.value ? '#fff' : C.textSec,
                border: `1px solid ${typeFilter === f.value ? C.accent : C.border}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
            fontSize: 12, fontFamily: 'var(--font-rubik)', background: C.surface,
            color: C.textSec, cursor: 'pointer', outline: 'none',
          }}
        >
          {STATUS_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Module filter */}
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          style={{
            padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
            fontSize: 12, fontFamily: 'var(--font-rubik)', background: C.surface,
            color: C.textSec, cursor: 'pointer', outline: 'none',
          }}
        >
          {MODULE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: 60, color: C.textMuted, fontSize: 14,
        }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>טוען מסמכים...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Document Table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: selected ? '0 12px 12px 0' : 12, overflow: 'hidden',
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-assistant)' }}>
                  <thead>
                    <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                      {['#', 'מסמך', 'סוג', 'מודול', 'סטטוס', 'גרסה', 'עדכון אחרון'].map(h => (
                        <th key={h} style={{
                          textAlign: 'right', padding: '10px 12px', fontWeight: 600, fontSize: 11,
                          color: C.textSec, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{
                          padding: 40, textAlign: 'center', color: C.textMuted, fontSize: 14,
                        }}>
                          לא נמצאו מסמכים התואמים את הסינון
                        </td>
                      </tr>
                    ) : (
                      filtered.map((doc, i) => {
                        const statusInfo = STATUS_MAP[doc.status];
                        const isSel = selectedDoc === doc.id;
                        return (
                          <tr
                            key={doc.id}
                            onClick={() => setSelectedDoc(isSel ? null : doc.id)}
                            style={{
                              borderBottom: `1px solid ${C.borderLight}`,
                              cursor: 'pointer',
                              background: isSel ? C.accentLight : i % 2 === 0 ? '#fff' : '#FAFBFC',
                              borderInlineEnd: isSel ? `3px solid ${C.accent}` : '3px solid transparent',
                              transition: 'background 0.1s',
                            }}
                          >
                            {/* # */}
                            <td style={{ padding: '10px 12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.accent, fontSize: 12 }}>
                              {doc.id}
                            </td>
                            {/* Title */}
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>
                              {doc.title}
                            </td>
                            {/* Type */}
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                background: C.accentLight, color: C.accent, fontSize: 10, fontWeight: 600,
                                padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
                              }}>
                                {TYPE_MAP[doc.type]}
                              </span>
                            </td>
                            {/* Module */}
                            <td style={{ padding: '10px 12px', color: C.textSec, fontSize: 12 }}>
                              {MODULE_MAP[doc.module] || doc.module}
                            </td>
                            {/* Status */}
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                fontFamily: 'var(--font-rubik)',
                                color: statusInfo.color,
                                background: statusInfo.bg,
                              }}>
                                {statusInfo.label}
                              </span>
                            </td>
                            {/* Version */}
                            <td style={{ padding: '10px 12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, fontSize: 12, color: C.textSec }}>
                              {doc.version}
                            </td>
                            {/* Date */}
                            <td style={{ padding: '10px 12px', fontSize: 12, fontFamily: 'var(--font-rubik)', color: C.textSec }}>
                              {doc.date || '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{
              width: 380, background: C.surface,
              borderInlineStart: `1px solid ${C.border}`,
              borderRadius: '12px 0 0 12px', padding: 20,
              overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)',
            }}>
              {/* Panel Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                  {selected.id}
                </span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button onClick={() => setEditDoc(selected)} title="ערוך" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                    <Pencil size={12} color={C.textSec} />
                  </button>
                  <button onClick={() => setDeleteTarget(selected)} title="מחק" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                    <Trash2 size={12} color={C.danger} />
                  </button>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    style={{
                      background: C.borderLight, border: 'none', borderRadius: 6,
                      width: 28, height: 28, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={14} color={C.textSec} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
                {selected.title}
              </h3>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{
                  background: STATUS_MAP[selected.status].bg,
                  color: STATUS_MAP[selected.status].color,
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                  fontFamily: 'var(--font-rubik)',
                }}>
                  {STATUS_MAP[selected.status].label}
                </span>
                <span style={{
                  background: C.accentLight, color: C.accent,
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                  fontFamily: 'var(--font-rubik)',
                }}>
                  {TYPE_MAP[selected.type]}
                </span>
              </div>

              {/* Details */}
              <div style={{ background: C.borderLight, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                {[
                  { l: 'מודול', v: MODULE_MAP[selected.module] || selected.module },
                  { l: 'גרסה', v: selected.version },
                  { l: 'אחראי', v: selected.owner },
                  { l: 'עדכון אחרון', v: selected.date || '—' },
                ].map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{f.l}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{f.v}</span>
                  </div>
                ))}
              </div>

              {/* Status Actions */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{
                  fontSize: 12, fontWeight: 700, color: C.text,
                  fontFamily: 'var(--font-rubik)', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Eye size={12} color={C.accent} /> שינוי סטטוס
                </h4>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['draft', 'review', 'approved', 'missing'] as DocStatus[])
                    .filter(s => s !== selected.status)
                    .map(s => {
                      const info = STATUS_MAP[s];
                      return (
                        <button
                          key={s}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(selected.id, s);
                          }}
                          style={{
                            background: info.bg, color: info.color,
                            border: `1px solid ${info.color}33`,
                            borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                          }}
                        >
                          {info.label}
                        </button>
                      );
                    })
                  }
                </div>
              </div>

              {/* File note */}
              <div style={{
                padding: '10px 14px', background: C.bg, borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                  העלאת קבצים ומעקב גרסאות מלא יהיו זמינים בקרוב.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Document Modal */}
      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="הוספת מסמך חדש"
        onSubmit={() => {}}
        loading={formLoading}
        submitLabel="הוסף מסמך"
        hideFooter
      >
        <DocumentForm
          mode="create"
          onSubmit={async (data) => {
            await handleCreateDocument(data);
          }}
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* Edit Document Modal */}
      <FormModal
        open={!!editDoc}
        onClose={() => setEditDoc(null)}
        title="עריכת מסמך"
        onSubmit={() => {}}
        hideFooter
      >
        {editDoc && (
          <DocumentForm
            mode="edit"
            initialData={{
              title: editDoc.title,
              type: editDoc.type,
              module: editDoc.module,
              version: editDoc.version,
              status: editDoc.dbStatus ?? 'draft',
              expiresAt: editDoc.expiresAt ?? '',
            }}
            onSubmit={async (data) => {
              try {
                await updateDocument(editDoc.id, data);
                setEditDoc(null);
                await loadData();
                showToast('המסמך עודכן בהצלחה');
              } catch {
                showToast('שגיאה בעדכון המסמך', 'error');
              }
            }}
            onCancel={() => setEditDoc(null)}
          />
        )}
      </FormModal>

      {/* Delete Confirmation */}
      <FormModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת מסמך"
        onSubmit={handleDelete}
        submitLabel="מחק"
      >
        <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: 0 }}>
          האם למחוק את המסמך <strong>&quot;{deleteTarget?.title}&quot;</strong>?
        </p>
        <p style={{ fontSize: 12, color: C.danger, fontFamily: 'var(--font-assistant)', marginTop: 8 }}>
          פעולה זו אינה הפיכה.
        </p>
      </FormModal>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? C.success : C.danger,
          color: 'white', padding: '10px 24px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-rubik)',
          zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {toast.message}
        </div>
      )}

      {/* Spin animation for loader */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
