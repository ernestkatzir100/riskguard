'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, FileText, Users, CheckSquare, Zap, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

type SearchResult = {
  id: string;
  title: string;
  type: 'risk' | 'control' | 'vendor' | 'task' | 'document' | 'incident';
  href: string;
};

const TYPE_CONFIG: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  risk: { label: 'סיכון', Icon: Shield, color: C.danger },
  control: { label: 'בקרה', Icon: Shield, color: C.success },
  vendor: { label: 'ספק', Icon: Users, color: C.accent },
  task: { label: 'משימה', Icon: CheckSquare, color: C.warning },
  document: { label: 'מסמך', Icon: FileText, color: C.pro },
  incident: { label: 'אירוע סייבר', Icon: Zap, color: C.danger },
};

// Demo search data
const DEMO_INDEX: SearchResult[] = [
  { id: '1', title: 'סיכון אשראי צרכני', type: 'risk', href: '/he/risk-register' },
  { id: '2', title: 'סיכון תפעולי — כשל מערכות', type: 'risk', href: '/he/risk-register' },
  { id: '3', title: 'סיכון סייבר — פישינג', type: 'risk', href: '/he/risk-register' },
  { id: '4', title: 'בקרת אימות לווה', type: 'control', href: '/he/risk-register' },
  { id: '5', title: 'בקרת ניטור רשת', type: 'control', href: '/he/cyber-protection' },
  { id: '6', title: 'CloudSec Ltd', type: 'vendor', href: '/he/outsourcing' },
  { id: '7', title: 'DataPro Solutions', type: 'vendor', href: '/he/outsourcing' },
  { id: '8', title: 'עדכון מדיניות סיכונים', type: 'task', href: '/he/tasks' },
  { id: '9', title: 'הגשת דוח רבעוני', type: 'task', href: '/he/tasks' },
  { id: '10', title: 'מדיניות ניהול סיכונים 2025', type: 'document', href: '/he/documents' },
  { id: '11', title: 'נוהל אירועי סייבר', type: 'document', href: '/he/documents' },
  { id: '12', title: 'ניסיון פישינג — ינואר 2025', type: 'incident', href: '/he/cyber-incidents' },
];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const matched = DEMO_INDEX.filter((item) =>
      item.title.toLowerCase().includes(lower) || item.type.includes(lower)
    );
    setResults(matched);
    setSelectedIdx(0);
  }, []);

  const navigate = (result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(results[selectedIdx]);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 120, direction: 'rtl',
      }}
    >
      <div style={{
        background: C.surface, borderRadius: 16, width: '100%', maxWidth: 560,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
        }}>
          <Search size={18} color={C.textMuted} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="חיפוש..."
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 15,
              fontFamily: 'var(--font-assistant)', background: 'transparent',
              color: C.text,
            }}
          />
          <div style={{
            fontSize: 10, color: C.textMuted, background: C.bg,
            padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
          }}>
            ESC
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ maxHeight: 360, overflow: 'auto', padding: '8px 0' }}>
            {results.map((result, i) => {
              const cfg = TYPE_CONFIG[result.type];
              const Icon = cfg?.Icon ?? BarChart3;
              return (
                <button
                  key={result.id}
                  onClick={() => navigate(result)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 16px',
                    background: i === selectedIdx ? C.accentLight : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'right',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `${cfg?.color ?? C.accent}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={14} color={cfg?.color ?? C.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      {result.title}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, color: cfg?.color ?? C.textMuted,
                    background: `${cfg?.color ?? C.accent}10`,
                    padding: '2px 8px', borderRadius: 4,
                    fontWeight: 600, fontFamily: 'var(--font-rubik)',
                  }}>
                    {cfg?.label ?? result.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {query && results.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: C.textMuted, fontSize: 13, fontFamily: 'var(--font-assistant)' }}>
            לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;
          </div>
        )}

        {!query && (
          <div style={{ padding: 20, textAlign: 'center', color: C.textMuted, fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
            חפש סיכונים, בקרות, ספקים, משימות, מסמכים...
          </div>
        )}
      </div>
    </div>
  );
}
