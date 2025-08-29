import React from 'react';
import { FaInbox, FaEnvelope, FaUserCircle, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';
import { MdLanguage } from 'react-icons/md';
import lightLogo from "/public/light-logo.png";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './../hooks/useLanguage';
import { useNotification } from './../contexts/NotificationContext';
import NotificationBadge from './components/NotificationBadge';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("superRole");
  const { t } = useLanguage();
  const { unreadEmailCount, fetchUnreadCount } = useNotification();

  React.useEffect(() => {
    if (location.pathname.startsWith('/home/')) {
      fetchUnreadCount();
    }
  }, [location.pathname, fetchUnreadCount]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('name');
    localStorage.removeItem('superRole');
    navigate('/login');
  };

  return (
    <div className="flex flex-col bg-[#1D2431] text-white w-[300px] p-4 h-full overflow-y-auto">
      {/* Logo */}
      <div className="text-xl font-bold mb-6">
        <Link to={'/home'}><span className="flex text-white items-center"><img src={lightLogo} alt="logo" className='w-16'/> {t('sidebar.logo')} </span></Link>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col gap-3">
        <div className="font-bold text-sm">{t('sidebar.menu')}</div>
        <div className="flex flex-col gap-3">
          <Link to="/home/progress-tracker">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaInbox className="text-lg" />
              <span>{t('sidebar.progressTracker')}</span>
            </div>
          </Link>
          {(role === "admin" || role === "owner") ?
            <Link to="/home/booking/availability">
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaEnvelope className="text-lg" />
                <span>{t('sidebar.availability')}</span>
              </div>
            </Link>
          : ""}
          <Link to='/home/booking'>
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaEnvelope className="text-lg" />
              <span>{t('sidebar.bookMeeting')}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Email Section */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="font-bold text-sm">{t('sidebar.email')}</div>
        <div className="flex flex-col gap-3">
          <Link to="/home/mail/inbox">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg relative">
              <FaInbox className="text-lg" />
              <span>{t('sidebar.inbox')}<NotificationBadge count={unreadEmailCount} /></span>
              
            </div>
          </Link>
          <Link to="/home/mail/send">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaEnvelope className="text-lg" />
              <span>{t('sidebar.sendMail')}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Account Section */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="font-bold text-sm">{t('sidebar.account')}</div>
        <div className="flex flex-col gap-3">
          <Link to="/home/account">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <FaUserCircle className="text-lg" />
              <span>{t('sidebar.myAccount')}</span>
            </div>
          </Link>
          {(role === "admin" || role === "owner") ?
            <Link to="user-management">
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaUserCircle className="text-lg" />
                <span>{t('sidebar.userManagement')}</span>
              </div>
            </Link>
          : ""}
          {(role === "admin" || role === "owner") ?
            <Link to="/home/statistics">
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaStar className="text-lg" />
                <span>{t('sidebar.statistics')}</span>
              </div>
            </Link>
          : ""}
          {(role === "admin" || role === "owner") ?
            <Link to="/home/kanban">
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaUserCircle className="text-lg" />
                <span>{t('sidebar.kanban')}</span>
              </div>
            </Link>
          : ""}
          {role === "admin" ?
            <Link to="/home/adminpage">
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaUserCircle className="text-lg" />
                <span>{t('sidebar.adminPage')}</span>
              </div>
            </Link>
          : ""}
          <div onClick={handleLogout} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
            <FaSignOutAlt className="text-lg" />
            <span>{t('sidebar.logout')}</span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="font-bold text-sm">{t('sidebar.settings')}</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
            <GiSettingsKnobs className="text-lg" />
            <span>{t('sidebar.addReview')}</span>
          </div>
        </div>
      </div>

      {/* Customer Support & Help Section */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="font-bold text-sm">{t('sidebar.customerSupport')}</div>
        <div className="flex flex-col gap-3">
          <Link to="/home/language-selection">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <MdLanguage className="text-lg" />
              <span>{t('sidebar.language')}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto mt-6 text-sm text-center text-gray-500">
        <div>{t('sidebar.copyright', { year: '2024' })}</div>
        <Link to="/home/terms-and-policy">
          <div className="text-blue-500 hover:text-blue-400 cursor-pointer">
            {t('sidebar.termsAndPolicy')}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;