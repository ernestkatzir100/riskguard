'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Shield,
  FileText,
  CheckSquare,
} from 'lucide-react';

/* ═══ Color palette (V11) ═══ */
const C = {
  accent: '#4A8EC2',
  accentLight: '#E8F4FA',
  success: '#2E8B57',
  border: '#E1E8EF',
  borderLight: '#F0F3F7',
  text: '#1A2332',
  textSec: '#4A5568',
  textMuted: '#8896A6',
  surface: '#FFFFFF',
};

/* ═══ NuTeLa Avatar SVG — pixel-perfect V11 ═══ */
function NuTelaAvatar({ size = 44, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={animate ? { animation: 'nutelaFloat 3s ease-in-out infinite' } : {}}
    >
      <defs>
        <linearGradient id="ntlEgg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="35%" stopColor="#7B61FF" />
          <stop offset="70%" stopColor="#BD34FE" />
          <stop offset="100%" stopColor="#FF6B9D" />
        </linearGradient>
        <linearGradient id="ntlShine" x1="0.3" y1="0" x2="0.7" y2="0.6">
          <stop offset="0%" stopColor="white" stopOpacity={0.5} />
          <stop offset="40%" stopColor="white" stopOpacity={0.08} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <filter id="ntlGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="ntlAura" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#7B61FF" stopOpacity={0} />
          <stop offset="85%" stopColor="#BD34FE" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#FF6B9D" stopOpacity={0.04} />
        </radialGradient>
        <radialGradient id="ntlFace" cx="50%" cy="45%" r="35%">
          <stop offset="0%" stopColor="white" stopOpacity={0.55} />
          <stop offset="100%" stopColor="white" stopOpacity={0.08} />
        </radialGradient>
        <radialGradient id="ntlEyeGlow" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#F0F4FF" />
        </radialGradient>
      </defs>

      {/* Aura glow ring */}
      <circle cx="50" cy="52" r="48" fill="url(#ntlAura)" />

      {/* Egg body */}
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="url(#ntlEgg)" filter="url(#ntlGlow)" />
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="url(#ntlShine)" />
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

      {/* Inner face glow */}
      <ellipse cx="50" cy="48" rx="20" ry="18" fill="url(#ntlFace)" />

      {/* Left eye */}
      <ellipse cx="40" cy="46" rx="7.5" ry="8.5" fill="url(#ntlEyeGlow)" />
      <ellipse cx="40" cy="46" rx="7" ry="8" fill="white" />
      <circle cx="41.5" cy="45" r="5" fill="#1E1B4B" />
      <circle cx="43.5" cy="43" r="2.2" fill="white" />
      <circle cx="39" cy="47" r="1" fill="white" opacity="0.6" />

      {/* Right eye */}
      <ellipse cx="60" cy="46" rx="7.5" ry="8.5" fill="url(#ntlEyeGlow)" />
      <ellipse cx="60" cy="46" rx="7" ry="8" fill="white" />
      <circle cx="61.5" cy="45" r="5" fill="#1E1B4B" />
      <circle cx="63.5" cy="43" r="2.2" fill="white" />
      <circle cx="59" cy="47" r="1" fill="white" opacity="0.6" />

      {/* Blush */}
      <ellipse cx="30" cy="54" rx="5" ry="3" fill="#FF6B9D" opacity="0.3" />
      <ellipse cx="70" cy="54" rx="5" ry="3" fill="#FF6B9D" opacity="0.3" />

      {/* Cute smile */}
      <path d="M 44 57 Q 47 61 50 57.5" fill="none" stroke="#7B61FF" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M 50 57.5 Q 53 61 56 57" fill="none" stroke="#7B61FF" strokeWidth="1.3" strokeLinecap="round" />

      {/* Tiny tongue */}
      <ellipse cx="50" cy="59.5" rx="2.2" ry="1.5" fill="#FF6B9D" opacity="0.7" />

      {/* NTL badge */}
      <rect x="36" y="68" rx="6" ry="6" width="28" height="12" fill="white" opacity="0.85" />
      <rect x="36" y="68" rx="6" ry="6" width="28" height="12" fill="none" stroke="rgba(123,97,255,0.3)" strokeWidth="0.5" />
      <text x="50" y="77" textAnchor="middle" fontSize="7" fontWeight={800} fontFamily="Rubik">
        <tspan fill="#7B61FF">N</tspan>
        <tspan fill="#BD34FE">u</tspan>
        <tspan fill="#7B61FF">T</tspan>
        <tspan fill="#BD34FE">e</tspan>
        <tspan fill="#7B61FF">L</tspan>
        <tspan fill="#FF6B9D">a</tspan>
      </text>

      {/* Floating sparkles */}
      <g style={animate ? { animation: 'nutelaSpin 8s linear infinite', transformOrigin: '50px 52px' } : {}}>
        <circle cx="15" cy="30" r="2" fill="#00D4FF" opacity="0.8" />
        <circle cx="85" cy="28" r="1.5" fill="#FF6B9D" opacity="0.7" />
        <circle cx="12" cy="65" r="1.2" fill="#BD34FE" opacity="0.6" />
        <circle cx="88" cy="70" r="1.8" fill="#7B61FF" opacity="0.5" />
      </g>

      {/* Star sparkles */}
      <g style={animate ? { animation: 'nutelaPulse 2s ease infinite' } : {}}>
        <path d="M 22 20 L 23 17 L 24 20 L 27 21 L 24 22 L 23 25 L 22 22 L 19 21 Z" fill="#FFD700" opacity="0.9" />
      </g>
      <g style={animate ? { animation: 'nutelaPulse 2s ease infinite 0.7s' } : {}}>
        <path d="M 78 18 L 79 16 L 80 18 L 82 19 L 80 20 L 79 22 L 78 20 L 76 19 Z" fill="#00D4FF" opacity="0.8" />
      </g>
      <g style={animate ? { animation: 'nutelaPulse 2s ease infinite 1.3s' } : {}}>
        <path d="M 90 50 L 91 48 L 92 50 L 94 51 L 92 52 L 91 54 L 90 52 L 88 51 Z" fill="#FF6B9D" opacity="0.7" />
      </g>
    </svg>
  );
}

/* ═══ NuTeLa Tips ═══ */
const NUTELA_TIPS = {
  generic:
    'היי! 👋 אני NuTeLa, עוזרת הסיכונים שלך.\n\nלא בטוח איך לדרג את הבקרה? הנה כלל אצבע:\n\n1 = לא קיימת — אין שום דבר מיושם\n2 = חלקית — יש תהליך אבל לא עקבי\n3 = מיושמת — עובד, אבל יש פערים\n4 = אפקטיבית — עובד טוב, מתועד\n5 = אפקטיבית מאוד — עובד מצוין, נבדק, מוכח',
};

/* ═══ Quick Actions ═══ */
const quickActions = [
  { label: 'סקירת ציות מהירה', icon: Shield, color: C.accent },
  { label: 'הפק דוח סיכונים', icon: FileText, color: C.success },
  { label: 'בדוק מצב משימות', icon: CheckSquare, color: '#BD34FE' },
];

/* ═══ NuTeLa Panel ═══ */
function NuTelaPanel({ onClose }: { onClose: () => void }) {
  const [typing, setTyping] = useState(true);
  const [input, setInput] = useState('');
  const lines = NUTELA_TIPS.generic.split('\n').filter(Boolean);

  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        left: 24,
        width: 380,
        maxHeight: 540,
        borderRadius: 20,
        boxShadow:
          '0 12px 60px rgba(123,97,255,0.2), 0 4px 20px rgba(189,52,254,0.1)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInUp 0.3s ease-out',
        direction: 'rtl',
        border: '1px solid rgba(123,97,255,0.15)',
      }}
    >
      {/* Gradient Header */}
      <div
        style={{
          background:
            'linear-gradient(135deg, #00D4FF 0%, #7B61FF 40%, #BD34FE 70%, #FF6B9D 100%)',
          padding: '18px 20px 14px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            right: -10,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 40,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#FFD700',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 15,
            left: 60,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#00D4FF',
            opacity: 0.6,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 14,
              padding: 4,
              backdropFilter: 'blur(10px)',
            }}
          >
            <NuTelaAvatar size={40} animate={false} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 800,
                fontFamily: 'var(--font-rubik)',
                letterSpacing: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              NuTeLa
              <span
                style={{
                  fontSize: 8,
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                AI
              </span>
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 11,
                fontFamily: 'var(--font-assistant)',
                marginTop: 1,
              }}
            >
              יועצת סיכונים חכמה · מבית NTL
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4ADE80',
                boxShadow: '0 0 8px #4ADE80',
              }}
            />
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: 8,
              width: 28,
              height: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <X size={14} color="rgba(255,255,255,0.8)" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          padding: '16px 18px',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #FAFBFD 0%, #F5F7FA 100%)',
        }}
      >
        {typing ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7B61FF, #BD34FE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <NuTelaAvatar size={22} animate={false} />
            </div>
            <div
              style={{
                background: 'white',
                borderRadius: '14px 14px 14px 4px',
                padding: '10px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: `1px solid ${C.borderLight}`,
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7B61FF, #FF6B9D)',
                    animation: `typingDot 1.2s ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {/* AI Message */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #7B61FF, #BD34FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <NuTelaAvatar size={22} animate={false} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    border: `1px solid ${C.borderLight}`,
                    maxWidth: 290,
                  }}
                >
                  {lines.map((line, i) => {
                    const isHighlight =
                      line.startsWith('✓') || line.startsWith('✗') || line.startsWith('💡');
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: 12,
                          fontFamily: 'var(--font-assistant)',
                          color: C.text,
                          lineHeight: 1.8,
                          fontWeight: isHighlight ? 600 : 400,
                          background: isHighlight
                            ? line.startsWith('✓')
                              ? `${C.success}08`
                              : line.startsWith('✗')
                                ? '#C0392B08'
                                : `${C.accent}08`
                            : 'transparent',
                          borderRadius: isHighlight ? 6 : 0,
                          padding: isHighlight ? '2px 6px' : 0,
                          margin: isHighlight ? '2px 0' : 0,
                        }}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: C.textMuted,
                    fontFamily: 'var(--font-rubik)',
                    marginTop: 4,
                    marginRight: 4,
                  }}
                >
                  עכשיו · NuTeLa AI
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.textMuted,
                  fontFamily: 'var(--font-rubik)',
                  marginBottom: 6,
                  marginRight: 38,
                }}
              >
                פעולות מהירות
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginRight: 38,
                  flexWrap: 'wrap',
                }}
              >
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    style={{
                      background: 'white',
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: '7px 12px',
                      fontSize: 10,
                      fontFamily: 'var(--font-rubik)',
                      color: C.text,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontWeight: 500,
                      transition: 'all 0.15s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = qa.color;
                      e.currentTarget.style.background = `${qa.color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <qa.icon size={11} color={qa.color} />
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${C.borderLight}`,
          background: 'white',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל את NuTeLa..."
            style={{
              width: '100%',
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '9px 14px',
              fontSize: 12,
              fontFamily: 'var(--font-assistant)',
              color: C.text,
              outline: 'none',
              background: C.borderLight,
              direction: 'rtl',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
        </div>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7B61FF, #BD34FE)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Send size={14} color="white" style={{ transform: 'scaleX(-1)' }} />
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 16px',
          background: 'linear-gradient(90deg, #F8FAFC, #F0ECFF)',
          borderTop: `1px solid ${C.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={10} color="#BD34FE" />
          <span
            style={{
              fontSize: 9,
              color: C.textMuted,
              fontFamily: 'var(--font-assistant)',
            }}
          >
            Powered by NuTeLa AI · NTL Management
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 9,
            color: C.accent,
            fontFamily: 'var(--font-rubik)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          סגור
        </button>
      </div>
    </div>
  );
}

/* ═══ NuTeLa Floating Bubble — main export ═══ */
export function NuTelaBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Bubble Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 150,
          cursor: 'pointer',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7B61FF, #BD34FE, #FF6B9D)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'nutelaGlow 3s ease-in-out infinite',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <NuTelaAvatar size={42} animate={!open} />
      </div>

      {/* Label tooltip when closed */}
      {!open && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: 86,
            zIndex: 150,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '4px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-rubik)',
              color: C.text,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#7B61FF' }}>N</span>
            <span style={{ color: '#BD34FE' }}>u</span>
            <span style={{ color: '#7B61FF' }}>T</span>
            <span style={{ color: '#BD34FE' }}>e</span>
            <span style={{ color: '#7B61FF' }}>L</span>
            <span style={{ color: '#FF6B9D' }}>a</span>{' '}
            <span style={{ fontSize: 9, color: C.textMuted }}>AI</span>
          </div>
        </div>
      )}

      {/* Panel */}
      {open && <NuTelaPanel onClose={() => setOpen(false)} />}
    </>
  );
}
