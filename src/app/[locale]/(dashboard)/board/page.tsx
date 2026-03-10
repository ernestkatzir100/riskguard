'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import {
  Briefcase, Calendar, CheckCircle2, Clock, Users, FileText, AlertCircle,
  ChevronDown, Plus, Pencil, Trash2, Eye, Download, BarChart3, BookOpen,
  Target, ArrowUpRight, Filter, RefreshCw, Link2, UserCheck, XCircle,
  Layers, ListChecks, FolderOpen, Building2, Upload, ClipboardList, Shield,
  RotateCcw, Save, MessageSquare,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import {
  getBoardDashboardData, getCommittees, getTopics,
  getActionItems, getDirectors, getCommitteeMembers, getAgendaItems,
  createBoardMeeting, deleteBoardMeeting, updateMeetingStage,
  createCommittee, deleteCommittee, addCommitteeMember, removeCommitteeMember,
  createTopic, updateTopic, deactivateTopic,
  createAgendaItem, updateAgendaItem, deleteAgendaItem,
  createActionItem, updateActionItem, syncActionItemToTask,
  upsertAttendance, getAttendance, getApprovals, createApprovals,
  seedBoardDefaults, uploadDocument, getDocuments, deleteDocument,
  generateMinutes,
} from '@/app/actions/board';
import { FormModal } from '@/shared/components/form-modal';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { ReportDownloadButtons } from '@/shared/components/report-download-buttons';
import { generateBoardReport } from '@/app/actions/report-generate';

/* ═══════════════════════════════════════════════ */
/* TYPES                                           */
/* ═══════════════════════════════════════════════ */

type Tab = 'dashboard' | 'meetings' | 'actions' | 'topics' | 'committees';

type Committee = {
  id: string; name: string; type: string; quorumMinimum: number;
  quorumType: string; meetingFrequency: string | null; isActive: boolean;
};
type Director = {
  id: string; fullName: string; email: string | null; phone: string | null;
  role: string; appointmentDate: string | null; active: boolean;
};
type Topic = {
  id: string; title: string; group: string; interval: string;
  committeeId: string | null; regulationRef: string | null;
  lastDiscussedAt: Date | string | null; isActive: boolean;
};
type Meeting = {
  id: string; meetingType: string; date: string; quarter: string | null;
  status: string; stage: string; committeeId: string | null;
  time: string | null; location: string | null; locationType: string | null;
  quorumMet: boolean | null; minutesText: string | null;
  recurringFrequency: string | null; nextMeetingDate: string | null;
  createdAt: Date | string;
};
type ActionItemT = {
  id: string; title: string; meetingId: string | null;
  ownerName: string | null; dueDate: string | null;
  priority: string; status: string;
  linkedRegulationRef: string | null; syncedToTasks: boolean;
  taskId: string | null; completedAt: Date | string | null; createdAt: Date | string;
};
type AgendaItemT = {
  id: string; meetingId: string; topicId: string | null;
  title: string; orderIndex: number; presenter: string | null;
  estimatedMinutes: number | null; status: string;
  discussionNotes: string | null; group: string | null; isCarriedOver: boolean;
};
type ApprovalT = {
  id: string; meetingId: string; directorId: string;
  status: string; token: string; comment: string | null;
  respondedAt: Date | string | null; directorName?: string; directorEmail?: string | null;
};
type AttendanceT = {
  id: string; meetingId: string; directorId: string;
  attended: boolean; proxyFor: string | null;
};
type DocT = {
  id: string; meetingId: string | null; filename: string;
  fileType: string | null; fileData: string; uploadedAt: Date | string;
};
type DashData = {
  nextMeeting: Meeting | null;
  meetingsThisYear: number; approvedMeetings: number;
  openActionItems: number; overdueActionItems: number;
  totalTopics: number; regulatoryTopics: number; regulatoryCoverage: number;
  committees: Committee[]; allMeetings: Meeting[]; allActions: ActionItemT[];
  allDirectors: Director[]; allAttendance: AttendanceT[]; allTopics: Topic[];
};

/* ═══════════════════════════════════════════════ */
/* CONSTANTS                                       */
/* ═══════════════════════════════════════════════ */

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

const STAGE_ORDER = ['draft', 'scheduled', 'in_progress', 'pending_approval', 'approved'];
const STAGE_HE = ['טיוטה', 'מתוכנן', 'בביצוע', 'לאישור', 'מאושר'];

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

const FREQ_LABELS: Record<string, string> = { monthly: 'חודשי', quarterly: 'רבעוני', semi_annual: 'חצי שנתי', annual: 'שנתי' };

/* ═══════════════════════════════════════════════ */
/* HELPERS                                         */
/* ═══════════════════════════════════════════════ */

function topicDueStatus(t: Topic): { status: 'ok' | 'due' | 'overdue'; label: string } {
  if (t.interval === 'ad_hoc') return { status: 'ok', label: 'לפי צורך' };
  if (!t.lastDiscussedAt) return { status: 'overdue', label: 'מעולם לא נדון' };
  const last = new Date(t.lastDiscussedAt);
  const now = new Date();
  const months = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());
  const th: Record<string, number> = { monthly: 1, quarterly: 3, semi_annual: 6, annual: 12 };
  const limit = th[t.interval] || 3;
  if (months >= limit) return { status: 'overdue', label: 'חייב דיון' };
  if (months >= limit - 1) return { status: 'due', label: 'קרוב למועד' };
  return { status: 'ok', label: 'בזמן' };
}

function initials(name: string) { return name.split(' ').map(w => w[0]).join(''); }

/* ═══════════════════════════════════════════════ */
/* SHARED UI                                       */
/* ═══════════════════════════════════════════════ */

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

const InputField = ({ label, value, onChange, type = 'text', placeholder, required, as }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; as?: 'textarea' }) => (
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

/* Stage Stepper */
function StageStepper({ current }: { current: string }) {
  const idx = STAGE_ORDER.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {STAGE_ORDER.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <Fragment key={s}>
            {i > 0 && <div style={{ width: 16, height: 2, background: done ? C.success : active ? STAGE_LABELS[s].color : C.borderLight }} />}
            <div style={{
              padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 600,
              fontFamily: 'var(--font-rubik)',
              background: active ? STAGE_LABELS[s].bg : done ? C.successBg : C.borderLight,
              color: active ? STAGE_LABELS[s].color : done ? C.success : C.textMuted,
              border: active ? `1px solid ${STAGE_LABELS[s].color}44` : '1px solid transparent',
            }}>
              {done ? '✓' : ''} {STAGE_HE[i]}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

/* Quorum Indicator */
function QuorumBadge({ met }: { met: boolean | null }) {
  if (met === null || met === undefined) return <Badge label="טרם נבדק" color={C.textMuted} bg={C.borderLight} />;
  return met ? <Badge label="מניין חוקי" color={C.success} bg={C.successBg} /> : <Badge label="אין מניין" color={C.danger} bg={C.dangerBg} />;
}

/* ═══════════════════════════════════════════════ */
/* MAIN PAGE                                       */
/* ═══════════════════════════════════════════════ */

export default function BoardPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [committees, setCommittees] = useState<Committee[]>([]);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<ActionItemT[]>([]);
  const [dashData, setDashData] = useState<DashData | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadAll = useCallback(async () => {
    try {
      const [c, d, t, a, dd] = await Promise.all([
        getCommittees(), getDirectors(), getTopics(), getActionItems(), getBoardDashboardData(),
      ]);
      setCommittees(c as Committee[]);
      setAllDirectors(d as Director[]);
      setTopics(t as Topic[]);
      setActions(a as ActionItemT[]);
      const ddTyped = dd as DashData;
      setDashData(ddTyped);
      setMeetings(ddTyped.allMeetings || []);
    } catch { /* fallback */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

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
              fontWeight: tab === t.key ? 700 : 500, fontSize: 12, fontFamily: 'var(--font-rubik)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'dashboard' && <DashboardTab data={dashData} meetings={meetings} actions={actions} committees={committees} directors={allDirectors} topics={topics} />}
      {tab === 'meetings' && <MeetingsTab meetings={meetings} committees={committees} directors={allDirectors} topics={topics} onReload={loadAll} showToast={showToast} />}
      {tab === 'actions' && <ActionItemsTab actions={actions} meetings={meetings} onReload={loadAll} showToast={showToast} />}
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

function DashboardTab({ data, meetings, actions, committees, directors, topics }: {
  data: DashData | null; meetings: Meeting[]; actions: ActionItemT[];
  committees: Committee[]; directors: Director[]; topics: Topic[];
}) {
  const dd = data;
  if (!dd) return null;
  const now = new Date().toISOString().split('T')[0];
  const approvalPct = dd.meetingsThisYear > 0 ? Math.round((dd.approvedMeetings / dd.meetingsThisYear) * 100) : 0;

  // Regulatory coverage stats
  const regTopics = topics.filter(t => t.regulationRef);
  const overdueTopics = topics.filter(t => topicDueStatus(t).status === 'overdue');

  return (
    <>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KPICard label="ישיבה הבאה" value={dd.nextMeeting ? new Date(dd.nextMeeting.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }) : '—'}
          sub={dd.nextMeeting ? dd.nextMeeting.meetingType : 'אין ישיבות מתוכננות'} color={C.accent} icon={<Calendar size={14} color={C.accent} />} />
        <KPICard label="משימות פתוחות" value={dd.openActionItems}
          sub={dd.overdueActionItems > 0 ? `${dd.overdueActionItems} באיחור` : 'הכל בזמן'} color={dd.overdueActionItems > 0 ? C.danger : C.success} icon={<ListChecks size={14} color={dd.overdueActionItems > 0 ? C.danger : C.success} />} />
        <KPICard label="אחוז אישורים" value={`${approvalPct}%`}
          sub={`${dd.approvedMeetings} מתוך ${dd.meetingsThisYear} ישיבות`} color={approvalPct >= 80 ? C.success : C.warning} icon={<CheckCircle2 size={14} color={approvalPct >= 80 ? C.success : C.warning} />} />
        <KPICard label="נושאים חייבי דיון" value={overdueTopics.length}
          sub={`${regTopics.length} נושאים רגולטוריים`} color={overdueTopics.length > 0 ? C.danger : C.success} icon={<Target size={14} color={overdueTopics.length > 0 ? C.danger : C.success} />} />
      </div>

      {/* Meeting Timeline */}
      <SectionCard title="ציר ישיבות — השנה" icon={<Calendar size={14} color={C.accent} />}>
        {meetings.length === 0 ? (
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>אין ישיבות עדיין</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {meetings.slice(0, 8).map(m => {
              const stage = STAGE_LABELS[m.stage] || STAGE_LABELS.draft;
              const committee = committees.find(c => c.id === m.committeeId);
              return (
                <div key={m.id} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', borderRight: `3px solid ${stage.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{m.meetingType}</span>
                    <Badge label={stage.label} color={stage.color} bg={stage.bg} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
                    {new Date(m.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {m.time ? ` · ${m.time}` : ''}
                  </div>
                  {committee && <div style={{ fontSize: 10, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{committee.name}</div>}
                  <div style={{ marginTop: 6 }}><StageStepper current={m.stage} /></div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Regulatory Coverage */}
      <SectionCard title={`כיסוי רגולטורי (${regTopics.length} נושאים)`} icon={<Shield size={14} color='#7C3AED' />}>
        {regTopics.length === 0 ? (
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>אין נושאים רגולטוריים</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {regTopics.map(t => {
              const due = topicDueStatus(t);
              const dueColor = due.status === 'overdue' ? C.danger : due.status === 'due' ? C.warning : C.success;
              const dueBg = due.status === 'overdue' ? C.dangerBg : due.status === 'due' ? C.warningBg : C.successBg;
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: due.status === 'overdue' ? '#FEF2F2' : C.borderLight, border: `1px solid ${due.status === 'overdue' ? C.danger + '33' : C.border}`, borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{t.title}</span>
                  <span style={{ fontSize: 9, color: '#7C3AED', fontFamily: 'var(--font-rubik)', background: '#EDE9FE', padding: '2px 6px', borderRadius: 4 }}>{t.regulationRef}</span>
                  <Badge label={INTERVAL_LABELS[t.interval] || t.interval} color={C.textMuted} bg={C.borderLight} />
                  <Badge label={due.label} color={dueColor} bg={dueBg} />
                  {t.lastDiscussedAt && <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>נדון: {new Date(t.lastDiscussedAt).toLocaleDateString('he-IL')}</span>}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Open Action Items */}
      <SectionCard title={`משימות פתוחות (${dd.openActionItems})`} icon={<AlertCircle size={14} color={C.warning} />}>
        {actions.filter(a => a.status === 'open' || a.status === 'in_progress').length === 0 ? (
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', textAlign: 'center', padding: 20 }}>אין משימות פתוחות</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.filter(a => a.status === 'open' || a.status === 'in_progress').slice(0, 10).map(a => {
              const pr = PRIORITY_LABELS[a.priority] || PRIORITY_LABELS.medium;
              const st = ACTION_STATUS_LABELS[a.status] || ACTION_STATUS_LABELS.open;
              const isOverdue = a.dueDate && a.dueDate < now;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: isOverdue ? C.dangerBg : C.borderLight, border: `1px solid ${isOverdue ? C.danger + '33' : C.border}`, borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{a.title}</span>
                  {a.ownerName && <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{a.ownerName}</span>}
                  {a.dueDate && <span style={{ fontSize: 10, color: isOverdue ? C.danger : C.textMuted, fontFamily: 'var(--font-rubik)' }}>{new Date(a.dueDate).toLocaleDateString('he-IL')}</span>}
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
            {directors.map(d => {
              const allAtt = dd.allAttendance || [];
              const dirAtt = allAtt.filter(a => a.directorId === d.id);
              const attended = dirAtt.filter(a => a.attended).length;
              const total = dirAtt.length;
              const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
              return (
                <div key={d.id} style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-rubik)', flexShrink: 0 }}>
                    {initials(d.fullName)}
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
  const [fType, setFType] = useState('');
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('');
  const [fCommittee, setFCommittee] = useState('');
  const [fLocation, setFLocation] = useState('');
  const [fLocationType, setFLocationType] = useState('פיזי');
  const [fQuarter, setFQuarter] = useState('');
  const [fRecurring, setFRecurring] = useState('');

  const filtered = filterCommittee ? meetings.filter(m => m.committeeId === filterCommittee) : meetings;

  async function handleCreate() {
    if (!fType || !fDate) return;
    try {
      await createBoardMeeting({
        meetingType: fType, date: fDate, time: fTime || undefined,
        committeeId: fCommittee || undefined, location: fLocation || undefined,
        locationType: fLocationType || undefined, quarter: fQuarter || undefined,
        recurringFrequency: fRecurring || undefined,
      });
      setShowCreate(false);
      setFType(''); setFDate(''); setFTime(''); setFCommittee(''); setFLocation(''); setFQuarter(''); setFRecurring('');
      await onReload();
      showToast('הישיבה נוצרה בהצלחה — סדר יום אוכלס אוטומטית מנושאים שהגיע זמנם');
    } catch { showToast('שגיאה ביצירת ישיבה', 'error'); }
  }

  async function handleDelete(id: string) {
    try { await deleteBoardMeeting(id); await onReload(); showToast('הישיבה נמחקה'); }
    catch { showToast('שגיאה במחיקה', 'error'); }
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

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.textMuted, fontSize: 13, fontFamily: 'var(--font-assistant)' }}>אין ישיבות</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(m => {
            const stage = STAGE_LABELS[m.stage] || STAGE_LABELS.draft;
            const committee = committees.find(c => c.id === m.committeeId);
            return (
              <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', borderRight: `4px solid ${stage.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>{m.meetingType}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)', marginBottom: 6 }}>
                      <span><Calendar size={11} /> {new Date(m.date).toLocaleDateString('he-IL')}</span>
                      {m.time && <span><Clock size={11} /> {m.time}</span>}
                      {committee && <span style={{ color: C.accent }}>{committee.name}</span>}
                      {m.location && <span>{m.location}</span>}
                      {m.recurringFrequency && <Badge label={`חוזר: ${FREQ_LABELS[m.recurringFrequency] || m.recurringFrequency}`} color={C.textMuted} bg={C.borderLight} />}
                    </div>
                    <StageStepper current={m.stage} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <QuorumBadge met={m.quorumMet} />
                    <Btn variant="ghost" size="xs" onClick={() => setViewMeeting(m)}><Eye size={12} /></Btn>
                    {m.stage === 'draft' && <Btn variant="ghost" size="xs" onClick={() => handleDelete(m.id)}><Trash2 size={12} color={C.danger} /></Btn>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {m.stage === 'draft' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(m.id, 'scheduled')}>העבר למתוכנן</Btn>}
                  {m.stage === 'scheduled' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(m.id, 'in_progress')}>התחל ישיבה</Btn>}
                  {m.stage === 'in_progress' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(m.id, 'pending_approval')}>שלח לאישור</Btn>}
                  {m.stage === 'pending_approval' && <Btn variant="outline" size="xs" onClick={() => handleStageChange(m.id, 'approved')}><CheckCircle2 size={11} /> אשר פרוטוקול</Btn>}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="רבעון" value={fQuarter} onChange={setFQuarter} placeholder="Q1/2026" />
          <SelectField label="תדירות חוזרת" value={fRecurring} onChange={setFRecurring}
            options={Object.entries(FREQ_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </div>
        {fCommittee && (
          <div style={{ padding: '8px 12px', background: '#E0F2FE', borderRadius: 8, fontSize: 11, color: '#0369A1', fontFamily: 'var(--font-rubik)', marginTop: 4 }}>
            סדר היום יאוכלס אוטומטית מנושאים שהגיע זמנם + משימות פתוחות מישיבה קודמת
          </div>
        )}
      </FormModal>

      {viewMeeting && (
        <MeetingDetailModal meeting={viewMeeting} committees={committees} directors={directors}
          onClose={() => { setViewMeeting(null); onReload(); }} showToast={showToast} />
      )}
    </>
  );
}

/* ═══ Meeting Detail Modal ═══ */
type MeetingSubTab = 'agenda' | 'attendance' | 'actions' | 'protocol' | 'approvals' | 'docs';

function MeetingDetailModal({ meeting: m, committees, directors, onClose, showToast }: {
  meeting: Meeting; committees: Committee[]; directors: Director[];
  onClose: () => void; showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [agendaItems, setAgendaItems] = useState<AgendaItemT[]>([]);
  const [attendance, setAttendance] = useState<AttendanceT[]>([]);
  const [approvals, setApprovals] = useState<ApprovalT[]>([]);
  const [docs, setDocs] = useState<DocT[]>([]);
  const [meetingActions, setMeetingActions] = useState<ActionItemT[]>([]);
  const [subTab, setSubTab] = useState<MeetingSubTab>('agenda');
  const [minutesText, setMinutesText] = useState<string | null>(m.minutesText);
  const [generatingMinutes, setGeneratingMinutes] = useState(false);

  // Agenda add
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [agTitle, setAgTitle] = useState('');
  const [agPresenter, setAgPresenter] = useState('');
  const [agMinutes, setAgMinutes] = useState('');
  const [agGroup, setAgGroup] = useState('');

  // Action item add
  const [showAddAction, setShowAddAction] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actOwner, setActOwner] = useState('');
  const [actDue, setActDue] = useState('');
  const [actPriority, setActPriority] = useState('medium');

  // Edit notes
  const [editNotesId, setEditNotesId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mid = m.id;
  const committee = committees.find(c => c.id === m.committeeId);
  const stage = STAGE_LABELS[m.stage] || STAGE_LABELS.draft;

  async function loadDetail() {
    const [ag, at, ap, dc, act] = await Promise.all([
      getAgendaItems(mid), getAttendance(mid), getApprovals(mid), getDocuments(mid), getActionItems({ meetingId: mid }),
    ]);
    setAgendaItems(ag as AgendaItemT[]);
    setAttendance(at as AttendanceT[]);
    setApprovals(ap as ApprovalT[]);
    setDocs(dc as DocT[]);
    setMeetingActions(act as ActionItemT[]);
  }
  useEffect(() => { loadDetail(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleSaveNotes(id: string) {
    await updateAgendaItem(id, { discussionNotes: editNotesText });
    setEditNotesId(null); setEditNotesText('');
    await loadDetail();
    showToast('הערות נשמרו');
  }

  async function handleSendForApproval() {
    const dirIds = directors.map(d => d.id);
    await createApprovals(mid, dirIds);
    await updateMeetingStage(mid, 'pending_approval');
    await loadDetail();
    showToast('נשלח לאישור דירקטורים');
  }

  async function handleGenerateMinutes() {
    setGeneratingMinutes(true);
    try {
      const text = await generateMinutes(mid);
      setMinutesText(text);
      showToast('פרוטוקול נוצר בהצלחה');
    } catch { showToast('שגיאה ביצירת פרוטוקול', 'error'); }
    setGeneratingMinutes(false);
  }

  async function handleUploadDoc(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await uploadDocument({ meetingId: mid, filename: file.name, fileType: file.type || file.name.split('.').pop() || '', fileData: base64 });
      await loadDetail();
      showToast('מסמך הועלה');
    };
    reader.readAsDataURL(file);
  }

  async function handleDeleteDoc(id: string) {
    await deleteDocument(id);
    await loadDetail();
    showToast('מסמך נמחק');
  }

  async function handleAddAction() {
    if (!actTitle) return;
    await createActionItem({ title: actTitle, meetingId: mid, ownerName: actOwner || undefined, dueDate: actDue || undefined, priority: actPriority as 'high' | 'medium' | 'low' });
    setActTitle(''); setActOwner(''); setActDue(''); setActPriority('medium');
    setShowAddAction(false);
    await loadDetail();
    showToast('משימה נוצרה');
  }

  async function handleActionStatusChange(id: string, status: string) {
    await updateActionItem(id, { status: status as 'open' | 'in_progress' | 'done' | 'overdue' });
    await loadDetail();
  }

  const SUB_TABS: { key: MeetingSubTab; label: string }[] = [
    { key: 'agenda', label: 'סדר יום' }, { key: 'attendance', label: 'נוכחות' },
    { key: 'actions', label: 'משימות' }, { key: 'protocol', label: 'פרוטוקול' },
    { key: 'approvals', label: 'אישורים' }, { key: 'docs', label: 'מסמכים' },
  ];

  return (
    <FormModal open={true} onClose={onClose} title={m.meetingType} onSubmit={() => {}} hideFooter>
      <div style={{ marginBottom: 14 }}>
        {/* Meeting header info */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
          <Badge label={stage.label} color={stage.color} bg={stage.bg} />
          {committee && <Badge label={committee.name} color={C.accent} bg={C.accentLight} />}
          <QuorumBadge met={m.quorumMet} />
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
            {new Date(m.date).toLocaleDateString('he-IL')} {m.time ? `· ${m.time}` : ''}
          </span>
        </div>
        <div style={{ marginBottom: 12 }}><StageStepper current={m.stage} /></div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 14, flexWrap: 'wrap' }}>
          {SUB_TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setSubTab(key)}
              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: subTab === key ? 700 : 500, fontFamily: 'var(--font-rubik)', background: subTab === key ? C.accentLight : C.borderLight, color: subTab === key ? C.accent : C.textMuted }}>
              {label} {key === 'actions' && meetingActions.length > 0 ? `(${meetingActions.length})` : ''}
            </button>
          ))}
        </div>

        {/* ═══ Agenda Sub-tab ═══ */}
        {subTab === 'agenda' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Btn size="xs" onClick={() => setShowAddAgenda(true)}><Plus size={11} /> הוסף נושא</Btn>
            </div>
            {agendaItems.length === 0 ? (
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', padding: 16, fontFamily: 'var(--font-assistant)' }}>אין נושאים בסדר היום</p>
            ) : agendaItems.map((ag, i) => {
              const grp = GROUP_LABELS[ag.group || ''] || null;
              return (
                <div key={ag.id} style={{ padding: '8px 10px', background: ag.isCarriedOver ? C.warningBg : C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${ag.isCarriedOver ? C.warning + '44' : C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)', width: 20 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      {ag.title}
                      {ag.isCarriedOver && <span style={{ fontSize: 9, color: C.warning, marginRight: 6 }}><RotateCcw size={9} /> מועבר</span>}
                    </span>
                    {ag.presenter && <span style={{ fontSize: 10, color: C.textMuted }}>{ag.presenter}</span>}
                    {ag.estimatedMinutes && <span style={{ fontSize: 10, color: C.textMuted }}>{ag.estimatedMinutes} דק׳</span>}
                    {grp && <Badge label={grp.label} color={grp.color} bg={grp.bg} />}
                    <select value={ag.status} onChange={e => handleAgendaStatus(ag.id, e.target.value)}
                      style={{ fontSize: 10, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'var(--font-rubik)', background: C.surface }}>
                      <option value="pending">ממתין</option>
                      <option value="discussed">נדון</option>
                      <option value="postponed">נדחה</option>
                      <option value="cancelled">בוטל</option>
                    </select>
                    <button onClick={() => { setEditNotesId(editNotesId === ag.id ? null : ag.id); setEditNotesText(ag.discussionNotes || ''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <MessageSquare size={12} color={ag.discussionNotes ? C.accent : C.textMuted} />
                    </button>
                    <button onClick={async () => { await deleteAgendaItem(ag.id); await loadDetail(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={12} color={C.danger} /></button>
                  </div>
                  {/* Discussion notes inline editor */}
                  {editNotesId === ag.id && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: C.surface, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <textarea value={editNotesText} onChange={e => setEditNotesText(e.target.value)}
                        placeholder="הערות דיון..."
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-assistant)', direction: 'rtl', resize: 'vertical', minHeight: 60 }} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <Btn size="xs" onClick={() => handleSaveNotes(ag.id)}><Save size={10} /> שמור</Btn>
                        <Btn size="xs" variant="outline" onClick={() => setEditNotesId(null)}>ביטול</Btn>
                      </div>
                    </div>
                  )}
                  {editNotesId !== ag.id && ag.discussionNotes && (
                    <div style={{ marginTop: 4, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)', paddingRight: 28 }}>
                      {ag.discussionNotes}
                    </div>
                  )}
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

            {m.stage === 'in_progress' && (
              <div style={{ marginTop: 14 }}>
                <Btn onClick={handleSendForApproval}><ArrowUpRight size={12} /> שלח פרוטוקול לאישור</Btn>
              </div>
            )}
          </div>
        )}

        {/* ═══ Attendance Sub-tab ═══ */}
        {subTab === 'attendance' && (
          <div>
            {directors.map(d => {
              const att = attendance.find(a => a.directorId === d.id);
              const isPresent = att ? att.attended : false;
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                      {initials(d.fullName)}
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
            <div style={{ marginTop: 10, padding: '8px 12px', background: C.borderLight, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                נוכחים: {attendance.filter(a => a.attended).length} / {directors.length}
                {committee && ` | מניין: ${committee.quorumType === 'all' ? '100%' : `>${committee.quorumMinimum}%`} (${committee.quorumType === 'all' ? 'כל החברים' : 'רוב'})`}
              </span>
              <QuorumBadge met={m.quorumMet} />
            </div>
          </div>
        )}

        {/* ═══ Actions Sub-tab ═══ */}
        {subTab === 'actions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Btn size="xs" onClick={() => setShowAddAction(true)}><Plus size={11} /> משימה חדשה</Btn>
            </div>
            {meetingActions.length === 0 ? (
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', padding: 16, fontFamily: 'var(--font-assistant)' }}>אין משימות לישיבה זו</p>
            ) : meetingActions.map(a => {
              const pr = PRIORITY_LABELS[a.priority] || PRIORITY_LABELS.medium;
              const st = ACTION_STATUS_LABELS[a.status] || ACTION_STATUS_LABELS.open;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{a.title}</span>
                  {a.ownerName && <span style={{ fontSize: 10, color: C.textMuted }}>{a.ownerName}</span>}
                  {a.dueDate && <span style={{ fontSize: 10, color: C.textMuted }}>{new Date(a.dueDate).toLocaleDateString('he-IL')}</span>}
                  <Badge label={pr.label} color={pr.color} bg={pr.bg} />
                  <select value={a.status} onChange={e => handleActionStatusChange(a.id, e.target.value)}
                    style={{ fontSize: 10, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'var(--font-rubik)', background: st.bg, color: st.color }}>
                    {Object.entries(ACTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              );
            })}

            {showAddAction && (
              <div style={{ background: C.borderLight, borderRadius: 10, padding: 14, marginTop: 10, border: `1px solid ${C.border}` }}>
                <InputField label="כותרת משימה" value={actTitle} onChange={setActTitle} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <InputField label="אחראי" value={actOwner} onChange={setActOwner} />
                  <InputField label="תאריך יעד" value={actDue} onChange={setActDue} type="date" />
                </div>
                <SelectField label="עדיפות" value={actPriority} onChange={setActPriority}
                  options={Object.entries(PRIORITY_LABELS).map(([k, v]) => ({ value: k, label: v.label }))} />
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Btn size="xs" onClick={handleAddAction}>צור משימה</Btn>
                  <Btn size="xs" variant="outline" onClick={() => setShowAddAction(false)}>ביטול</Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Protocol/Minutes Sub-tab ═══ */}
        {subTab === 'protocol' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 8 }}>
              <Btn size="xs" onClick={handleGenerateMinutes} disabled={generatingMinutes}>
                <ClipboardList size={11} /> {generatingMinutes ? 'מייצר...' : minutesText ? 'ייצר מחדש' : 'ייצר פרוטוקול'}
              </Btn>
            </div>
            {minutesText ? (
              <div style={{ background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, fontFamily: 'var(--font-assistant)', color: C.text, lineHeight: 1.8, direction: 'rtl', margin: 0 }}>
                  {minutesText}
                </pre>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: C.textMuted }}>
                <ClipboardList size={32} color={C.borderLight} />
                <p style={{ fontSize: 12, fontFamily: 'var(--font-assistant)', marginTop: 10 }}>
                  טרם נוצר פרוטוקול. לחץ &quot;ייצר פרוטוקול&quot; ליצירה אוטומטית מנתוני הישיבה.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══ Approvals Sub-tab ═══ */}
        {subTab === 'approvals' && (
          <div>
            {approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 10 }}>טרם נשלחו בקשות אישור</p>
                {m.stage === 'in_progress' && <Btn size="xs" onClick={handleSendForApproval}><ArrowUpRight size={11} /> שלח לאישור</Btn>}
              </div>
            ) : (
              <>
                {approvals.map(ap => {
                  const stStyle = ap.status === 'approved' ? { color: C.success, bg: C.successBg } : ap.status === 'rejected' ? { color: C.danger, bg: C.dangerBg } : { color: C.warning, bg: C.warningBg };
                  return (
                    <div key={ap.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{ap.directorName || ''}</span>
                        {ap.comment && <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 2 }}>{ap.comment}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {ap.respondedAt && <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{new Date(ap.respondedAt).toLocaleDateString('he-IL')}</span>}
                        <Badge label={ap.status === 'approved' ? 'אישר' : ap.status === 'rejected' ? 'דחה' : 'ממתין'} color={stStyle.color} bg={stStyle.bg} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, padding: '6px 10px', background: C.borderLight, borderRadius: 6, fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                  אישרו: {approvals.filter(a => a.status === 'approved').length} / {approvals.length}
                  {approvals.every(a => a.status === 'approved') && ' — כל הדירקטורים אישרו ✓'}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ Documents Sub-tab ═══ */}
        {subTab === 'docs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={e => handleUploadDoc(e.target.files)} />
              <Btn size="xs" onClick={() => fileInputRef.current?.click()}><Upload size={11} /> העלה מסמך</Btn>
            </div>
            {docs.length === 0 ? (
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', padding: 20, fontFamily: 'var(--font-assistant)' }}>אין מסמכים</p>
            ) : docs.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.borderLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                <FileText size={14} color={C.accent} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{d.filename}</span>
                {d.fileType && <Badge label={d.fileType} color={C.textMuted} bg={C.borderLight} />}
                <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{new Date(d.uploadedAt).toLocaleDateString('he-IL')}</span>
                <a href={`data:application/octet-stream;base64,${d.fileData}`} download={d.filename}
                  style={{ fontSize: 10, color: C.accent, textDecoration: 'none', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Download size={11} /> הורד
                </a>
                <button onClick={() => handleDeleteDoc(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Trash2 size={12} color={C.danger} />
                </button>
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

function ActionItemsTab({ actions, meetings, onReload, showToast }: {
  actions: ActionItemT[]; meetings: Meeting[];
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
    try { await syncActionItemToTask(id); await onReload(); showToast('סונכרן למשימות'); }
    catch { showToast('שגיאה בסנכרון', 'error'); }
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
                {['משימה', 'אחראי', 'ישיבה', 'תאריך יעד', 'עדיפות', 'סטטוס', 'רגולציה', 'פעולות'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const pr = PRIORITY_LABELS[a.priority] || PRIORITY_LABELS.medium;
                const st = ACTION_STATUS_LABELS[a.status] || ACTION_STATUS_LABELS.open;
                const isOverdue = a.dueDate && a.dueDate < now && a.status !== 'done';
                const mtg = a.meetingId ? meetings.find(mm => mm.id === a.meetingId) : null;
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${C.borderLight}`, background: isOverdue ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text, maxWidth: 200 }}>{a.title}</td>
                    <td style={{ padding: '10px 12px', color: C.textSec }}>{a.ownerName || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 10, color: C.textMuted }}>{mtg ? mtg.meetingType : '—'}</td>
                    <td style={{ padding: '10px 12px', color: isOverdue ? C.danger : C.textMuted }}>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('he-IL') : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}><Badge label={pr.label} color={pr.color} bg={pr.bg} /></td>
                    <td style={{ padding: '10px 12px' }}>
                      <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}
                        style={{ fontSize: 10, padding: '2px 6px', border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: 'var(--font-rubik)', background: st.bg, color: st.color }}>
                        {Object.entries(ACTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 10, color: C.textMuted }}>{a.linkedRegulationRef || ''}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {!a.syncedToTasks ? (
                        <Btn size="xs" variant="outline" onClick={() => handleSync(a.id)}><Link2 size={10} /> סנכרן</Btn>
                      ) : (
                        <Badge label="מסונכרן" color={C.success} bg={C.successBg} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="משימה חדשה" onSubmit={handleCreate} submitLabel="צור משימה">
        <InputField label="כותרת" value={fTitle} onChange={setFTitle} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="אחראי" value={fOwner} onChange={setFOwner} />
          <InputField label="תאריך יעד" value={fDue} onChange={setFDue} type="date" />
        </div>
        <SelectField label="עדיפות" value={fPriority} onChange={setFPriority}
          options={Object.entries(PRIORITY_LABELS).map(([k, v]) => ({ value: k, label: v.label }))} />
        <SelectField label="ישיבה" value={fMeeting} onChange={setFMeeting}
          options={meetings.map(mm => ({ value: mm.id, label: `${mm.meetingType} — ${new Date(mm.date).toLocaleDateString('he-IL')}` }))} />
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
  const [fTitle, setFTitle] = useState('');
  const [fGroup, setFGroup] = useState('business');
  const [fInterval, setFInterval] = useState('quarterly');
  const [fCommittee, setFCommittee] = useState('');
  const [fRegRef, setFRegRef] = useState('');

  let filtered = [...topics];
  if (filterCommittee) filtered = filtered.filter(t => t.committeeId === filterCommittee);
  if (filterGroup) filtered = filtered.filter(t => t.group === filterGroup);

  const grouped: Record<string, Topic[]> = {};
  filtered.forEach(t => {
    const cName = committees.find(c => c.id === t.committeeId)?.name || 'כללי';
    if (!grouped[cName]) grouped[cName] = [];
    grouped[cName].push(t);
  });

  // Stats
  const overdueCount = topics.filter(t => topicDueStatus(t).status === 'overdue').length;
  const dueCount = topics.filter(t => topicDueStatus(t).status === 'due').length;

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
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center', borderTop: `3px solid ${C.accent}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{topics.length}</div>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>סה&quot;כ נושאים</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center', borderTop: `3px solid ${C.danger}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.danger, fontFamily: 'var(--font-rubik)' }}>{overdueCount}</div>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>חייבי דיון</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center', borderTop: `3px solid ${C.warning}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.warning, fontFamily: 'var(--font-rubik)' }}>{dueCount}</div>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>קרובים למועד</div>
        </div>
      </div>

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

      {Object.entries(grouped).map(([committeeName, topicList]) => (
        <SectionCard key={committeeName} title={`${committeeName} (${topicList.length})`} icon={<Layers size={14} color={C.accent} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topicList.map(t => {
              const grp = GROUP_LABELS[t.group] || GROUP_LABELS.business;
              const due = topicDueStatus(t);
              const dueColor = due.status === 'overdue' ? C.danger : due.status === 'due' ? C.warning : C.success;
              const dueBg = due.status === 'overdue' ? C.dangerBg : due.status === 'due' ? C.warningBg : C.successBg;
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: due.status === 'overdue' ? '#FEF2F2' : C.borderLight, borderRadius: 8, border: `1px solid ${due.status === 'overdue' ? C.danger + '33' : C.border}` }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{t.title}</span>
                  <Badge label={grp.label} color={grp.color} bg={grp.bg} />
                  <Badge label={INTERVAL_LABELS[t.interval] || t.interval} color={C.textMuted} bg={C.borderLight} />
                  <Badge label={due.label} color={dueColor} bg={dueBg} />
                  {t.lastDiscussedAt && <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>נדון: {new Date(t.lastDiscussedAt).toLocaleDateString('he-IL')}</span>}
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
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState('');
  const [fQuorum, setFQuorum] = useState('51');
  const [fQuorumType, setFQuorumType] = useState('majority');
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
    await createCommittee({ name: fName, type: fType || 'custom', quorumMinimum: parseInt(fQuorum) || 51, quorumType: fQuorumType, meetingFrequency: fFreq || undefined });
    setShowCreate(false);
    setFName(''); setFType(''); setFQuorum('51'); setFQuorumType('majority'); setFFreq('quarterly');
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
                <div onClick={() => handleExpand(c.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: isExpanded ? C.borderLight : C.surface }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>
                        <span>מניין: {c.quorumType === 'all' ? '100% (כל החברים)' : `>${c.quorumMinimum}% (רוב)`}</span>
                        {c.meetingFrequency && <span>· תדירות: {FREQ_LABELS[c.meetingFrequency] || c.meetingFrequency}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge label={`${mems.length} חברים`} color={C.accent} bg={C.accentLight} />
                    <ChevronDown size={16} color={C.textMuted} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 18px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>חברי ועדה</span>
                      <Btn size="xs" variant="outline" onClick={() => setShowAddDirector(!showAddDirector)}>
                        <Plus size={10} /> הוסף חבר
                      </Btn>
                    </div>

                    {mems.map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: C.borderLight, borderRadius: 8, marginBottom: 4, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                            {initials(d.fullName)}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{d.fullName}</span>
                          <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{d.role}</span>
                        </div>
                        <button onClick={() => handleRemoveMember(c.id, d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <XCircle size={14} color={C.danger} />
                        </button>
                      </div>
                    ))}

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

      <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="ועדה חדשה" onSubmit={handleCreate} submitLabel="צור ועדה">
        <InputField label="שם ועדה" value={fName} onChange={setFName} required />
        <InputField label="סוג" value={fType} onChange={setFType} placeholder="audit / risk / credit / custom" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="מניין נדרש (%)" value={fQuorum} onChange={setFQuorum} type="number" />
          <SelectField label="סוג מניין" value={fQuorumType} onChange={setFQuorumType}
            options={[{ value: 'majority', label: 'רוב (>50%)' }, { value: 'all', label: 'כל החברים (100%)' }]} />
        </div>
        <SelectField label="תדירות ישיבות" value={fFreq} onChange={setFFreq}
          options={Object.entries(FREQ_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
      </FormModal>
    </>
  );
}
