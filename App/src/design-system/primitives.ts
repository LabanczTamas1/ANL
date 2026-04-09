/**
 * ANL Design System — Primitives
 *
 * ⚠️  SINGLE SOURCE OF TRUTH for all raw design values.
 *     Both `tailwind.config.ts` and the TypeScript design-system modules
 *     consume these primitives.
 *
 * Naming convention — semantic groups avoid Tailwind prefix stutter:
 *   brand.*     → bg-brand, text-brand-hover          (not bg-brand-primary)
 *   surface.*   → bg-surface-dark, bg-surface-elevated (not bg-bg-*)
 *   content.*   → text-content-muted                   (not text-text-*)
 *   line.*      → border-line, border-line-dark         (not border-border-*)
 *   status.*    → text-status-error, bg-status-success
 */

// ─── Brand ──────────────────────────────────────────────────────────────────
export const brand = {
  DEFAULT: '#65558F',
  hover: '#7c6bb7',
  muted: 'rgba(101, 85, 143, 0.20)',
  focus: '#a78bfa',
} as const;

// ─── Accent (secondary palette) ─────────────────────────────────────────────
export const accent = {
  teal: '#7AA49F',
  rose: '#9A4647',
  purple: '#9B7ADB',
} as const;

// ─── Surfaces (backgrounds) ─────────────────────────────────────────────────
export const surface = {
  light: '#FFFFFF',
  dark: '#121212',
  elevated: '#1e1e1e',
  sidebar: '#1D2431',
  overlay: '#080A0D',
  black: '#000000',
} as const;

// ─── Content (text & icon colors) ───────────────────────────────────────────
export const content = {
  DEFAULT: '#000000',
  inverse: '#FFFFFF',
  muted: '#A5A5A5',
  subtle: '#4B5563',
  'subtle-inverse': '#D1D5DB',
  disabled: '#9CA3AF',
} as const;

// ─── Lines (borders & dividers) ─────────────────────────────────────────────
export const line = {
  DEFAULT: '#D0D0D0',
  dark: '#374151',
  error: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.08)',
} as const;

// ─── Status / Feedback ──────────────────────────────────────────────────────
export const status = {
  error: '#EF4444',
  'error-muted': 'rgba(239, 68, 68, 0.30)',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// ─── Glassmorphism ──────────────────────────────────────────────────────────
export const glass = {
  DEFAULT: 'rgba(20, 20, 30, 0.7)',
} as const;

// ─── Font Family ────────────────────────────────────────────────────────────
export const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
};

// ─── Component Sizes (extends Tailwind spacing) ─────────────────────────────
export const sizes = {
  sidebar: '18.75rem',    // 300px
  'navbar-w': '56.25rem', // 900px
  'navbar-h': '4rem',     // 64px
  'content-max': '72rem', // 1152px
  'logo': '2.5rem',
  'logo-sm': '4rem',
  'icon-sm': '1rem',      // 16px
  'icon-md': '1.25rem',   // 20px
  'icon-lg': '1.5rem',    // 24px
  'avatar-sm': '2rem',    // 32px
  'avatar-md': '3rem',    // 48px
  'avatar-lg': '4rem',    // 64px
  'spinner': '4rem',
  'card-w': '18.75rem',   // 300px
  'card-h': '15.625rem',  // 250px
  'feature-icon': '2.5rem',
} as const;

// ─── Border Radius (extends Tailwind defaults) ─────────────────────────────
export const borderRadius = {
  '4xl': '2rem',
  navbar: '2.5rem',
} as const;

// ─── Box Shadows ────────────────────────────────────────────────────────────
export const boxShadow = {
  soft: '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
  card: '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
  'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
  glass: '0 4px 32px 0 rgba(0, 0, 0, 0.18)',
  'dark-card': '0 4px 6px -1px rgba(55, 65, 81, 0.3), 0 2px 4px -2px rgba(55, 65, 81, 0.2)',
  footer: '0 -1px 3px 0 rgba(107, 114, 128, 0.3)',
  elevated: '0 12px 40px -8px rgba(0, 0, 0, 0.2)',
} as const;

// ─── Z-Index ────────────────────────────────────────────────────────────────
export const zIndex = {
  behind: '-1',
  base: '0',
  raised: '10',
  dropdown: '20',
  sticky: '30',
  fixed: '40',
  navbar: '50',
  modal: '60',
  toast: '70',
  tooltip: '80',
  overlay: '100',
} as const;

// ─── Height-based Screens ───────────────────────────────────────────────────
export const screens = {
  'h-sm': { raw: '(max-height: 640px)' },
  'h-md': { raw: '(min-height: 641px) and (max-height: 1024px)' },
  'h-lg': { raw: '(min-height: 1025px)' },
} as const;

// ─── Transition Durations ───────────────────────────────────────────────────
export const transitionDuration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
} as const;

// ─── Backdrop Blur ──────────────────────────────────────────────────────────
export const backdropBlur = {
  glass: '12px',
} as const;
