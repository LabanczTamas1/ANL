import React, { useEffect, useState } from 'react';

const CalendarConnection: React.FC = () => {
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
      const t = setTimeout(() => { setSuccess(null); setError(null); }, 5000);
      return () => clearTimeout(t);
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
      setError(err.message);
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
      setError(err.message);
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
      setSuccess(`Connected as ${data.email}`);
      fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? New bookings will not create Meet links.')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/calendar/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setSuccess('Google Calendar disconnected');
      setStatus({ connected: false, email: null, connectedAt: null });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-2">Google Calendar</h2>
      <p className="text-gray-500 text-sm mb-6">
        Connect a Google account to automatically create Calendar events with Google Meet links for every booking.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Checking connection...</p>
      ) : status.connected ? (
        <div className="border border-green-200 bg-green-50 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-800 font-semibold">Connected</span>
          </div>
          <table className="text-sm text-gray-700 mb-4">
            <tbody>
              <tr>
                <td className="pr-4 py-1 text-gray-500">Account:</td>
                <td className="py-1 font-medium">{status.email}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 text-gray-500">Connected:</td>
                <td className="py-1">
                  {status.connectedAt
                    ? new Date(status.connectedAt).toLocaleString()
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mb-4">
            New bookings will automatically create a Google Calendar event with a Meet link on this account's calendar.
          </p>
          <button
            onClick={handleDisconnect}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-gray-600 font-semibold">Not Connected</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Connect your Google account to enable automatic Google Meet link creation for bookings.
            Events will be created on your primary calendar and attendees will receive invites.
          </p>
          <button
            onClick={handleConnect}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {actionLoading ? 'Connecting...' : 'Connect Google Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarConnection;
