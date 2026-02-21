import { TopNav } from '@/shared/components/top-nav';
import { NuTelaBubble } from '@/shared/components/nutela-bubble';
import { PageHeader } from '@/shared/components/page-header';
import { GlobalSearch } from '@/shared/components/global-search';
import { ErrorBoundary } from '@/shared/components/error-boundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh', fontFamily: 'var(--font-assistant)' }}>
      <TopNav />
      <div
        className="dashboard-content"
        style={{
          padding: '24px 32px',
          maxWidth: 1400,
          margin: '0 auto',
          direction: 'rtl',
        }}
      >
        <PageHeader />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
      <NuTelaBubble />
      <GlobalSearch />
    </div>
  );
}
