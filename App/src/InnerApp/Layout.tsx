import { useEffect } from "react";
import Sidebar from "./Sidebar";
import ProgressBar from "./ProgressBar";
import { Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      const darkMode = localStorage.getItem('darkMode');
      localStorage.clear();
      sessionStorage.clear();
      if (darkMode !== null) localStorage.setItem('darkMode', darkMode);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  return (
    <div className="flex flex-row h-screen bg-white dark:bg-[#121212] overflow-hidden overflow-hidden">
      {/* Sidebar */}
      <div className="h-full bg-[#1D2431] hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="main-content flex flex-col h-full w-full min-h-0 min-w-0">
        {/* Progress Bar */}
        <div className="md:hidden">
        </div>
        <div className="sticky top-0 z-10 bg-white dark:bg-[#1e1e1e]">
          <ProgressBar />
        </div>

        {/* Content Section */}
        <div className="text-black dark:text-white dark:bg-[#121212] flex-1 min-h-0 min-w-0 w-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
