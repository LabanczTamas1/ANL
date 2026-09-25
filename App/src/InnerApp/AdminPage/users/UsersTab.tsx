import React, { useState, useMemo } from 'react';
import { useUsers } from './useUsers';
import UserToolbar from './UserToolbar';
import UserTable from './UserTable';
import { useLanguage } from '../../../hooks/useLanguage';
import { Spinner, Text } from '@design-system/components';

const UsersTab: React.FC = () => {
  const { t } = useLanguage();
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
        <div className="flex items-center gap-2 text-content-muted py-8 justify-center">
          <Spinner size="md" />
          {t('admin.loadingUsers')}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <Text tone="muted" className="text-center py-12">
          {t('admin.noUsersMatchSearch')}
        </Text>
      )}

      {!loading && filteredUsers.length > 0 && (
        <UserTable users={filteredUsers} onRoleChange={updateRole} />
      )}
    </>
  );
};

export default UsersTab;
