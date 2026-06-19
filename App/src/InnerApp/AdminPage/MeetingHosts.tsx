import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface MeetingHostsProps {
  userRole?: string;
}

const MeetingHosts: React.FC<MeetingHostsProps> = () => {
  const { t } = useLanguage();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [hosts, setHosts] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('authToken');

  // Fetch hosts on mount
  useEffect(() => {
    fetchHosts();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(null); setError(null); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/meeting-hosts`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch meeting hosts');
      const data = await res.json();
      setHosts(data.hosts || []);
    } catch (err: any) {
      setError(err.message || t('admin.failLoadHosts'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('admin.validEmail'));
      return;
    }

    if (hosts.includes(email)) {
      setError(t('admin.emailAlreadyInList'));
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/meeting-hosts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add host');
      }
      const data = await res.json();
      setHosts(data.hosts || []);
      setNewEmail('');
      setSuccess(t('admin.addedEmail', { email }));
    } catch (err: any) {
      setError(err.message || t('admin.failAddHost'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (email: string) => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/meeting-hosts`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove host');
      }
      const data = await res.json();
      setHosts(data.hosts || []);
      setSuccess(t('admin.removedEmail', { email }));
    } catch (err: any) {
      setError(err.message || t('admin.failRemoveHost'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{t('admin.meetingHostsTitle')}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {t('admin.meetingHostsDesc')}
      </p>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder={t('admin.enterEmailPlaceholder')}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:border-[#65558F] outline-none"
          disabled={saving}
        />
        <button
          type="submit"
          disabled={saving || !newEmail.trim()}
          className="px-4 py-2 bg-[#65558F] text-white rounded-lg font-medium hover:bg-[#4e4070] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? t('admin.adding') : t('admin.addHost')}
        </button>
      </form>

      {/* Hosts list */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('admin.loadingHosts')}</p>
      ) : hosts.length === 0 ? (
        <div className="p-6 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('admin.noHostsConfigured')}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            {t('admin.hostsFallbackNote')}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1a1a2e]">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.emailAddress')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {hosts.map((email) => (
                <tr key={email} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(email)}
                      disabled={saving}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                    >
                      {t('admin.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        {hosts.length} {hosts.length !== 1 ? t('admin.hosts') : t('admin.host')} {t('admin.configured')}
      </p>
    </div>
  );
};

export default MeetingHosts;
