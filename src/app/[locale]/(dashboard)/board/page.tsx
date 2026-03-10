'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Calendar, CheckCircle2, Clock, Users, FileText, AlertCircle,
  ChevronDown, Plus, Pencil, Trash2, Eye, Download, BarChart3, BookOpen,
  Target, ArrowUpRight, Filter, RefreshCw, Link2, UserCheck, XCircle,
  Layers, Settings, ChevronLeft, ListChecks, FolderOpen, Building2,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import {
  getBoardDashboardData, getBoardMeetings, getCommittees, getTopics,
  getActionItems, getDirectors, getCommitteeMembers, getAgendaItems,
  createBoardMeeting, updateBoardMeeting, deleteBoardMeeting, updateMeetingStage,
  createCommittee, updateCommittee, deleteCommittee, addCommitteeMember, removeCommitteeMember,
  createTopic, updateTopic, deactivateTopic,
  createAgendaItem, updateAgendaItem, deleteAgendaItem,
  createActionItem, updateActionItem, syncActionItemToTask,
  upsertAttendance, getAttendance, getApprovals, createApprovals,
  seedBoardDefaults, createDirector, uploadDocument, getDocuments,
} from '@/app/actions/board';
import { FormModal } from '@/shared/components/form-modal';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { ReportDownloadButtons } from '@/shared/components/report-download-buttons';
import { generateBoardReport } from '@/app/actions/report-generate';

/* ═══ Types ═══ */
type Tab = 'dashboard' | 'meetings' | 'actions' | 'topics' | 'committees';
type Committee = { id: string; name: string; type: string; quorumMinimum: number; meetingFrequency: string | null; isActive: boolean };
type Director = { id: string; fullName: string; email: string | null; phone: string | null; role: string; appointmentDate: string | null; active: boolean };
type Topic = { id: string; title: string; group: string; interval: string; committeeId: string | null; regulationRef: string | null; isActive: boolean };
type Meeting = Record<string, unknown>;
type ActionItem = Record<string, unknown>;

/* ═══ Constants ═══ */
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'לוח בקרה', icon: <BarChart3 size={14} /> },
  { key: 'meetings', label: 'ישיבות', icon: <Calendar size={14} /> },
  { key: 'actions', label: 'משימות ועוקבות', icon: <ListChecks size={14} /> },
  { key: 'topics', label: 'ספריית נושאים', icon: <FolderOpen size={14} /> },
  { key: 'committees', label: 'ועדות', icon: <Building2 size={14} /> },
];

const GROUP_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  business: { label: 'עסקי', color: '#0369A1', bg: '#E0F2FE' },
  regulatory: { label: 'רגולטורי', color: '#7C3AED', bg: '#EDE9FE' },
  risk: { label: 'סיכונים', color: C.warning, bg: C.warningBg },
};

const INTERVAL_LABELS: Record<string, string> = {
  monthly: 'חודשי', quarterly: 'רבעוני', semi_annual: 'חצי שנתי', annual: 'שנתי', ad_hoc: 'לפי צורך',
};

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'טיוטה', color: C.textMuted, bg: C.borderLight },
  scheduled: { label: 'מתוכנן', color: '#0369A1', bg: '#E0F2FE' },
  in_progress: { label: 'בביצוע', color: C.warning, bg: C.warningBg },
  pending_approval: { label: 'ממתין לאישור', color: '#7C3AED', bg: '#EDE9FE' },
  approved: { label: 'מאושר', color: C.success, bg: C.successBg },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'גבוהה', color: C.danger, bg: C.dangerBg },
  medium: { label: 'בינונית', color: C.warning, bg: C.warningBg },
  low: { label: 'נמוכה', color: C.success, bg: C.successBg },
};

const ACTION_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'פתוח', color: '#0369A1', bg: '#E0F2FE' },
  in_progress: { label: 'בביצוע', color: C.warning, bg: C.warningBg },
  done: { label: 'הושלם', color: C.success, bg: C.successBg },
  overdue: { label: 'באיחור', color: C.danger, bg: C.dangerBg },
};

/* ═══ Shared UI helpers ═══ */
const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ background: bg, color, fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 6, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>{label}</span>
);

const KPICard = ({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      {icon}
      <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{label}</span>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'var(--font-rubik)' }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const SectionCard = ({ title, icon, children, actions }: { title: string; icon: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {title}
      </h3>
      {actions}
    </div>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'sm', disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'outline' | 'danger' | 'ghost'; size?: 'sm' | 'xs'; disabled?: boolean }) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: C.accentGrad, color: 'white', border: 'none' },
    outline: { background: 'none', color: C.textSec, border: `1px solid ${C.border}` },
    danger: { background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}33` },
    ghost: { background: 'none', color: C.textSec, border: 'none' },
  };
  const sz = size === 'xs' ? { padding: '3px 8px', fontSize: 10 } : { padding: '6px 14px', fontSize: 11 };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...sz, borderRadius: 7, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4, opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
};

const InputField = ({ label, value, onChange, type = 'text', placeholder, required, as }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; as?: 'textarea' | 'select' }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
      {label} {required && <span style={{ color: C.danger }}>*</span>}
    </label>
    {as === 'textarea' ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-assistant)', direction: 'rtl', resize: 'vertical' }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-assistant)', direction: type === 'date' || type === 'time' ? 'ltr' : 'rtl' }} />
    )}
  </div>
);

const SelectField = ({ label, value, onChange, options, required }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
      {label} {required && <span style={{ color: C.danger }}>*</span>}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-assistant)', direction: 'rtl', background: C.surface }}>
      <option value="">בחר...</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

/* ═══════════════════════════════════════════════ */
/* MAIN PAGE                                       */
/* ═══════════════════════════════════════════════ */

export default function BoardPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Global data
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [dashData, setDashData] = useState<Record<string, unknown> | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadAll = useCallback(async () => {
    try {
      const [c, d, t, m, a, dd] = await Promise.all([
        getCommittees(), getDirectors(), getTopics(), getBoardMeetings(), getActionItems(), getBoardDashboardData(),
      ]);
      setCommittees(c as Committee[]);
      setAllDirectors(d as Director[]);
      setTopics(t as Topic[]);
      setMeetings(m as Meeting[]);
      setActions(a as ActionItem[]);
      setDashData(dd as Record<string, unknown>);
    } catch { /* fallback */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedBoardDefaults();
      await loadAll();
      showToast('נתוני ברירת מחדל נטענו בהצלחה');
    } catch { showToast('שגיאה בטעינת נתונים', 'error'); }
    setSeeding(false);
  }

  if (loading) return <PageSkeleton />;

  const isEmpty = committees.length === 0 && meetings.length === 0;

  return (
    <>
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={20} color={C.accent} /> ניהול דירקטוריון
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            ועדות · ישיבות · החלטות · משימות · כיסוי רגולטורי
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isEmpty && (
            <Btn onClick={handleSeed} disabled={seeding}>
              <RefreshCw size={12} /> {seeding ? 'טוען...' : 'טען נתוני ברירת מחדל'}
            </Btn>
          )}
          <ReportDownloadButtons generateAction={generateBoardReport} filenameBase="board" />
          <div style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 10, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={11} /> 2024-10-2 §2(א)
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: C.borderLight, borderRadius: 10, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.key ? C.surface : 'transparent',
              color: tab === t.key ? C.accent : C.textMuted,
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 12, fontFamily: 'var(--font-rubik)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              transition: 'all 0.15s',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'dashboard' && <DashboardTab data={dashData} meetings={meetings} actions={actions} committees={committees} directors={allDirectors} />}
      {tab === 'meetings' && <MeetingsTab meetings={meetings} committees={committees} directors={allDirectors} topics={topics} onReload={loadAll} showToast={showToast} />}
      {tab === 'actions' && <ActionItemsTab actions={actions} meetings={meetings} committees={committees} onReload={loadAll} showToast={showToast} />}
      {tab === 'topics' && <TopicsTab topics={topics} committees={committees} onReload={loadAll} showToast={showToast} />}
      {tab === 'committees' && <CommitteesTab committees={committees} directors={allDirectors} onReload={loadAll} showToast={showToast} />}
    </div>

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

/* ═══════════════════════════════════════════════ */
/* TAB 1: DASHBOARD                                */
/* ═══════════════════════════════════════════════ */

function DashboardTab({ data, meetings, actions, committees, directors }: {
  data: Record<string, unknown> | null; meetings: Meeting[]; actions: ActionItem[];
  committees: Committee[]; directors: Director[];
}) {
  const dd = data || {};
  const nextMeeting = dd.nextMeeting as Meeting | null;
  const openActions = (dd.openActionItems as number) || 0;
  const overdueActions = (dd.overdueActionItems as number) || 0;
  const meetingsThisYear = (dd.meetingsThisYear as number) || 0;
  const approvedMeetings = (dd.approvedMeetings as number) || 0;
  const totalTopics = (dd.totalTopics as number) || 0;
  const regTopics = (dd.regulatoryTopics as number) || 0;

  const approvalPct = meetingsThisYear > 0 ? Math.round((approvedMeetings / meetingsThisYear) * 100) : 0;
  const now = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KPICard label="ישיבה הבאה" value={nextMeeting ? new Date(nextMeeting.date as string).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }) : '—'}
          sub={nextMeeting ? String(nextMeeting.meetingType || '') : 'אין ישיבות מתוכננות'} color={C.accent} icon={<Calendar size={14} color={C.accent} />} />
        <KPICard label="משימות פתוחות" value={openActions}
          sub={overdueActions > 0 ? `${overdueActions} באיחור` : 'הכל בזמן'} color={overdueActions > 0 ? C.danger : C.success} icon={<ListChecks size={14} color={overdueActions > 0 ? C.danger : C.success} />} />
        <KPICard label="אחוז אישורים" value={`${approvalPct}%`}
          sub={`${approvedMeetings} מתוך ${meetingsThisYear} ישיבות`} color={approvalPct >= 80 ? C.success : C.warning} icon={<CheckCircle2 size={14} color={approvalPct >= 80 ? C.success : C.warning} />} />
        <KPICard label="כיסוי רגולטורי" value={totalTopics > 0 ? `${regTopics}/${totalTopics}` : '—'}
          sub="נושאים רגולטוריים מכוסים" color={C.accent} icon={<Target size={14} color={C.accent} />} />
      </div>

      {/* Meeting Timeline */}
      <SectionCard title="ציר ישיבות — השנה" icon={<Calendar size={14} color={C.accent} />}>
        {meetings.length === 0 ? (
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>אין ישיבות עדיין</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {meetings.slice(0, 8).map((m, i) => {
              const stage = STAGE_LABELS[String(m.stage || 'draft')] || STAGE_LABELS.draft;
              const committee = committees.find(c => c.id === m.committeeId);
              return (
                <div key={i} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', borderRight: `3px solid ${stage.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      {String(m.meetingType || '')}
                    </span>
                    <Badge label={stage.label} color={stage.color} bg={stage.bg} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
                    {m.date ? new Date(String(m.date)).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    {m.time ? ` · ${m.time}` : ''}
                  </div>
                  {committee && <div style={{ fontSize: 10, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{committee.name}</div>}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Open Action Items */}
      <SectionCard title={`משימות פתוחות (${openActions})`} icon={<AlertCircle size={14} color={C.warning} />}>
        {actions.filter(a => a.status === 'open' || a.status === 'in_progress').length === 0 ? (
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>אין משימות פתוחות</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.filter(a => a.status === 'open' || a.status === 'in_progress').slice(0, 10).map((a, i) => {
              const pr = PRIORITY_LABELS[String(a.priority || 'medium')] || PRIORITY_LABELS.medium;
              const st = ACTION_STATUS_LABELS[String(a.status || 'open')] || ACTION_STATUS_LABELS.open;
              const isOverdue = a.dueDate && String(a.dueDate) < now;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: isOverdue ? C.dangerBg : C.borderLight, border: `1px solid ${isOverdue ? C.danger + '33' : C.border}`, borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{String(a.title)}</span>
                  {!!a.ownerName && <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{String(a.ownerName)}</span>}
                  {!!a.dueDate && <span style={{ fontSize: 10, color: isOverdue ? C.danger : C.textMuted, fontFamily: 'var(--font-rubik)' }}>{new Date(String(a.dueDate)).toLocaleDateString('he-IL')}</span>}
                  <Badge label={pr.label} color={pr.color} bg={pr.bg} />
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Director Participation */}
      <SectionCard title="השתתפות דירקטורים" icon={<Users size={14} color={C.accent} />}>
        {directors.length === 0 ? (
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>אין דירקטורים</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {directors.map((d, i) => {
              const allAtt = ((dd.allAttendance || []) as { directorId: string; attended: boolean }[]);
              const dirAtt = allAtt.filter(a => a.directorId === d.id);
              const attended = dirAtt.filter(a => a.attended).length;
              const total = dirAtt.length;
              const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
              return (
                <div key={i} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-rubik)', flexShrink: 0 }}>
                    {d.fullName.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{d.fullName}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{d.role}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: pct >= 80 ? C.success : pct >= 50 ? C.warning : C.danger, fontFamily: 'var(--font-rubik)' }}>
                    {total > 0 ? `${pct}%` : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </>
  );
}

/* ═══════════════════════════════════════════════ */
/* TAB 2: MEETINGS                                 */
/* ═══════════════════════════════════════════════ */

function MeetingsTab({ meetings, committees, directors, topics, onReload, showToast }: {
  meetings: Meeting[]; committees: Committee[]; directors: Director[]; topics: Topic[];
  onReload: () => Promise<void>; showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);
  const [filterCommittee, setFilterCommittee] = useState('');

  // Create form state
  const [fType, setFType] = useState('');
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('');
  const [fCommittee, setFCommittee] = useState('');
  const [fLocation, setFLocation] = useState('');
  const [fLocationType, setFLocationType] = useState('פיזי');
  const [fQuarter, setFQuarter] = useState('');

  const filtered = filterCommittee ? meetings.filter(m => m.committeeId === filterCommittee) : meetings;

  async function handleCreate() {
    if (!fType || !fDate) return;
    try {
      await createBoardMeeting({ meetingType: fType, date: fDate, time: fTime || undefined, committeeId: fCommittee || undefined, location: fLocation || undefined, locationType: fLocationType || undefined, quarter: fQuarter || undefined });
      setShowCreate(false);
      setFType(''); setFDate(''); setFTime(''); setFCommittee(''); setFLocation(''); setFQuarter('');
      await onReload();
      showToast('הישיבה נוצרה בהצלחה');
    } catch { showToast('שגיאה ביצירת ישיבה', 'error'); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBoardMeeting(id);
      await onReload();
      showToast('הישיבה נמחקה');
    } catch { showToast('שגיאה במחיקה', 'error'); }
  }

  async function handleStageChange(id: string, stage: string) {
    try {
      await updateMeetingStage(id, stage as 'draft' | 'scheduled' | 'in_progress' | 'pending_approval' | 'approved');
      await onReload();
      showToast('הסטטוס עודכן');
    } catch { showToast('שגיאה', 'error'); }
  }

  return (
    <>
      {/* Filter + Create */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={13} color={C.textMuted} />
          <select value={filterCommittee} onChange={e => setFilterCommittee(e.target.value)}
            style={{ padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11, fontFamily: 'var(--font-rubik)', background: C.surface, direction: 'rtl' }}>
            <option value="">כל הוועדות</option>
            {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Btn onClick={() => setShowCreate(true)}><Plus size={12} /> ישיבה חדשה</Btn>
      </div>

      {/* Meeting Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.textMuted, fontSize: 13, fontFamily: 'var(--font-assistant)' }}>אין ישיבות</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((m, i) => {
            const stage = STAGE_LABELS[String(m.stage || 'draft')] || STAGE_LABELS.draft;
            const committee = committees.find(c => c.id === m.committeeId);
            return (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', borderRight: `4px solid ${stage.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>{String(m.meetingType)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                      <span><Calendar size={11} /> {m.date ? new Date(String(m.date)).toLocaleDateString('he-IL') : ''}</span>
                      {!!m.time && <span><Clock size={11} /> {String(m.time)}</span>}
                      {committee && <span style={{ color: C.accent }}>{committee.name}</span>}
                      {!!m.location && <span>{String(m.location)}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge label={stage.label} color={stage.color} bg={stage.bg} />
                    {!!m.quorumMet && <Badge label="מניין חוקי" color={C.success} bg={C.successBg} />}
                    <Btn variant="ghost" size="xs" onClick={() => setViewMeeting(m)}><Eye size={12} /></Btn>
                    <Btn variant="ghost" size="xs" onClick={() => handleDelete(String(m.id))}><Trash2 size={12} color={C.danger} /></Btn>
                  </div>
                </div>

                {/* Stage Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {m.stage === 'draft' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(String(m.id), 'scheduled')}>העבר למתוכנן</Btn>}
                  {m.stage === 'scheduled' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(String(m.id), 'in_progress')}>התחל ישיבה</Btn>}
                  {m.stage === 'in_progress' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(String(m.id), 'pending_approval')}>שלח לאישור</Btn>}
                  {m.stage === 'pending_approval' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(String(m.id), 'approved')}><CheckCircle2 size={11} /> אשר פרוטוקול</Btn>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Meeting Modal */}
      <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="ישיבה חדשה" onSubmit={handleCreate} submitLabel="צור ישיבה">
        <InputField label="סוג ישיבה" value={fType} onChange={setFType} placeholder="ישיבת דירקטוריון רבעונית" required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="תאריך" value={fDate} onChange={setFDate} type="date" required />
          <InputField label="שעה" value={fTime} onChange={setFTime} type="time" />
        </div>
        <SelectField label="ועדה" value={fCommittee} onChange={setFCommittee}
          options={committees.map(c => ({ value: c.id, label: c.name }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="מיקום" value={fLocation} onChange={setFLocation} placeholder="חדר ישיבות ראשי" />
          <SelectField label="סוג מיקום" value={fLocationType} onChange={setFLocationType}
            options={[{ value: 'פיזי', label: 'פיזי' }, { value: 'זום', label: 'זום' }, { value: 'היברידי', label: 'היברידי' }]} />
        </div>
        <InputField label="רבעון" value={fQuarter} onChange={setFQuarter} placeholder="Q1/2026" />
      </FormModal>

      {/* View Meeting Modal */}
      {viewMeeting && (
        <MeetingDetailModal meeting={viewMeeting} committees={committees} directors={directors} topics={topics}
          onClose={() => { setViewMeeting(null); onReload(); }} showToast={showToast} />
      )}
    </>
  );
}

/* ═══ Meeting Detail Modal ═══ */
function MeetingDetailModal({ meeting: m, committees, directors, topics, onClose, showToast }: {
  meeting: Meeting; committees: Committee[]; directors: Director[]; topics: Topic[];
  onClose: () => void; showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [agendaItems, setAgendaItems] = useState<Record<string, unknown>[]>([]);
  const [attendance, setAttendance] = useState<Record<string, unknown>[]>([]);
  const [approvals, setApprovals] = useState<Record<string, unknown>[]>([]);
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [subTab, setSubTab] = useState<'agenda' | 'attendance' | 'approvals' | 'docs'>('agenda');
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [agTitle, setAgTitle] = useState('');
  const [agPresenter, setAgPresenter] = useState('');
  const [agMinutes, setAgMinutes] = useState('');
  const [agGroup, setAgGroup] = useState('');

  const mid = String(m.id);

  async function loadDetail() {
    const [ag, at, ap, dc] = await Promise.all([
      getAgendaItems(mid), getAttendance(mid), getApprovals(mid), getDocuments(mid),
    ]);
    setAgendaItems(ag as Record<string, unknown>[]);
    setAttendance(at as Record<string, unknown>[]);
    setApprovals(ap as Record<string, unknown>[]);
    setDocs(dc as Record<string, unknown>[]);
  }
  useEffect(() => { loadDetail(); }, []);

  const committee = committees.find(c => c.id === m.committeeId);
  const stage = STAGE_LABELS[String(m.stage || 'draft')] || STAGE_LABELS.draft;

  async function handleAddAgenda() {
    if (!agTitle) return;
    await createAgendaItem({ meetingId: mid, title: agTitle, presenter: agPresenter || undefined, estimatedMinutes: agMinutes ? parseInt(agMinutes) : undefined, group: (agGroup || undefined) as 'business' | 'regulatory' | 'risk' | undefined });
    setAgTitle(''); setAgPresenter(''); setAgMinutes(''); setAgGroup('');
    setShowAddAgenda(false);
    await loadDetail();
    showToast('נושא נוסף לסדר היום');
  }

  async function handleToggleAttendance(directorId: string, current: boolean) {
    await upsertAttendance(mid, directorId, !current);
    await loadDetail();
  }

  async function handleAgendaStatus(id: string, status: string) {
    await updateAgendaItem(id, { status: status as 'pending' | 'discussed' | 'postponed' | 'cancelled' });
    await loadDetail();
  }

  async function handleSendForApproval() {
    const dirIds = directors.map(d => d.id);
    await createApprovals(mid, dirIds);
    await updateMeetingStage(mid, 'pending_approval');
    await loadDetail();
    showToast('נשלח לאישור דירקטורים');
  }

  return (
    <FormModal open={true} onClose={onClose} title={`${String(m.meetingType)}`} onSubmit={() => {}} hideFooter>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge label={stage.label} color={stage.color} bg={stage.bg} />
          {committee && <Badge label={committee.name} color={C.accent} bg={C.accentLight} />}
          {!!m.date && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{new Date(String(m.date)).toLocaleDateString('he-IL')} {m.time ? `· ${String(m.time)}` : ''}</span>}
          {!!m.quorumMet && <Badge label="מניין חוקי" color={C.success} bg={C.successBg} />}
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {([['agenda', 'סדר יום'], ['attendance', 'נוכחות'], ['approvals', 'אישורים'], ['docs', 'מסמכים']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setSubTab(k)}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: subTab === k ? 700 : 500, fontFamily: 'var(--font-rubik)', background: subTab === k ? C.accentLight : C.borderLight, color: subTab === k ? C.accent : C.textMuted }}>
              {l}
            </button>
          ))}
        </div>

        {/* Agenda */}
        {subTab === 'agenda' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Btn size="xs" onClick={() => setShowAddAgenda(true)}><Plus size={11} /> הוסף נושא</Btn>
            </div>
            {agendaItems.length === 0 ? (
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', padding: 16, fontFamily: 'var(--font-assistant)' }}>אין נושאים בסדר היום</p>
            ) : agendaItems.map((ag, i) => {
              const grp = GROUP_LABELS[String(ag.group || '')] || null;
              const sts = String(ag.status || 'pending');
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)', width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{String(ag.title)}</span>
                  {!!ag.presenter && <span style={{ fontSize: 10, color: C.textMuted }}>{String(ag.presenter)}</span>}
                  {!!ag.estimatedMinutes && <span style={{ fontSize: 10, color: C.textMuted }}>{String(ag.estimatedMinutes)} דק׳</span>}
                  {grp && <Badge label={grp.label} color={grp.color} bg={grp.bg} />}
                  <select value={sts} onChange={e => handleAgendaStatus(String(ag.id), e.target.value)}
                    style={{ fontSize: 10, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'var(--font-rubik)', background: C.surface }}>
                    <option value="pending">ממתין</option>
                    <option value="discussed">נדון</option>
                    <option value="postponed">נדחה</option>
                    <option value="cancelled">בוטל</option>
                  </select>
                  <button onClick={async () => { await deleteAgendaItem(String(ag.id)); await loadDetail(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={12} color={C.danger} /></button>
                </div>
              );
            })}

            {showAddAgenda && (
              <div style={{ background: C.borderLight, borderRadius: 10, padding: 14, marginTop: 10, border: `1px solid ${C.border}` }}>
                <InputField label="נושא" value={agTitle} onChange={setAgTitle} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <InputField label="מציג" value={agPresenter} onChange={setAgPresenter} />
                  <InputField label="דקות" value={agMinutes} onChange={setAgMinutes} type="number" />
                  <SelectField label="קבוצה" value={agGroup} onChange={setAgGroup}
                    options={[{ value: 'business', label: 'עסקי' }, { value: 'regulatory', label: 'רגולטורי' }, { value: 'risk', label: 'סיכונים' }]} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Btn size="xs" onClick={handleAddAgenda}>הוסף</Btn>
                  <Btn size="xs" variant="outline" onClick={() => setShowAddAgenda(false)}>ביטול</Btn>
                </div>
              </div>
            )}

            {/* Send for approval button */}
            {m.stage === 'in_progress' && (
              <div style={{ marginTop: 14 }}>
                <Btn onClick={handleSendForApproval}><ArrowUpRight size={12} /> שלח פרוטוקול לאישור</Btn>
              </div>
            )}
          </div>
        )}

        {/* Attendance */}
        {subTab === 'attendance' && (
          <div>
            {directors.map((d, i) => {
              const att = attendance.find(a => (a as { directorId: string }).directorId === d.id);
              const isPresent = att ? (att as { attended: boolean }).attended : false;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                      {d.fullName.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{d.fullName}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{d.role}</div>
                    </div>
                  </div>
                  <button onClick={() => handleToggleAttendance(d.id, isPresent)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-rubik)', background: isPresent ? C.successBg : C.borderLight, color: isPresent ? C.success : C.textMuted }}>
                    {isPresent ? <><UserCheck size={12} /> נוכח/ת</> : <><XCircle size={12} /> לא נוכח/ת</>}
                  </button>
                </div>
              );
            })}
            <div style={{ marginTop: 10, padding: '8px 12px', background: C.borderLight, borderRadius: 8, fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
              נוכחים: {attendance.filter(a => (a as { attended: boolean }).attended).length} / {directors.length}
              {committee && ` | מניין נדרש: ${committee.quorumMinimum}%`}
            </div>
          </div>
        )}

        {/* Approvals */}
        {subTab === 'approvals' && (
          <div>
            {approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 10 }}>טרם נשלחו בקשות אישור</p>
                <Btn size="xs" onClick={handleSendForApproval}><ArrowUpRight size={11} /> שלח לאישור</Btn>
              </div>
            ) : approvals.map((ap, i) => {
              const st = String(ap.status || 'pending');
              const stStyle = st === 'approved' ? { color: C.success, bg: C.successBg } : st === 'rejected' ? { color: C.danger, bg: C.dangerBg } : { color: C.warning, bg: C.warningBg };
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{String((ap as { directorName?: string }).directorName || '')}</span>
                  <Badge label={st === 'approved' ? 'אישר' : st === 'rejected' ? 'דחה' : 'ממתין'} color={stStyle.color} bg={stStyle.bg} />
                </div>
              );
            })}
          </div>
        )}

        {/* Documents */}
        {subTab === 'docs' && (
          <div>
            {docs.length === 0 ? (
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', padding: 20, fontFamily: 'var(--font-assistant)' }}>אין מסמכים</p>
            ) : docs.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                <FileText size={14} color={C.accent} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{String(d.filename)}</span>
                {!!d.fileType && <Badge label={String(d.fileType)} color={C.textMuted} bg={C.borderLight} />}
                <a href={`data:application/octet-stream;base64,${String(d.fileData)}`} download={String(d.filename)}
                  style={{ fontSize: 10, color: C.accent, textDecoration: 'none', fontFamily: 'var(--font-rubik)' }}>
                  <Download size={12} /> הורד
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormModal>
  );
}

/* ═══════════════════════════════════════════════ */
/* TAB 3: ACTION ITEMS                             */
/* ═══════════════════════════════════════════════ */

function ActionItemsTab({ actions, meetings, committees, onReload, showToast }: {
  actions: ActionItem[]; meetings: Meeting[]; committees: Committee[];
  onReload: () => Promise<void>; showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fOwner, setFOwner] = useState('');
  const [fDue, setFDue] = useState('');
  const [fPriority, setFPriority] = useState('medium');
  const [fMeeting, setFMeeting] = useState('');
  const [fRegRef, setFRegRef] = useState('');

  const now = new Date().toISOString().split('T')[0];
  let filtered = [...actions];
  if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus);
  if (filterPriority) filtered = filtered.filter(a => a.priority === filterPriority);

  async function handleCreate() {
    if (!fTitle) return;
    await createActionItem({ title: fTitle, ownerName: fOwner || undefined, dueDate: fDue || undefined, priority: fPriority as 'high' | 'medium' | 'low', meetingId: fMeeting || undefined, linkedRegulationRef: fRegRef || undefined });
    setShowCreate(false);
    setFTitle(''); setFOwner(''); setFDue(''); setFPriority('medium'); setFMeeting(''); setFRegRef('');
    await onReload();
    showToast('משימה נוצרה');
  }

  async function handleStatusChange(id: string, status: string) {
    await updateActionItem(id, { status: status as 'open' | 'in_progress' | 'done' | 'overdue' });
    await onReload();
  }

  async function handleSync(id: string) {
    try {
      await syncActionItemToTask(id);
      await onReload();
      showToast('סונכרן למשימות');
    } catch { showToast('שגיאה בסנכרון', 'error'); }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={13} color={C.textMuted} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11, fontFamily: 'var(--font-rubik)', background: C.surface }}>
            <option value="">כל הסטטוסים</option>
            {Object.entries(ACTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            style={{ padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11, fontFamily: 'var(--font-rubik)', background: C.surface }}>
            <option value="">כל העדיפויות</option>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <Btn onClick={() => setShowCreate(true)}><Plus size={12} /> משימה חדשה</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        {Object.entries(ACTION_STATUS_LABELS).map(([k, v]) => {
          const count = actions.filter(a => a.status === k).length;
          return (
            <div key={k} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center', borderTop: `3px solid ${v.color}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: v.color, fontFamily: 'var(--font-rubik)' }}>{count}</div>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{v.label}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.textMuted, fontSize: 13, fontFamily: 'var(--font-assistant)' }}>אין משימות</div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-rubik)' }}>
            <thead>
              <tr style={{ background: C.borderLight }}>
                {['משימה', 'אחראי', 'תאריך יעד', 'עדיפות', 'סטטוס', 'רגולציה', 'פעולות'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const pr = PRIORITY_LABELS[String(a.priority || 'medium')] || PRIORITY_LABELS.medium;
                const st = ACTION_STATUS_LABELS[String(a.status || 'open')] || ACTION_STATUS_LABELS.open;
                const isOverdue = a.dueDate && String(a.dueDate) < now && a.status !== 'done';
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: isOverdue ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>{String(a.title)}</td>
                    <td style={{ padding: '10px 12px', color: C.textSec }}>{String(a.ownerName || '—')}</td>
                    <td style={{ padding: '10px 12px', color: isOverdue ? C.danger : C.textMuted }}>
                      {a.dueDate ? new Date(String(a.dueDate)).toLocaleDateString('he-IL') : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}><Badge label={pr.label} color={pr.color} bg={pr.bg} /></td>
                    <td style={{ padding: '10px 12px' }}>
                      <select value={String(a.status)} onChange={e => handleStatusChange(String(a.id), e.target.value)}
                        style={{ fontSize: 10, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'var(--font-rubik)', background: st.bg, color: st.color }}>
                        {Object.entries(ACTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 10, color: C.textMuted }}>{String(a.linkedRegulationRef || '')}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {!a.syncedToTasks && (
                        <Btn size="xs" variant="outline" onClick={() => handleSync(String(a.id))}><Link2 size={10} /> סנכרן</Btn>
                      )}
                      {!!a.syncedToTasks && <Badge label="מסונכרן" color={C.success} bg={C.successBg} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="משימה חדשה" onSubmit={handleCreate} submitLabel="צור משימה">
        <InputField label="כותרת" value={fTitle} onChange={setFTitle} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="אחראי" value={fOwner} onChange={setFOwner} />
          <InputField label="תאריך יעד" value={fDue} onChange={setFDue} type="date" />
        </div>
        <SelectField label="עדיפות" value={fPriority} onChange={setFPriority}
          options={Object.entries(PRIORITY_LABELS).map(([k, v]) => ({ value: k, label: v.label }))} />
        <SelectField label="ישיבה" value={fMeeting} onChange={setFMeeting}
          options={meetings.map(m => ({ value: String(m.id), label: `${String(m.meetingType)} — ${m.date ? new Date(String(m.date)).toLocaleDateString('he-IL') : ''}` }))} />
        <InputField label="הפניה רגולטורית" value={fRegRef} onChange={setFRegRef} placeholder="2024-10-2 §3" />
      </FormModal>
    </>
  );
}

/* ═══════════════════════════════════════════════ */
/* TAB 4: TOPIC LIBRARY                            */
/* ═══════════════════════════════════════════════ */

function TopicsTab({ topics, committees, onReload, showToast }: {
  topics: Topic[]; committees: Committee[];
  onReload: () => Promise<void>; showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [filterCommittee, setFilterCommittee] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [editTopic, setEditTopic] = useState<Topic | null>(null);

  // Create form
  const [fTitle, setFTitle] = useState('');
  const [fGroup, setFGroup] = useState('business');
  const [fInterval, setFInterval] = useState('quarterly');
  const [fCommittee, setFCommittee] = useState('');
  const [fRegRef, setFRegRef] = useState('');

  let filtered = [...topics];
  if (filterCommittee) filtered = filtered.filter(t => t.committeeId === filterCommittee);
  if (filterGroup) filtered = filtered.filter(t => t.group === filterGroup);

  // Group by committee
  const grouped: Record<string, Topic[]> = {};
  filtered.forEach(t => {
    const cName = committees.find(c => c.id === t.committeeId)?.name || 'כללי';
    if (!grouped[cName]) grouped[cName] = [];
    grouped[cName].push(t);
  });

  async function handleCreate() {
    if (!fTitle) return;
    await createTopic({ title: fTitle, group: fGroup as 'business' | 'regulatory' | 'risk', interval: fInterval as 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'ad_hoc', committeeId: fCommittee || undefined, regulationRef: fRegRef || undefined });
    setShowCreate(false);
    setFTitle(''); setFGroup('business'); setFInterval('quarterly'); setFCommittee(''); setFRegRef('');
    await onReload();
    showToast('נושא נוסף בהצלחה');
  }

  async function handleDeactivate(id: string) {
    await deactivateTopic(id);
    await onReload();
    showToast('נושא הושבת');
  }

  async function handleSaveEdit() {
    if (!editTopic) return;
    await updateTopic(editTopic.id, { title: editTopic.title, group: editTopic.group as 'business' | 'regulatory' | 'risk', interval: editTopic.interval as 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'ad_hoc', regulationRef: editTopic.regulationRef || undefined });
    setEditTopic(null);
    await onReload();
    showToast('נושא עודכן');
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={13} color={C.textMuted} />
          <select value={filterCommittee} onChange={e => setFilterCommittee(e.target.value)}
            style={{ padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11, fontFamily: 'var(--font-rubik)', background: C.surface }}>
            <option value="">כל הוועדות</option>
            {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.entries(GROUP_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => setFilterGroup(filterGroup === k ? '' : k)}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-rubik)', background: filterGroup === k ? v.bg : C.borderLight, color: filterGroup === k ? v.color : C.textMuted }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={() => setShowCreate(true)}><Plus size={12} /> נושא חדש</Btn>
      </div>

      {/* Topics by committee */}
      {Object.entries(grouped).map(([committee, topicList]) => (
        <SectionCard key={committee} title={`${committee} (${topicList.length})`} icon={<Layers size={14} color={C.accent} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topicList.map((t, i) => {
              const grp = GROUP_LABELS[t.group] || GROUP_LABELS.business;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.borderLight, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{t.title}</span>
                  <Badge label={grp.label} color={grp.color} bg={grp.bg} />
                  <Badge label={INTERVAL_LABELS[t.interval] || t.interval} color={C.textMuted} bg={C.borderLight} />
                  {t.regulationRef && <span style={{ fontSize: 9, color: '#7C3AED', fontFamily: 'var(--font-rubik)', background: '#EDE9FE', padding: '2px 6px', borderRadius: 4 }}>{t.regulationRef}</span>}
                  <button onClick={() => setEditTopic({ ...t })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Pencil size={11} color={C.textSec} /></button>
                  <button onClick={() => handleDeactivate(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={11} color={C.danger} /></button>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: C.textMuted, fontSize: 13, fontFamily: 'var(--font-assistant)' }}>אין נושאים בספרייה</div>
      )}

      {/* Create Modal */}
      <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="נושא חדש" onSubmit={handleCreate} submitLabel="הוסף נושא">
        <InputField label="כותרת" value={fTitle} onChange={setFTitle} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <SelectField label="קבוצה" value={fGroup} onChange={setFGroup} required
            options={Object.entries(GROUP_LABELS).map(([k, v]) => ({ value: k, label: v.label }))} />
          <SelectField label="תדירות" value={fInterval} onChange={setFInterval} required
            options={Object.entries(INTERVAL_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </div>
        <SelectField label="ועדה" value={fCommittee} onChange={setFCommittee}
          options={committees.map(c => ({ value: c.id, label: c.name }))} />
        <InputField label="הפניה רגולטורית" value={fRegRef} onChange={setFRegRef} placeholder="2024-10-2 §3" />
      </FormModal>

      {/* Edit Modal */}
      <FormModal open={!!editTopic} onClose={() => setEditTopic(null)} title="עריכת נושא" onSubmit={handleSaveEdit} submitLabel="שמור">
        {editTopic && (
          <>
            <InputField label="כותרת" value={editTopic.title} onChange={v => setEditTopic({ ...editTopic, title: v })} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <SelectField label="קבוצה" value={editTopic.group} onChange={v => setEditTopic({ ...editTopic, group: v })}
                options={Object.entries(GROUP_LABELS).map(([k, v]) => ({ value: k, label: v.label }))} />
              <SelectField label="תדירות" value={editTopic.interval} onChange={v => setEditTopic({ ...editTopic, interval: v })}
                options={Object.entries(INTERVAL_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
            </div>
            <InputField label="הפניה רגולטורית" value={editTopic.regulationRef || ''} onChange={v => setEditTopic({ ...editTopic, regulationRef: v })} />
          </>
        )}
      </FormModal>
    </>
  );
}

/* ═══════════════════════════════════════════════ */
/* TAB 5: COMMITTEES                               */
/* ═══════════════════════════════════════════════ */

function CommitteesTab({ committees, directors, onReload, showToast }: {
  committees: Committee[]; directors: Director[];
  onReload: () => Promise<void>; showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, Director[]>>({});
  const [showAddDirector, setShowAddDirector] = useState(false);

  // Create form
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState('');
  const [fQuorum, setFQuorum] = useState('51');
  const [fFreq, setFFreq] = useState('quarterly');

  async function loadMembers(cid: string) {
    const m = await getCommitteeMembers(cid);
    setMembers(prev => ({ ...prev, [cid]: m as Director[] }));
  }

  async function handleExpand(cid: string) {
    if (expandedId === cid) { setExpandedId(null); return; }
    setExpandedId(cid);
    await loadMembers(cid);
  }

  async function handleCreate() {
    if (!fName) return;
    await createCommittee({ name: fName, type: fType || 'custom', quorumMinimum: parseInt(fQuorum) || 51, meetingFrequency: fFreq || undefined });
    setShowCreate(false);
    setFName(''); setFType(''); setFQuorum('51'); setFFreq('quarterly');
    await onReload();
    showToast('ועדה נוצרה');
  }

  async function handleDelete(id: string) {
    await deleteCommittee(id);
    await onReload();
    showToast('ועדה הושבתה');
  }

  async function handleAddMember(committeeId: string, directorId: string) {
    await addCommitteeMember(committeeId, directorId);
    await loadMembers(committeeId);
    showToast('חבר נוסף');
  }

  async function handleRemoveMember(committeeId: string, directorId: string) {
    await removeCommitteeMember(committeeId, directorId);
    await loadMembers(committeeId);
    showToast('חבר הוסר');
  }

  const FREQ_LABELS: Record<string, string> = { monthly: 'חודשי', quarterly: 'רבעוני', semi_annual: 'חצי שנתי', annual: 'שנתי' };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Btn onClick={() => setShowCreate(true)}><Plus size={12} /> ועדה חדשה</Btn>
      </div>

      {committees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.textMuted, fontSize: 13, fontFamily: 'var(--font-assistant)' }}>אין ועדות</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {committees.map(c => {
            const isExpanded = expandedId === c.id;
            const mems = members[c.id] || [];
            return (
              <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div onClick={() => handleExpand(c.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: isExpanded ? C.borderLight : C.surface }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                        <span>מניין: {c.quorumMinimum}%</span>
                        {c.meetingFrequency && <span>· תדירות: {FREQ_LABELS[c.meetingFrequency] || c.meetingFrequency}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge label={`${mems.length} חברים`} color={C.accent} bg={C.accentLight} />
                    <ChevronDown size={16} color={C.textMuted} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>חברי ועדה</span>
                      <Btn size="xs" variant="outline" onClick={() => setShowAddDirector(!showAddDirector)}>
                        <Plus size={10} /> הוסף חבר
                      </Btn>
                    </div>

                    {/* Members list */}
                    {mems.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: C.borderLight, borderRadius: 8, marginBottom: 4, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                            {d.fullName.split(' ').map(w => w[0]).join('')}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{d.fullName}</span>
                          <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{d.role}</span>
                        </div>
                        <button onClick={() => handleRemoveMember(c.id, d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <XCircle size={14} color={C.danger} />
                        </button>
                      </div>
                    ))}

                    {/* Add member dropdown */}
                    {showAddDirector && (
                      <div style={{ marginTop: 8, padding: 10, background: C.borderLight, borderRadius: 8, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)', marginBottom: 6 }}>בחר דירקטור להוספה:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {directors.filter(d => !mems.some(m => m.id === d.id)).map(d => (
                            <button key={d.id} onClick={() => { handleAddMember(c.id, d.id); setShowAddDirector(false); }}
                              style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-rubik)', color: C.text }}>
                              {d.fullName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete committee */}
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <Btn size="xs" variant="danger" onClick={() => handleDelete(c.id)}><Trash2 size={10} /> השבת ועדה</Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="ועדה חדשה" onSubmit={handleCreate} submitLabel="צור ועדה">
        <InputField label="שם ועדה" value={fName} onChange={setFName} required />
        <InputField label="סוג" value={fType} onChange={setFType} placeholder="audit / risk / credit / custom" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="מניין נדרש (%)" value={fQuorum} onChange={setFQuorum} type="number" />
          <SelectField label="תדירות ישיבות" value={fFreq} onChange={setFFreq}
            options={Object.entries(FREQ_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </div>
      </FormModal>
    </>
  );
}
