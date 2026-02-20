import type { LucideIcon } from 'lucide-react';

const C = {
  surface: '#FFFFFF',
  border: '#E1E8EF',
  text: '#1A2332',
  accent: '#4A8EC2',
} as const;

export function ChartCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.text,
          fontFamily: 'var(--font-rubik)',
          margin: '0 0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {Icon && <Icon size={14} color={C.accent} />} {title}
      </h3>
      {children}
    </div>
  );
}
