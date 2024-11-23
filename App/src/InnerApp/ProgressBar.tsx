import React, { useState, useEffect } from "react";

const ProgressBar = () => {
  const username = localStorage.getItem("name");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply the dark class to the HTML tag
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex flex-row justify-between mr-5 border-b-[1px] border-black p-3 pr-0" style={{ borderColor: "rgba(0, 0, 0 , 0.34)" }}>
      {/* Breadcrumbs Section */}
      <div className="flex flex-col">
        <div className="font-semibold text-lg">Breadcrumbs</div>
      </div>

      {/* User Info Section */}
      <div className="flex flex-row items-center space-x-4">
        <div className="text-sm text-gray-800 dark:text-white">
          Hello, {username}!
        </div>
        
        {/* Toggle Button for Dark/Light Mode */}
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>

        {/* Logout Section */}
        <div className="text-sm text-gray-800 dark:text-white cursor-pointer">
          logout
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
