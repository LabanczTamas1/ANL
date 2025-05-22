import React from 'react';
import { FaInbox, FaEnvelope, FaUserCircle, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';
import { MdLanguage } from 'react-icons/md';
import lightLogo from "/public/light-logo.png";
import { Link, useNavigate } from 'react-router-dom';

interface MobileNavbarProps{
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const MobileNavbar: React.FC<MobileNavbarProps> = ({ setIsMenuOpen }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("superRole");

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('name');
    localStorage.removeItem('superRole');
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-50 h-screen bg-[#1D2431] text-white w-full overflow-y-auto">
      <div className="flex flex-col p-4">
      

        {/* Logo */}
        <div className="text-xl font-bold mb-6">
          <span className="flex text-white items-center"><img src={lightLogo} alt="logo" className="w-16"/> Ads and Leads </span>
        </div>

        {/* Menu Section */}
        <div className="flex flex-col gap-3">
          <div className="font-bold text-sm">Menu</div>
          <div className="flex flex-col gap-3">
            <Link to="/home/progress-tracker" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaInbox className="text-lg" />
                <span>Progress Tracker</span>
              </div>
            </Link>
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/booking/availability" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaEnvelope className="text-lg" />
                  <span>Availability</span>
                </div>
              </Link>
            ) : ""}
            <Link to='/home/booking' onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaEnvelope className="text-lg" />
                <span>Book a meeting</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Email Section */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="font-bold text-sm">Email</div>
          <div className="flex flex-col gap-3">
            <Link to="/home/mail/inbox" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaInbox className="text-lg" />
                <span>Inbox 12</span>
              </div>
            </Link>
            <Link to="/home/mail/send" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaEnvelope className="text-lg" />
                <span>Send a mail</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Account Section */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="font-bold text-sm">Account</div>
          <div className="flex flex-col gap-3">
            <Link to="/home/account" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaUserCircle className="text-lg" />
                <span>My Account</span>
              </div>
            </Link>
            {(role === "admin" || role === "owner") ? (
              <Link to="user-management" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaUserCircle className="text-lg" />
                  <span>User Management</span>
                </div>
              </Link>
            ) : ""}
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/statistics" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaStar className="text-lg" />
                  <span>Statistics</span>
                </div>
              </Link>
            ) : ""}
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/kanban" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaUserCircle className="text-lg" />
                  <span>Kanban</span>
                </div>
              </Link>
            ) : ""}
            {role === "admin" ? (
              <Link to="/home/adminpage" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaUserCircle className="text-lg" />
                  <span>Admin Page</span>
                </div>
              </Link>
            ) : ""}
            <div onClick={() => { handleLogout(); closeMenu(); }} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="font-bold text-sm">Settings</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <GiSettingsKnobs className="text-lg" />
              <span>Add a review</span>
            </div>
          </div>
        </div>

        {/* Customer Support & Help Section */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="font-bold text-sm">Customer Support & Help</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <MdLanguage className="text-lg" />
              <span>Language / Nyelv / Limba</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-6 mb-4 text-sm text-center text-gray-500">
          <div>Ads and Leads 2024</div>
          <Link to="/home/terms-and-policy" onClick={closeMenu}><div className="text-blue-500 hover:text-blue-400 cursor-pointer">Terms and policy</div></Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;