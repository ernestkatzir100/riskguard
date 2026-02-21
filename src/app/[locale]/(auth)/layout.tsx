import { C } from '@/shared/lib/design-tokens';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${C.navBg} 0%, #0F1923 50%, ${C.navBg} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        direction: 'rtl',
      }}
    >
      {children}
    </div>
  );
}
