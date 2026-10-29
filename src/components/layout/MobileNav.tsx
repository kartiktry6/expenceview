/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Clock,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Ledger', icon: ArrowLeftRight },
    { id: 'budgets' as NavTab, label: 'Budgets', icon: PieChart },
    { id: 'analytics' as NavTab, label: 'Trends', icon: BarChart3 },
    { id: 'recurring' as NavTab, label: 'Recurring', icon: Clock },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1 flex items-center justify-around safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
