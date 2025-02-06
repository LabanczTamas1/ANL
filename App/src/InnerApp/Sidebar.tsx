import React from 'react';
import { FaInbox, FaEnvelope, FaUserCircle, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';
import { MdLanguage } from 'react-icons/md';
import lightLogo from "/public/light-logo.png";
import { Link, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate(); // Hook to navigate to different routes
  const username = localStorage.getItem("name");

  const handleLogout = () => {
    // Clear session data from localStorage
    localStorage.removeItem('authToken');  // Remove JWT token
    localStorage.removeItem('name');  // Remove user-specific data if any
    // Redirect to login page (or wherever you want)
    navigate('/login');  // Change '/login' to your login route
  };

  return (
    <div className="flex flex-col bg-[#1D2431] text-white w-[300px] p-4 h-full overflow-y-auto">
      {/* Logo */}
      <div className="text-xl font-bold mb-6">
        <span className="flex text-white items-center"><img src={lightLogo} alt="logo" className='w-16'/> Ads and Leads </span>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col gap-3">
        <div className="font-bold text-sm">Menu</div>
        <div className="flex flex-col gap-3">
        <Link to="/home/progress-tracker">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaInbox className="text-lg" />
            <span>Progress Tracker</span>
          </div>
          </Link>
          <Link to="/home/booking/availability">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaEnvelope className="text-lg" />
            <span>Availability</span>
          </div>
          </Link>
          <Link to='/home/booking'>
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
          <Link to="/mail/inbox">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaInbox className="text-lg" />
              <span>Inbox 12</span>
            </div>
          </Link>
          <Link to="/home/mail/send">
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
          <Link to="/home/account">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaUserCircle className="text-lg" />
              <span>My Account</span>
            </div>
          </Link>
          <Link to="user-management">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaUserCircle className="text-lg" />
            <span>User Management</span>
          </div>
          </Link>
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaStar className="text-lg" />
            <span>Spends</span>
          </div>

          <Link to="/home/kanban">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaUserCircle className="text-lg" />
              <span>Kanban</span>
            </div>
          </Link>
        { username===`admin` ?
          <Link to="/home/adminpage">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaUserCircle className="text-lg" />
              <span>Admin Page</span>
            </div>
          </Link>
          : ""
}
          <div onClick={handleLogout} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
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
      <div className="mt-auto mt-6 text-sm text-center text-gray-500">
        <div>Ads and Leads 2024</div>
        <div className="text-blue-500 hover:text-blue-400 cursor-pointer">Terms and policy</div>
      </div>
    </div>
  );
};

export default Sidebar;
