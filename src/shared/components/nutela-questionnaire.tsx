'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Check, ChevronLeft } from 'lucide-react';

import { C } from '@/shared/lib/design-tokens';

const TOTAL_QUESTIONS = 3;
const GRADIENT = 'linear-gradient(135deg, #00D4FF 0%, #7B61FF 40%, #BD34FE 70%, #FF6B9D 100%)';

/* ═══ NuTeLa Mini Avatar SVG ═══ */
function NuTelaEgg({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="qEgg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="35%" stopColor="#7B61FF" />
          <stop offset="70%" stopColor="#BD34FE" />
          <stop offset="100%" stopColor="#FF6B9D" />
        </linearGradient>
        <linearGradient id="qShine" x1="0.3" y1="0" x2="0.7" y2="0.6">
          <stop offset="0%" stopColor="white" stopOpacity={0.5} />
          <stop offset="40%" stopColor="white" stopOpacity={0.08} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="qEyeG" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#F0F4FF" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="url(#qEgg)" />
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="url(#qShine)" />
      <ellipse cx="40" cy="46" rx="7" ry="8" fill="white" />
      <circle cx="41.5" cy="45" r="5" fill="#1E1B4B" />
      <circle cx="43.5" cy="43" r="2.2" fill="white" />
      <ellipse cx="60" cy="46" rx="7" ry="8" fill="white" />
      <circle cx="61.5" cy="45" r="5" fill="#1E1B4B" />
      <circle cx="63.5" cy="43" r="2.2" fill="white" />
      <ellipse cx="30" cy="54" rx="5" ry="3" fill="#FF6B9D" opacity="0.3" />
      <ellipse cx="70" cy="54" rx="5" ry="3" fill="#FF6B9D" opacity="0.3" />
      <path d="M 44 57 Q 47 61 50 57.5" fill="none" stroke="#7B61FF" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M 50 57.5 Q 53 61 56 57" fill="none" stroke="#7B61FF" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ═══ Confetti Particle ═══ */
function ConfettiParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => {
    const colors = ['#00D4FF', '#7B61FF', '#BD34FE', '#FF6B9D', '#FFD700', '#4ADE80'];
    const color = colors[i % colors.length];
    const left = 10 + Math.random() * 80;
    const delay = Math.random() * 0.8;
    const duration = 1.5 + Math.random() * 1.5;
    const size = 4 + Math.random() * 6;
    const rotation = Math.random() * 360;
    return { color, left, delay, duration, size, rotation, id: i };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-10%',
            width: p.size,
            height: p.size * (p.id % 3 === 0 ? 1 : 0.6),
            background: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : 1,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(400px) rotate(720deg); }
        }
      `}</style>
    </div>
  );
}

/* ═══ Slider Labels ═══ */
const SLIDER_LABELS: Record<number, string> = {
  1: 'נמוך מאוד',
  2: 'נמוך',
  3: 'בינוני',
  4: 'גבוה',
  5: 'גבוה מאוד',
};

/* ═══ NuTeLa Questionnaire Modal ═══ */
export function NuTelaQuestionnaire({ onClose, onComplete }: { onClose: () => void; onComplete?: (answers: Record<string, string | number>) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [sliderValue, setSliderValue] = useState(3);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (currentStep === 3) {
      // Fire completion callback with collected answers
      onComplete?.(answers);
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onClose, onComplete, answers]);

  const advanceTo = useCallback((step: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentStep(step);
      setFadeIn(true);
    }, 200);
  }, []);

  const handleChoiceClick = (questionKey: string, value: string, nextStep: number) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
    advanceTo(nextStep);
  };

  const handleSliderSubmit = () => {
    setAnswers((prev) => ({ ...prev, q2_risk_level: sliderValue }));
    advanceTo(2);
  };

  /* Step dots data */
  const stepDots = [1, 2, 3];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        direction: 'rtl',
        fontFamily: 'var(--font-assistant)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* White Card */}
      <div
        style={{
          width: 640,
          maxWidth: '94vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: C.surface,
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 8px 32px rgba(123,97,255,0.15)',
          animation: 'questModalIn 0.35s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header with gradient ── */}
        <div
          style={{
            background: GRADIENT,
            padding: '20px 24px 16px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '20px 20px 0 0',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -25, right: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          {/* Top row: Avatar + Task name + Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 3,
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
              }}
            >
              <NuTelaEgg size={40} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 800,
                  fontFamily: 'var(--font-rubik)',
                  letterSpacing: 0.3,
                }}
              >
                עדכון מפת סיכונים רבעוני
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 11,
                  fontFamily: 'var(--font-assistant)',
                  marginTop: 2,
                }}
              >
                NuTeLa Questionnaire &middot; {currentStep < 3 ? `שאלה ${currentStep + 1} מתוך ${TOTAL_QUESTIONS}` : 'הושלם'}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                borderRadius: 10,
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            >
              <X size={16} color="white" />
            </button>
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: 14,
              height: 6,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.15)',
              overflow: 'hidden',
              display: 'flex',
              gap: 2,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 3,
                  background: i < currentStep
                    ? 'rgba(255,255,255,0.9)'
                    : i === currentStep && currentStep < 3
                      ? 'rgba(255,255,255,0.45)'
                      : currentStep === 3
                        ? 'rgba(255,255,255,0.9)'
                        : 'transparent',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Step dots ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            padding: '16px 24px 8px',
            background: C.borderLight,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {stepDots.map((num, i) => {
            const isCompleted = currentStep > i;
            const isActive = currentStep === i;
            const isFinal = currentStep === 3;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-rubik)',
                    transition: 'all 0.3s ease',
                    ...(isCompleted || isFinal
                      ? {
                          background: C.success,
                          color: 'white',
                          boxShadow: `0 2px 8px ${C.success}40`,
                        }
                      : isActive
                        ? {
                            background: GRADIENT,
                            color: 'white',
                            boxShadow: '0 2px 12px rgba(123,97,255,0.3)',
                          }
                        : {
                            background: 'white',
                            color: C.textMuted,
                            border: `2px solid ${C.border}`,
                          }),
                  }}
                >
                  {isCompleted || isFinal ? <Check size={14} strokeWidth={3} /> : num}
                </div>
                {i < stepDots.length - 1 && (
                  <div
                    style={{
                      width: 40,
                      height: 2,
                      borderRadius: 1,
                      background: isCompleted || isFinal ? C.success : C.border,
                      transition: 'background 0.3s ease',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Question Body ── */}
        <div
          style={{
            padding: '32px 40px 36px',
            minHeight: 260,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          {/* ── Step 0: Business environment changes ── */}
          {currentStep === 0 && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.accent,
                  fontFamily: 'var(--font-rubik)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                שאלה 1 מתוך 3
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: 'var(--font-rubik)',
                  lineHeight: 1.5,
                  marginBottom: 32,
                }}
              >
                האם בוצעו שינויים בסביבה העסקית?
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'כן', value: 'yes', color: C.success, bg: C.successBg },
                  { label: 'לא', value: 'no', color: C.danger, bg: C.dangerBg },
                  { label: 'חלקית', value: 'partial', color: C.warning, bg: C.warningBg },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChoiceClick('q1_business_changes', opt.value, 1)}
                    style={{
                      minWidth: 130,
                      padding: '16px 28px',
                      borderRadius: 14,
                      border: `2px solid ${C.border}`,
                      background: C.surface,
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'var(--font-rubik)',
                      color: C.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = opt.color;
                      e.currentTarget.style.background = opt.bg;
                      e.currentTarget.style.color = opt.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 20px ${opt.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = C.surface;
                      e.currentTarget.style.color = C.text;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Operational risk slider ── */}
          {currentStep === 1 && (
            <div style={{ textAlign: 'center', width: '100%', maxWidth: 460 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.accent,
                  fontFamily: 'var(--font-rubik)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                שאלה 2 מתוך 3
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: 'var(--font-rubik)',
                  lineHeight: 1.5,
                  marginBottom: 36,
                }}
              >
                דרג את הסיכון התפעולי הגבוה ביותר
              </div>

              {/* Slider value display */}
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  fontFamily: 'var(--font-rubik)',
                  background: GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 4,
                }}
              >
                {sliderValue}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: sliderValue <= 2 ? C.success : sliderValue === 3 ? C.warning : C.danger,
                  fontFamily: 'var(--font-rubik)',
                  marginBottom: 24,
                  transition: 'color 0.2s',
                }}
              >
                {SLIDER_LABELS[sliderValue]}
              </div>

              {/* Slider track */}
              <div style={{ position: 'relative', padding: '0 8px', marginBottom: 12 }}>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: `linear-gradient(to left, ${C.danger}, ${C.warning}, ${C.success})`,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Slider labels row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: 32 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    style={{
                      fontSize: 10,
                      color: sliderValue === n ? C.text : C.textMuted,
                      fontFamily: 'var(--font-assistant)',
                      fontWeight: sliderValue === n ? 700 : 400,
                      textAlign: 'center',
                      minWidth: 50,
                      transition: 'all 0.2s',
                    }}
                  >
                    {n}
                    <div style={{ fontSize: 9, marginTop: 2 }}>{SLIDER_LABELS[n]}</div>
                  </div>
                ))}
              </div>

              {/* Submit button */}
              <button
                onClick={handleSliderSubmit}
                style={{
                  background: GRADIENT,
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 48px',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-rubik)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,97,255,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,97,255,0.3)';
                }}
              >
                <ChevronLeft size={16} />
                אישור והמשך
              </button>
            </div>
          )}

          {/* ── Step 2: Controls updated ── */}
          {currentStep === 2 && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.accent,
                  fontFamily: 'var(--font-rubik)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                שאלה 3 מתוך 3
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: 'var(--font-rubik)',
                  lineHeight: 1.5,
                  marginBottom: 32,
                }}
              >
                האם כל הבקרות עודכנו?
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {[
                  { label: 'כן', value: 'yes', color: C.success, bg: C.successBg },
                  { label: 'לא', value: 'no', color: C.danger, bg: C.dangerBg },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChoiceClick('q3_controls_updated', opt.value, 3)}
                    style={{
                      minWidth: 150,
                      padding: '18px 36px',
                      borderRadius: 14,
                      border: `2px solid ${C.border}`,
                      background: C.surface,
                      fontSize: 17,
                      fontWeight: 700,
                      fontFamily: 'var(--font-rubik)',
                      color: C.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = opt.color;
                      e.currentTarget.style.background = opt.bg;
                      e.currentTarget.style.color = opt.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 20px ${opt.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = C.surface;
                      e.currentTarget.style.color = C.text;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Completion screen ── */}
          {currentStep === 3 && (
            <div style={{ textAlign: 'center', width: '100%', position: 'relative' }}>
              <ConfettiParticles />

              {/* Green checkmark circle */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: C.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: `0 8px 32px ${C.success}40`,
                  animation: 'checkPop 0.5s ease-out',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Check size={40} color="white" strokeWidth={3} />
              </div>

              {/* Success ring pulse */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: `3px solid ${C.success}`,
                  animation: 'ringPulse 1.5s ease-out infinite',
                  opacity: 0,
                  marginTop: -60,
                }}
              />

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.success,
                  fontFamily: 'var(--font-rubik)',
                  marginBottom: 8,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                &#x2713; מפת הסיכונים עודכנה
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.text,
                  fontFamily: 'var(--font-assistant)',
                  marginBottom: 24,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                ציון עמידה עלה ל-
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 20,
                    fontFamily: 'var(--font-rubik)',
                    background: GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginRight: 4,
                    marginLeft: 2,
                  }}
                >
                  64%
                </span>
              </div>

              {/* Summary card */}
              <div
                style={{
                  background: C.successBg,
                  borderRadius: 14,
                  padding: '18px 24px',
                  border: `1px solid ${C.success}30`,
                  maxWidth: 380,
                  margin: '0 auto 24px',
                  textAlign: 'right',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: C.success, fontFamily: 'var(--font-rubik)', marginBottom: 10 }}>
                  סיכום תשובות
                </div>
                {Object.entries(answers).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${C.success}15` }}>
                    <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                      {key === 'q1_business_changes' ? 'שינויים בסביבה העסקית'
                        : key === 'q2_risk_level' ? 'דירוג סיכון תפעולי'
                          : 'עדכון בקרות'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      {val === 'yes' ? 'כן' : val === 'no' ? 'לא' : val === 'partial' ? 'חלקית' : String(val)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                style={{
                  background: GRADIENT,
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 48px',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-rubik)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
                  position: 'relative',
                  zIndex: 2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,97,255,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,97,255,0.3)';
                }}
              >
                סגור
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Global keyframe styles ── */}
      <style>{`
        @keyframes questModalIn {
          0% { opacity: 0; transform: scale(0.92) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #7B61FF;
          box-shadow: 0 2px 8px rgba(123,97,255,0.3);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 14px rgba(123,97,255,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #7B61FF;
          box-shadow: 0 2px 8px rgba(123,97,255,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
