/**
 * ANL Design System — Animation Tokens
 *
 * Durations, easings, and reusable transition / keyframe presets.
 */

// ─── Durations ──────────────────────────────────────────────────────────────
export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
  /** Theme transition */
  theme: '300ms',
  /** Card flip */
  cardFlip: '300ms',
  /** Hero gradient cycle */
  heroGradient: '10s',
  /** Greeting rotation */
  greetingInterval: 1500, // ms (for JS timers)
  /** Loading spinner delay */
  loadingDelay: 1000,     // ms
} as const;

// ─── Easings ────────────────────────────────────────────────────────────────
export const easing = {
  /** Default ease for UI transitions */
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Enter / appear */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Exit / disappear */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Smooth in-out */
  easeInOut: 'ease-in-out',
  /** Linear (gradient animation) */
  linear: 'linear',
} as const;

// ─── Transition Presets (CSS shorthand strings) ─────────────────────────────
export const transitions = {
  /** Default all-property transition */
  all: `all ${duration.normal} ${easing.default}`,
  /** Color / background transitions (theme switch) */
  colors: `color ${duration.theme} ${easing.default}, background-color ${duration.theme} ${easing.default}, border-color ${duration.theme} ${easing.default}`,
  /** Transform transitions (hover lift) */
  transform: `transform ${duration.normal} ${easing.default}`,
  /** Shadow transitions (card hover) */
  shadow: `box-shadow ${duration.normal} ${easing.default}`,
  /** Opacity transitions (fade in/out) */
  opacity: `opacity ${duration.normal} ${easing.default}`,
} as const;

// ─── Keyframe Definitions (as CSS strings for injection or reference) ───────
export const keyframes = {
  /** Spin — loading spinner */
  spin: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
  /** Hero gradient scroll */
  moveGradient: `@keyframes moveGradient { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`,
  /** Card flip on Y axis */
  flipY: `@keyframes flipY { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }`,
  /** Fade in */
  fadeIn: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
  /** Slide up */
  slideUp: `@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`,
} as const;

const animations = {
  duration,
  easing,
  transitions,
  keyframes,
} as const;

export default animations;
