'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Shield, BarChart3, Handshake, ShieldCheck,
  Lock, ShieldAlert, Zap, FileText, BookOpen, CheckSquare,
  Settings, CreditCard, Gauge, FileWarning, FileOutput, Briefcase, Bot,
  ClipboardList,
} from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';

type RouteInfo = { label: string; Icon: LucideIcon };

const ROUTE_MAP: Record<string, RouteInfo> = {
  '/he': { label: 'דשבורד', Icon: LayoutDashboard },
  '/he/risk-register': { label: 'מאגר סיכונים ובקרות', Icon: Shield },
  '/he/agents': { label: 'סוכנים', Icon: Bot },
  '/he/board': { label: 'דירקטוריון', Icon: Briefcase },
  '/he/risk-governance': { label: 'ממשל סיכונים', Icon: Shield },
  '/he/cyber-governance': { label: 'ממשל סייבר', Icon: Lock },
  '/he/operational-risk': { label: 'סיכון תפעולי', Icon: BarChart3 },
  '/he/outsourcing': { label: 'מיקור חוץ', Icon: Handshake },
  '/he/bcp': { label: 'המשכיות עסקית', Icon: ShieldCheck },
  '/he/cyber-protection': { label: 'הגנת סייבר', Icon: ShieldAlert },
  '/he/cyber-incidents': { label: 'אירועי סייבר', Icon: Zap },
  '/he/credit-risk': { label: 'סיכון אשראי', Icon: CreditCard },
  '/he/kri': { label: 'מדדי סיכון מרכזיים', Icon: Gauge },
  '/he/event-reporting': { label: 'דיווח אירועים', Icon: FileWarning },
  '/he/reports': { label: 'דוחות', Icon: FileOutput },
  '/he/documents': { label: 'מסמכים', Icon: FileText },
  '/he/regulation': { label: 'רגולציה', Icon: BookOpen },
  '/he/tasks': { label: 'משימות', Icon: CheckSquare },
  '/he/settings': { label: 'הגדרות', Icon: Settings },
  '/he/onboarding': { label: 'הגדרת מערכת', Icon: Settings },
  '/he/audit': { label: 'יומן ביקורת', Icon: ClipboardList },
};

export function PageHeader() {
  const pathname = usePathname();
  const route = ROUTE_MAP[pathname];
  if (!route || pathname === '/he') return null;

  const Ic = route.Icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 18,
        direction: 'rtl',
      }}
    >
      <Link
        href="/he"
        style={{
          fontSize: 11,
          color: C.textMuted,
          fontFamily: 'var(--font-rubik)',
          textDecoration: 'none',
        }}
      >
        דשבורד
      </Link>
      <ChevronLeft size={12} color={C.textMuted} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Ic size={14} color={C.accent} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.text,
            fontFamily: 'var(--font-rubik)',
          }}
        >
          {route.label}
        </span>
      </div>
    </div>
  );
}
