import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

const InformationsLayout = () => {
  return (
    <div className="bg-surface-overlay relative min-h-screen flex flex-col">
      {/* Same Navbar as landing page */}
      <Navbar />

      {/* Page content */}
      <div className="flex-1 dark">
        <Outlet />
      </div>

      <Footer darkMode={true} />
    </div>
  );
};

export default InformationsLayout;