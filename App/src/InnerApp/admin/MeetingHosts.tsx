import React, { useEffect, useState } from 'react';

interface MeetingHostsProps {
  userRole?: string;
}

const MeetingHosts: React.FC<MeetingHostsProps> = () => {
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
      const t = setTimeout(() => { setSuccess(null); setError(null); }, 4000);
      return () => clearTimeout(t);
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
      setError(err.message || 'Failed to load meeting hosts');
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
      setError('Please enter a valid email address');
      return;
    }

    if (hosts.includes(email)) {
      setError('This email is already in the list');
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
      setSuccess(`Added ${email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to add host');
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
      setSuccess(`Removed ${email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to remove host');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-2">Meeting Hosts</h2>
      <p className="text-gray-500 text-sm mb-6">
        These people will be automatically invited to every booking meeting with a Google Meet link.
      </p>

      {/* Messages */}
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

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder="Enter email address..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={saving}
        />
        <button
          type="submit"
          disabled={saving || !newEmail.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Adding...' : 'Add Host'}
        </button>
      </form>

      {/* Hosts list */}
      {loading ? (
        <p className="text-gray-500">Loading meeting hosts...</p>
      ) : hosts.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-500 text-sm">
            No meeting hosts configured yet. Add email addresses above.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            The system will fall back to the ANL_TEAM_EMAILS environment variable if no hosts are configured here.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hosts.map((email) => (
                <tr key={email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(email)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        {hosts.length} host{hosts.length !== 1 ? 's' : ''} configured
      </p>
    </div>
  );
};

export default MeetingHosts;
