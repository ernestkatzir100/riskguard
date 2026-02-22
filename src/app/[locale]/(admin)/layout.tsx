'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bot, UserPlus, CreditCard, ShieldCheck, ChevronLeft,
} from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

const NAV_ITEMS = [
  { href: '/he/admin', label: 'דשבורד', Icon: LayoutDashboard },
  { href: '/he/admin/nutela', label: 'סוכני NuTeLa', Icon: Bot },
  { href: '/he/admin/onboard', label: 'קליטת לקוח', Icon: UserPlus },
  { href: '/he/admin/billing', label: 'חיוב ומנויים', Icon: CreditCard },
  { href: '/he/admin/monitor', label: 'מוניטור ציות', Icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'rtl', fontFamily: 'var(--font-assistant)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: C.navBg, padding: '20px 0', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>
            NTL Admin
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-assistant)' }}>
            ניהול לקוחות RiskGuard
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || (href !== '/he/admin' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                background: isActive ? C.navHover : 'transparent',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                fontFamily: 'var(--font-rubik)', transition: 'all 0.15s',
                borderLeft: isActive ? `3px solid ${C.accentTeal}` : '3px solid transparent',
              }}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/he" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
          color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 11,
          fontFamily: 'var(--font-rubik)',
        }}>
          <ChevronLeft size={12} />
          חזרה לדשבורד לקוח
        </Link>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1, marginRight: 220, background: C.bg, minHeight: '100vh',
        padding: '24px 32px', maxWidth: 1200,
      }}>
        {children}
      </main>
    </div>
  );
}
