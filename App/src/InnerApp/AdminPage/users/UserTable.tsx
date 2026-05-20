import React from 'react';
import { User, ROLE_BADGE } from '../types';

interface Props {
  users: User[];
  onRoleChange: (userId: string, newRole: string) => void;
}

const ROLES = ['admin', 'owner', 'user', 'moderator', 'guest'];

function displayName(u: User) {
  return u.firstName ? `${u.firstName} ${u.lastName}`.trim() : u.username;
}

const UserTable: React.FC<Props> = ({ users, onRoleChange }) => (
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
        {users.map(user => (
          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
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
                  onChange={e => onRoleChange(user.id, e.target.value)}
                  className="text-xs px-1.5 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#65558F] appearance-auto"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
);

export default UserTable;
