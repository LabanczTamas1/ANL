import React from 'react';
import { TABS } from './constants';
import { useLanguage } from '../../hooks/useLanguage';
import type { TranslationKey } from '../../translations/english';

interface Props {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const AdminTabBar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  return (
  <div className="border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto">
    <nav className="flex gap-1 min-w-max">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          aria-current={activeTab === id ? 'page' : undefined}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === id
              ? 'border-[#65558F] text-[#65558F] dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Icon className="text-base" />
          {t(label as TranslationKey)}
        </button>
      ))}
    </nav>
  </div>
  );
};

export default AdminTabBar;
