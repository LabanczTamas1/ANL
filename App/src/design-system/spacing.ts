/**
 * ANL Design System — Spacing & Sizing Tokens
 *
 * Consistent spacing scale and fixed component sizes.
 * Based on a 4 px base unit.
 */

// ─── Base Unit ──────────────────────────────────────────────────────────────
export const BASE_UNIT = 4; // px

/** Generate a spacing value from a multiplier (e.g. space(4) → '16px') */
export const space = (multiplier: number): string => `${BASE_UNIT * multiplier}px`;

// ─── Spacing Scale ──────────────────────────────────────────────────────────
// Extends Tailwind defaults — only add values you actually need beyond the
// default 0–96 scale. Tailwind's built-in spacing already covers 0.5–96
// in a 4 px–based system.
export const spacing = {
  '0': '0px',
  px: '1px',
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  '2': '8px',
  '2.5': '10px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '7': '28px',
  '8': '32px',
  '9': '36px',
  '10': '40px',
  '12': '48px',
  '14': '56px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '28': '112px',
  '32': '128px',
} as const;

// ─── Fixed Component Sizes ──────────────────────────────────────────────────
export const sizes = {
  /** Sidebar width */
  sidebar: '18.75rem',      // 300px
  /** Navbar max width */
  navbarW: '56.25rem',      // 900px
  /** Navbar height */
  navbarH: '4rem',          // 64px
  /** Max content width */
  contentMax: '72rem',      // 1152px
  /** Logo height */
  logo: '2.5rem',
  /** Logo — small breakpoint */
  logoSm: '4rem',
  /** Icon — small */
  iconSm: '1rem',           // 16px
  /** Icon — medium */
  iconMd: '1.25rem',        // 20px
  /** Icon — large */
  iconLg: '1.5rem',         // 24px
  /** Avatar — small */
  avatarSm: '2rem',         // 32px
  /** Avatar — medium */
  avatarMd: '3rem',         // 48px
  /** Avatar — large */
  avatarLg: '4rem',         // 64px
  /** Loading spinner */
  spinner: '4rem',
  /** Card width */
  cardW: '18.75rem',        // 300px
  /** Card height */
  cardH: '15.625rem',       // 250px
  /** Feature icon box */
  featureIcon: '2.5rem',
} as const;

// ─── Border Radius (extends Tailwind defaults) ─────────────────────────────
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  '4xl': '2rem',     // 32px
  full: '9999px',
  navbar: '2.5rem',  // 40px
} as const;

const spacingTokens = {
  BASE_UNIT,
  space,
  spacing,
  sizes,
  borderRadius,
} as const;

export default spacingTokens;
