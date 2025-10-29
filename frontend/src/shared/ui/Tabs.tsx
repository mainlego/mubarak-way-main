/**
 * Tabs Component
 * Horizontal tabs navigation
 */

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all
            ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
