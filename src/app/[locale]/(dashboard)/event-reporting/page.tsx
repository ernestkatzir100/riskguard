'use client';

import { getLossEvents } from '@/app/actions/risks';
import { C } from '@/shared/lib/design-tokens';
import { useState, useEffect } from 'react';
import { FileWarning, TrendingUp, AlertTriangle, Clock, BookOpen, ExternalLink, Crown } from 'lucide-react';

type EventStatus = 'סגור' | 'פתוח' | 'בטיפול';

interface LossEvent {
  id: string;
  title: string;
  amount: string;
  date: string;
  status: EventStatus;
  category: string;
}

const events: LossEvent[] = [
  { id: 'EVT-001', title: 'כשל מערכת סליקה', amount: '₪125,000', date: '15/01/2026', status: 'סגור', category: 'תפעולי' },
  { id: 'EVT-002', title: 'הונאת פישינג', amount: '₪45,000', date: '28/01/2026', status: 'פתוח', category: 'סייבר' },
  { id: 'EVT-003', title: 'טעות בחישוב ריבית', amount: '₪82,000', date: '05/02/2026', status: 'בטיפול', category: 'תפעולי' },
  { id: 'EVT-004', title: 'דליפת מידע לקוחות', amount: '₪160,000', date: '10/02/2026', status: 'פתוח', category: 'סייבר' },
  { id: 'EVT-005', title: 'כשל בגיבוי', amount: '₪0', date: '18/02/2026', status: 'סגור', category: 'תפעולי' },
];

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

export default function EventReportingPage() {
  const [eventData, setEventData] = useState<LossEvent[]>(events);

  useEffect(() => {
    async function loadData() {
      try {
        const lossRes = await getLossEvents();
        if (lossRes?.length) {
          setEventData(lossRes.map((le: Record<string, unknown>, i: number) => {
            const amt = Number(le.amountNis ?? 0);
            return {
              id: `EVT-${String(i + 1).padStart(3, '0')}`,
              title: String(le.title ?? ''),
              amount: amt > 0 ? `₪${amt >= 1000 ? Math.round(amt / 1000) + 'K' : amt.toLocaleString()}` : '₪0',
              date: le.eventDate ? new Date(le.eventDate as string).toLocaleDateString('he-IL') : '—',
              status: (le.correctiveActions ? 'סגור' : 'פתוח') as EventStatus,
              category: String(le.category ?? 'תפעולי'),
            };
          }));
        }
      } catch { /* demo fallback */ }
    }
    loadData();
  }, []);

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
          <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}>
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
    </div>
  );
}
