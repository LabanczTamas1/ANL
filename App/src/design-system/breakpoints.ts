/**
 * ANL Design System — Breakpoint Tokens
 *
 * Matches Tailwind's default breakpoints + custom height-based breakpoints
 * from tailwind.config.js. Use these in JS/TS media-query hooks and
 * responsive logic.
 */

// ─── Width Breakpoints (min-width, px) ──────────────────────────────────────
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ─── Height Breakpoints (from tailwind.config.js) ───────────────────────────
export const heightBreakpoints = {
  /** h-sm: max-height 640px */
  sm: 640,
  /** h-md: 641px – 1024px */
  mdMin: 641,
  mdMax: 1024,
  /** h-lg: min-height 1025px */
  lg: 1025,
} as const;

// ─── Media Query Strings (for JS matchMedia or CSS-in-JS) ──────────────────
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,

  /** Mobile-first: max-width below md */
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  /** Mobile breakpoint used in the Navbar (max-width: 600px) */
  mobileNav: '(max-width: 600px)',

  /** Height-based (matches tailwind.config.js screens) */
  hSm: `(max-height: ${heightBreakpoints.sm}px)`,
  hMd: `(min-height: ${heightBreakpoints.mdMin}px) and (max-height: ${heightBreakpoints.mdMax}px)`,
  hLg: `(min-height: ${heightBreakpoints.lg}px)`,
} as const;

const breakpointTokens = {
  breakpoints,
  heightBreakpoints,
  mediaQueries,
} as const;

export default breakpointTokens;
