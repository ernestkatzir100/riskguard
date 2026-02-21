'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, FileText, Clock,
  BookOpen, Activity, Shield, Sparkles, Plus, Trash2,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { getBCPPlan, getCriticalFunctions, getBCPTests, createBCPTest, deleteBCPTest } from '@/app/actions/bcp';
import { FormModal } from '@/shared/components/form-modal';
import { PageSkeleton } from '@/shared/components/skeleton-loader';

/* ═══ BCP Data ═══ */
const BCP_DOCUMENTS: { id: string; name: string; version: string; date: string; status: 'approved' | 'draft' | 'review' | 'missing' }[] = [
  { id: 'T10', name: 'תוכנית המשכיות עסקית (BCP)', version: 'v1.0', date: '15/08/2025', status: 'review' },
  { id: 'T11', name: 'ניתוח השפעה עסקית (BIA)', version: '—', date: '—', status: 'missing' },
  { id: 'T12', name: 'תוכנית Disaster Recovery', version: 'v1.0', date: '20/09/2025', status: 'review' },
];

const DOC_STATUS = {
  approved: { l: 'מאושר', c: C.success, bg: C.successBg },
  draft: { l: 'טיוטה', c: C.warning, bg: C.warningBg },
  review: { l: 'בסקירה', c: C.accent, bg: C.accentLight },
  missing: { l: 'חסר', c: C.danger, bg: C.dangerBg },
};

const BIA_PROCESSES = [
  { name: 'מערכת אשראי', rto: '4 שעות', rpo: '1 שעה', impact: 'קריטי', alternative: 'DR Site', status: 'partial' },
  { name: 'מערכת גבייה', rto: '8 שעות', rpo: '4 שעות', impact: 'קריטי', alternative: 'DR Site', status: 'partial' },
  { name: 'CRM', rto: '24 שעות', rpo: '12 שעות', impact: 'גבוה', alternative: 'גיבוי ענן', status: 'not_defined' },
  { name: 'אתר אינטרנט', rto: '12 שעות', rpo: '4 שעות', impact: 'בינוני', alternative: 'CDN', status: 'not_defined' },
  { name: 'דוא״ל ארגוני', rto: '4 שעות', rpo: '0', impact: 'גבוה', alternative: 'M365 DR', status: 'ok' },
];

const DR_TESTS = [
  { type: 'Failover מלא', frequency: 'שנתי', lastTest: '09/2024', nextDue: '09/2025', status: 'overdue' as const },
  { type: 'גיבוי ושחזור', frequency: 'רבעוני', lastTest: '12/2025', nextDue: '03/2026', status: 'upcoming' as const },
  { type: 'בדיקת תקשורת', frequency: 'חודשי', lastTest: '01/2026', nextDue: '02/2026', status: 'ok' as const },
  { type: 'תרגיל שולחני', frequency: 'רבעוני', lastTest: '—', nextDue: '—', status: 'missing' as const },
];

const BCP_RISKS = [
  { id: 'R14', name: 'היעדר תוכנית המשכיות עסקית (BCP) מעודכנת', inherent: 4, residual: 3 },
  { id: 'R15', name: 'אי-ביצוע ניתוח השפעה עסקית (BIA)', inherent: 3, residual: 3 },
  { id: 'R16', name: 'כשל בשחזור מערכות לאחר אסון', inherent: 5, residual: 5 },
  { id: 'R17', name: 'השבתה ממושכת עקב אירוע חירום', inherent: 4, residual: 3 },
];

const RISK_LEVELS: Record<number, { label: string; color: string }> = { 1: { label: 'זניח', color: '#7CB5A0' }, 2: { label: 'נמוך', color: C.success }, 3: { label: 'בינוני', color: C.warning }, 4: { label: 'גבוה', color: '#E8875B' }, 5: { label: 'קריטי', color: C.danger } };

const TEST_STATUS = {
  ok: { l: 'תקין', c: C.success, bg: C.successBg },
  upcoming: { l: 'בקרוב', c: C.accent, bg: C.accentLight },
  overdue: { l: 'באיחור', c: C.danger, bg: C.dangerBg },
  missing: { l: 'טרם בוצע', c: C.danger, bg: C.dangerBg },
};

const IMPACT_COLORS: Record<string, string> = { 'קריטי': C.danger, 'גבוה': '#E8875B', 'בינוני': C.warning };

export default function BCPPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bia' | 'dr'>('overview');
  const [biaProcesses, setBiaProcesses] = useState(BIA_PROCESSES);
  const [drTests, setDrTests] = useState<{ id?: string; type: string; frequency: string; lastTest: string; nextDue: string; status: 'ok' | 'upcoming' | 'overdue' | 'missing' }[]>(DR_TESTS);
  const [showAddTest, setShowAddTest] = useState(false);
  const [testForm, setTestForm] = useState({ testType: '', testDate: '', scenario: '', results: '', nextTestDate: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTestTarget, setDeleteTestTarget] = useState<{ id?: string; type: string } | null>(null);
  const [testErrors, setTestErrors] = useState<Record<string, string>>({});

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleCreateTest() {
    const te: Record<string, string> = {};
    if (!testForm.testType.trim()) te.testType = 'סוג תרגיל נדרש';
    if (!testForm.testDate) te.testDate = 'תאריך ביצוע נדרש';
    setTestErrors(te);
    if (Object.keys(te).length > 0) return;
    try {
      await createBCPTest({ ...testForm, participants: [] });
      showToast('תרגיל נוצר בהצלחה');
      setShowAddTest(false);
      setTestForm({ testType: '', testDate: '', scenario: '', results: '', nextTestDate: '' });
      const testsRes = await getBCPTests();
      if (testsRes?.length) {
        setDrTests(testsRes.map((t: Record<string, unknown>) => ({
          id: String(t.id ?? ''),
          type: String(t.testType ?? ''),
          frequency: '—',
          lastTest: t.testDate ? new Date(t.testDate as string).toLocaleDateString('he-IL') : '—',
          nextDue: t.nextTestDate ? new Date(t.nextTestDate as string).toLocaleDateString('he-IL') : '—',
          status: 'ok' as const,
        })));
      }
    } catch { showToast('שגיאה ביצירת תרגיל', 'error'); }
  }

  async function handleDeleteTest() {
    if (!deleteTestTarget) return;
    const prev = [...drTests];
    setDrTests(drTests.filter(t => deleteTestTarget.id ? t.id !== deleteTestTarget.id : t.type !== deleteTestTarget.type));
    setDeleteTestTarget(null);
    try {
      if (deleteTestTarget.id) await deleteBCPTest(deleteTestTarget.id);
      showToast('תרגיל נמחק');
    } catch { setDrTests(prev); showToast('שגיאה במחיקה', 'error'); }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [, funcsRes, testsRes] = await Promise.all([
          getBCPPlan(),
          getCriticalFunctions(),
          getBCPTests(),
        ]);
        if (funcsRes?.length) {
          setBiaProcesses(funcsRes.map((f: Record<string, unknown>) => ({
            name: String(f.functionName ?? ''),
            rto: f.rtoHours ? `${f.rtoHours} שעות` : '—',
            rpo: f.rpoHours ? `${f.rpoHours} שעות` : '—',
            impact: Number(f.impactLevel) >= 5 ? 'קריטי' : Number(f.impactLevel) >= 4 ? 'גבוה' : 'בינוני',
            alternative: String(f.dependencies ?? '—'),
            status: 'partial' as const,
          })));
        }
        if (testsRes?.length) {
          setDrTests(testsRes.map((t: Record<string, unknown>) => ({
            id: String(t.id ?? ''),
            type: String(t.testType ?? ''),
            frequency: '—',
            lastTest: t.testDate ? new Date(t.testDate as string).toLocaleDateString('he-IL') : '—',
            nextDue: t.nextTestDate ? new Date(t.nextTestDate as string).toLocaleDateString('he-IL') : '—',
            status: 'ok' as const,
          })));
        }
      } catch { /* demo fallback */ } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const complianceScore = 45;
  const docApproved = BCP_DOCUMENTS.filter(d => d.status === 'approved').length;
  const docMissing = BCP_DOCUMENTS.filter(d => d.status === 'missing').length;
  const testsOverdue = drTests.filter(t => t.status === 'overdue' || t.status === 'missing').length;

  if (loading) return <PageSkeleton />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color={C.accent} /> המשכיות עסקית
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            BCP · BIA · Disaster Recovery · תרגילים
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> חוזר 2024-10-2 § 2(ב)(5)
          </div>
        </div>
      </div>

      {/* KPIs — Red/Critical theme */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'ציון עמידה', value: `${complianceScore}%`, c: C.danger },
          { label: 'מסמכים מאושרים', value: `${docApproved}/${BCP_DOCUMENTS.length}`, c: docApproved === 0 ? C.danger : C.warning },
          { label: 'מסמכים חסרים', value: docMissing, c: docMissing > 0 ? C.danger : C.success },
          { label: 'תרגילים באיחור', value: testsOverdue, c: testsOverdue > 0 ? C.danger : C.success },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center', borderTop: `3px solid ${kpi.c}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* NuTeLa Inline Panel */}
      <div style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(189,52,254,0.05))', border: '1px solid rgba(123,97,255,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7B61FF, #BD34FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7B61FF', fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>NuTeLa</div>
          <div style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
            ניתוח השפעת עסקים (BIA) חסר. אצור עבורך שאלון BIA?
          </div>
        </div>
        <button style={{ background: 'linear-gradient(135deg, #7B61FF, #BD34FE)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>
          צור שאלון BIA
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          { id: 'overview' as const, l: 'סקירה כללית', Icon: ShieldCheck },
          { id: 'bia' as const, l: 'ניתוח השפעה (BIA)', Icon: Activity },
          { id: 'dr' as const, l: 'Disaster Recovery', Icon: Shield },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? C.accent : C.surface,
            color: activeTab === t.id ? 'white' : C.textSec,
            border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
            borderRadius: 8, padding: '7px 16px', fontSize: 11, fontWeight: activeTab === t.id ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5,
          }}><t.Icon size={12} />{t.l}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Documents */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} color={C.accent} /> מסמכי BCP ({BCP_DOCUMENTS.length})
            </h3>
            {BCP_DOCUMENTS.map(d => {
              const s = DOC_STATUS[d.status];
              return (
                <div key={d.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: 'var(--font-assistant)' }}>{d.name}</div>
                    <div style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{d.id} · {d.version} · {d.date}</div>
                  </div>
                  <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{s.l}</span>
                </div>
              );
            })}
          </div>

          {/* Risks */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} color={C.danger} /> סיכוני המשכיות ({BCP_RISKS.length})
            </h3>
            {BCP_RISKS.map(r => {
              const rl = RISK_LEVELS[r.residual];
              return (
                <div key={r.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: 'var(--font-assistant)' }}>{r.name}</div>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{r.id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ background: `${RISK_LEVELS[r.inherent].color}18`, color: RISK_LEVELS[r.inherent].color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{r.inherent}</span>
                    <span style={{ color: C.textMuted, fontSize: 10 }}>→</span>
                    <span style={{ background: `${rl.color}18`, color: rl.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{r.residual}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Schedule */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color={C.warning} /> לוח תרגילים ובדיקות
              </h3>
              <button onClick={() => setShowAddTest(true)} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={12} /> הוסף תרגיל
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
              <thead>
                <tr style={{ background: C.borderLight }}>
                  {['סוג תרגיל', 'תדירות', 'ביצוע אחרון', 'הבא', 'סטטוס', ''].map(h => (
                    <th key={h} style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drTests.map((t, i) => {
                  const s = TEST_STATUS[t.status];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                      <td style={{ padding: '10px', fontWeight: 500, color: C.text }}>{t.type}</td>
                      <td style={{ padding: '10px', color: C.textSec }}>{t.frequency}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-rubik)', color: t.lastTest === '—' ? C.danger : C.textSec }}>{t.lastTest}</td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-rubik)' }}>{t.nextDue}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: s.bg, color: s.c, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{s.l}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button onClick={() => setDeleteTestTarget({ id: t.id, type: t.type })} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                          <Trash2 size={11} color={C.danger} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BIA Tab */}
      {activeTab === 'bia' && (
        <div>
          {/* Warning banner */}
          <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color={C.danger} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, fontFamily: 'var(--font-rubik)' }}>ניתוח BIA טרם הושלם</div>
              <div style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>יש להשלים ניתוח השפעה עסקית (BIA) עד Q2/2026 בהתאם לדרישות חוזר 2024-10-2</div>
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={13} color={C.accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>תהליכים קריטיים — RTO/RPO</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
              <thead>
                <tr style={{ background: C.borderLight }}>
                  {['תהליך', 'RTO', 'RPO', 'השפעה', 'חלופה', 'סטטוס'].map(h => (
                    <th key={h} style={{ textAlign: 'right', padding: '9px 10px', fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {biaProcesses.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{p.name}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-rubik)', fontWeight: 600 }}>{p.rto}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-rubik)', fontWeight: 600 }}>{p.rpo}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ color: IMPACT_COLORS[p.impact] || C.textSec, fontWeight: 600, fontFamily: 'var(--font-rubik)', fontSize: 11 }}>{p.impact}</span>
                    </td>
                    <td style={{ padding: '10px', color: C.textSec }}>{p.alternative}</td>
                    <td style={{ padding: '10px' }}>
                      {p.status === 'ok' ? (
                        <span style={{ background: C.successBg, color: C.success, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>מוגדר</span>
                      ) : p.status === 'partial' ? (
                        <span style={{ background: C.warningBg, color: C.warning, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>חלקי</span>
                      ) : (
                        <span style={{ background: C.dangerBg, color: C.danger, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>לא מוגדר</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DR Tab */}
      {activeTab === 'dr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* DR Plan Status */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color={C.accent} /> תוכנית DR
            </h3>
            {[
              { l: 'סטטוס', v: 'בסקירה', c: C.accent },
              { l: 'גרסה', v: 'v1.0', c: C.text },
              { l: 'אתר DR', v: 'AWS eu-west-1', c: C.text },
              { l: 'גיבוי אוטומטי', v: 'כל 4 שעות', c: C.success },
              { l: 'Failover אחרון', v: '09/2024 — באיחור', c: C.danger },
              { l: 'RTO מוגדר', v: '4 שעות', c: C.text },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{item.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: item.c, fontFamily: 'var(--font-rubik)' }}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* Emergency Team */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} color={C.danger} /> צוות חירום
            </h3>
            {[
              { role: 'מנהל חירום', name: 'יוסי לוי', phone: '050-XXX-XXXX' },
              { role: 'IT ראשי', name: 'דנה כהן', phone: '050-XXX-XXXX' },
              { role: 'תפעול', name: 'רונית גולד', phone: '050-XXX-XXXX' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{m.role}</div>
                </div>
                <span style={{ fontSize: 10, color: C.textSec, fontFamily: 'var(--font-rubik)', direction: 'ltr' as const }}>{m.phone}</span>
              </div>
            ))}
          </div>

          {/* DR Activation Procedure */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} color={C.warning} /> נוהל הפעלת DR
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { step: '1', title: 'זיהוי אסון', time: '15 דקות', desc: 'הפעלת צוות חירום' },
                { step: '2', title: 'הערכת נזק', time: '30 דקות', desc: 'החלטה על failover' },
                { step: '3', title: 'הפעלת DR', time: '4 שעות', desc: 'מעבר לאתר חלופי' },
                { step: '4', title: 'אימות', time: '1 שעה', desc: 'בדיקת תקינות נתונים' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: C.borderLight, borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.accentGrad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>{s.step}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>{s.time}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Create Test Modal */}
      <FormModal open={showAddTest} title="הוספת תרגיל BCP" onClose={() => setShowAddTest(false)} onSubmit={handleCreateTest} hideFooter>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, display: 'block', marginBottom: 4, fontFamily: 'var(--font-rubik)' }}>סוג תרגיל *</label>
              <input value={testForm.testType} onChange={e => setTestForm(p => ({ ...p, testType: e.target.value }))} placeholder="למשל: Failover מלא" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${testErrors.testType ? C.danger : C.border}`, fontSize: 13, fontFamily: 'var(--font-assistant)', background: C.surface, color: C.text }} />
              {testErrors.testType && <div style={{ fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>{testErrors.testType}</div>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, display: 'block', marginBottom: 4, fontFamily: 'var(--font-rubik)' }}>תאריך ביצוע *</label>
              <input type="date" value={testForm.testDate} onChange={e => setTestForm(p => ({ ...p, testDate: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${testErrors.testDate ? C.danger : C.border}`, fontSize: 13, fontFamily: 'var(--font-rubik)', background: C.surface, color: C.text }} />
              {testErrors.testDate && <div style={{ fontSize: 11, color: C.danger, marginTop: 2, fontFamily: 'var(--font-assistant)' }}>{testErrors.testDate}</div>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, display: 'block', marginBottom: 4, fontFamily: 'var(--font-rubik)' }}>תרחיש</label>
              <textarea value={testForm.scenario} onChange={e => setTestForm(p => ({ ...p, scenario: e.target.value }))} rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'var(--font-assistant)', background: C.surface, color: C.text, resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, display: 'block', marginBottom: 4, fontFamily: 'var(--font-rubik)' }}>תוצאות</label>
              <textarea value={testForm.results} onChange={e => setTestForm(p => ({ ...p, results: e.target.value }))} rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'var(--font-assistant)', background: C.surface, color: C.text, resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, display: 'block', marginBottom: 4, fontFamily: 'var(--font-rubik)' }}>תאריך תרגיל הבא</label>
              <input type="date" value={testForm.nextTestDate} onChange={e => setTestForm(p => ({ ...p, nextTestDate: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'var(--font-rubik)', background: C.surface, color: C.text }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 4 }}>
              <button onClick={handleCreateTest} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>שמור</button>
              <button onClick={() => setShowAddTest(false)} style={{ background: C.surface, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>ביטול</button>
            </div>
          </div>
      </FormModal>

      {/* Delete Test Confirmation */}
      <FormModal open={!!deleteTestTarget} title="מחיקת תרגיל" onClose={() => setDeleteTestTarget(null)} onSubmit={handleDeleteTest} hideFooter>
          <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: '0 0 16px' }}>
            למחוק את התרגיל <strong>&quot;{deleteTestTarget?.type}&quot;</strong>?
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
            <button onClick={handleDeleteTest} style={{ background: C.danger, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>מחק</button>
            <button onClick={() => setDeleteTestTarget(null)} style={{ background: C.surface, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>ביטול</button>
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
