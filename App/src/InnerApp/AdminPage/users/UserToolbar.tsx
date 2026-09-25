import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';
import { Input, Select, Text } from '@design-system/components';

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleFilterChange: (v: string) => void;
  roleOptions: string[];
  filteredCount: number;
  totalCount: number;
}

const UserToolbar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  roleOptions,
  filteredCount,
  totalCount,
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <Input
        type="text"
        placeholder={t('admin.searchUsersPlaceholder')}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        leftIcon={<FiSearch />}
        containerClassName="flex-1"
      />

      <Select value={roleFilter} onChange={e => onRoleFilterChange(e.target.value)}>
        {roleOptions.map(r => (
          <option key={r} value={r}>
            {r === 'all' ? t('admin.allRoles') : r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </Select>

      <Text tone="muted" size="sm" as="span" className="self-center whitespace-nowrap">
        {t('admin.usersCount', { filtered: String(filteredCount), total: String(totalCount) })}
      </Text>
    </div>
  );
};

export default UserToolbar;
