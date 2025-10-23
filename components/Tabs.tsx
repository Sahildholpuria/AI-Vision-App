
import React from 'react';
import { AppTab } from '../types';

interface TabsProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.values(AppTab);

  return (
    <div className="flex justify-center">
      <div className="bg-gray-800 p-1.5 rounded-xl flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
