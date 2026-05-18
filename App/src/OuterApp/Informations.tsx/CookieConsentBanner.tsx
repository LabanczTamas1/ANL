import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import posthog from 'posthog-js';
import { useLanguage } from '../../hooks/useLanguage';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
}

const CookieConsentBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (!consentGiven) {
      setVisible(true);
    }
  }, []);

  const persistAndHide = (analyticsAllowed: boolean) => {
    localStorage.setItem('cookieConsent', 'true');
    const prefs: CookiePreferences = { essential: true, analytics: analyticsAllowed };
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    if (analyticsAllowed) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
    setVisible(false);
  };

  const acceptAllCookies = () => persistAndHide(true);

  const declineCookies = () => persistAndHide(false);

  const savePreferences = () => persistAndHide(analyticsEnabled);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      {!showPreferences ? (
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{t('legal.consent.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('legal.consent.text')}{' '}
                <Link to="/information/cookie-policy" className="text-blue-600 hover:underline">
                  {t('legal.cp.title')}
                </Link>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                {t('legal.consent.preferences')}
              </button>
              <button
                onClick={declineCookies}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                {t('legal.consent.decline')}
              </button>
              <button
                onClick={acceptAllCookies}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
              >
                {t('legal.consent.accept')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <h3 className="text-lg font-semibold mb-4">{t('legal.consent.preferences')}</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t('legal.consent.essential')}</h4>
                  <p className="text-sm text-gray-600">{t('legal.consent.essentialDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t('legal.consent.analytics')}</h4>
                  <p className="text-sm text-gray-600">{t('legal.consent.analyticsDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={() => setAnalyticsEnabled(prev => !prev)}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPreferences(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
            >
              {t('legal.consent.back')}
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              {t('legal.consent.savePreferences')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsentBanner;
