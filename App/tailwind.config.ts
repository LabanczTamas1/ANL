/**
 * Tailwind CSS Config — driven by the ANL Design System primitives.
 *
 * ⚠️  Do NOT hard-code colours / sizes here.
 *     Edit `src/design-system/primitives.ts` instead — the single source of truth.
 *
 * Color naming avoids prefix stutter:
 *   bg-brand, bg-brand-hover       (not bg-brand-primary)
 *   bg-surface-dark                 (not bg-bg-surface-dark)
 *   text-content-muted              (not text-text-muted)
 *   border-line-dark                (not border-border-dark)
 */
import type { Config } from 'tailwindcss';
import {
  brand,
  accent,
  surface,
  content,
  line,
  status,
  glass,
  fontFamily,
  sizes,
  borderRadius,
  boxShadow,
  zIndex,
  screens,
  transitionDuration,
  backdropBlur,
} from './src/design-system/primitives';
import daisyui from 'daisyui';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Typography ──────────────────────────────────────────────────────
      fontFamily,

      // ── Spacing (component sizes extend Tailwind defaults) ──────────────
      spacing: sizes,

      // ── Screens (height-based breakpoints) ─────────────────────────────
      screens,

      // ── Colors (semantic groups — no prefix stutter) ───────────────────
      colors: {
        brand,
        accent,
        surface,
        content,
        line,
        status,
        glass,
      },

      // ── Border Radius ──────────────────────────────────────────────────
      borderRadius,

      // ── Box Shadow ─────────────────────────────────────────────────────
      boxShadow,

      // ── Z-Index ────────────────────────────────────────────────────────
      zIndex,

      // ── Transition Duration ────────────────────────────────────────────
      transitionDuration,

      // ── Backdrop Blur ──────────────────────────────────────────────────
      backdropBlur,

      // ── Transform & Perspective (non-token) ────────────────────────────
      transform: ['motion-safe'],
      rotate: {
        'y-180': 'rotateY(180deg)',
      },
      perspective: {
        DEFAULT: '1000px',
      },
    },
  },
  plugins: [
    daisyui,
  ],
} satisfies Config;
