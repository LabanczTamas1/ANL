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
      <div className="main-content flex flex-col h-full w-full min-h-0 min-w-0">
        {/* Header: collapses out of flow on mobile scroll-down, no gap left behind */}
        <div
          className="shrink-0 overflow-hidden transition-[height] duration-300 ease-in-out"
          style={isMobile ? { height: collapsed ? 0 : headerHeight } : undefined}
        >
          <div ref={headerRef} className="bg-white dark:bg-[#1e1e1e]">
            <ProgressBar />
          </div>
        </div>

        {/* The one and only content scroller */}
        <div
          ref={scrollRef}
          className="text-black dark:text-white dark:bg-[#121212] flex-1 min-h-0 min-w-0 w-full overflow-y-auto"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
