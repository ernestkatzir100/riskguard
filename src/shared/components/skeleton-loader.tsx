'use client';

/**
 * Skeleton Loader — shimmer placeholders for loading states.
 * Uses .skeleton class from globals.css for the shimmer animation.
 */

const C = {
  surface: '#FFFFFF',
  border: '#E1E8EF',
} as const;

type SkeletonProps = {
  /** Number of rows to render */
  rows?: number;
  /** Show chart placeholder */
  chart?: boolean;
  /** Variant: 'card' | 'table' | 'list' */
  variant?: 'card' | 'table' | 'list';
};

function SkeletonLine({ width, height = 12, mb = 10 }: { width: string | number; height?: number; mb?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, marginBottom: mb }}
    />
  );
}

export function SkeletonLoader({ rows = 4, chart = false, variant = 'card' }: SkeletonProps) {
  if (variant === 'table') {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <SkeletonLine width="30%" height={16} mb={16} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <SkeletonLine width="20%" height={14} mb={0} />
            <SkeletonLine width="30%" height={14} mb={0} />
            <SkeletonLine width="15%" height={14} mb={0} />
            <SkeletonLine width="20%" height={14} mb={0} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <SkeletonLine width="40%" height={16} mb={16} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <SkeletonLine width="60%" height={12} mb={6} />
              <SkeletonLine width="40%" height={10} mb={0} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: card variant
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <SkeletonLine width="50%" height={18} mb={16} />
      {chart && (
        <div className="skeleton" style={{ width: '100%', height: 160, marginBottom: 16 }} />
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={`${80 - i * 10}%`} height={14} />
      ))}
    </div>
  );
}

/** Full-page skeleton for module loading */
export function PageSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <SkeletonLine width={200} height={22} mb={6} />
          <SkeletonLine width={120} height={12} mb={0} />
        </div>
        <SkeletonLine width={100} height={34} mb={0} />
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonLoader key={i} rows={2} />
        ))}
      </div>

      {/* Content row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <SkeletonLoader rows={6} chart />
        <SkeletonLoader rows={4} variant="list" />
      </div>
    </div>
  );
}
