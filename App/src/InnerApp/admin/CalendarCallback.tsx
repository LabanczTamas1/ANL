import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Handles the Google OAuth redirect for calendar connection.
 * Captures the authorization code and redirects to the admin page
 * where CalendarConnection will exchange it for tokens.
 */
const CalendarCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      navigate('/home/adminpage?calendar_error=' + encodeURIComponent(error), { replace: true });
      return;
    }

    if (code) {
      // Pass the code to the admin page via sessionStorage so it persists through the navigation
      sessionStorage.setItem('calendar_oauth_code', code);
      navigate('/home/adminpage?tab=calendar', { replace: true });
    } else {
      navigate('/home/adminpage', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Connecting Google Calendar...</p>
      </div>
    </div>
  );
};

export default CalendarCallback;
