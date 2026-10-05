import { useLayoutEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ProgressBar from "./ProgressBar";
import { Outlet } from "react-router-dom";
import { useAutoHideHeader } from "../hooks/useAutoHideHeader";
import { useMediaQuery } from "../hooks/useMediaQuery";

const Layout = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerHidden = useAutoHideHeader(scrollRef, {
    bottomOffset: headerHeight + 24,
  });

  // Measure the header so it can collapse to exactly 0 ↔ its natural height.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Only collapse on mobile; the desktop header is always visible.
  const collapsed = isMobile && headerHidden;

  return (
    <div className="flex flex-row h-screen bg-white dark:bg-[#121212] overflow-hidden">
      {/* Sidebar */}
      <div className="h-full bg-[#1D2431] hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area — app shell with a single scroll container */}
      <div className="main-content relative flex flex-col h-full w-full min-h-0 min-w-0">
        {/* Header overlay: slides up with a transform (no reflow, so the content
            below never shifts). Measured so the scroller can reserve matching
            top padding. */}
        <div
          ref={headerRef}
          className="absolute top-0 left-0 right-0 z-20 bg-white dark:bg-[#1e1e1e] transition-transform duration-300 ease-in-out will-change-transform"
          style={{ transform: collapsed ? "translateY(-100%)" : "translateY(0)" }}
        >
          <ProgressBar />
        </div>

        {/* The one and only content scroller. A constant top padding equal to the
            header height keeps the content below the header without ever changing
            layout, so hiding the header produces no jump. */}
        <div
          ref={scrollRef}
          className="text-black dark:text-white dark:bg-[#121212] flex-1 min-h-0 min-w-0 w-full overflow-y-auto"
          style={{ paddingTop: headerHeight }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
