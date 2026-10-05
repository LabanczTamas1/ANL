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
 * @param scrollRef  Ref to the scrollable element to observe.
 * @param options.threshold   Minimum px of movement before reacting (default 6).
 * @param options.revealOffset Always show the header while within this many px
 *                             of the top (default 64).
 * @returns `true` when the header should be hidden.
 */
export function useAutoHideHeader(
  scrollRef: RefObject<HTMLElement | null>,
  { threshold = 6, revealOffset = 64 }: { threshold?: number; revealOffset?: number } = {},
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
        if (currentY <= revealOffset) {
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
  }, [scrollRef, threshold, revealOffset]);

  return hidden;
}

export default useAutoHideHeader;
