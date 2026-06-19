import React, { useEffect } from 'react';
import { FaInbox, FaEnvelope, FaUserCircle, FaStar, FaSignOutAlt, FaCalendarCheck, FaTimes } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';
import { MdLanguage } from 'react-icons/md';
const lightLogo = "/light-logo.png";
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useLogout } from '../../hooks/useLogout';
import { useLanguage } from '../../hooks/useLanguage';

interface MobileNavbarProps{
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const MobileNavbar: React.FC<MobileNavbarProps> = ({ setIsMenuOpen }) => {
  const { t } = useLanguage();
  const logout = useLogout();
  const role = localStorage.getItem("superRole");

  // Lock scroll on html+body while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#1D2431] text-white overflow-y-auto overscroll-contain">
      <div className="flex flex-col p-4 pb-20">

        {/* Top bar: Logo + Close */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/home" onClick={closeMenu} className="text-xl font-bold">
            <span className="flex text-white items-center"><img src={lightLogo} alt="logo" className="w-16"/> {t('sidebar.logo')} </span>
          </Link>
          <button
            onClick={closeMenu}
            className="text-white text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={t('msgDetail.closeMessage')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Menu Section */}
        <div className="flex flex-col gap-3">
          <div className="font-bold text-sm">{t('sidebar.menu')}</div>
          <div className="flex flex-col gap-3">
            <Link to="/home/progress-tracker" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaInbox className="text-lg" />
                <span>{t('sidebar.progressTracker')}</span>
              </div>
            </Link>
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/booking/availability" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaEnvelope className="text-lg" />
                  <span>{t('sidebar.availability')}</span>
                </div>
              </Link>
            ) : ""}
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/booking/availability/overview" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaCalendarCheck className="text-lg" />
                  <span>{t('sidebar.availabilityOverview')}</span>
                </div>
              </Link>
            ) : ""}
            <Link to='/home/booking' onClick={closeMenu}>
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
            <Link to="/home/mail/inbox" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaInbox className="text-lg" />
                <span>{t('sidebar.inbox')}</span>
              </div>
            </Link>
            <Link to="/home/mail/send" onClick={closeMenu}>
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
            <Link to="/home/account" onClick={closeMenu}>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                <FaUserCircle className="text-lg" />
                <span>{t('sidebar.myAccount')}</span>
              </div>
            </Link>
            {(role === "admin" || role === "owner") ? (
              <Link to="user-management" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaUserCircle className="text-lg" />
                  <span>{t('sidebar.userManagement')}</span>
                </div>
              </Link>
            ) : ""}
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/statistics" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaStar className="text-lg" />
                  <span>{t('sidebar.statistics')}</span>
                </div>
              </Link>
            ) : ""}
            {(role === "admin" || role === "owner") ? (
              <Link to="/home/kanban" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaUserCircle className="text-lg" />
                  <span>{t('sidebar.kanban')}</span>
                </div>
              </Link>
            ) : ""}
            {role === "admin" ? (
              <Link to="/home/adminpage" onClick={closeMenu}>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
                  <FaUserCircle className="text-lg" />
                  <span>{t('sidebar.adminPage')}</span>
                </div>
              </Link>
            ) : ""}
            <div onClick={() => { handleLogout(); closeMenu(); }} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
              <FaSignOutAlt className="text-lg" />
              <span>{t('sidebar.logout')}</span>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="font-bold text-sm">{t('sidebar.settings')}</div>
          <div className="flex flex-col gap-3">
          <Link to="/home/add-review" onClick={closeMenu}>
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <GiSettingsKnobs className="text-lg" />
              <span>{t('sidebar.addReview')}</span>
            </div>
          </Link>
          </div>
        </div>

        {/* Customer Support & Help Section */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="font-bold text-sm">{t('sidebar.customerSupport')}</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-lg">
              <MdLanguage className="text-lg" />
              <span>{t('sidebar.language')}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-6 mb-4 text-sm text-center text-gray-500">
          <div>{t('sidebar.copyright', { year: '2024' })}</div>
          <Link to="/home/terms-and-policy" onClick={closeMenu}><div className="text-blue-500 hover:text-blue-400 cursor-pointer">{t('sidebar.termsAndPolicy')}</div></Link>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileNavbar;