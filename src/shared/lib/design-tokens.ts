/**
 * RiskGuard Design Tokens — Single source of truth for all colors.
 * Import: import { C } from '@/shared/lib/design-tokens';
 * Replaces the duplicated `const C = { ... }` in every file.
 */

export const C = {
  // Navigation
  navBg: '#1E2D3D',
  navHover: '#2A3F52',

  // Core palette
  accent: '#4A8EC2',
  accentTeal: '#5BB8C9',
  accentLight: '#E8F4FA',
  accentDark: '#3A7AAF',
  accentGrad: 'linear-gradient(135deg, #4A8EC2, #5BB8C9)',

  // Semantic — success
  success: '#2E8B57',
  successBg: '#EFF8F2',

  // Semantic — warning
  warning: '#C8922A',
  warningBg: '#FDF8ED',

  // Semantic — danger
  danger: '#C0392B',
  dangerBg: '#FDF0EE',

  // Surfaces
  bg: '#F5F7FA',
  surface: '#FFFFFF',

  // Text
  text: '#1A2332',
  textSec: '#4A5568',
  textMuted: '#8896A6',

  // Borders
  border: '#E1E8EF',
  borderLight: '#F0F3F7',

  // PRO tier
  pro: '#7C6FD0',
  proBg: 'rgba(124,111,208,0.08)',
} as const;

export type DesignTokens = typeof C;
