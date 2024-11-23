import React from 'react';
import { FaInbox, FaEnvelope, FaUserCircle, FaCog, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';
import { MdLanguage } from 'react-icons/md';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#1D2431] text-white w-[300px] p-4 h-full">
      {/* Logo */}
      <div className="text-xl font-bold mb-6">
        <span className="text-white">ANL</span> Ads and Leads
      </div>

      {/* Menu Section */}
      <div className="flex flex-col gap-3">
        <div className="font-bold text-sm">Menu</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaInbox className="text-lg" />
            <span>Progress Tracker</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaEnvelope className="text-lg" />
            <span>Calendar</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaEnvelope className="text-lg" />
            <span>Book a meeting</span>
          </div>
        </div>
      </div>

      {/* Email Section */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="font-bold text-sm">Email</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaInbox className="text-lg" />
            <span>Inbox 12</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaEnvelope className="text-lg" />
            <span>Send a mail</span>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="font-bold text-sm">Account</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaUserCircle className="text-lg" />
            <span>My Account</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaUserCircle className="text-lg" />
            <span>Change details</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaStar className="text-lg" />
            <span>Spends</span>
          </div>
          <Link to="/">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </div>
          </Link>
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
}

export default Sidebar;
