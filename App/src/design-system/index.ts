/**
 * ANL Design System — Barrel Export
 *
 * Import everything from `@design-system`:
 *
 *   import { brand, surface, content, fontSize, shadows, zIndex } from '@design-system';
 *
 * Or import a specific module:
 *
 *   import colors from '@design-system/colors';
 */

// ─── Colors ─────────────────────────────────────────────────────────────────
export {
  default as colors,
  brand,
  accent,
  surface,
  content,
  line,
  status,
  glass,
  gradients,
} from './colors';

// ─── Typography ─────────────────────────────────────────────────────────────
export {
  default as typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
} from './typography';

// ─── Spacing & Sizing ───────────────────────────────────────────────────────
export {
  default as spacingTokens,
  BASE_UNIT,
  space,
  spacing,
  sizes,
  borderRadius,
} from './spacing';

// ─── Shadows ────────────────────────────────────────────────────────────────
export { default as shadows } from './shadows';

// ─── Animations ─────────────────────────────────────────────────────────────
export {
  default as animations,
  duration,
  easing,
  transitions,
  keyframes,
} from './animations';

// ─── Breakpoints ────────────────────────────────────────────────────────────
export {
  default as breakpointTokens,
  breakpoints,
  heightBreakpoints,
  mediaQueries,
} from './breakpoints';

// ─── Z-Index ────────────────────────────────────────────────────────────────
export { default as zIndex } from './zIndex';
