import React from "react";
import Sidebar from "./Sidebar";
import ProgressBar from "./ProgressBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-row h-screen bg-white dark:bg-[#121212]">
      {/* Sidebar */}
      <div className="h-full bg-[#1D2431] hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col h-full w-full">
        {/* Progress Bar */}
        <div className="md:hidden">
        hello
      </div>
        <div className="bg-white dark:bg-[#1e1e1e]">
          <ProgressBar />
        </div>

        {/* Content Section */}
        <div className="text-black dark:text-white dark:bg-[#121212] h-full w-full p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
