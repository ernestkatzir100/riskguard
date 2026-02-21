'use client';

import { useState, useEffect } from 'react';
import {
  Gauge, Shield, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, AlertCircle, Plus, Pencil, Trash2,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { getKRIs, createKRI, updateKRI, deleteKRI } from '@/app/actions/kris';
import { FormModal } from '@/shared/components/form-modal';
import { KRIForm } from '@/shared/components/forms/kri-form';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { EmptyState, EMPTY_STATES } from '@/shared/components/empty-state';

/* ═══════════════════════════════════════════════
   KRI Data
   ═══════════════════════════════════════════════ */
type KRI = {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: { green: number; yellow: number; red: number };
  trend: number[];
  cat: string;
  reverse?: boolean;
};

const KRI_DATA: KRI[] = [
  { id: 'KRI-01', name: 'שיעור NPL', value: 2.3, unit: '%', threshold: { green: 5, yellow: 7, red: 10 }, trend: [3.1, 2.9, 2.7, 2.5, 2.4, 2.3], cat: 'אשראי' },
  { id: 'KRI-02', name: 'יחס הון', value: 14.2, unit: '%', threshold: { green: 12, yellow: 10, red: 9 }, trend: [13.5, 13.8, 14.0, 14.1, 14.0, 14.2], cat: 'הון', reverse: true },
  { id: 'KRI-03', name: 'ריכוזיות אשראי', value: 68, unit: '%', threshold: { green: 60, yellow: 65, red: 75 }, trend: [62, 63, 64, 66, 67, 68], cat: 'אשראי' },
  { id: 'KRI-04', name: 'כיסוי נזילות', value: 142, unit: '%', threshold: { green: 120, yellow: 110, red: 100 }, trend: [130, 135, 138, 140, 141, 142], cat: 'הון', reverse: true },
  { id: 'KRI-05', name: 'שיעור אי-עמידה', value: 3.1, unit: '%', threshold: { green: 5, yellow: 8, red: 12 }, trend: [4.2, 3.8, 3.5, 3.3, 3.2, 3.1], cat: 'ציות' },
  { id: 'KRI-06', name: 'ספקים קריטיים ללא אסטרטגיית יציאה', value: 2, unit: '', threshold: { green: 1, yellow: 3, red: 5 }, trend: [3, 3, 2, 2, 2, 2], cat: 'תפעולי' },
  { id: 'KRI-07', name: 'אירועי סייבר פתוחים', value: 1, unit: '', threshold: { green: 0, yellow: 2, red: 5 }, trend: [2, 1, 3, 2, 1, 1], cat: 'סייבר' },
  { id: 'KRI-08', name: 'עמידה ברגולציה', value: 62, unit: '%', threshold: { green: 80, yellow: 60, red: 40 }, trend: [50, 52, 55, 58, 60, 62], cat: 'ציות', reverse: true },
];

const CATEGORIES = ['הכל', 'אשראי', 'הון', 'תפעולי', 'סייבר', 'ציות'];

/* ═══════════════════════════════════════════════
   Status helpers
   ═══════════════════════════════════════════════ */
type Status = 'green' | 'yellow' | 'red';

function getStatus(kri: KRI): Status {
  const { value, threshold, reverse } = kri;
  if (reverse) {
    if (value >= threshold.green) return 'green';
    if (value >= threshold.yellow) return 'yellow';
    return 'red';
  }
  if (value <= threshold.green) return 'green';
  if (value <= threshold.yellow) return 'yellow';
  return 'red';
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  green: { label: 'תקין', color: C.success, bg: C.successBg },
  yellow: { label: 'אזהרה', color: C.warning, bg: C.warningBg },
  red: { label: 'חריג', color: C.danger, bg: C.dangerBg },
};

/* ═══════════════════════════════════════════════
   SVG Gauge component
   ═══════════════════════════════════════════════ */
function KRIGauge({ value, threshold, status, reverse }: {
  value: number; threshold: { green: number; yellow: number; red: number };
  status: Status; reverse: boolean;
}) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75; // 270 degrees

  // Calculate fill ratio
  const maxVal = reverse
    ? threshold.green * 1.3
    : threshold.red * 1.3;
  const minVal = reverse
    ? threshold.red * 0.7
    : 0;
  const ratio = Math.min(1, Math.max(0, (value - minVal) / (maxVal - minVal)));
  const filledArc = arcLength * ratio;

  return (
    <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(135deg)' }}>
      <circle
        cx={40} cy={40} r={r}
        fill="none"
        stroke={C.borderLight}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${circumference}`}
      />
      <circle
        cx={40} cy={40} r={r}
        fill="none"
        stroke={STATUS_CONFIG[status].color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${filledArc} ${circumference}`}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   Mini Sparkline component
   ═══════════════════════════════════════════════ */
function Sparkline({ data, status }: { data: number[]; status: Status }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 30;
  const w = 100;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - 2 * padding);
    const y = h - padding - ((v - min) / range) * (h - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={STATUS_CONFIG[status].color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   KRI Dashboard Page
   ═══════════════════════════════════════════════ */
export default function KRIPage() {
  const [filterCat, setFilterCat] = useState('הכל');
  const [loading, setLoading] = useState(true);
  const [kriData, setKriData] = useState<KRI[]>(KRI_DATA);
  const [showAddKRI, setShowAddKRI] = useState(false);
  const [editKRI, setEditKRI] = useState<KRI | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KRI | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const rows = await getKRIs();
        if (rows.length > 0) {
          setKriData(rows.map((r) => ({
            id: r.id,
            name: r.name,
            value: Number(r.currentValue) || 0,
            unit: '',
            threshold: { green: 5, yellow: 7, red: 10 },
            trend: [0, 0, 0, 0, 0, Number(r.currentValue) || 0],
            cat: 'כללי',
          })));
        }
      } catch {
        /* silent fallback to demo KRI_DATA */
      } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const filtered = filterCat === 'הכל' ? kriData : kriData.filter(k => k.cat === filterCat);

  // Status counts
  const greenCount = kriData.filter(k => getStatus(k) === 'green').length;
  const yellowCount = kriData.filter(k => getStatus(k) === 'yellow').length;
  const redCount = kriData.filter(k => getStatus(k) === 'red').length;

  if (loading) return <PageSkeleton />;
  if (kriData.length === 0) return <EmptyState {...EMPTY_STATES['kri']} />;

  return (
    <><div style={{ direction: 'rtl' }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 3px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Gauge size={20} color={C.accent} /> מדדי סיכון מפתח (KRI)
            <span style={{
              background: 'rgba(91,184,201,0.15)', color: C.accentTeal,
              fontSize: 9, fontWeight: 700, padding: '2px 8px',
              borderRadius: 4, fontFamily: 'var(--font-rubik)',
              marginRight: 4,
            }}>
              PRO
            </span>
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            ניטור רציף של מדדי סיכון ביחס לספים מותרים
          </p>
        </div>
        <button
          onClick={() => setShowAddKRI(true)}
          style={{ background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <Plus size={14} /> מדד חדש
        </button>
      </div>

      {/* ═══ Breach Alert Banner ═══ */}
      {redCount > 0 && (
        <div style={{
          background: C.dangerBg, border: `1px solid ${C.danger}30`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={16} color={C.danger} />
          <span style={{
            fontSize: 13, fontWeight: 600, color: C.danger,
            fontFamily: 'var(--font-rubik)',
          }}>
            {redCount} מדדים חריגים — נדרשת התייחסות מיידית
          </span>
        </div>
      )}

      {/* ═══ Summary Strip ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'תקין', count: greenCount, color: C.success, bg: C.successBg, Icon: CheckCircle },
          { label: 'אזהרה', count: yellowCount, color: C.warning, bg: C.warningBg, Icon: AlertCircle },
          { label: 'חריג', count: redCount, color: C.danger, bg: C.dangerBg, Icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.Icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: s.color,
                fontFamily: 'var(--font-rubik)',
              }}>
                {s.count}
              </div>
              <div style={{
                fontSize: 11, color: C.textMuted,
                fontFamily: 'var(--font-assistant)',
              }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Category Filter ═══ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{
            background: filterCat === c ? C.accent : C.surface,
            color: filterCat === c ? 'white' : C.textSec,
            border: `1px solid ${filterCat === c ? C.accent : C.border}`,
            borderRadius: 6, padding: '5px 12px', fontSize: 11,
            fontWeight: filterCat === c ? 600 : 400, cursor: 'pointer',
            fontFamily: 'var(--font-rubik)',
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* ═══ KRI Cards Grid ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {filtered.map(kri => {
          const status = getStatus(kri);
          const cfg = STATUS_CONFIG[status];
          const trendData = kri.trend;
          const prev = trendData[trendData.length - 2];
          const curr = trendData[trendData.length - 1];
          const delta = curr - prev;
          const deltaAbs = Math.abs(delta).toFixed(1);

          // Determine if the trend direction is "good"
          const isGoodDirection = kri.reverse
            ? delta >= 0 // for reverse: going up is good
            : delta <= 0; // for normal: going down is good

          return (
            <div key={kri.id} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, overflow: 'hidden',
              borderTop: `4px solid ${cfg.color}`,
            }}>
              <div style={{ padding: '16px 18px' }}>
                {/* Card header: icon, id, category, status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={16} color={cfg.color} />
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: C.textMuted,
                      fontFamily: 'var(--font-rubik)',
                      background: C.borderLight, padding: '2px 7px', borderRadius: 4,
                    }}>
                      {kri.id}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 500, color: C.textSec,
                      fontFamily: 'var(--font-rubik)',
                      background: C.borderLight, padding: '2px 7px', borderRadius: 4,
                    }}>
                      {kri.cat}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: cfg.color,
                    fontFamily: 'var(--font-rubik)',
                    background: cfg.bg, padding: '3px 10px', borderRadius: 5,
                  }}>
                    {cfg.label}
                  </span>
                </div>

                {/* KRI name */}
                <div style={{
                  fontSize: 13, fontWeight: 600, color: C.text,
                  fontFamily: 'var(--font-rubik)', marginBottom: 14,
                  lineHeight: 1.5,
                }}>
                  {kri.name}
                </div>

                {/* Gauge + Value section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  {/* SVG Gauge */}
                  <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    <KRIGauge
                      value={kri.value}
                      threshold={kri.threshold}
                      status={status}
                      reverse={!!kri.reverse}
                    />
                    {/* Center value */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: 18, fontWeight: 900, color: cfg.color,
                        fontFamily: 'var(--font-rubik)', lineHeight: 1,
                      }}>
                        {kri.value}
                      </div>
                      {kri.unit && (
                        <div style={{
                          fontSize: 9, color: C.textMuted,
                          fontFamily: 'var(--font-rubik)',
                        }}>
                          {kri.unit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thresholds */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: C.textMuted,
                      fontFamily: 'var(--font-rubik)', marginBottom: 6,
                    }}>
                      ספי התראה
                    </div>
                    {[
                      { label: 'ירוק', op: kri.reverse ? '≥' : '≤', val: kri.threshold.green, color: C.success },
                      { label: 'צהוב', op: kri.reverse ? '≥' : '≤', val: kri.threshold.yellow, color: C.warning },
                      { label: 'אדום', op: kri.reverse ? '<' : '>', val: kri.threshold.yellow, color: C.danger },
                    ].map(t => (
                      <div key={t.label} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginBottom: 3,
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: t.color,
                        }} />
                        <span style={{
                          fontSize: 10, color: C.textSec,
                          fontFamily: 'var(--font-assistant)',
                        }}>
                          {t.label} {t.op} {t.val}{kri.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Sparkline */}
                <div style={{ marginBottom: 10 }}>
                  <Sparkline data={trendData} status={status} />
                </div>

                {/* Trend delta + actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {delta > 0 ? (
                      <TrendingUp size={14} color={isGoodDirection ? C.success : C.danger} />
                    ) : delta < 0 ? (
                      <TrendingDown size={14} color={isGoodDirection ? C.success : C.danger} />
                    ) : null}
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: isGoodDirection ? C.success : C.danger,
                      fontFamily: 'var(--font-rubik)',
                    }}>
                      {delta > 0 ? '+' : ''}{deltaAbs}{kri.unit}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => setEditKRI(kri)} title="ערוך" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                      <Pencil size={11} color={C.textSec} />
                    </button>
                    <button onClick={() => setDeleteTarget(kri)} title="מחק" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}>
                      <Trash2 size={11} color={C.danger} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Regulation Traceability ═══ */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '16px 18px', marginTop: 14,
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)',
          margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          עקיבות רגולטורית
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { reg: '2024-10-2', section: '§3', req: 'KRI-01', desc: 'מדדי סיכון מפתח — דיווח רבעוני' },
            { reg: '2022-10-9', section: '§7', req: 'KRI-07', desc: 'ניטור אירועי סייבר' },
          ].map((t, i) => (
            <div key={i} style={{
              background: '#EDE9FE', border: '1px solid #D8C9FE', borderRadius: 8,
              padding: '8px 14px', fontSize: 11, fontFamily: 'var(--font-assistant)', color: '#5B21B6',
            }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-rubik)' }}>
                ({t.reg}, {t.section}, {t.req})
              </span>
              <span style={{ marginRight: 6, color: C.textSec }}>{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <FormModal
      open={showAddKRI}
      onClose={() => setShowAddKRI(false)}
      title="הוספת מדד סיכון חדש"
      onSubmit={() => {}}
      submitLabel="הוסף מדד"
      hideFooter
    >
      <KRIForm
        mode="create"
        onSubmit={async (data) => {
          try {
            await createKRI(data);
            setShowAddKRI(false);
            showToast('המדד נוסף בהצלחה');
            // reload
            const rows = await getKRIs();
            if (rows.length > 0) {
              setKriData(rows.map((r) => ({
                id: r.id, name: r.name, value: Number(r.currentValue) || 0,
                unit: '', threshold: { green: 5, yellow: 7, red: 10 },
                trend: [0, 0, 0, 0, 0, Number(r.currentValue) || 0], cat: 'כללי',
              })));
            }
          } catch {
            showToast('שגיאה ביצירת המדד', 'error');
          }
        }}
        onCancel={() => setShowAddKRI(false)}
      />
    </FormModal>

    {/* Edit KRI Modal */}
    <FormModal
      open={!!editKRI}
      onClose={() => setEditKRI(null)}
      title="עריכת מדד סיכון"
      onSubmit={() => {}}
      hideFooter
    >
      {editKRI && (
        <KRIForm
          mode="edit"
          initialData={{
            name: editKRI.name,
            currentValue: String(editKRI.value),
            threshold: `green:${editKRI.threshold.green},yellow:${editKRI.threshold.yellow},red:${editKRI.threshold.red}`,
            trend: 'stable',
            breached: false,
          }}
          onSubmit={async (data) => {
            try {
              await updateKRI(editKRI.id, data);
              setEditKRI(null);
              showToast('המדד עודכן בהצלחה');
              const rows = await getKRIs();
              if (rows.length > 0) {
                setKriData(rows.map((r) => ({
                  id: r.id, name: r.name, value: Number(r.currentValue) || 0,
                  unit: '', threshold: { green: 5, yellow: 7, red: 10 },
                  trend: [0, 0, 0, 0, 0, Number(r.currentValue) || 0], cat: 'כללי',
                })));
              }
            } catch {
              showToast('שגיאה בעדכון המדד', 'error');
            }
          }}
          onCancel={() => setEditKRI(null)}
        />
      )}
    </FormModal>

    {/* Delete Confirmation */}
    <FormModal
      open={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      title="מחיקת מדד"
      onSubmit={async () => {
        if (!deleteTarget) return;
        const prev = [...kriData];
        setKriData(k => k.filter(x => x.id !== deleteTarget.id));
        setDeleteTarget(null);
        try {
          await deleteKRI(deleteTarget.id);
          showToast('המדד נמחק בהצלחה');
        } catch {
          setKriData(prev);
          showToast('שגיאה במחיקת המדד', 'error');
        }
      }}
      submitLabel="מחק"
    >
      <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: 0 }}>
        האם למחוק את המדד <strong>&quot;{deleteTarget?.name}&quot;</strong>?
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
