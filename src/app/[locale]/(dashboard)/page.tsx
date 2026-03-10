'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/app/actions/dashboard';
import Link from 'next/link';
import {
  Shield, BarChart3, Handshake, ShieldCheck, Lock, ShieldAlert,
  Zap, AlertTriangle, Target, ArrowUpRight, ArrowDownRight,
  Users, Clock, TrendingUp, Activity, CheckSquare, Layers,
  CreditCard, Gauge, FileWarning, FileOutput, ChevronLeft, Settings2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart as RPieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { ScoreRing } from '@/shared/components/score-ring';
import { ChartCard } from '@/shared/components/chart-card';
import { ActivityFeed } from '@/shared/components/activity-feed';
import { computeCompliance, MODULE_WEIGHTS } from '@/shared/lib/compliance-engine';

import { C } from '@/shared/lib/design-tokens';
import { ReportDownloadButtons } from '@/shared/components/report-download-buttons';
import { generateDashboardReport } from '@/app/actions/report-generate';
import { useWidgetOrder, WidgetOrderModal, type WidgetDef } from '@/shared/components/widget-order';

const WIDGET_DEFS: WidgetDef[] = [
  { id: 'alerts', label: 'התראות איחור' },
  { id: 'agents', label: 'תור סוכנים' },
  { id: 'kpis', label: 'כרטיסי KPI' },
  { id: 'charts-trend', label: 'מגמה + בנצ׳מארק' },
  { id: 'charts-modules', label: 'מודולים + התפלגות' },
  { id: 'bottom', label: 'מועדים + פעילות' },
];

/* ═══════════════════════════════════════════════
   Demo data — exact match to V11 JSX
   ═══════════════════════════════════════════════ */
type ModuleData = {
  id: string;
  Icon: LucideIcon;
  name: string;
  score: number;
  tasks: number;
  reqs: number;
  met: number;
  reg: 'risk' | 'cyber';
};

const ALL_MODULES: ModuleData[] = [
  { id: 'gov', Icon: Shield, name: 'ממשל סיכונים', score: 78, tasks: 2, reqs: 14, met: 11, reg: 'risk' },
  { id: 'ops', Icon: BarChart3, name: 'סיכון תפעולי', score: 65, tasks: 4, reqs: 18, met: 12, reg: 'risk' },
  { id: 'out', Icon: Handshake, name: 'מיקור חוץ', score: 70, tasks: 1, reqs: 10, met: 7, reg: 'risk' },
  { id: 'bcp', Icon: ShieldCheck, name: 'המשכיות עסקית', score: 45, tasks: 3, reqs: 12, met: 5, reg: 'risk' },
  { id: 'cgov', Icon: Lock, name: 'ממשל סייבר', score: 55, tasks: 2, reqs: 16, met: 9, reg: 'cyber' },
  { id: 'cpro', Icon: ShieldAlert, name: 'הגנת סייבר', score: 40, tasks: 5, reqs: 22, met: 9, reg: 'cyber' },
  { id: 'cinc', Icon: Zap, name: 'אירועי סייבר', score: 80, tasks: 0, reqs: 8, met: 6, reg: 'cyber' },
  { id: 'credit', Icon: CreditCard, name: 'סיכון אשראי', score: 58, tasks: 3, reqs: 16, met: 9, reg: 'risk' },
  { id: 'kri', Icon: Gauge, name: 'מדדי סיכון (KRI)', score: 52, tasks: 2, reqs: 10, met: 5, reg: 'risk' },
  { id: 'events', Icon: FileWarning, name: 'דיווח אירועים', score: 65, tasks: 1, reqs: 8, met: 5, reg: 'risk' },
  { id: 'reports', Icon: FileOutput, name: 'דוחות', score: 70, tasks: 2, reqs: 6, met: 4, reg: 'risk' },
];

const MODULE_ROUTES: Record<string, string> = {
  gov: '/he/risk-governance', ops: '/he/operational-risk', out: '/he/outsourcing',
  bcp: '/he/bcp', cgov: '/he/cyber-governance', cpro: '/he/cyber-protection',
  cinc: '/he/cyber-incidents', credit: '/he/credit-risk', kri: '/he/kri',
  events: '/he/event-reporting', reports: '/he/reports',
};

const TREND_DATA: Record<string, { month: string; score: number; benchmark: number }[]> = {
  all: [
    { month: 'ספט', score: 32, benchmark: 50 }, { month: 'אוק', score: 38, benchmark: 52 },
    { month: 'נוב', score: 44, benchmark: 53 }, { month: 'דצמ', score: 50, benchmark: 54 },
    { month: 'ינו', score: 55, benchmark: 56 }, { month: 'פבר', score: 62, benchmark: 58 },
  ],
  risk: [
    { month: 'ספט', score: 38, benchmark: 52 }, { month: 'אוק', score: 45, benchmark: 54 },
    { month: 'נוב', score: 51, benchmark: 55 }, { month: 'דצמ', score: 56, benchmark: 57 },
    { month: 'ינו', score: 60, benchmark: 58 }, { month: 'פבר', score: 66, benchmark: 60 },
  ],
  cyber: [
    { month: 'ספט', score: 22, benchmark: 48 }, { month: 'אוק', score: 28, benchmark: 49 },
    { month: 'נוב', score: 35, benchmark: 50 }, { month: 'דצמ', score: 42, benchmark: 51 },
    { month: 'ינו', score: 48, benchmark: 53 }, { month: 'פבר', score: 54, benchmark: 55 },
  ],
};

const RADAR_DATA: Record<string, { subject: string; you: number; market: number }[]> = {
  all: [
    { subject: 'ממשל', you: 78, market: 65 }, { subject: 'תפעולי', you: 65, market: 60 },
    { subject: 'מיקור חוץ', you: 70, market: 55 }, { subject: 'המשכיות', you: 45, market: 50 },
    { subject: 'ממשל סייבר', you: 55, market: 50 }, { subject: 'הגנה', you: 40, market: 45 },
    { subject: 'אירועים', you: 80, market: 55 },
  ],
  risk: [
    { subject: 'ממשל', you: 78, market: 65 }, { subject: 'תפעולי', you: 65, market: 60 },
    { subject: 'מיקור חוץ', you: 70, market: 55 }, { subject: 'המשכיות', you: 45, market: 50 },
  ],
  cyber: [
    { subject: 'ממשל סייבר', you: 55, market: 50 }, { subject: 'הגנה', you: 40, market: 45 },
    { subject: 'אירועים', you: 80, market: 55 },
  ],
};

const RISK_DIST = [
  { name: 'קריטי', value: 2, color: C.danger },
  { name: 'גבוה', value: 4, color: '#E8875B' },
  { name: 'בינוני', value: 4, color: C.warning },
  { name: 'נמוך', value: 2, color: C.success },
];

const COMPLIANCE_DIST = [
  { name: 'עומד', value: 38, color: C.success },
  { name: 'בתהליך', value: 18, color: C.warning },
  { name: 'לא עומד', value: 12, color: C.danger },
  { name: 'טרם הוחל', value: 12, color: '#B0B8C4' },
];

const SCORES: Record<string, number> = { all: 62, risk: 66, cyber: 54 };
const BENCHMARKS: Record<string, number> = { all: 58, risk: 60, cyber: 55 };

type TaskItem = {
  title: string;
  mod: string;
  due: string;
  status: 'overdue' | 'active' | 'pending';
  reg: string;
};

const TASKS: TaskItem[] = [
  { title: 'השלמת BIA לפונקציות קריטיות', mod: 'המשכיות', due: '15/03/2026', status: 'overdue', reg: 'risk' },
  { title: 'דוח רבעוני Q1 לדירקטוריון', mod: 'ממשל', due: '31/03/2026', status: 'active', reg: 'risk' },
  { title: 'סריקת פגיעויות Q1', mod: 'הגנת סייבר', due: '31/03/2026', status: 'pending', reg: 'cyber' },
  { title: 'חידוש הערכת ספק קלאודפיי', mod: 'מיקור חוץ', due: '15/04/2026', status: 'pending', reg: 'risk' },
  { title: 'מבחן חדירה שנתי', mod: 'הגנת סייבר', due: '30/06/2026', status: 'pending', reg: 'cyber' },
];

/* ACTIVITIES moved to shared/components/activity-feed.tsx */

type PushItem = {
  id: string;
  agent: string;
  agentName: string;
  color: string;
  priority: 'high' | 'med' | 'low';
  title: string;
  desc: string;
  questionCount: number;
};

const AGENT_PUSH_QUEUE: PushItem[] = [
  { id: 'APQ-01', agent: '🛡️', agentName: 'סוכן ניהול סיכונים', color: '#00D4FF', priority: 'high', title: 'עדכון מפת סיכונים — רבעוני', desc: 'הגיע הזמן לעדכן את מפת הסיכונים. ענה על 5 שאלות מהירות.', questionCount: 5 },
  { id: 'APQ-02', agent: '🔐', agentName: 'סוכן סייבר', color: '#FF6B9D', priority: 'high', title: 'שאלון סריקת חולשות חודשי', desc: 'דיווח חודשי על סטטוס סריקות וממצאים.', questionCount: 4 },
  { id: 'APQ-03', agent: '🛡️', agentName: 'סוכן ניהול סיכונים', color: '#00D4FF', priority: 'med', title: 'אישור דוח רבעוני לדירקטוריון', desc: 'הדוח הרבעוני מוכן. בדוק ואשר לפני שליחה.', questionCount: 4 },
  { id: 'APQ-04', agent: '🛡️', agentName: 'סוכן ניהול סיכונים', color: '#00D4FF', priority: 'med', title: 'סקירת ספקים — רבעונית', desc: 'בדוק את סטטוס הספקים הקריטיים.', questionCount: 3 },
  { id: 'APQ-05', agent: '🔐', agentName: 'סוכן סייבר', color: '#FF6B9D', priority: 'low', title: 'דיווח אירוע סייבר', desc: 'דווח על אירוע סייבר שהתרחש.', questionCount: 5 },
];

const TASK_STYLE: Record<string, { bg: string; c: string; l: string; Icon: LucideIcon }> = {
  overdue: { bg: C.dangerBg, c: C.danger, l: 'באיחור', Icon: AlertTriangle },
  active: { bg: C.warningBg, c: C.warning, l: 'בתהליך', Icon: TrendingUp },
  pending: { bg: C.borderLight, c: C.textSec, l: 'ממתין', Icon: Clock },
};

const PRIO_COLORS: Record<string, { c: string; bg: string; l: string }> = {
  high: { c: C.danger, bg: C.dangerBg, l: 'דחוף' },
  med: { c: C.warning, bg: C.warningBg, l: 'רגיל' },
  low: { c: C.textMuted, bg: C.borderLight, l: 'נמוך' },
};

/* ═══════════════════════════════════════════════
   Custom Recharts tooltip
   ═══════════════════════════════════════════════ */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', direction: 'rtl', fontFamily: 'var(--font-assistant)', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          {p.name}: {p.value}%
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Agent Push Card
   ═══════════════════════════════════════════════ */
function AgentPushCard({ item }: { item: PushItem }) {
  const p = PRIO_COLORS[item.priority];
  return (
    <div
      onClick={() => window.dispatchEvent(new Event('nutela:open-questionnaire'))}
      style={{
        background: 'white',
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        borderRight: `4px solid ${item.color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: `${item.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}
        >
          {item.agent}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{item.title}</span>
            <span style={{ background: p.bg, color: p.c, fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{p.l}</span>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
            {item.agentName} · {item.questionCount} שאלות · ~1 דקה
          </div>
        </div>
        <ChevronLeft size={16} color={C.textMuted} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════ */
export default function DashboardPage() {
  const [dashFilter, setDashFilter] = useState<'all' | 'risk' | 'cyber'>('all');
  const [dbData, setDbData] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const { state: widgetState, setOrder: setWidgetOrder, visibleOrder } = useWidgetOrder(WIDGET_DEFS);

  useEffect(() => {
    getDashboardData().then(setDbData).catch(() => {/* silent fallback to demo data */});
  }, []);

  // Merge DB moduleScores into ALL_MODULES when available
  const mergedModules = (() => {
    if (!dbData?.moduleScores?.length) return ALL_MODULES;
    const dbMap = new Map(dbData.moduleScores.map(ms => [ms.id, ms]));
    return ALL_MODULES.map(m => {
      const db = dbMap.get(m.id);
      if (db) return { ...m, score: db.score, reqs: db.total || m.reqs, met: db.met || m.met };
      return m;
    });
  })();

  const modules = dashFilter === 'all' ? mergedModules : mergedModules.filter((m) => m.reg === dashFilter);
  const trend = TREND_DATA[dashFilter];
  const radar = RADAR_DATA[dashFilter];
  const overallScore = dbData && dashFilter === 'all' ? dbData.complianceScore : SCORES[dashFilter];
  const benchmarkScore = BENCHMARKS[dashFilter];

  // Use shared compliance engine for weighted score calculation
  const complianceResult = computeCompliance(
    modules.map((m) => ({ id: m.id, name: m.name, reqs: m.reqs, met: m.met, reg: m.reg, weight: MODULE_WEIGHTS[m.id] ?? 1 }))
  );
  const totalReqs = complianceResult.totalReqs;
  const metReqs = complianceResult.totalMet;
  const compliancePct = totalReqs ? Math.round((metReqs / totalReqs) * 100) : 0;
  // Merge overdue tasks from DB when available
  const mergedTasks: TaskItem[] = (() => {
    if (!dbData?.overdueTasks?.length) return TASKS;
    const dbTasks: TaskItem[] = dbData.overdueTasks.map((t: Record<string, unknown>) => ({
      title: String(t.title ?? ''),
      mod: String(t.module ?? ''),
      due: t.dueDate ? new Date(t.dueDate as string).toLocaleDateString('he-IL') : '—',
      status: 'overdue' as const,
      reg: 'risk' as const,
    }));
    // Combine DB overdue + remaining hardcoded non-overdue items
    return [...dbTasks, ...TASKS.filter(t => t.status !== 'overdue')];
  })();
  const filteredTasks = dashFilter === 'all' ? mergedTasks : mergedTasks.filter((t) => t.reg === dashFilter);
  const overdueCount = dbData ? dbData.overdueTasks.length : TASKS.filter((t) => t.status === 'overdue').length;
  const highPriorityCount = AGENT_PUSH_QUEUE.filter((p) => p.priority === 'high').length;

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  /* Widget section renderers keyed by widget id */
  const widgetSections: Record<string, React.ReactNode> = {
    alerts: overdueCount > 0 ? (
      <div key="alerts" style={{ background: C.dangerBg, border: '1px solid #F5C6C0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={15} color={C.danger} />
        <span style={{ fontSize: 13, color: C.danger, fontWeight: 600, fontFamily: 'var(--font-assistant)', flex: 1 }}>
          {overdueCount} פריטים באיחור
        </span>
        <button style={{ background: C.danger, color: 'white', border: 'none', padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>
          צפה
        </button>
      </div>
    ) : null,

    agents: (
      <div key="agents" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(0,212,255,0.06))', border: '1px solid rgba(123,97,255,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="white" />
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>הסוכנים מחכים לך</span>
              <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginRight: 6 }}>
                {' '}· {AGENT_PUSH_QUEUE.length} פריטים דורשים תשומת לב
              </span>
            </div>
          </div>
          <span style={{ background: 'linear-gradient(135deg, #7B61FF, #00D4FF)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, fontFamily: 'var(--font-rubik)' }}>
            {highPriorityCount} דחופים
          </span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {AGENT_PUSH_QUEUE.slice(0, 3).map((item) => (
            <AgentPushCard key={item.id} item={item} />
          ))}
          {AGENT_PUSH_QUEUE.length > 3 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: C.accent, fontFamily: 'var(--font-rubik)', padding: '4px 0', cursor: 'pointer', fontWeight: 600 }}>
              +{AGENT_PUSH_QUEUE.length - 3} פריטים נוספים ←
            </div>
          )}
        </div>
      </div>
    ),
  };

  return (
    <>
      {/* ═══ Ordered widget sections (before header) ═══ */}
      {visibleOrder.filter(id => id === 'alerts' || id === 'agents').map(id => (
        <div key={id}>{widgetSections[id]}</div>
      ))}

      {/* ═══ Dashboard header + filter ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 2px' }}>
            דשבורד
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            אשראי פייננס בע״מ · {today}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowCustomize(true)}
            title="התאמת דשבורד"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-rubik)', color: C.textSec,
            }}
          >
            <Settings2 size={13} /> התאמה
          </button>
          <ReportDownloadButtons generateAction={generateDashboardReport} filenameBase="dashboard" />
          <div style={{ display: 'flex', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 3 }}>
          {([
            { id: 'all' as const, label: 'הכל', Icon: Layers },
            { id: 'risk' as const, label: 'ניהול סיכונים', Icon: Shield },
            { id: 'cyber' as const, label: 'סיכוני סייבר', Icon: Lock },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => setDashFilter(f.id)}
              style={{
                background: dashFilter === f.id ? C.accentGrad : 'transparent',
                border: 'none', cursor: 'pointer',
                color: dashFilter === f.id ? 'white' : C.textSec,
                padding: '8px 16px', borderRadius: 8,
                fontFamily: 'var(--font-rubik)', fontSize: 12,
                fontWeight: dashFilter === f.id ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <f.Icon size={13} />{f.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* ═══ Ordered widget sections (after header) ═══ */}
      {visibleOrder.filter(id => id !== 'alerts' && id !== 'agents').map(id => {
        switch (id) {
          case 'kpis':
            return (
              <div key="kpis" className="rg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <ScoreRing score={overallScore} size={110} label="ציון עמידה" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8 }}>
                      {dashFilter === 'all' ? 'ציון כולל' : dashFilter === 'risk' ? 'ניהול סיכונים' : 'סיכוני סייבר'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      {overallScore >= benchmarkScore
                        ? <ArrowUpRight size={14} color={C.success} />
                        : <ArrowDownRight size={14} color={C.danger} />}
                      <span style={{ fontSize: 12, color: overallScore >= benchmarkScore ? C.success : C.danger, fontWeight: 600, fontFamily: 'var(--font-rubik)' }}>
                        {overallScore >= benchmarkScore ? '+' : ''}{overallScore - benchmarkScore}% מהשוק
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                      ממוצע שוק: {benchmarkScore}%
                    </div>
                  </div>
                </div>
                <Link href="/he/regulation" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                    <Target size={13} color={C.accent} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>עמידה בדרישות</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{metReqs}</span>
                    <span style={{ fontSize: 15, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>/ {totalReqs}</span>
                  </div>
                  <div style={{ background: C.borderLight, borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: `${compliancePct}%`, height: '100%', borderRadius: 6, background: C.accentGrad }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{compliancePct}% מולאו</div>
                </Link>
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}>
                  {([
                    { v: '12', l: 'סיכונים פתוחים', c: C.danger, Icon: AlertTriangle, bg: C.dangerBg },
                    { v: '6', l: 'ספקים פעילים', c: C.accent, Icon: Users, bg: C.accentLight },
                  ] as const).map((s, i) => (
                    <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <s.Icon size={16} color={s.c} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.c, fontFamily: 'var(--font-rubik)' }}>{s.v}</div>
                        <div style={{ fontSize: 10, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>{s.l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'charts-trend':
            return (
              <div key="charts-trend" className="rg-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                <ChartCard title="מגמת עמידה מול ממוצע שוק" Icon={TrendingUp}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 8, justifyContent: 'flex-end' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-assistant)', color: C.accent }}>
                      <div style={{ width: 16, height: 3, borderRadius: 2, background: C.accent }} />אתם
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-assistant)', color: C.textMuted }}>
                      <div style={{ width: 16, height: 0, borderTop: '2px dashed #64748B' }} />ממוצע שוק
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.accent} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={C.accent} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                      <XAxis dataKey="month" fontSize={10} fontFamily="Assistant" tick={{ fill: C.textMuted }} />
                      <YAxis domain={[0, 100]} fontSize={10} tick={{ fill: C.textMuted }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" name="אתם" stroke={C.accent} strokeWidth={2.5} fill="url(#gS)" dot={{ r: 3, fill: C.accent }} />
                      <Line type="monotone" dataKey="benchmark" name="ממוצע שוק" stroke={C.textMuted} strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="בנצ׳מארק מול שוק" Icon={Target}>
                  <ResponsiveContainer width="100%" height={210}>
                    <RadarChart data={radar} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                      <PolarGrid stroke={C.borderLight} />
                      <PolarAngleAxis dataKey="subject" fontSize={9} fontFamily="Assistant" tick={{ fill: C.textSec }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="אתם" dataKey="you" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="שוק" dataKey="market" stroke={C.textMuted} fill={C.textMuted} fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="4 3" />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            );

          case 'charts-modules':
            return (
              <div key="charts-modules" className="rg-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                <ChartCard title="מודולים" Icon={Layers}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {modules.map((m) => {
                      const color = m.score >= 80 ? C.success : m.score >= 50 ? C.warning : C.danger;
                      const Ic = m.Icon;
                      const href = MODULE_ROUTES[m.id] || '/he';
                      return (
                        <Link key={m.id} href={href} style={{ background: C.borderLight, borderRadius: 8, padding: 12, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.1s', textDecoration: 'none', display: 'block' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Ic size={13} color={C.accent} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', flex: 1 }}>{m.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-rubik)' }}>{m.score}%</span>
                          </div>
                          <div style={{ background: 'white', borderRadius: 3, height: 5, overflow: 'hidden', marginBottom: 4 }}>
                            <div style={{ width: `${m.score}%`, height: '100%', borderRadius: 3, background: color }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                            <span>{m.met}/{m.reqs} דרישות</span>
                            {m.tasks > 0 && <span>{m.tasks} משימות</span>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </ChartCard>
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 14 }}>
                  <ChartCard title="התפלגות סיכונים" Icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={100}>
                      <RPieChart>
                        <Pie data={RISK_DIST} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value">
                          {RISK_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </RPieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {RISK_DIST.map((e, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                          <div style={{ width: 7, height: 7, borderRadius: 2, background: e.color }} />{e.name} ({e.value})
                        </span>
                      ))}
                    </div>
                  </ChartCard>
                  <ChartCard title="סטטוס קומפליאנס" Icon={CheckSquare}>
                    <ResponsiveContainer width="100%" height={100}>
                      <RPieChart>
                        <Pie data={COMPLIANCE_DIST} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value">
                          {COMPLIANCE_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </RPieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {COMPLIANCE_DIST.map((e, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                          <div style={{ width: 7, height: 7, borderRadius: 2, background: e.color }} />{e.name} ({e.value})
                        </span>
                      ))}
                    </div>
                  </ChartCard>
                </div>
              </div>
            );

          case 'bottom':
            return (
              <div key="bottom" className="rg-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <ChartCard title="מועדים קרובים" Icon={Clock}>
                  {filteredTasks.map((t, i) => {
                    const s = TASK_STYLE[t.status];
                    const StatusIcon = s.Icon;
                    return (
                      <div key={i} style={{ padding: '9px 0', borderBottom: i < filteredTasks.length - 1 ? `1px solid ${C.borderLight}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: 'var(--font-assistant)' }}>{t.title}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>{t.mod} · {t.due}</div>
                        </div>
                        <span style={{ background: s.bg, color: s.c, fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 5, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                          <StatusIcon size={9} />{s.l}
                        </span>
                      </div>
                    );
                  })}
                </ChartCard>
                <ChartCard title="פעילות אחרונה" Icon={Activity}>
                  <ActivityFeed limit={6} />
                </ChartCard>
              </div>
            );

          default:
            return null;
        }
      })}

      {/* ═══ Widget Customize Modal ═══ */}
      {showCustomize && (
        <WidgetOrderModal
          widgets={WIDGET_DEFS}
          state={widgetState}
          onSave={setWidgetOrder}
          onClose={() => setShowCustomize(false)}
        />
      )}
    </>
  );
}
