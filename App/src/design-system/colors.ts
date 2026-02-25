/**
 * ANL Design System — Color Tokens
 *
 * Semantic color palette for the TypeScript app.
 * Re-exports primitives and adds JS-only extras (gradients).
 *
 * Tailwind class mapping:
 *   brand.DEFAULT    → `bg-brand`, `text-brand`
 *   brand.hover      → `bg-brand-hover`
 *   surface.dark     → `bg-surface-dark`
 *   content.muted    → `text-content-muted`
 *   line.dark        → `border-line-dark`
 *   status.error     → `text-status-error`, `border-status-error`
 */

export {
  brand,
  accent,
  surface,
  content,
  line,
  status,
  glass,
} from './primitives';

import { brand, accent, surface, content, line, status, glass } from './primitives';

// ─── Gradients (CSS strings — for JS/TS inline styles only) ─────────────────
export const gradients = {
  landing: `linear-gradient(to bottom, ${surface.overlay}, ${brand.DEFAULT}, ${surface.black})`,
  innerLight: 'linear-gradient(to bottom right, #F9FAFB, #F5F3FF)',
  innerDark: 'linear-gradient(to bottom right, #111827, #1F2937)',
  heroText: `linear-gradient(to right, ${accent.teal}, ${accent.rose}, ${accent.teal})`,
  globalLight: 'linear-gradient(to bottom, #EFEFEF 0%, #CDCDCD 78%, #FCFCFD 100%)',
  globalDark: 'linear-gradient(to bottom, rgb(206, 13, 13) 0%, rgb(173, 25, 25) 78%, rgb(18, 18, 194) 100%)',
} as const;

// ─── Combined palette export ────────────────────────────────────────────────
const colors = {
  brand,
  accent,
  surface,
  content,
  line,
  status,
  glass,
  gradients,
} as const;

export default colors;
