import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import posthog from 'posthog-js';
import { useLanguage } from '../hooks/useLanguage';

const OAuthCallback: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        console.log("Received token (first 10 chars):", token ? token.substring(0, 10) + "..." : "None");
        
        if (!token) {
          throw new Error(t('oauth.noToken'));
        }
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Verify token is stored correctly
        const storedToken = localStorage.getItem('authToken');
        console.log("Stored token matches received:", storedToken === token);
        
        await fetchUserInfo(token);
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error instanceof Error ? error.message : t('oauth.authFailed'));
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    handleAuth();
  }, [location, navigate]);

  const fetchUserInfo = async (token: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/user/me`;
      console.log('Fetching user data from:', apiUrl);
      
      // Log the exact authorization header we're sending
      const authHeader = `Bearer ${token}`;
      console.log('Authorization header (first 15 chars):', 
                  authHeader.substring(0, 15) + "...");
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || t('oauth.serverError', { status: String(response.status) }));
      }

      const userData = await response.json();
      console.log('User data received:', userData);

      // Store user data in localStorage
      // OAuth users are always verified
      localStorage.setItem('verified', 'true');
      localStorage.setItem('userId', userData.userId || '');
      localStorage.setItem('firstName', userData.firstName || '');
      localStorage.setItem('lastName', userData.lastName || '');
      console.log(import.meta.env.VITE_ADMIN_GOOGLE_EMAIL);
      console.log(userData.email);

      if (userData.role === 'admin' || userData.email === import.meta.env.VITE_ADMIN_GOOGLE_EMAIL) {
        localStorage.setItem('superRole', 'admin');
        localStorage.setItem('role', 'admin');
        localStorage.setItem('name', 'admin');
        localStorage.setItem('username', 'admin');
      }
      else{
        localStorage.setItem('role', userData.role);
        localStorage.setItem('username', userData.username || '');
      }
      if(userData.role === 'owner'){
        localStorage.setItem('superRole', 'owner');
      }

      // Sync consent from backend profile
      if (userData.cookie_consent === 'true') {
        const analyticsAllowed = userData.analytics_consent === 'true';
        localStorage.setItem('cookieConsent', 'true');
        localStorage.setItem(
          'cookiePreferences',
          JSON.stringify({ essential: true, analytics: analyticsAllowed })
        );
        if (analyticsAllowed) {
          posthog.opt_in_capturing();
        } else {
          posthog.opt_out_capturing();
        }
      }

      setLoading(false);
      navigate('/home');
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError(error instanceof Error ? error.message : t('oauth.unknownError'));
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md">
        {loading ? (
          <>
            <h2 className="text-2xl font-bold mb-4">{t('oauth.authenticating')}</h2>
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-500">{t('oauth.authError')}</h2>
            <p className="mb-4">{error}</p>
            <p>{t('oauth.redirecting')}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;