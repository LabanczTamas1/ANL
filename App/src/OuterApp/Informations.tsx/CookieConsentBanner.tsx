import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Essential cookies are always required
    preferences: true,
    analytics: true,
    marketing: true
  });
  
  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem('cookieConsent');
    
    // If no consent record found, show the banner
    if (!consentGiven) {
      setVisible(true);
    }
  }, []);
  
  const savePreferences = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setVisible(false);
  };
  
  const acceptAllCookies = () => {
    setPreferences({
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true
    });
    savePreferences();
  };
  
  const declineCookies = () => {
    setPreferences({
      essential: true, // Essential cookies are always required
      preferences: false,
      analytics: false,
      marketing: false
    });
    savePreferences();
  };
  
  const handlePreferenceChange = (category: keyof CookiePreferences) => {
    if (category === 'essential') return; // Cannot change essential cookies
    setPreferences({
      ...preferences,
      [category]: !preferences[category]
    });
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      {!showPreferences ? (
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">We value your privacy</h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                By clicking "Accept All", you consent to our use of cookies as described in our 
                <Link to="/information/cookie-policy" className="text-blue-600 hover:underline ml-1">Cookie Policy</Link>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                Preferences
              </button>
              <button 
                onClick={declineCookies}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                Decline
              </button>
              <button 
                onClick={acceptAllCookies}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <h3 className="text-lg font-semibold mb-4">Cookie Preferences</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">Required for basic website functionality</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.essential} 
                  disabled={true}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">Preference Cookies</h4>
                  <p className="text-sm text-gray-600">Remember your settings and preferences</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.preferences} 
                  onChange={() => handlePreferenceChange('preferences')}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us understand how you use our website</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics} 
                  onChange={() => handlePreferenceChange('analytics')}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">Used for advertising and content personalization</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing} 
                  onChange={() => handlePreferenceChange('marketing')}
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
              Back
            </button>
            <button 
              onClick={savePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsentBanner;