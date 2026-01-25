import axios from "axios";
import React, { useState, useEffect } from "react";
import { FiDownload, FiUpload } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";

import Breadcrumbs from "./components/Breadcrumbs";
import MobileNavbar from "./components/MobileNavbar";
import HamburgerMenu from "./components/HamburgerMenu";
import { useLogout } from "./../hooks/useLogout";

const ProgressBar = () => {
  const username = localStorage.getItem("userName") || localStorage.getItem("role");
  const location = useLocation();
  const roles = ["user", "owner", "admin"];
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem("superRole") || "user");
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null
      ? savedTheme === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const logout = useLogout();
  const showUploadFile = location.pathname === "/home/kanban";
  const isAdmin = username === "admin";

  // ===== Dark Mode Effects =====
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("darkMode") === null) setDarkMode(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // ===== File Upload Handler =====
  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return console.log("No file selected.");

    console.log("Selected file:", file);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        console.log("Parsed JSON Data:", jsonData);

        const formData = new FormData();
        formData.append("file", file);

        fetch(`${API_BASE_URL}/api/upload`, { method: "POST", body: formData })
          .then((res) => res.json())
          .then((data) => console.log("File uploaded successfully:", data))
          .catch((err) => console.error("Error uploading file:", err));
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    reader.readAsText(file);
  };

  // ===== Export Handler =====
  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/export`);
      const exportData = response.data;
      console.log("Exported Data:", exportData);

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "exported_data.json";
      link.click();

      console.log("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // ===== Role Change Handler =====
  const handleRoleChange = (newRole: string) => {
    if (role === newRole) return;
    localStorage.setItem("superRole", newRole);
    setRole(newRole);
    setTimeout(() => window.location.reload(), 0);
  };

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div
      className={`flex flex-wrap md:flex-nowrap items-center justify-between p-3 border-b-[1px] dark:border-gray-300 ${
        isMenuOpen ? "bg-[#1D2431]" : ""
      }`}
    >
      {/* ===== Breadcrumbs (Desktop Only) ===== */}
      <div className="hidden md:block flex-shrink">
        <Breadcrumbs />
      </div>

      {/* ===== Hamburger Menu & Mobile Navbar ===== */}
      <HamburgerMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {isMenuOpen && <MobileNavbar setIsMenuOpen={setIsMenuOpen} />}

      {/* ===== Right Side: User Info & Actions ===== */}
      <div className="flex flex-row flex-wrap md:flex-nowrap items-center space-x-4 ml-auto">
        {/* File Upload & Export */}
        {showUploadFile && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <label
              htmlFor="uploadInput"
              className="inline-flex items-center border border-gray-300 rounded-lg px-3 py-1 space-x-2 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-sm dark:text-white font-medium">Choose File</span>
              <FiUpload className="text-sm dark:text-white" />
            </label>
            <input
              id="uploadInput"
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={handleExport}
              className="inline-flex items-center border border-gray-300 rounded-lg px-3 py-1 space-x-2 hover:bg-gray-100 flex-shrink-0"
            >
              <span className="text-sm dark:text-white font-medium">Export</span>
              <FiDownload className="text-sm dark:text-white" />
            </button>
          </div>
        )}

        {/* Greeting / Role Selector */}
        {!isAdmin ? (
          <div className="dark:text-white font-bold flex-shrink-0">Hello, {username}!</div>
        ) : (
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="dark:text-white bg-[#FF5B61] rounded-xl h-[24px] px-2 flex-shrink-0"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={handleToggleDarkMode}
          className="flex items-center w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"
        >
          <span
            className={`w-8 h-6 rounded-full flex items-center justify-center transition-transform ${
              darkMode ? "transform translate-x-8 bg-black text-yellow-700" : "bg-[#1D2431] text-white"
            }`}
          >
            {/* Sun / Moon Icon logic stays the same */}
            {darkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15C12.8333 15 13.5417 14.7083 14.125 14.125C14.7083 13.5417 15 12.8333 15 12C15 11.1667 14.7083 10.4583 14.125 9.875C13.5417 9.29167 12.8333 9 12 9C11.1667 9 10.4583 9.29167 9.875 9.875C9.29167 10.4583 9 11.1667 9 12C9 12.8333 9.29167 13.5417 9.875 14.125C10.4583 14.7083 11.1667 15 12 15ZM12 17C10.6167 17 9.4375 16.5125 8.4625 15.5375C7.4875 14.5625 7 13.3833 7 12C7 10.6167 7.4875 9.4375 8.4625 8.4625C9.4375 7.4875 10.6167 7 12 7C13.3833 7 14.5625 7.4875 15.5375 8.4625C16.5125 9.4375 17 10.6167 17 12C17 13.3833 16.5125 14.5625 15.5375 15.5375C14.5625 16.5125 13.3833 17 12 17ZM5 13H1V11H5V13ZM23 13H19V11H23V13ZM11 5V1H13V5H11ZM11 23V19H13V23H11ZM6.4 7.75L3.875 5.325L5.3 3.85L7.7 6.35L6.4 7.75ZM18.7 20.15L16.275 17.625L17.6 16.25L20.125 18.675L18.7 20.15ZM16.25 6.4L18.675 3.875L20.15 5.3L17.65 7.7L16.25 6.4ZM3.85 18.7L6.375 16.275L7.75 17.6L5.325 20.125L3.85 18.7Z"
                  fill="#FFE500"
                />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21C9.5 21 7.375 20.125 5.625 18.375C3.875 16.625 3 14.5 3 12C3 9.5 3.875 7.375 5.625 5.625C7.375 3.875 9.5 3 12 3C12.2333 3 12.4625 3.00833 12.6875 3.025C12.9125 3.04167 13.1333 3.06667 13.35 3.1C12.6667 3.58333 12.1208 4.2125 11.7125 4.9875C11.3042 5.7625 11.1 6.6 11.1 7.5C11.1 9 11.625 10.275 12.675 11.325C13.725 12.375 15 12.9 16.5 12.9C17.4167 12.9 18.2583 12.6958 19.025 12.2875C19.7917 11.8792 20.4167 11.3333 20.9 10.65C20.9333 10.8667 20.9583 11.0875 20.975 11.3125C20.9917 11.5375 21 11.7667 21 12C21 14.5 20.125 16.625 18.375 18.375C16.625 20.125 14.5 21 12 21ZM12 19C13.4667 19 14.7833 18.5958 15.95 17.7875C17.1167 16.9792 17.9667 15.925 18.5 14.625C18.1667 14.7083 17.8333 14.775 17.5 14.825C17.1667 14.875 16.8333 14.9 16.5 14.9C14.45 14.9 12.7042 14.1792 11.2625 12.7375C9.82083 11.2958 9.1 9.55 9.1 7.5C9.1 7.16667 9.125 6.83333 9.175 6.5C9.225 6.16667 9.29167 5.83333 9.375 5.5C8.075 6.03333 7.02083 6.88333 6.2125 8.05C5.40417 9.21667 5 10.5333 5 12C5 13.9333 5.68333 15.5833 7.05 16.95C8.41667 18.3167 10.0667 19 12 19Z"
                  fill="white"
                />
              </svg>
            )}
          </span>
        </button>

        {/* Logout */}
        <div
          onClick={logout}
          className="text-sm text-gray-800 dark:text-white cursor-pointer flex-shrink-0"
        >
          <FaSignOutAlt className="text-lg" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
