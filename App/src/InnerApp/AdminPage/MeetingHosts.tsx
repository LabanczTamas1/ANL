import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import {
  Alert,
  Button,
  Heading,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@design-system/components';

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
      <Heading level={2} className="mb-2">
        {t('admin.meetingHostsTitle')}
      </Heading>
      <Text tone="muted" size="sm" className="mb-6">
        {t('admin.meetingHostsDesc')}
      </Text>

      {/* Messages */}
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

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <Input
          type="email"
          placeholder={t('admin.enterEmailPlaceholder')}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={saving}
          containerClassName="flex-1"
        />
        <Button type="submit" loading={saving} disabled={!newEmail.trim()}>
          {saving ? t('admin.adding') : t('admin.addHost')}
        </Button>
      </form>

      {/* Hosts list */}
      {loading ? (
        <Text tone="muted">{t('admin.loadingHosts')}</Text>
      ) : hosts.length === 0 ? (
        <div className="p-6 bg-black/[0.03] dark:bg-white/5 border border-line dark:border-line-dark rounded-lg text-center">
          <Text tone="muted" size="sm">
            {t('admin.noHostsConfigured')}
          </Text>
          <Text tone="muted" size="xs" className="mt-1">
            {t('admin.hostsFallbackNote')}
          </Text>
        </div>
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>{t('admin.emailAddress')}</Th>
                <Th className="text-right w-24">{t('admin.actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {hosts.map((email) => (
                <Tr key={email} hoverable>
                  <Td className="text-sm">{email}</Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(email)}
                      disabled={saving}
                      className="text-status-error"
                    >
                      {t('admin.remove')}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Text tone="muted" size="xs" className="mt-4">
        {hosts.length} {hosts.length !== 1 ? t('admin.hosts') : t('admin.host')}{' '}
        {t('admin.configured')}
      </Text>
    </div>
  );
};

export default MeetingHosts;
