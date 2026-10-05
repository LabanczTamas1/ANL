import { useRef } from "react";
import Sidebar from "./Sidebar";
import ProgressBar from "./ProgressBar";
import { Outlet } from "react-router-dom";
import { useAutoHideHeader } from "../hooks/useAutoHideHeader";

const Layout = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerHidden = useAutoHideHeader(scrollRef);

  return (
    <div className="flex flex-row h-screen bg-white dark:bg-[#121212] overflow-hidden">
      {/* Sidebar */}
      <div className="h-full bg-[#1D2431] hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="main-content flex flex-col h-full w-full min-h-0 min-w-0">
        {/* Single scroll container — header and content share one scroller */}
        <div
          ref={scrollRef}
          className="text-black dark:text-white dark:bg-[#121212] flex-1 min-h-0 min-w-0 w-full overflow-y-auto"
        >
          {/* Sticky header: auto-hides on mobile, always visible on desktop */}
          <div
            className={`sticky top-0 z-20 bg-white dark:bg-[#1e1e1e] transition-transform duration-300 ease-in-out md:translate-y-0 ${
              headerHidden ? "-translate-y-full" : "translate-y-0"
            }`}
          >
            <ProgressBar />
          </div>

          {/* Content Section */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
