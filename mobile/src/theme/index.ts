/**
 * Easner Premium Design System
 * 
 * Central export for all theme tokens
 */

export { colors } from './colors'
export type { Colors } from './colors'

export { shadows, combineShadows } from './shadows'
export type { Shadows } from './shadows'

export { 
  fontFamily, 
  fontWeight, 
  fontSize, 
  lineHeight, 
  letterSpacing,
  textStyles 
} from './typography'
export type { Typography } from './typography'

// Spacing scale (4px base unit)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
}

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
}

// Animation durations
export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
}

// Easing curves
export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
}

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  toast: 60,
}

