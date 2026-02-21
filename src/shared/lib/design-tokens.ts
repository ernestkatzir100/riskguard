/**
 * RiskGuard Design Tokens — Single source of truth for all colors.
 * Import: import { C } from '@/shared/lib/design-tokens';
 * Replaces the duplicated `const C = { ... }` in every file.
 */

export const C = {
  // Navigation
  navBg: '#1A2740',
  navHover: '#253854',

  // Core palette
  accent: '#1D6FAB',
  accentTeal: '#0E9AAA',
  accentLight: '#E0F2FE',
  accentDark: '#155A8A',
  accentGrad: 'linear-gradient(135deg, #1D6FAB, #0E9AAA)',

  // Semantic — success
  success: '#16A34A',
  successBg: '#DCFCE7',

  // Semantic — warning
  warning: '#D97706',
  warningBg: '#FEF3C7',

  // Semantic — danger
  danger: '#DC2626',
  dangerBg: '#FEE2E2',

  // Surfaces
  bg: '#F5F7FA',
  surface: '#FFFFFF',

  // Text
  text: '#0F172A',
  textSec: '#475569',
  textMuted: '#64748B',

  // Borders
  border: '#CBD5E1',
  borderLight: '#E2E8F0',

  // PRO tier
  pro: '#7C3AED',
  proBg: 'rgba(124,58,237,0.08)',
} as const;

export type DesignTokens = typeof C;
