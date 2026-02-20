'use client';

import { Inbox, Shield, BarChart3, FileText, Users, Zap, type LucideIcon } from 'lucide-react';

/**
 * Empty State — Hebrew message + icon + optional action button.
 * Used per module when there's no data.
 */

import { C } from '@/shared/lib/design-tokens';

type EmptyStateProps = {
  /** Icon to display */
  icon?: LucideIcon;
  /** Hebrew title */
  title: string;
  /** Hebrew description */
  description: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
};

/** Pre-defined empty states per module */
export const EMPTY_STATES: Record<string, { icon: LucideIcon; title: string; description: string; actionLabel: string }> = {
  'risk-register': { icon: Shield, title: 'אין סיכונים במאגר', description: 'התחל להוסיף סיכונים כדי לבנות את מפת הסיכונים שלך.', actionLabel: 'הוסף סיכון ראשון' },
  'outsourcing': { icon: Users, title: 'אין ספקים רשומים', description: 'הוסף ספקים כדי לעקוב אחר מיקור חוץ.', actionLabel: 'הוסף ספק' },
  'bcp': { icon: FileText, title: 'אין מסמכי BCP', description: 'צור תוכנית המשכיות עסקית כדי להיות מוכן.', actionLabel: 'צור תוכנית' },
  'cyber-incidents': { icon: Zap, title: 'אין אירועי סייבר', description: 'מצוין! לא דווחו אירועי סייבר.', actionLabel: 'דווח אירוע' },
  'reports': { icon: FileText, title: 'אין דוחות', description: 'צור דוח ראשון לדירקטוריון.', actionLabel: 'צור דוח' },
  'kri': { icon: BarChart3, title: 'אין מדדי סיכון', description: 'הגדר KRIs כדי לנטר את רמת הסיכון.', actionLabel: 'הגדר KRI' },
  'default': { icon: Inbox, title: 'אין נתונים', description: 'לא נמצאו נתונים להצגה.', actionLabel: 'התחל' },
};

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const Ic = Icon || Inbox;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '48px 32px',
        textAlign: 'center',
        direction: 'rtl',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: C.accentLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <Ic size={28} color={C.accent} />
      </div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          fontFamily: 'var(--font-rubik)',
          margin: '0 0 6px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: C.textMuted,
          fontFamily: 'var(--font-assistant)',
          margin: '0 0 20px',
          maxWidth: 300,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            background: C.accentGrad,
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-rubik)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
