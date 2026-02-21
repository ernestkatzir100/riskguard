'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Shield, BarChart3, Handshake, ShieldCheck,
  Lock, ShieldAlert, Zap, FileText, BookOpen, CheckSquare,
  Settings, Bell, Building2, ChevronDown, ChevronUp,
  CreditCard, Gauge, FileWarning, FileOutput, Briefcase,
  Crown, Bot, LogOut, Search, Menu, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';
import { useBranding } from '@/shared/hooks/use-branding';

/* ═══════════════════════════════════════════════
   Navigation structure — exact match to V11 JSX
   ═══════════════════════════════════════════════ */
type NavItem = {
  id: string;
  label: string;
  Icon: LucideIcon;
  href: string;
};

type NavGroup = {
  label: string | null;
  sub?: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { id: 'dash', label: 'דשבורד', Icon: LayoutDashboard, href: '/he' },
      { id: 'riskreg', label: 'מאגר סיכונים ובקרות', Icon: Shield, href: '/he/risk-register' },
      { id: 'agents', label: 'סוכנים', Icon: Bot, href: '/he/agents' },
    ],
  },
  {
    label: 'ממשל תאגידי',
    sub: 'Corporate Governance',
    items: [
      { id: 'board', label: 'דירקטוריון', Icon: Briefcase, href: '/he/board' },
      { id: 'gov', label: 'ממשל סיכונים', Icon: Shield, href: '/he/risk-governance' },
      { id: 'cgov', label: 'ממשל סייבר', Icon: Lock, href: '/he/cyber-governance' },
    ],
  },
  {
    label: 'ניהול סיכונים',
    sub: '2024-10-2',
    items: [
      { id: 'ops', label: 'סיכון תפעולי', Icon: BarChart3, href: '/he/operational-risk' },
      { id: 'out', label: 'מיקור חוץ', Icon: Handshake, href: '/he/outsourcing' },
      { id: 'bcp', label: 'המשכיות עסקית', Icon: ShieldCheck, href: '/he/bcp' },
    ],
  },
  {
    label: 'ניהול סיכוני סייבר',
    sub: '2022-10-9',
    items: [
      { id: 'cpro', label: 'הגנת סייבר', Icon: ShieldAlert, href: '/he/cyber-protection' },
      { id: 'cinc', label: 'אירועי סייבר', Icon: Zap, href: '/he/cyber-incidents' },
    ],
  },
  {
    label: 'PRO',
    items: [
      { id: 'credit', label: 'סיכון אשראי', Icon: CreditCard, href: '/he/credit-risk' },
      { id: 'kri', label: 'KRI', Icon: Gauge, href: '/he/kri' },
      { id: 'events', label: 'דיווח אירועים', Icon: FileWarning, href: '/he/event-reporting' },
      { id: 'reports', label: 'דוחות', Icon: FileOutput, href: '/he/reports' },
    ],
  },
  {
    label: 'כלים',
    items: [
      { id: 'docs', label: 'מסמכים', Icon: FileText, href: '/he/documents' },
      { id: 'reg', label: 'רגולציה', Icon: BookOpen, href: '/he/regulation' },
      { id: 'tasks', label: 'משימות', Icon: CheckSquare, href: '/he/tasks' },
      { id: 'settings', label: 'הגדרות', Icon: Settings, href: '/he/settings' },
    ],
  },
];

/* ═══════════════════════════════════════════════
   Dropdown menu component
   ═══════════════════════════════════════════════ */
function NavDropdown({
  group,
  isOpen,
  onToggle,
  activeId,
  onNavigate,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  activeId: string | null;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const isPro = group.label === 'PRO';
  const hasActive = group.items.some((it) => it.id === activeId);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        onClick={onToggle}
        style={{
          background: isPro
            ? isOpen || hasActive
              ? 'rgba(124,111,208,0.15)'
              : 'rgba(124,111,208,0.08)'
            : isOpen || hasActive
              ? 'rgba(74,142,194,0.1)'
              : 'none',
          border: 'none',
          cursor: 'pointer',
          color: isPro
            ? isOpen || hasActive
              ? '#B0A4E8'
              : '#8B7FD0'
            : isOpen || hasActive
              ? '#8CC8E8'
              : '#5A7080',
          fontSize: 11,
          fontWeight: 800,
          fontFamily: 'var(--font-rubik)',
          padding: '4px 8px 4px 4px',
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          letterSpacing: 0.3,
          transition: 'all 0.15s',
        }}
      >
        {isPro && <Crown size={10} />}
        {group.label}
        {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 200,
            background: C.navBg,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 8,
            minWidth: 200,
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          {group.sub && (
            <div
              style={{
                fontSize: 9,
                color: '#475569',
                fontFamily: 'var(--font-rubik)',
                padding: '4px 10px 6px',
                letterSpacing: 0.5,
              }}
            >
              חוזר {group.sub}
            </div>
          )}
          {group.items.map((item) => {
            const active = item.id === activeId;
            const Ic = item.Icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onNavigate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  background: active ? 'rgba(74,142,194,0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? '#8CC8E8' : '#94A3B8',
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'var(--font-rubik)',
                  transition: 'all 0.12s',
                  textAlign: 'right',
                  textDecoration: 'none',
                }}
              >
                <Ic size={14} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isPro && (
                  <span style={{
                    fontSize: 8, fontWeight: 700, color: '#B0A4E8',
                    background: 'rgba(124,111,208,0.15)', padding: '1px 5px',
                    borderRadius: 3, fontFamily: 'var(--font-rubik)',
                  }}>PRO</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main TopNav component
   ═══════════════════════════════════════════════ */
export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { branding } = useBranding();

  const handleLogout = async () => {
    try {
      const { getSupabaseBrowser } = await import('@/shared/lib/supabase-client');
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
    } catch { /* ignore if supabase not configured */ }
    router.push('/he/login');
    router.refresh();
  };

  // Resolve active nav item from pathname
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const activeItem = allItems.find((item) => {
    if (item.href === '/he' && pathname === '/he') return true;
    if (item.href !== '/he' && pathname.startsWith(item.href)) return true;
    return false;
  });
  const activeId = activeItem?.id ?? 'dash';

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  return (
    <div style={{ background: C.navBg, position: 'sticky', top: 0, zIndex: 100, direction: 'rtl' }}>
      {/* ── Brand bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Right side: Logo + company */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="לוגו"
              style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: C.accentGrad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 800,
                color: 'white',
                fontFamily: 'var(--font-rubik)',
              }}
            >
              R
            </div>
          )}
          <span
            style={{
              color: 'white',
              fontSize: 17,
              fontWeight: 700,
              fontFamily: 'var(--font-rubik)',
            }}
          >
            RiskGuard
          </span>
          <span className="top-brand-company" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>|</span>
            <Building2 size={14} color={C.textMuted} />
            <span
              style={{
                color: C.textMuted,
                fontSize: 13,
                fontFamily: 'var(--font-assistant)',
              }}
            >
              {branding.companyName || 'אשראי פייננס בע״מ'}
            </span>
          </span>
        </div>

        {/* Left side: PRO badge + bell + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Hamburger — visible on mobile only via CSS */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(prev => !prev)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#CBD5E1', padding: 4,
            }}
            aria-label="תפריט"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span
            className="top-brand-pro"
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: C.accentGrad,
              color: 'white',
              padding: '3px 12px',
              borderRadius: 10,
              fontFamily: 'var(--font-rubik)',
            }}
          >
            PRO
          </span>

          {/* Search trigger */}
          <button
            className="top-brand-search"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            title="חיפוש (Ctrl+K)"
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, color: '#64748B',
              fontSize: 11, fontFamily: 'var(--font-rubik)',
            }}
          >
            <Search size={13} /> חיפוש...
            <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3 }}>⌘K</span>
          </button>

          {/* Notification bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="#CBD5E1" />
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: C.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: 'white',
              }}
            >
              2
            </div>
          </div>

          {/* User avatar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              paddingRight: 16,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: C.accentGrad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'var(--font-rubik)',
              }}
            >
              יל
            </div>
            <div>
              <div
                style={{
                  color: '#E2E8F0',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-rubik)',
                  lineHeight: 1.2,
                }}
              >
                יוסי לוי
              </div>
              <div
                style={{
                  color: '#64748B',
                  fontSize: 10,
                  fontFamily: 'var(--font-assistant)',
                  lineHeight: 1.2,
                }}
              >
                מנהל סיכונים
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="התנתק"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748B', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E2E8F0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Nav bar (hidden on mobile via CSS) ── */}
      <div
        className="top-nav-links"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          height: 44,
          position: 'relative',
        }}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Separator between groups */}
            {gi > 0 && (
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: 'rgba(255,255,255,0.1)',
                  margin: '0 6px',
                }}
              />
            )}

            {group.label ? (
              /* Grouped items with dropdown */
              <NavDropdown
                group={group}
                isOpen={openGroup === group.label}
                onToggle={() => toggleGroup(group.label!)}
                activeId={activeId}
                onNavigate={() => setOpenGroup(null)}
              />
            ) : (
              /* Ungrouped items — inline buttons */
              group.items.map((item) => {
                const active = item.id === activeId;
                const Ic = item.Icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    style={{
                      background: active ? 'rgba(74,142,194,0.15)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: active ? '#8CC8E8' : '#7B8FA0',
                      padding: '7px 9px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      fontFamily: 'var(--font-rubik)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.12s',
                      whiteSpace: 'nowrap',
                      borderBottom: active
                        ? `2px solid ${C.accentTeal}`
                        : '2px solid transparent',
                      marginBottom: -1,
                      textDecoration: 'none',
                    }}
                  >
                    <Ic size={12} strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                );
              })
            )}
          </div>
        ))}
      </div>

      {/* ── Mobile navigation panel (shown via CSS when .open) ── */}
      <div
        className={`mobile-nav-panel${mobileOpen ? ' open' : ''}`}
        style={{
          background: C.navBg,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '8px 16px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            {group.label && (
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#64748B',
                fontFamily: 'var(--font-rubik)', padding: '8px 8px 4px',
                letterSpacing: 0.5,
              }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const active = item.id === activeId;
              const Ic = item.Icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 8px', borderRadius: 8,
                    background: active ? 'rgba(74,142,194,0.15)' : 'transparent',
                    color: active ? '#8CC8E8' : '#94A3B8',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    fontFamily: 'var(--font-rubik)', textDecoration: 'none',
                  }}
                >
                  <Ic size={16} strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}
