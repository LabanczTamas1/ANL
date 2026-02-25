/**
 * ANL Design System — Shadow Tokens
 *
 * Box-shadow presets for elevation and depth.
 * Custom values extend Tailwind's built-in shadow-sm … shadow-2xl.
 */

export const shadows = {
  /** No shadow */
  none: 'none',
  /** Subtle resting shadow */
  soft: '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
  /** Card at rest */
  card: '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
  /** Card hover / focus */
  'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
  /** Glassmorphism */
  glass: '0 4px 32px 0 rgba(0, 0, 0, 0.18)',
  /** Dark-mode card */
  'dark-card': '0 4px 6px -1px rgba(55, 65, 81, 0.3), 0 2px 4px -2px rgba(55, 65, 81, 0.2)',
  /** Footer (light mode) */
  footer: '0 -1px 3px 0 rgba(107, 114, 128, 0.3)',
  /** Prominent elevation — modals, popovers */
  elevated: '0 12px 40px -8px rgba(0, 0, 0, 0.2)',
} as const;

export default shadows;
