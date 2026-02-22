/**
 * RiskGuard Design Tokens — Single source of truth for all colors.
 * Import: import { C } from '@/shared/lib/design-tokens';
 * Replaces the duplicated `const C = { ... }` in every file.
 */

export const C = {
  // Navigation
  navBg: '#0F1B2D',
  navHover: '#1A2B45',

  // Core palette — deeper, richer blues
  accent: '#1360A6',
  accentTeal: '#0B8A99',
  accentLight: '#D4ECFD',
  accentDark: '#0E4D80',
  accentGrad: 'linear-gradient(135deg, #1360A6, #0B8A99)',

  // Semantic — success (vivid green)
  success: '#0D9440',
  successBg: '#CBFADE',

  // Semantic — warning (vivid amber)
  warning: '#C36A00',
  warningBg: '#FEECB3',

  // Semantic — danger (vivid red)
  danger: '#C81E1E',
  dangerBg: '#FDD8D8',

  // Surfaces — slightly darker background for contrast
  bg: '#EDF0F5',
  surface: '#FFFFFF',

  // Text — closer to pure black
  text: '#0B1120',
  textSec: '#3B4A5E',
  textMuted: '#576B82',

  // Borders — slightly darker
  border: '#B8C4D1',
  borderLight: '#D5DDE8',

  // PRO tier
  pro: '#6D28D9',
  proBg: 'rgba(109,40,217,0.10)',
} as const;

export type DesignTokens = typeof C;
