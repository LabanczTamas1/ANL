import React, { useState, useEffect } from 'react';
import { useLanguage } from './hooks/useLanguage';

const CookieConsent = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem('cookieConsent');
    
    // If no consent record found, show the banner
    if (!consentGiven) {
      setVisible(true);
    }
  }, []);
  
  const acceptCookies = () => {
    // Store consent in localStorage
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };
  
  const declineCookies = () => {
    // Store decline preference
    localStorage.setItem('cookieConsent', 'false');
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-700 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1 text-white mb-4 md:mb-0 pr-4">
          <h3 className="text-lg font-semibold mb-2">{t('cookie.title')}</h3>
          <p className="text-sm text-gray-300">
            {t('cookie.description')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={declineCookies}
            className="px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none"
          >
            {t('cookie.decline')}
          </button>
          <button 
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-800 focus:outline-none"
          >
            {t('cookie.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;