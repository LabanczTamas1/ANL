import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSearch, FiUsers, FiShield, FiWifi, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import RequestStats from './admin/RequestStats';
import AdminIPBan from './admin/AdminIPBan';
import MeetingHosts from './admin/MeetingHosts';
import CalendarConnection from './admin/CalendarConnection';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  company?: string;
}

const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  owner:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  user:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  moderator: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  guest:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const TABS = [
  { id: 'users',         label: 'Users',         icon: FiUsers },
  { id: 'stats',         label: 'API Stats',      icon: FiBarChart2 },
  { id: 'ip_ban',        label: 'IP Bans',        icon: FiShield },
  { id: 'meeting_hosts', label: 'Meeting Hosts',  icon: FiWifi },
  { id: 'calendar',      label: 'Calendar',       icon: FiCalendar },
];

const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');

  const hashTab = location.hash.replace('#', '');
  const activeTab = TABS.some(t => t.id === hashTab) ? hashTab : 'users';

  const setActiveTab = (id: string) => navigate({ hash: id }, { replace: true });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/v1/user/listAllUsers`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUserRole = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        setCurrentUserRole(data.role);
      } catch {
        // non-critical
      }
    };

    fetchUsers();
    fetchCurrentUserRole();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/v1/user/updateUserRole/${userId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to "${newRole}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const displayName = (u: User) =>
    u.firstName ? `${u.firstName} ${u.lastName}`.trim() : u.username;

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(u => {
      const matchesQuery =
        !q ||
        u.id.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        (u.company ?? '').toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const roleOptions = useMemo(() => {
    const roles = Array.from(new Set(users.map(u => u.role))).sort();
    return ['all', ...roles];
  }, [users]);

  return (
    <div className="min-h-full bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" theme="colored" />

      {/* ── Tab bar ── */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#65558F] text-[#65558F] dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="text-base" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 md:p-6">
        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, email, username, company…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
              >
                {roleOptions.map(r => (
                  <option key={r} value={r}>
                    {r === 'all' ? 'All roles' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>

              <span className="self-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {filteredUsers.length} / {users.length} users
              </span>
            </div>

            {/* States */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-8 justify-center">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading users…
              </div>
            )}

            {!loading && filteredUsers.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                No users match your search.
              </p>
            )}

            {/* Table — scrollable on mobile */}
            {!loading && filteredUsers.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Company</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        {/* Name + email on mobile */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{displayName(user)}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 md:hidden">{user.email}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate max-w-[160px]">{user.id}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{user.email}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{user.company || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${ROLE_BADGE[user.role] ?? ROLE_BADGE.guest}`}>
                              {user.role}
                            </span>
                            <select
                              value={user.role}
                              onChange={e => handleRoleChange(user.id, e.target.value)}
                              className="text-xs px-1.5 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#65558F]"
                            >
                              {['admin', 'owner', 'user', 'moderator', 'guest'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats'         && <RequestStats userRole={currentUserRole} />}
        {activeTab === 'ip_ban'        && <AdminIPBan />}
        {activeTab === 'meeting_hosts' && <MeetingHosts />}
        {activeTab === 'calendar'      && <CalendarConnection />}
      </div>
    </div>
  );
};

export default AdminPage;