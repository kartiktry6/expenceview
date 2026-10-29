/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { parseMonthKey, getMonthKey } from '../../utils/calculations';
import { NavTab } from './Sidebar';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sun,
  Moon,
  Plus,
  Wallet,
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddTransaction,
}) => {
  const {
    activeMonthKey,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    settings,
    updateSettings,
  } = useFinance();

  const { label } = parseMonthKey(activeMonthKey);
  const isCurrentMonth = activeMonthKey === getMonthKey(new Date());

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard' },
    { id: 'transactions' as NavTab, label: 'Transactions' },
    { id: 'budgets' as NavTab, label: 'Budgets' },
    { id: 'analytics' as NavTab, label: 'Analytics' },
    { id: 'recurring' as NavTab, label: 'Recurring' },
    { id: 'settings' as NavTab, label: 'Settings' },
  ];

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left side: Mobile Brand + Desktop Month Navigator */}
        <div className="flex items-center gap-4">
          {/* Mobile brand mark */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Wallet className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              SpendWise
            </span>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={goToPreviousMonth}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-neutral-500 hidden sm:block" />
              <span>{label}</span>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentMonth && (
              <button
                onClick={goToCurrentMonth}
                className="ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-white dark:bg-neutral-700 rounded-md shadow-2xs hover:opacity-90 cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Center: Tablet nav links (hidden on mobile, hidden on wide desktop with sidebar) */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentTab === item.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side: Theme toggle + Persistent Quick Add Transaction */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Toggle light/dark theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Mobile/Tablet Add Button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 py-1.5 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
