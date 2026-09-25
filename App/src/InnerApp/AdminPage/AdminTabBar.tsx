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
  <div className="border-b border-line dark:border-line-dark px-4 overflow-x-auto">
    <nav className="flex gap-1 min-w-max">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          aria-current={activeTab === id ? 'page' : undefined}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus ${
            activeTab === id
              ? 'border-brand text-brand dark:text-brand-focus dark:border-brand-focus'
              : 'border-transparent text-content-subtle dark:text-content-subtle-inverse hover:text-content dark:hover:text-content-inverse'
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
