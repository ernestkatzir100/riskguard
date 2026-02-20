'use client';

import { BarChart3, CheckSquare, Handshake, Zap, Shield, FileText, Users, Lock, type LucideIcon } from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';

/* ═══════════════════════════════════════════════
   Global activity log — last 10 actions
   ═══════════════════════════════════════════════ */
export type ActivityEntry = {
  action: string;
  detail: string;
  user: string;
  time: string;
  Icon: LucideIcon;
  module?: string;
};

export const GLOBAL_ACTIVITIES: ActivityEntry[] = [
  { action: 'עדכן סיכון', detail: 'כשל מערכת הליבה — ציון 16', user: 'יוסי לוי', time: 'היום 14:32', Icon: BarChart3, module: 'risk-register' },
  { action: 'אישר מדיניות', detail: 'מדיניות הגנת סייבר v2.1', user: 'דנה כהן', time: 'היום 11:15', Icon: CheckSquare, module: 'cyber-governance' },
  { action: 'הוסיף ספק', detail: 'דיגיפורם — דיגיטל', user: 'יוסי לוי', time: 'אתמול 16:40', Icon: Handshake, module: 'outsourcing' },
  { action: 'סגר אירוע', detail: 'אירוע סייבר #001', user: 'יוסי לוי', time: 'אתמול 09:22', Icon: Zap, module: 'cyber-incidents' },
  { action: 'העלה מסמך', detail: 'תוכנית BCP v3.0', user: 'רונית גולד', time: 'אתמול 08:10', Icon: FileText, module: 'bcp' },
  { action: 'עדכן בקרה', detail: 'WAF — סטטוס פעיל', user: 'דנה כהן', time: '18/02 15:45', Icon: Shield, module: 'cyber-protection' },
  { action: 'הוסיף חבר דירקטוריון', detail: 'מיכל אברהם — יועצת חיצונית', user: 'יוסי לוי', time: '18/02 11:30', Icon: Users, module: 'board' },
  { action: 'הגדיר KRI', detail: 'NPL Ratio — סף 5%', user: 'יוסי לוי', time: '17/02 16:20', Icon: BarChart3, module: 'kri' },
  { action: 'אישר גישה', detail: 'הרשאות CISO עודכנו', user: 'דנה כהן', time: '17/02 10:00', Icon: Lock, module: 'cyber-governance' },
  { action: 'יצר דוח', detail: 'דוח רבעוני Q4/2025', user: 'רונית גולד', time: '16/02 14:15', Icon: FileText, module: 'reports' },
];

/* ═══════════════════════════════════════════════
   ActivityFeed component — reusable across modules
   ═══════════════════════════════════════════════ */
type ActivityFeedProps = {
  /** Filter to specific module (optional) */
  module?: string;
  /** Max items to show (default 10) */
  limit?: number;
};

export function ActivityFeed({ module, limit = 10 }: ActivityFeedProps) {
  const items = module
    ? GLOBAL_ACTIVITIES.filter((a) => a.module === module).slice(0, limit)
    : GLOBAL_ACTIVITIES.slice(0, limit);

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', color: C.textMuted, fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
        אין פעילות אחרונה
      </div>
    );
  }

  return (
    <div>
      {items.map((a, i) => {
        const Ic = a.Icon;
        return (
          <div
            key={i}
            style={{
              display: 'flex', gap: 8, padding: '8px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none',
            }}
          >
            <div
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: C.accentLight, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Ic size={12} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.text, fontFamily: 'var(--font-assistant)' }}>
                <b>{a.user}</b> {a.action}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{a.detail} · {a.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
