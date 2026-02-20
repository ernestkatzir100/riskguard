import { TopNav } from '@/shared/components/top-nav';
import { NuTelaBubble } from '@/shared/components/nutela-bubble';
import { PageHeader } from '@/shared/components/page-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh', fontFamily: 'var(--font-assistant)' }}>
      <TopNav />
      <div
        style={{
          padding: '24px 32px',
          maxWidth: 1400,
          margin: '0 auto',
          direction: 'rtl',
        }}
      >
        <PageHeader />
        {children}
      </div>
      <NuTelaBubble />
    </div>
  );
}
