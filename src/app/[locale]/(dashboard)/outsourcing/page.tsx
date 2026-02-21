'use client';

import { useState, useEffect } from 'react';
import {
  Handshake, Shield, CheckSquare,
  X, BookOpen, Activity, Pencil, Trash2,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { getVendors, createVendor, updateVendor, deleteVendor } from '@/app/actions/vendors';
import { FormModal } from '@/shared/components/form-modal';
import { VendorForm } from '@/shared/components/forms/vendor-form';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { EmptyState, EMPTY_STATES } from '@/shared/components/empty-state';

/* ═══ Vendor Data — from V11 ═══ */
type Assessment = { date: string; score: number; status: string; assessor: string };
type Vendor = {
  id: string; name: string; service: string; criticality: 'קריטי' | 'גבוה' | 'רגיל';
  riskRating: number; sla: string; contractEnd: string; hasAlternative: boolean;
  exitStrategy: boolean; certifications: string[]; assessments: Assessment[];
  reg: string; section: string; reqId: string; contact: string; email: string;
};

const VENDORS: Vendor[] = [
  {
    id: 'V01', name: 'קלאוד-טק', service: 'שרתים + תשתית ענן', criticality: 'קריטי',
    riskRating: 4, sla: '99.9%', contractEnd: '12/2026', hasAlternative: true,
    exitStrategy: true, certifications: ['ISO 27001', 'SOC2 Type II'],
    assessments: [
      { date: '01/12/2025', score: 82, status: 'הושלם', assessor: 'יוסי לוי' },
      { date: '15/12/2024', score: 78, status: 'הושלם', assessor: 'יוסי לוי' },
    ],
    reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-01', contact: 'אורי כהן', email: 'uri@cloudtek.co.il',
  },
  {
    id: 'V02', name: 'פיננס-סופט', service: 'מערכת ניהול אשראי', criticality: 'קריטי',
    riskRating: 5, sla: '99.5%', contractEnd: '06/2027', hasAlternative: false,
    exitStrategy: false, certifications: ['ISO 27001'],
    assessments: [
      { date: '01/12/2025', score: 65, status: 'הושלם', assessor: 'יוסי לוי' },
    ],
    reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-01', contact: 'גלית שמש', email: 'galit@financesoft.co.il',
  },
  {
    id: 'V03', name: 'סייבר-שילד', service: 'הגנת סייבר ו-SOC', criticality: 'גבוה',
    riskRating: 3, sla: '99.8%', contractEnd: '03/2026', hasAlternative: true,
    exitStrategy: true, certifications: ['ISO 27001', 'SOC2 Type II', 'CREST'],
    assessments: [
      { date: '15/11/2025', score: 91, status: 'הושלם', assessor: 'דנה כהן' },
      { date: '10/11/2024', score: 88, status: 'הושלם', assessor: 'דנה כהן' },
    ],
    reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-03', contact: 'רועי לב', email: 'roi@cybershield.co.il',
  },
  {
    id: 'V04', name: 'דאטה-בק', service: 'גיבוי ושחזור נתונים', criticality: 'גבוה',
    riskRating: 3, sla: '99.9%', contractEnd: '09/2026', hasAlternative: false,
    exitStrategy: false, certifications: ['SOC2 Type I'],
    assessments: [
      { date: '20/10/2025', score: 74, status: 'הושלם', assessor: 'יוסי לוי' },
    ],
    reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-03', contact: 'מאיר דוד', email: 'meir@databak.co.il',
  },
  {
    id: 'V05', name: 'טלקום-פרו', service: 'תקשורת + אינטרנט', criticality: 'רגיל',
    riskRating: 2, sla: '99.5%', contractEnd: '12/2025', hasAlternative: true,
    exitStrategy: true, certifications: ['ISO 9001'],
    assessments: [
      { date: '01/09/2025', score: 80, status: 'הושלם', assessor: 'יוסי לוי' },
    ],
    reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-01', contact: 'שרה לוין', email: 'sara@telecompro.co.il',
  },
  {
    id: 'V06', name: 'HR-סרוויס', service: 'שירותי שכר ומשאבי אנוש', criticality: 'רגיל',
    riskRating: 2, sla: '99%', contractEnd: '12/2026', hasAlternative: true,
    exitStrategy: true, certifications: ['ISO 27001'],
    assessments: [
      { date: '15/08/2025', score: 85, status: 'הושלם', assessor: 'יוסי לוי' },
    ],
    reg: '2024-10-2', section: '2(ב)(4)', reqId: 'OUT-05', contact: 'נועה ברק', email: 'noa@hrservice.co.il',
  },
];

const RISK_LEVELS: Record<number, { label: string; color: string }> = { 1: { label: 'זניח', color: '#7CB5A0' }, 2: { label: 'נמוך', color: C.success }, 3: { label: 'בינוני', color: C.warning }, 4: { label: 'גבוה', color: '#E8875B' }, 5: { label: 'קריטי', color: C.danger } };
const CRIT_COLORS = { 'קריטי': { c: C.danger, bg: C.dangerBg }, 'גבוה': { c: C.warning, bg: C.warningBg }, 'רגיל': { c: C.success, bg: C.successBg } };

export default function OutsourcingPage() {
  const [vendors, setVendors] = useState<Vendor[]>(VENDORS);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [filterCrit, setFilterCrit] = useState<string>('הכל');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadData() {
    try {
      const result = await getVendors();
      if (result && Array.isArray(result) && result.length > 0) {
        const mapped: Vendor[] = result.map((v: Record<string, unknown>) => ({
          id: String(v.id ?? ''),
          name: String(v.name ?? ''),
          service: String(v.service ?? ''),
          criticality: (v.criticality as Vendor['criticality']) ?? 'רגיל',
          riskRating: Number(v.riskRating ?? 2),
          sla: String(v.sla ?? ''),
          contractEnd: String(v.contractEnd ?? ''),
          hasAlternative: Boolean(v.hasAlternative),
          exitStrategy: Boolean(v.exitStrategy),
          certifications: Array.isArray(v.certifications) ? v.certifications : [],
          assessments: Array.isArray(v.assessments) ? v.assessments : [],
          reg: String(v.reg ?? ''),
          section: String(v.section ?? ''),
          reqId: String(v.reqId ?? ''),
          contact: String(v.contact ?? ''),
          email: String(v.email ?? ''),
        }));
        setVendors(mapped);
      }
    } catch { /* fallback to demo */ } finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  const filtered = filterCrit === 'הכל' ? vendors : vendors.filter(v => v.criticality === filterCrit);
  const selected = selectedVendor ? vendors.find(v => v.id === selectedVendor) : null;

  const criticalCount = vendors.filter(v => v.criticality === 'קריטי').length;
  const noExitCount = vendors.filter(v => !v.exitStrategy).length;
  const avgScore = Math.round(vendors.reduce((a, v) => a + (v.assessments[0]?.score || 0), 0) / vendors.length);

  if (loading) return <PageSkeleton />;
  if (vendors.length === 0) return <EmptyState {...EMPTY_STATES['outsourcing']} />;

  return (
    <>
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Handshake size={20} color={C.accent} /> ניהול מיקור חוץ
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            {vendors.length} ספקים · {criticalCount} קריטיים · {noExitCount} ללא אסטרטגיית יציאה
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowAddVendor(true)} style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5 }}>
            + הוסף ספק
          </button>
          <div style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> חוזר 2024-10-2 § 2(ב)(4)
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'סה״כ ספקים', value: vendors.length, c: C.accent },
          { label: 'ספקים קריטיים', value: criticalCount, c: C.danger },
          { label: 'ציון הערכה ממוצע', value: `${avgScore}%`, c: avgScore >= 80 ? C.success : C.warning },
          { label: 'ללא Exit Strategy', value: noExitCount, c: noExitCount > 0 ? C.danger : C.success },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {['הכל', 'קריטי', 'גבוה', 'רגיל'].map(c => (
          <button key={c} onClick={() => setFilterCrit(c)} style={{ background: filterCrit === c ? C.accent : C.surface, color: filterCrit === c ? 'white' : C.textSec, border: `1px solid ${filterCrit === c ? C.accent : C.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: filterCrit === c ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Vendor List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: selected ? '0 12px 12px 0' : 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
              <thead>
                <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                  {['ספק', 'שירות', 'קריטיות', 'דירוג סיכון', 'SLA', 'חוזה עד', 'חלופה', 'Exit'].map(h => (
                    <th key={h} style={{ textAlign: 'right', padding: '9px 10px', fontWeight: 600, fontSize: 11, color: C.textSec, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  const isSel = selectedVendor === v.id;
                  const cc = CRIT_COLORS[v.criticality];
                  const rl = RISK_LEVELS[v.riskRating];
                  return (
                    <tr key={v.id} onClick={() => setSelectedVendor(isSel ? null : v.id)} style={{
                      borderBottom: `1px solid ${C.borderLight}`, cursor: 'pointer',
                      background: isSel ? C.accentLight : i % 2 === 0 ? 'white' : '#FAFBFC',
                      borderInlineEnd: isSel ? `3px solid ${C.accent}` : '3px solid transparent',
                      transition: 'background 0.1s',
                    }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                        {v.name}
                        <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 400, fontFamily: 'var(--font-assistant)' }}>{v.id}</div>
                      </td>
                      <td style={{ padding: '10px', color: C.textSec }}>{v.service}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: cc.bg, color: cc.c, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{v.criticality}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: `${rl.color}18`, color: rl.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{v.riskRating} — {rl.label}</span>
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-rubik)', fontWeight: 600 }}>{v.sla}</td>
                      <td style={{ padding: '10px', fontSize: 11, fontFamily: 'var(--font-rubik)' }}>{v.contractEnd}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {v.hasAlternative ? <CheckSquare size={14} color={C.success} /> : <X size={14} color={C.danger} />}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {v.exitStrategy ? <CheckSquare size={14} color={C.success} /> : <X size={14} color={C.danger} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: 380, background: C.surface, borderInlineStart: `1px solid ${C.border}`, borderRadius: '12px 0 0 12px', padding: 20, overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>{selected.id}</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button onClick={() => setEditVendor(selected)} title="ערוך" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                  <Pencil size={12} color={C.textSec} />
                </button>
                <button onClick={() => setDeleteTarget(selected)} title="מחק" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                  <Trash2 size={12} color={C.danger} />
                </button>
                <button onClick={() => setSelectedVendor(null)} style={{ background: C.borderLight, border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color={C.textSec} /></button>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>{selected.name}</h3>
            <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 14 }}>{selected.service}</p>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ background: CRIT_COLORS[selected.criticality].bg, color: CRIT_COLORS[selected.criticality].c, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{selected.criticality}</span>
              <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>({selected.reg}, §{selected.section}, {selected.reqId})</span>
            </div>

            {/* Profile */}
            <div style={{ background: C.borderLight, borderRadius: 10, padding: 14, marginBottom: 14 }}>
              {[
                { l: 'SLA', v: selected.sla },
                { l: 'חוזה עד', v: selected.contractEnd },
                { l: 'איש קשר', v: selected.contact },
                { l: 'אימייל', v: selected.email },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{f.l}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{f.v}</span>
                </div>
              ))}
            </div>

            {/* Status indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: selected.exitStrategy ? C.successBg : C.dangerBg, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 4 }}>Exit Strategy</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: selected.exitStrategy ? C.success : C.danger, fontFamily: 'var(--font-rubik)' }}>
                  {selected.exitStrategy ? 'קיימת' : 'חסרה'}
                </div>
              </div>
              <div style={{ background: selected.hasAlternative ? C.successBg : C.dangerBg, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 4 }}>חלופה זמינה</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: selected.hasAlternative ? C.success : C.danger, fontFamily: 'var(--font-rubik)' }}>
                  {selected.hasAlternative ? 'כן' : 'לא'}
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Shield size={12} color={C.accent} /> הסמכות ({selected.certifications.length})
              </h4>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {selected.certifications.map((cert, i) => (
                  <span key={i} style={{ background: C.accentLight, color: C.accent, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{cert}</span>
                ))}
              </div>
            </div>

            {/* Assessment History */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Activity size={12} color={C.warning} /> היסטוריית הערכות ({selected.assessments.length})
              </h4>
              {selected.assessments.map((a, i) => (
                <div key={i} style={{ background: C.borderLight, borderRadius: 8, padding: '10px 12px', marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>{a.date}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: a.score >= 80 ? C.success : a.score >= 60 ? C.warning : C.danger, fontFamily: 'var(--font-rubik)' }}>{a.score}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginTop: 2 }}>
                    {a.assessor} · {a.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    <FormModal
      open={showAddVendor}
      onClose={() => setShowAddVendor(false)}
      title="הוסף ספק חדש"
      onSubmit={() => {}}
      hideFooter
    >
      <VendorForm
        mode="create"
        onSubmit={async (data) => {
          try {
            await createVendor(data);
            setShowAddVendor(false);
            await loadData();
            showToast('הספק נוסף בהצלחה');
          } catch {
            showToast('שגיאה בהוספת הספק', 'error');
          }
        }}
        onCancel={() => setShowAddVendor(false)}
      />
    </FormModal>

    {/* Edit Vendor Modal */}
    <FormModal
      open={!!editVendor}
      onClose={() => setEditVendor(null)}
      title="עריכת ספק"
      onSubmit={() => {}}
      hideFooter
    >
      {editVendor && (
        <VendorForm
          mode="edit"
          initialData={{
            name: editVendor.name,
            serviceDescription: editVendor.service,
            criticality: editVendor.criticality === 'קריטי' ? 'critical' : editVendor.criticality === 'גבוה' ? 'important' : 'standard',
            status: 'active',
            contractEnd: '',
            contractStart: '',
            annualValueNis: '',
            riskRating: editVendor.riskRating,
            contactName: editVendor.contact,
            contactEmail: editVendor.email,
          }}
          onSubmit={async (data) => {
            try {
              await updateVendor(editVendor.id, data);
              setEditVendor(null);
              setSelectedVendor(null);
              await loadData();
              showToast('הספק עודכן בהצלחה');
            } catch {
              showToast('שגיאה בעדכון הספק', 'error');
            }
          }}
          onCancel={() => setEditVendor(null)}
        />
      )}
    </FormModal>

    {/* Delete Confirmation */}
    <FormModal
      open={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      title="מחיקת ספק"
      onSubmit={async () => {
        if (!deleteTarget) return;
        const prev = [...vendors];
        setVendors(v => v.filter(x => x.id !== deleteTarget.id));
        setDeleteTarget(null);
        setSelectedVendor(null);
        try {
          await deleteVendor(deleteTarget.id);
          showToast('הספק נמחק בהצלחה');
        } catch {
          setVendors(prev);
          showToast('שגיאה במחיקת הספק', 'error');
        }
      }}
      submitLabel="מחק"
    >
      <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: 0 }}>
        האם למחוק את הספק <strong>&quot;{deleteTarget?.name}&quot;</strong>?
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
