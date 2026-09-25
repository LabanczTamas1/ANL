import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Alert, Button, Heading, Text } from '@design-system/components';

const CalendarConnection: React.FC = () => {
  const { t } = useLanguage();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [status, setStatus] = useState<{
    connected: boolean;
    email: string | null;
    connectedAt: string | null;
  }>({ connected: false, email: null, connectedAt: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('authToken');

  useEffect(() => {
    fetchStatus();
  }, []);

  // Check if we're returning from OAuth callback (code stored in sessionStorage by CalendarCallback)
  useEffect(() => {
    const code = sessionStorage.getItem('calendar_oauth_code');
    if (code) {
      sessionStorage.removeItem('calendar_oauth_code');
      handleOAuthCode(code);
    }
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(null); setError(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/calendar/status`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || t('admin.failFetchStatus'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/calendar/auth-url`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to get auth URL');
      const data = await res.json();
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || t('admin.failGetAuthUrl'));
      setActionLoading(false);
    }
  };

  const handleOAuthCode = async (code: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/calendar/callback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect');
      setSuccess(t('admin.connectedAs', { email: data.email }));
      fetchStatus();
    } catch (err: any) {
      setError(err.message || t('admin.failConnect'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(t('admin.disconnectConfirm'))) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/calendar/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setSuccess(t('admin.calendarDisconnected'));
      setStatus({ connected: false, email: null, connectedAt: null });
    } catch (err: any) {
      setError(err.message || t('admin.failDisconnect'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Heading level={2} className="mb-2">
        {t('admin.googleCalendar')}
      </Heading>
      <Text tone="muted" size="sm" className="mb-6">
        {t('admin.calendarDesc')}
      </Text>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert tone="success" className="mb-4">
          {success}
        </Alert>
      )}

      {loading ? (
        <Text tone="muted">{t('admin.checkingConnection')}</Text>
      ) : status.connected ? (
        <div className="border border-status-success/40 bg-status-success/10 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-status-success rounded-full animate-pulse" />
            <span className="text-status-success font-semibold">{t('admin.connected')}</span>
          </div>
          <table className="text-sm text-content-subtle dark:text-content-subtle-inverse mb-4">
            <tbody>
              <tr>
                <td className="pr-4 py-1 text-content-muted">{t('admin.account')}</td>
                <td className="py-1 font-medium">{status.email}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 text-content-muted">{t('admin.connectedLabel')}</td>
                <td className="py-1">
                  {status.connectedAt
                    ? new Date(status.connectedAt).toLocaleString()
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
          <Text tone="muted" size="xs" className="mb-4">
            {t('admin.connectedNote')}
          </Text>
          <Button variant="dangerSoft" size="sm" onClick={handleDisconnect} loading={actionLoading}>
            {actionLoading ? t('admin.disconnecting') : t('admin.disconnect')}
          </Button>
        </div>
      ) : (
        <div className="border border-line dark:border-line-dark bg-black/[0.03] dark:bg-white/5 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-content-muted rounded-full" />
            <span className="text-content-subtle dark:text-content-subtle-inverse font-semibold">
              {t('admin.notConnected')}
            </span>
          </div>
          <Text tone="muted" size="sm" className="mb-4">
            {t('admin.notConnectedDesc')}
          </Text>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            loading={actionLoading}
            leftIcon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            {actionLoading ? t('admin.connecting') : t('admin.connectGoogle')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarConnection;
