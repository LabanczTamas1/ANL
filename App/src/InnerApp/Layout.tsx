import React from "react";
import Sidebar from "./Sidebar";
import ProgressBar from "./ProgressBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen bg-white dark:bg-[#121212]">
      <div className="flex flex-row w-full bg-[#1D2431] pt-3 h-full">
        <Sidebar />
        <div className="bg-white dark:bg-[#1e1e1e] w-full rounded-tl-lg">
          <ProgressBar />
          {/* Content Section */}
          <div className="p-4 text-black dark:text-white">
                <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
