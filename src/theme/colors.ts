// src/theme/colors.ts
// Central bluish "modern chat" color palette. Import this everywhere instead
// of hardcoding hex values so the whole app can be re-themed from one place.

export const colors = {
  // Core brand blues
  primary: '#2F6FED',
  primaryDark: '#1B3A78',
  primaryDarker: '#122451',
  primaryLight: '#5C9DFF',
  primarySoft: '#EAF1FF',

  // Accent
  accent: '#00C2CB',

  // Surfaces
  background: '#F4F8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3FF',

  // Text
  textPrimary: '#0B1B33',
  textSecondary: '#5B6B85',
  textMuted: '#98A6BF',
  textOnPrimary: '#FFFFFF',

  // Borders / dividers
  border: '#DCE7FA',
  divider: '#E4ECFB',

  // Status
  online: '#27C46B',
  offline: '#B7C1D6',
  error: '#FF5A5F',
  warning: '#FFB020',

  // Chat bubbles
  bubbleMine: '#2F6FED',
  bubbleTheirs: '#EAF1FF',
  bubbleMineText: '#FFFFFF',
  bubbleTheirsText: '#0B1B33',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(11,27,51,0.45)',
};

export default colors;
