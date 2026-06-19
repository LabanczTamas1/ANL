import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

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
    <div className="relative flex-1">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        placeholder={t('admin.searchUsersPlaceholder')}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
      />
    </div>

    <select
      value={roleFilter}
      onChange={e => onRoleFilterChange(e.target.value)}
      className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
    >
      {roleOptions.map(r => (
        <option key={r} value={r}>
          {r === 'all' ? t('admin.allRoles') : r.charAt(0).toUpperCase() + r.slice(1)}
        </option>
      ))}
    </select>

    <span className="self-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
      {t('admin.usersCount', { filtered: String(filteredCount), total: String(totalCount) })}
    </span>
  </div>
  );
};

export default UserToolbar;
