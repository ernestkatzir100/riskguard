'use client';

import { useState, useEffect, useCallback } from 'react';
import { GripVertical, ChevronUp, ChevronDown, Eye, EyeOff, X, Settings2 } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';

export type WidgetDef = { id: string; label: string };

const STORAGE_KEY = 'rg-dashboard-widgets';

type WidgetState = { order: string[]; hidden: string[] };

function loadState(widgets: WidgetDef[]): WidgetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WidgetState;
      // Ensure all widget ids are present
      const allIds = widgets.map(w => w.id);
      const order = parsed.order.filter(id => allIds.includes(id));
      const missing = allIds.filter(id => !order.includes(id));
      return { order: [...order, ...missing], hidden: parsed.hidden.filter(id => allIds.includes(id)) };
    }
  } catch { /* ignore */ }
  return { order: widgets.map(w => w.id), hidden: [] };
}

function saveState(state: WidgetState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function useWidgetOrder(widgets: WidgetDef[]) {
  const [state, setState] = useState<WidgetState>({ order: widgets.map(w => w.id), hidden: [] });

  useEffect(() => { setState(loadState(widgets)); }, [widgets]);

  const setOrder = useCallback((newState: WidgetState) => {
    setState(newState);
    saveState(newState);
  }, []);

  const visibleOrder = state.order.filter(id => !state.hidden.includes(id));

  return { state, setOrder, visibleOrder };
}

type Props = {
  widgets: WidgetDef[];
  state: WidgetState;
  onSave: (state: WidgetState) => void;
  onClose: () => void;
};

export function WidgetOrderModal({ widgets, state, onSave, onClose }: Props) {
  const [order, setOrder] = useState(state.order);
  const [hidden, setHidden] = useState(state.hidden);

  const move = (idx: number, dir: -1 | 1) => {
    const newOrder = [...order];
    const target = idx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setOrder(newOrder);
  };

  const toggle = (id: string) => {
    setHidden(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, direction: 'rtl' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Settings2 size={16} color={C.accent} /> התאמת דשבורד
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} color={C.textMuted} />
          </button>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {order.map((id, idx) => {
            const w = widgets.find(x => x.id === id);
            if (!w) return null;
            const isHidden = hidden.includes(id);
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                background: isHidden ? C.borderLight : 'white', borderRadius: 8, marginBottom: 4,
                border: `1px solid ${C.borderLight}`, opacity: isHidden ? 0.5 : 1,
              }}>
                <GripVertical size={14} color={C.textMuted} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                  {w.label}
                </span>
                <button onClick={() => toggle(id)} title={isHidden ? 'הצג' : 'הסתר'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {isHidden ? <EyeOff size={14} color={C.textMuted} /> : <Eye size={14} color={C.accent} />}
                </button>
                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                  style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: 2, opacity: idx === 0 ? 0.3 : 1 }}>
                  <ChevronUp size={14} color={C.textSec} />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === order.length - 1}
                  style={{ background: 'none', border: 'none', cursor: idx === order.length - 1 ? 'not-allowed' : 'pointer', padding: 2, opacity: idx === order.length - 1 ? 0.3 : 1 }}>
                  <ChevronDown size={14} color={C.textSec} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => { onSave({ order, hidden }); onClose(); }}
            style={{ flex: 1, background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)' }}>
            שמור
          </button>
          <button onClick={() => { onSave({ order: widgets.map(w => w.id), hidden: [] }); onClose(); }}
            style={{ padding: '8px 16px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-rubik)', color: C.textSec }}>
            איפוס
          </button>
        </div>
      </div>
    </div>
  );
}
