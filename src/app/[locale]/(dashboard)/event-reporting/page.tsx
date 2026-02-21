'use client';

import { getLossEvents, createLossEvent, updateLossEvent, deleteLossEvent } from '@/app/actions/risks';
import { C } from '@/shared/lib/design-tokens';
import { useState, useEffect } from 'react';
import { FileWarning, TrendingUp, AlertTriangle, Clock, BookOpen, ExternalLink, Crown, Plus, Pencil, Trash2 } from 'lucide-react';
import { FormModal } from '@/shared/components/form-modal';
import { PageSkeleton } from '@/shared/components/skeleton-loader';

type EventStatus = 'סגור' | 'פתוח' | 'בטיפול';

interface LossEvent {
  id: string;
  dbId?: string;
  title: string;
  amount: string;
  date: string;
  status: EventStatus;
  category: string;
  dbCategory?: string;
  dbAmountNis?: string;
  dbEventDate?: string;
  dbCorrectiveActions?: string;
  dbDescription?: string;
  dbRootCause?: string;
}

const DEMO_EVENTS: LossEvent[] = [
  { id: 'EVT-001', title: 'כשל מערכת סליקה', amount: '₪125,000', date: '15/01/2026', status: 'סגור', category: 'תפעולי' },
  { id: 'EVT-002', title: 'הונאת פישינג', amount: '₪45,000', date: '28/01/2026', status: 'פתוח', category: 'סייבר' },
  { id: 'EVT-003', title: 'טעות בחישוב ריבית', amount: '₪82,000', date: '05/02/2026', status: 'בטיפול', category: 'תפעולי' },
  { id: 'EVT-004', title: 'דליפת מידע לקוחות', amount: '₪160,000', date: '10/02/2026', status: 'פתוח', category: 'סייבר' },
  { id: 'EVT-005', title: 'כשל בגיבוי', amount: '₪0', date: '18/02/2026', status: 'סגור', category: 'תפעולי' },
];

const CATEGORY_MAP: Record<string, string> = {
  operational: 'תפעולי', fraud: 'הונאה', outsourcing: 'מיקור חוץ',
  cyber: 'סייבר', bcp: 'המשכיות עסקית', credit: 'אשראי', governance: 'ממשל',
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAP);

function getStatusColor(status: EventStatus) {
  switch (status) {
    case 'סגור': return C.success;
    case 'פתוח': return C.danger;
    case 'בטיפול': return C.warning;
  }
}

function getStatusBg(status: EventStatus) {
  switch (status) {
    case 'סגור': return C.successBg;
    case 'פתוח': return C.dangerBg;
    case 'בטיפול': return C.warningBg;
  }
}

function mapLossRes(lossRes: Record<string, unknown>[]): LossEvent[] {
  return lossRes.map((le, i) => {
    const amt = Number(le.amountNis ?? 0);
    const cat = String(le.category ?? 'operational');
    return {
      id: `EVT-${String(i + 1).padStart(3, '0')}`,
      dbId: String(le.id ?? ''),
      title: String(le.title ?? ''),
      amount: amt > 0 ? `₪${amt >= 1000 ? Math.round(amt / 1000) + 'K' : amt.toLocaleString()}` : '₪0',
      date: le.eventDate ? new Date(le.eventDate as string).toLocaleDateString('he-IL') : '—',
      status: (le.correctiveActions ? 'סגור' : 'פתוח') as EventStatus,
      category: CATEGORY_MAP[cat] ?? cat,
      dbCategory: cat,
      dbAmountNis: String(le.amountNis ?? ''),
      dbEventDate: String(le.eventDate ?? ''),
      dbCorrectiveActions: String(le.correctiveActions ?? ''),
      dbDescription: String(le.description ?? ''),
      dbRootCause: String(le.rootCause ?? ''),
    };
  });
}

const EMPTY_FORM = { title: '', description: '', category: 'operational', amountNis: '', eventDate: '', rootCause: '', correctiveActions: '' };

export default function EventReportingPage() {
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<LossEvent[]>(DEMO_EVENTS);
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<LossEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LossEvent | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function validateForm(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'כותרת האירוע נדרשת';
    if (!form.eventDate) e.eventDate = 'תאריך אירוע נדרש';
    if (!form.category) e.category = 'קטגוריה נדרשת';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function reloadEvents() {
    try {
      const lossRes = await getLossEvents();
      if (lossRes?.length) setEventData(mapLossRes(lossRes as unknown as Record<string, unknown>[]));
    } catch { /* keep current */ }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const lossRes = await getLossEvents();
        if (lossRes?.length) setEventData(mapLossRes(lossRes as unknown as Record<string, unknown>[]));
      } catch { /* demo fallback */ } finally { setLoading(false); }
    }
    loadData();
  }, []);

  async function handleCreate() {
    if (!validateForm()) return;
    try {
      await createLossEvent(form);
      showToast('אירוע נוצר בהצלחה');
      setShowCreate(false);
      setForm(EMPTY_FORM);
      await reloadEvents();
    } catch { showToast('שגיאה ביצירת אירוע', 'error'); }
  }

  async function handleEdit() {
    if (!editEvent?.dbId) return;
    if (!validateForm()) return;
    try {
      await updateLossEvent(editEvent.dbId, form);
      showToast('אירוע עודכן בהצלחה');
      setEditEvent(null);
      setForm(EMPTY_FORM);
      await reloadEvents();
    } catch { showToast('שגיאה בעדכון אירוע', 'error'); }
  }

  async function handleDelete() {
    if (!deleteTarget?.dbId) return;
    const prev = [...eventData];
    setEventData(eventData.filter(e => e.dbId !== deleteTarget.dbId));
    setDeleteTarget(null);
    try {
      await deleteLossEvent(deleteTarget.dbId);
      showToast('אירוע נמחק');
    } catch { setEventData(prev); showToast('שגיאה במחיקה', 'error'); }
  }

  function openEdit(evt: LossEvent) {
    setForm({
      title: evt.title,
      description: evt.dbDescription ?? '',
      category: evt.dbCategory ?? 'operational',
      amountNis: evt.dbAmountNis ?? '',
      eventDate: evt.dbEventDate ?? '',
      rootCause: evt.dbRootCause ?? '',
      correctiveActions: evt.dbCorrectiveActions ?? '',
    });
    setEditEvent(evt);
  }

  const [filter, setFilter] = useState<'all' | EventStatus>('all');

  const filteredEvents = filter === 'all' ? eventData : eventData.filter((e) => e.status === filter);

  const openEvents = eventData.filter(e => e.status === 'פתוח').length;
  const kpis = [
    { label: 'סה"כ אירועים', value: String(eventData.length), icon: FileWarning, color: C.accent },
    { label: 'סה"כ הפסדים', value: '₪412K', icon: TrendingUp, color: C.danger },
    { label: 'אירועים פתוחים', value: String(openEvents), icon: AlertTriangle, color: C.warning },
    { label: 'זמן טיפול ממוצע', value: '4.2 ימים', icon: Clock, color: C.accentTeal },
  ];

  const trendData = [
    { month: 'ספט', count: 1 },
    { month: 'אוק', count: 2 },
    { month: 'נוב', count: 1 },
    { month: 'דצמ', count: 3 },
    { month: 'ינו', count: 2 },
    { month: 'פבר', count: 3 },
  ];
  const maxCount = Math.max(...trendData.map((d) => d.count));

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'var(--font-assistant)', background: C.surface, color: C.text };
  const labelStyle = { fontSize: 12, fontWeight: 600 as const, color: C.textSec, display: 'block' as const, marginBottom: 4, fontFamily: 'var(--font-rubik)' };

  if (loading) return <PageSkeleton />;

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-assistant)', color: C.text, padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileWarning size={24} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, margin: 0, color: C.text }}>
              דיווח אירועים
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: C.proBg, color: C.pro, fontSize: 11, fontWeight: 700,
              padding: '2px 10px', borderRadius: 20,
            }}>
              <Crown size={12} />
              PRO
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: C.textSec }}>
            Event Reporting &middot; ניהול ומעקב אחר אירועי הפסד
          </p>
        </div>
      </div>

      {/* Regulation Badge */}
      <div style={{ marginBottom: 24 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 600,
          padding: '4px 12px', borderRadius: 20,
        }}>
          <BookOpen size={14} />
          חוזר 2024-10-2 §5
        </span>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.textSec, fontWeight: 500 }}>{kpi.label}</span>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <span style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, color: C.text }}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Trend Mini-Chart */}
      <div style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <TrendingUp size={20} color={C.accent} />
          <h2 style={{ fontFamily: 'var(--font-rubik)', fontSize: 20, fontWeight: 600, margin: 0, color: C.text }}>
            מגמת אירועים (6 חודשים)
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 120, padding: '0 20px' }}>
          {trendData.map((d) => (
            <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{d.count}</span>
              <div style={{
                width: '100%', maxWidth: 48,
                height: `${(d.count / maxCount) * 80}px`,
                background: C.accentGrad, borderRadius: 6,
                minHeight: 8,
              }} />
              <span style={{ fontSize: 11, color: C.textSec }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Log Table */}
      <div style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <FileWarning size={20} color={C.warning} />
          <h2 style={{ fontFamily: 'var(--font-rubik)', fontSize: 20, fontWeight: 600, margin: 0, color: C.text }}>
            יומן אירועים
          </h2>
          <div style={{ marginRight: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {(['all', 'פתוח', 'בטיפול', 'סגור'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-assistant)',
                  background: filter === f ? C.accent : C.surface,
                  color: filter === f ? '#fff' : C.textSec,
                  transition: 'all 0.2s',
                }}
              >
                {f === 'all' ? 'הכל' : f}
              </button>
            ))}
            <button onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={14} /> הוסף אירוע
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>מזהה</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: C.textSec, fontWeight: 600 }}>כותרת</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>סכום</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>תאריך</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>קטגוריה</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>סטטוס</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => (
                <tr key={evt.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.accent }}>
                    {evt.id}
                  </td>
                  <td style={{ padding: '12px', color: C.text }}>{evt.title}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.text }}>
                    {evt.amount}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.textSec }}>{evt.date}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600, background: C.accentLight, color: C.accent,
                    }}>
                      {evt.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: getStatusBg(evt.status), color: getStatusColor(evt.status),
                    }}>
                      {evt.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button onClick={() => openEdit(evt)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                        <Pencil size={12} color={C.accent} />
                      </button>
                      <button onClick={() => setDeleteTarget(evt)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                        <Trash2 size={12} color={C.danger} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulation Traceability Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '16px 0', borderTop: `1px solid ${C.borderLight}`, color: C.textMuted, fontSize: 12,
      }}>
        <BookOpen size={14} />
        <span>עקיבות רגולטורית: חוזר 2024-10-2, §5, OPS-02</span>
        <ExternalLink size={12} />
      </div>

      {/* Create Event Modal */}
      <FormModal open={showCreate} title="הוספת אירוע הפסד" onClose={() => setShowCreate(false)} onSubmit={handleCreate} hideFooter>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>כותרת *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ ...inputStyle, ...(formErrors.title ? { borderColor: C.danger } : {}) }} />
            {formErrors.title && <div style={{ fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>{formErrors.title}</div>}
          </div>
          <div>
            <label style={labelStyle}>תיאור</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>קטגוריה *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                {CATEGORY_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>סכום (₪)</label>
              <input type="number" value={form.amountNis} onChange={e => setForm(p => ({ ...p, amountNis: e.target.value }))} style={{ ...inputStyle, fontFamily: 'var(--font-rubik)' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>תאריך אירוע *</label>
            <input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} style={{ ...inputStyle, fontFamily: 'var(--font-rubik)', ...(formErrors.eventDate ? { borderColor: C.danger } : {}) }} />
            {formErrors.eventDate && <div style={{ fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>{formErrors.eventDate}</div>}
          </div>
          <div>
            <label style={labelStyle}>סיבת שורש</label>
            <textarea value={form.rootCause} onChange={e => setForm(p => ({ ...p, rootCause: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div>
            <label style={labelStyle}>פעולות מתקנות</label>
            <textarea value={form.correctiveActions} onChange={e => setForm(p => ({ ...p, correctiveActions: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 4 }}>
            <button onClick={handleCreate} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>שמור</button>
            <button onClick={() => setShowCreate(false)} style={{ background: C.surface, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>ביטול</button>
          </div>
        </div>
      </FormModal>

      {/* Edit Event Modal */}
      <FormModal open={!!editEvent} title="עריכת אירוע הפסד" onClose={() => setEditEvent(null)} onSubmit={handleEdit} hideFooter>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>כותרת *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ ...inputStyle, ...(formErrors.title ? { borderColor: C.danger } : {}) }} />
            {formErrors.title && <div style={{ fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>{formErrors.title}</div>}
          </div>
          <div>
            <label style={labelStyle}>תיאור</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>קטגוריה *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                {CATEGORY_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>סכום (₪)</label>
              <input type="number" value={form.amountNis} onChange={e => setForm(p => ({ ...p, amountNis: e.target.value }))} style={{ ...inputStyle, fontFamily: 'var(--font-rubik)' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>תאריך אירוע *</label>
            <input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} style={{ ...inputStyle, fontFamily: 'var(--font-rubik)', ...(formErrors.eventDate ? { borderColor: C.danger } : {}) }} />
            {formErrors.eventDate && <div style={{ fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>{formErrors.eventDate}</div>}
          </div>
          <div>
            <label style={labelStyle}>סיבת שורש</label>
            <textarea value={form.rootCause} onChange={e => setForm(p => ({ ...p, rootCause: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div>
            <label style={labelStyle}>פעולות מתקנות</label>
            <textarea value={form.correctiveActions} onChange={e => setForm(p => ({ ...p, correctiveActions: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 4 }}>
            <button onClick={handleEdit} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>עדכן</button>
            <button onClick={() => setEditEvent(null)} style={{ background: C.surface, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>ביטול</button>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <FormModal open={!!deleteTarget} title="מחיקת אירוע" onClose={() => setDeleteTarget(null)} onSubmit={handleDelete} hideFooter>
        <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: '0 0 16px' }}>
          למחוק את האירוע <strong>&quot;{deleteTarget?.title}&quot;</strong>?
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
          <button onClick={handleDelete} style={{ background: C.danger, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>מחק</button>
          <button onClick={() => setDeleteTarget(null)} style={{ background: C.surface, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>ביטול</button>
        </div>
      </FormModal>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? C.success : C.danger, color: 'white', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-rubik)', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
