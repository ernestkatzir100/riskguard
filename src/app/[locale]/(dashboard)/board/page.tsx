'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase, BookOpen, Calendar, Clock, CheckCircle2,
  Mail, Users, FileText, AlertCircle, ChevronLeft, Pencil, Trash2,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { getBoardMeetings, createBoardMeeting, updateBoardMeeting, deleteBoardMeeting } from '@/app/actions/board';
import { FormModal } from '@/shared/components/form-modal';
import { MeetingForm } from '@/shared/components/forms/meeting-form';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { EmptyState, EMPTY_STATES } from '@/shared/components/empty-state';

/* ═══ Board Members ═══ */
const MEMBERS = [
  { name: 'רונית אברהם', role: 'יו"ר דירקטוריון', since: 2021, email: 'ronit@credit-finance.co.il' },
  { name: 'אבי מזרחי', role: 'דירקטור עצמאי', since: 2020, email: 'avi.m@credit-finance.co.il' },
  { name: 'מירי שרון', role: 'דירקטורית', since: 2022, email: 'miri@credit-finance.co.il' },
];

/* ═══ Meetings ═══ */
type Meeting = {
  date: string;
  dateShort: string;
  type: string;
  status: 'בוצע' | 'מתוכנן';
  minutes: string | null;
  decisions: { total: number; done: number; active: number } | null;
  agenda: string[] | null;
};

const MEETINGS: Meeting[] = [
  {
    date: '15 בינואר 2026',
    dateShort: '15/01/2026',
    type: 'ועדת סיכונים',
    status: 'בוצע' as const,
    minutes: 'הועלה',
    decisions: { total: 3, done: 2, active: 1 },
    agenda: null,
  },
  {
    date: '20 באפריל 2026',
    dateShort: '20/04/2026',
    type: 'דירקטוריון — סיכונים',
    status: 'מתוכנן' as const,
    minutes: null,
    decisions: null,
    agenda: ['דוח ציות Q1', 'סקירת KRI', 'עדכון BCP', 'מעקב החלטות'],
  },
];

/* ═══ Pending Approvals ═══ */
const APPROVALS = [
  {
    id: 'APR-01',
    type: 'חידוש מדיניות',
    title: 'חידוש מדיניות ניהול סיכונים',
    status: 'ממתין לאישור דירקטוריון',
    statusType: 'warning' as const,
    dueDate: '01/03/2026',
  },
  {
    id: 'APR-02',
    type: 'דוח רבעוני',
    title: 'דוח ציות רבעוני Q1/2026',
    status: 'בהכנה',
    statusType: 'info' as const,
    dueDate: '15/04/2026',
  },
];

const STATUS_STYLE = {
  'בוצע': { c: C.success, bg: C.successBg },
  'מתוכנן': { c: '#0369A1', bg: '#E0F2FE' },
};

const APPROVAL_STATUS_STYLE = {
  warning: { c: C.warning, bg: C.warningBg },
  info: { c: C.accent, bg: C.accentLight },
};

export default function BoardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(MEETINGS);
  const [loading, setLoading] = useState(true);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [editMeeting, setEditMeeting] = useState<(Meeting & { id?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<(Meeting & { id?: string }) | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadData() {
    try {
      const result = await getBoardMeetings();
      if (result && Array.isArray(result) && result.length > 0) {
        const mapped = result.map((m: Record<string, unknown>) => ({
          id: String(m.id ?? ''),
          date: m.date ? new Date(m.date as string).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : String(m.date ?? ''),
          dateShort: m.date ? new Date(m.date as string).toLocaleDateString('he-IL') : '',
          dateRaw: m.date ? new Date(m.date as string).toISOString().split('T')[0] : '',
          type: String(m.meetingType ?? m.type ?? ''),
          status: (m.status === 'completed' ? 'בוצע' : 'מתוכנן') as 'בוצע' | 'מתוכנן',
          minutes: null,
          decisions: null,
          agenda: Array.isArray(m.agenda) ? m.agenda as string[] : null,
          quarter: String(m.quarter ?? ''),
        }));
        setMeetings(mapped);
      }
    } catch { /* fallback to demo */ } finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  if (loading) return <PageSkeleton />;
  if (meetings.length === 0) return <EmptyState {...EMPTY_STATES['board']} />;

  return (
    <>
    <div style={{ direction: 'rtl' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={20} color={C.accent} /> ניהול דירקטוריון
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            חברי דירקטוריון · ישיבות · החלטות · אישורים
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowAddMeeting(true)} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5 }}>
            + ישיבה חדשה
          </button>
          <div style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> חוזר 2024-10-2 §2(א)
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'ישיבות השנה', value: 4, c: C.accent },
          { label: 'בוצעו', value: 1, c: C.success },
          { label: 'החלטות פתוחות', value: 1, c: C.warning },
          { label: 'אישורים ממתינים', value: 2, c: C.danger },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center', borderTop: `3px solid ${kpi.c}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Board Members ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} color={C.accent} /> חברי דירקטוריון ({MEMBERS.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {MEMBERS.map((m, i) => {
            const initials = m.name.split(' ').map(w => w[0]).join('');
            return (
              <div key={i} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: C.accentGrad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-rubik)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                {/* Name & Role */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>{m.role}</div>
                </div>
                {/* Tenure */}
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                  מכהן/ת מאז {m.since}
                </div>
                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textSec, fontFamily: 'var(--font-rubik)', direction: 'ltr' as const }}>
                  <Mail size={10} color={C.textMuted} />
                  {m.email}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two-Column: Meetings Timeline + Pending Approvals ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Meeting Timeline */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color={C.accent} /> ציר ישיבות
          </h3>

          {meetings.map((mtg, i) => {
            const sts = STATUS_STYLE[mtg.status];
            const isLast = mtg.status === 'בוצע';
            return (
              <div key={i} style={{
                position: 'relative',
                paddingRight: 24,
                paddingBottom: i < meetings.length - 1 ? 20 : 0,
                marginBottom: i < meetings.length - 1 ? 12 : 0,
                borderBottom: i < meetings.length - 1 ? `1px solid ${C.borderLight}` : 'none',
              }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', right: 0, top: 4,
                  width: 12, height: 12, borderRadius: '50%',
                  background: isLast ? C.success : C.accent,
                  border: `2px solid ${isLast ? C.successBg : C.accentLight}`,
                }} />
                {/* Timeline line */}
                {i < meetings.length - 1 && (
                  <div style={{
                    position: 'absolute', right: 5, top: 18,
                    width: 2, height: 'calc(100% - 14px)',
                    background: C.borderLight,
                  }} />
                )}

                {/* Content */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>{mtg.type}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{mtg.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => setEditMeeting(mtg)} title="ערוך" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                      <Pencil size={11} color={C.textSec} />
                    </button>
                    <button onClick={() => setDeleteTarget(mtg)} title="מחק" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                      <Trash2 size={11} color={C.danger} />
                    </button>
                    <span style={{ background: sts.bg, color: sts.c, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>
                      {mtg.status}
                    </span>
                  </div>
                </div>

                {/* Last meeting details */}
                {isLast && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>פרוטוקול:</span>
                      <span style={{ background: C.successBg, color: C.success, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                        <CheckCircle2 size={9} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 3 }} />
                        {mtg.minutes}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>החלטות:</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                        {mtg.decisions!.total}
                      </span>
                      <span style={{ background: C.successBg, color: C.success, fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                        {mtg.decisions!.done} בוצעו
                      </span>
                      <span style={{ background: C.warningBg, color: C.warning, fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                        {mtg.decisions!.active} פעילה
                      </span>
                    </div>
                  </div>
                )}

                {/* Next meeting details */}
                {!isLast && mtg.agenda && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 6 }}>סדר יום:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {mtg.agenda.map((item, ai) => (
                        <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                          <ChevronLeft size={10} color={C.accent} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pending Approvals */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} color={C.warning} /> אישורים ממתינים ({APPROVALS.length})
          </h3>

          {APPROVALS.map((appr, i) => {
            const sts = APPROVAL_STATUS_STYLE[appr.statusType];
            return (
              <div key={appr.id} style={{
                background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '14px 16px', marginBottom: i < APPROVALS.length - 1 ? 10 : 0,
              }}>
                {/* Type badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ background: C.accentLight, color: C.accent, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>
                    {appr.type}
                  </span>
                  <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{appr.id}</span>
                </div>

                {/* Title */}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8 }}>
                  {appr.title}
                </div>

                {/* Status + Due */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: sts.bg, color: sts.c, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, fontFamily: 'var(--font-rubik)' }}>
                    {appr.status}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                    <Clock size={10} />
                    {appr.dueDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Traceability Footer ── */}
      <div style={{ marginTop: 16, padding: '10px 14px', background: C.borderLight, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileText size={11} color={C.textMuted} />
        <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
          עקיבות: (2024-10-2, §2(א), GOV-04)
        </span>
      </div>
    </div>
    <FormModal
      open={showAddMeeting}
      onClose={() => setShowAddMeeting(false)}
      title="ישיבה חדשה"
      onSubmit={() => {}}
      hideFooter
    >
      <MeetingForm
        mode="create"
        onSubmit={async (data) => {
          try {
            await createBoardMeeting({ ...data, agenda: data.agenda ? data.agenda.split('\n').filter(Boolean) : [], attendees: data.attendees ? data.attendees.split('\n').filter(Boolean) : [] });
            setShowAddMeeting(false);
            await loadData();
            showToast('הישיבה נוספה בהצלחה');
          } catch {
            showToast('שגיאה ביצירת הישיבה', 'error');
          }
        }}
        onCancel={() => setShowAddMeeting(false)}
      />
    </FormModal>

    {/* Edit Meeting Modal */}
    <FormModal
      open={!!editMeeting}
      onClose={() => setEditMeeting(null)}
      title="עריכת ישיבה"
      onSubmit={() => {}}
      hideFooter
    >
      {editMeeting && (
        <MeetingForm
          mode="edit"
          initialData={{
            meetingType: editMeeting.type,
            date: (editMeeting as Record<string, unknown>).dateRaw as string ?? '',
            quarter: (editMeeting as Record<string, unknown>).quarter as string ?? '',
            agenda: editMeeting.agenda?.join('\n') ?? '',
            attendees: '',
          }}
          onSubmit={async (data) => {
            try {
              const id = (editMeeting as Record<string, unknown>).id as string;
              if (id) {
                await updateBoardMeeting(id, { ...data, agenda: data.agenda ? data.agenda.split('\n').filter(Boolean) : [], attendees: data.attendees ? data.attendees.split('\n').filter(Boolean) : [] });
              }
              setEditMeeting(null);
              await loadData();
              showToast('הישיבה עודכנה בהצלחה');
            } catch {
              showToast('שגיאה בעדכון הישיבה', 'error');
            }
          }}
          onCancel={() => setEditMeeting(null)}
        />
      )}
    </FormModal>

    {/* Delete Confirmation */}
    <FormModal
      open={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      title="מחיקת ישיבה"
      onSubmit={async () => {
        if (!deleteTarget) return;
        const prev = [...meetings];
        setMeetings(m => m.filter(x => x !== deleteTarget));
        setDeleteTarget(null);
        try {
          const id = (deleteTarget as Record<string, unknown>).id as string;
          if (id) await deleteBoardMeeting(id);
          showToast('הישיבה נמחקה בהצלחה');
        } catch {
          setMeetings(prev);
          showToast('שגיאה במחיקת הישיבה', 'error');
        }
      }}
      submitLabel="מחק"
    >
      <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: 0 }}>
        האם למחוק את הישיבה <strong>&quot;{deleteTarget?.type}&quot;</strong>?
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
    </>
  );
}
