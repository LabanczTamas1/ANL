/**
 * ANL Design System — Z-Index Scale
 *
 * Predefined stacking layers so components never fight for z-index.
 */

export const zIndex = {
  /** Below everything (hidden layers) */
  behind: -1,
  /** Default stacking context */
  base: 0,
  /** Slightly raised — sticky elements, cards on hover */
  raised: 10,
  /** Dropdowns, popovers */
  dropdown: 20,
  /** Sticky headers, progress bars */
  sticky: 30,
  /** Fixed sidebars, mobile nav */
  fixed: 40,
  /** Navbar — matches "z-50" used in Navbar.tsx */
  navbar: 50,
  /** Modals, dialogs */
  modal: 60,
  /** Toasts, notifications (react-toastify) */
  toast: 70,
  /** Tooltips */
  tooltip: 80,
  /** Top-most — loading overlays */
  overlay: 100,
} as const;

export default zIndex;
