'use client';

import { useState, useEffect } from 'react';

import { C } from '@/shared/lib/design-tokens';

export function ScoreRing({
  score,
  size = 110,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let s = 0;
    const f = () => {
      s += 1.5;
      if (s >= score) {
        setV(score);
        return;
      }
      setV(Math.round(s));
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }, [score]);

  const color = v >= 80 ? C.success : v >= 50 ? C.warning : C.danger;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.borderLight}
          strokeWidth="8"
          strokeDasharray={`${arc} ${circ}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${arc} ${circ}`}
          strokeDashoffset={arc - (arc * v) / 100}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-42%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: size * 0.28,
            fontWeight: 700,
            color: C.text,
            fontFamily: 'var(--font-rubik)',
          }}
        >
          {v}%
        </div>
        {label && (
          <div
            style={{
              fontSize: 9,
              color: C.textMuted,
              fontFamily: 'var(--font-assistant)',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
