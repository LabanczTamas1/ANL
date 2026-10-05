import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Auto-hiding header hook.
 *
 * Watches the scroll position of a scroll container and reports whether a
 * sticky header should be hidden. The header hides when the user scrolls down
 * and reveals when they scroll up — the common "headroom" pattern.
 *
 * Uses a passive scroll listener throttled with requestAnimationFrame and a
 * small delta threshold so direction changes don't flicker.
 *
 * A `bottomOffset` guard freezes toggling near the end of the scroll. This
 * prevents the self-oscillation that happens when collapsing the header grows
 * the scroll container, the browser clamps `scrollTop`, and that clamp fires a
 * "scroll up" event which would otherwise re-show the header — producing a
 * visible vibration at the bottom of the page.
 *
 * @param scrollRef  Ref to the scrollable element to observe.
 * @param options.threshold   Minimum px of movement before reacting (default 6).
 * @param options.revealOffset Always show the header while within this many px
 *                             of the top (default 64).
 * @param options.bottomOffset Freeze toggling while within this many px of the
 *                             bottom (default 96). Should be >= header height.
 * @returns `true` when the header should be hidden.
 */
export function useAutoHideHeader(
  scrollRef: RefObject<HTMLElement | null>,
  {
    threshold = 6,
    revealOffset = 64,
    bottomOffset = 96,
  }: { threshold?: number; revealOffset?: number; bottomOffset?: number } = {},
): boolean {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    lastScrollY.current = el.scrollTop;

    const update = () => {
      const currentY = el.scrollTop;
      const diff = currentY - lastScrollY.current;

      if (Math.abs(diff) > threshold) {
        const distanceToBottom = el.scrollHeight - currentY - el.clientHeight;

        if (distanceToBottom <= bottomOffset) {
          // Near the bottom: keep the current state so the clamp caused by a
          // header collapse can't trigger a reveal/hide feedback loop.
        } else if (currentY <= revealOffset) {
          setHidden(false);
        } else {
          setHidden(diff > 0); // scrolling down -> hide, up -> reveal
        }
        lastScrollY.current = currentY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef, threshold, revealOffset, bottomOffset]);

  return hidden;
}

export default useAutoHideHeader;
