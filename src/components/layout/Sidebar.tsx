/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/calculations';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Clock,
  Settings,
  Plus,
  Wallet,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'analytics'
  | 'recurring'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddTransaction,
}) => {
  const { activeMetrics, settings } = useFinance();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets' as NavTab, label: 'Budgets', icon: PieChart },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'recurring' as NavTab, label: 'Recurring', icon: Clock },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const remaining = activeMetrics.remainingBudget;
  const isOverBudget = remaining < 0;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
          <Wallet className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          SpendWise
        </span>
      </div>

      {/* Add Transaction Button */}
      <div className="px-5 pt-5 pb-3">
        <button
          onClick={onOpenAddTransaction}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mini Widget at bottom of sidebar */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Monthly Budget</span>
          <span className="tabular-nums font-semibold text-slate-300">
            {activeMetrics.budgetUtilization.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isOverBudget ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(activeMetrics.budgetUtilization, 100)}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-[11px] text-slate-400">Remaining</span>
          <span
            className={`font-bold tabular-nums ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(remaining, settings.currencyCode)}
          </span>
        </div>
      </div>
    </aside>
  );
};
