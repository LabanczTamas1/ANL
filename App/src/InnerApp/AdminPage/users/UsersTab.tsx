import React, { useState, useMemo } from 'react';
import { useUsers } from './useUsers';
import UserToolbar from './UserToolbar';
import UserTable from './UserTable';

const UsersTab: React.FC = () => {
  const { users, loading, updateRole } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
    <>
      <UserToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        roleOptions={roleOptions}
        filteredCount={filteredUsers.length}
        totalCount={users.length}
      />

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

      {!loading && filteredUsers.length > 0 && (
        <UserTable users={filteredUsers} onRoleChange={updateRole} />
      )}
    </>
  );
};

export default UsersTab;
