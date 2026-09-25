import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { Spinner, Text } from '@design-system/components';

/**
 * Handles the Google OAuth redirect for calendar connection.
 * Captures the authorization code and redirects to the admin page
 * where CalendarConnection will exchange it for tokens.
 */
const CalendarCallback = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      navigate('/home/adminpage#calendar', { replace: true });
      return;
    }

    if (code) {
      // Pass the code to the admin page via sessionStorage so it persists through the navigation
      sessionStorage.setItem('calendar_oauth_code', code);
      navigate('/home/adminpage#calendar', { replace: true });
    } else {
      navigate('/home/adminpage', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="text-center">
        <Spinner size="lg" className="text-brand mx-auto mb-3" />
        <Text tone="muted" size="sm">{t('admin.connectingCalendar')}</Text>
      </div>
    </div>
  );
};

export default CalendarCallback;
